"""
Service layer for coordinating activity caching, API fetching, and criteria filtering.
"""

from datetime import datetime, timedelta, timezone
import json
from typing import Any, Optional

from app.core.config import settings
from app.clients.ctsv_client import CTSVClient
from app.db.repositories.activity_repo import ActivityRepository
from app.services.criteria_service import CriteriaService

class ActivityService:
    """Orchestrates activity operations, caching policies, and external sync."""

    def __init__(self, repo: ActivityRepository, client: CTSVClient):
        self.repo = repo
        self.client = client

    def _is_cache_fresh(self, last_updated_str: str) -> bool:
        """Verify if cached data is within the configured TTL."""
        try:
            last_updated = datetime.strptime(last_updated_str, "%Y-%m-%d %H:%M:%S")
            now_utc = datetime.now(timezone.utc).replace(tzinfo=None)
            return (now_utc - last_updated) < timedelta(minutes=settings.CACHE_TTL_MINUTES)
        except Exception:
            return False

    async def filter_missing_criteria_activities(
        self,
        activities: list[dict[str, Any]],
        username: str,
        semester: Optional[str] = None
    ) -> list[dict[str, Any]]:
        """Filter activities that can fulfill criteria currently scoring zero."""
        try:
            criteria_details = await self.client.get_criteria_details(username, semester)
            score_list = criteria_details.get("CriteriaTypeDetailsLst", [])
            zero_criteria = CriteriaService.get_zero_criteria(score_list)
            
            # Normalize missing keys for resilient matching
            normalized_missing = set()
            for k in zero_criteria.keys():
                norm_k = k.strip().lower()
                normalized_missing.add(norm_k)
                normalized_missing.add(norm_k.rstrip("."))

            matched_activities = []
            for act in activities:
                criteria_dict = act.get("criteriaLst", {})
                is_match = False
                for c_key in criteria_dict.keys():
                    norm_key = c_key.strip().lower()
                    norm_key_no_dot = norm_key.rstrip(".")
                    slug = CriteriaService.key_reverse(c_key).lower()
                    if (norm_key in normalized_missing or 
                        norm_key_no_dot in normalized_missing or 
                        slug in normalized_missing):
                        is_match = True
                        break
                if is_match:
                    matched_activities.append(act)

            return matched_activities
        except Exception as e:
            print(f"Error filtering missing criteria: {e}")
            return activities

    async def get_user_activities(
        self,
        username: str,
        refresh: bool = False,
        incomplete_criteria: bool = False,
        semester: Optional[str] = None
    ) -> dict[str, Any]:
        """Fetch user activities with automatic smart caching and optional missing criteria filtering."""
        cached_record = self.repo.get_cache(username)

        # 1. Cache Hit check
        if cached_record and not refresh:
            if self._is_cache_fresh(cached_record["last_updated"]):
                processed_data = json.loads(cached_record["data"])

                if incomplete_criteria:
                    filtered = await self.filter_missing_criteria_activities(
                        processed_data, username, semester
                    )
                    return {
                        "status": "success",
                        "message": "Filtered missing criteria (cached)",
                        "data": filtered
                    }

                return {
                    "status": "success",
                    "message": "Fetched from cache",
                    "data": processed_data
                }
            else:
                # Invalidate stale cache
                self.repo.invalidate_cache(username)

        # 2. Cache Miss or Forced Refresh -> Fetch from CTSV API
        raw_api_data = await self.client.get_all_activities(username)
        processed_data = [CriteriaService.format_activity_for_frontend(act) for act in raw_api_data]

        # Persist to database and update cache
        self.repo.save_all_activities(raw_api_data)
        self.repo.set_cache(username, json.dumps(processed_data))

        if incomplete_criteria:
            filtered = await self.filter_missing_criteria_activities(
                processed_data, username, semester
            )
            return {
                "status": "success",
                "message": "Filtered missing criteria (fresh)",
                "data": filtered
            }

        return {
            "status": "success",
            "message": "Cache updated successfully",
            "data": processed_data
        }

    async def get_criteria_list(
        self,
        username: str,
        semester: Optional[str] = None
    ) -> dict[str, Any]:
        """Fetch criteria sections and points."""
        response = await self.client.get_criteria_details(username, semester)
        return {"data": response.get("CriteriaTypeDetailsLst", [])}

    async def participate(
        self,
        activity_id: int,
        username: str,
        reason: str = ""
    ) -> dict[str, Any]:
        """Register student for an activity and update local cache/database."""
        response = await self.client.assign_user_activity(activity_id, username, reason)

        # Sync single activity in local DB
        try:
            fresh_activity = await self.client.get_single_activity(activity_id, username)
            self.repo.save_activity(fresh_activity)
            # Invalidate user cache so next activity list fetch reflects the new status
            self.repo.invalidate_cache(username)
        except Exception as e:
            print(f"Warning: Failed to update local activity cache after participation: {e}")

        return {
            "status": "success",
            "message": response.get("RespText", "Registered successfully"),
            "data": response
        }

