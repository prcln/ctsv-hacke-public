"""
HTTP Client for interacting with the university CTSV Portal API (https://ctsv.hust.edu.vn).
"""

import asyncio
from typing import Any, Optional
import httpx

from app.core.config import settings
from app.core.constants import (
    ASSIGN_ACTIVITY_URL,
    GET_PUBLISH_ACTIVITY_URL,
    GET_ACTIVITY_BY_ID_URL,
    GET_CRITERIA_TYPE_DETAILS_URL,
    DEFAULT_SIGNATURE,
)

class CTSVClient:
    """Async HTTP client for CTSV APIs."""

    def __init__(
        self,
        username: Optional[str] = None,
        x_student_token: Optional[str] = None,
        x_access_token: Optional[str] = None,
        token_code: Optional[str] = None,
        authorization: Optional[str] = None,
        timeout: float = 15.0,
    ):
        self.username = username or settings.CTSV_USERNAME or ""
        self.x_student_token = x_student_token or settings.X_STUDENT_PORTAL_TOKEN or ""
        self.x_access_token = x_access_token or settings.X_ACCESS_TOKEN or ""
        self.token_code = token_code or settings.TOKEN_CODE or ""
        self.authorization = authorization or settings.AUTHORIZATION or ""
        self.timeout = timeout

    def _get_headers(self) -> dict[str, str]:
        headers: dict[str, str] = {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json;charset=UTF-8",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        }
        if self.authorization:
            headers["Authorization"] = self.authorization
        return headers

    def _get_cookies(self, username: Optional[str] = None) -> dict[str, str]:
        cookies: dict[str, str] = {}
        target_user = username or self.username
        if target_user:
            cookies["UserName"] = target_user
        if self.x_student_token:
            cookies["x-student-portal-token"] = self.x_student_token
        if self.x_access_token:
            cookies["x-access-token"] = self.x_access_token
        return cookies

    async def get_publish_activities(
        self,
        username: str,
        signature: str = DEFAULT_SIGNATURE,
        row_number: int = 100,
        page_number: int = 1
    ) -> list[dict[str, Any]]:
        """Fetch list of published activities for a user."""
        payload = {
            "Signature": signature,
            "NumberRow": row_number,
            "PageNumber": page_number,
            "UserName": username
        }
        async with httpx.AsyncClient(
            headers=self._get_headers(),
            cookies=self._get_cookies(username),
            timeout=self.timeout
        ) as client:
            response = await client.post(GET_PUBLISH_ACTIVITY_URL, json=payload)
            response.raise_for_status()
            data = response.json()
            return data.get("Activities", [])

    async def get_single_activity(self, activity_id: int, username: str) -> dict[str, Any]:
        """Fetch detailed information for a single activity by its AId."""
        payload = {"AId": activity_id, "UserName": username}
        async with httpx.AsyncClient(
            headers=self._get_headers(),
            cookies=self._get_cookies(username),
            timeout=self.timeout
        ) as client:
            response = await client.post(GET_ACTIVITY_BY_ID_URL, json=payload)
            response.raise_for_status()
            activities = response.json().get("Activities", [])
            if not activities:
                raise ValueError(f"Activity with ID {activity_id} not found in response.")
            return activities[0]

    async def get_all_activities(self, username: str, max_concurrent: int = 10) -> list[dict[str, Any]]:
        """
        Fetch all published activities with full details.
        Uses asyncio.gather with a semaphore for significantly faster parallel retrieval.
        """
        published = await self.get_publish_activities(username)
        activity_ids = [act["AId"] for act in published if "AId" in act]

        semaphore = asyncio.Semaphore(max_concurrent)

        async def fetch_with_limit(aid: int) -> Optional[dict[str, Any]]:
            async with semaphore:
                try:
                    return await self.get_single_activity(aid, username)
                except Exception as e:
                    print(f"Error fetching activity {aid}: {e}")
                    return None

        tasks = [fetch_with_limit(aid) for aid in activity_ids]
        results = await asyncio.gather(*tasks)
        return [r for r in results if r is not None]

    async def assign_user_activity(
        self,
        activity_id: int,
        username: str,
        reason: str = "",
        token_code: Optional[str] = None
    ) -> dict[str, Any]:
        """Assign or register a student to an activity."""
        payload = {
            "AId": activity_id,
            "Reason": reason,
            "UserName": username,
            "TokenCode": token_code or self.token_code
        }
        async with httpx.AsyncClient(
            headers=self._get_headers(),
            cookies=self._get_cookies(username),
            timeout=self.timeout
        ) as client:
            response = await client.post(ASSIGN_ACTIVITY_URL, json=payload)
            response.raise_for_status()
            return response.json()

    async def get_criteria_details(
        self,
        username: str,
        semester: Optional[str] = None,
        token_code: Optional[str] = None
    ) -> dict[str, Any]:
        """Fetch full criteria evaluation details for a student in a semester."""
        target_semester = semester or settings.DEFAULT_SEMESTER
        payload = {
            "Semester": target_semester,
            "UserCode": username,
            "UserName": username,
            "TokenCode": token_code or self.token_code
        }
        async with httpx.AsyncClient(
            headers=self._get_headers(),
            cookies=self._get_cookies(username),
            timeout=self.timeout
        ) as client:
            response = await client.post(GET_CRITERIA_TYPE_DETAILS_URL, json=payload)
            response.raise_for_status()
            return response.json()

