"""
Service for processing student criteria, mapping categories, and identifying missing requirements.
"""

from typing import Any, Optional
from app.core.constants import (
    REVERSE_CRITERIA_MAP,
    GROUP_ACADEMIC,
    GROUP_DISCIPLINE,
    GROUP_EXTRACURRICULAR,
    GROUP_CITIZENSHIP,
    GROUP_LEADERSHIP,
    GROUP_PENALTY,
)

class CriteriaService:
    """Business logic for evaluating and categorizing criteria."""

    @staticmethod
    def key_reverse(criterium_name: str) -> str:
        """
        Convert official Vietnamese criteria title into short internal slug.
        Performs smart punctuation trimming for resilient matching.
        """
        cleaned = criterium_name.strip()
        if cleaned in REVERSE_CRITERIA_MAP:
            return REVERSE_CRITERIA_MAP[cleaned]

        # Try without trailing punctuation/dots
        no_punct = cleaned.rstrip(".,;: ")
        if no_punct in REVERSE_CRITERIA_MAP:
            return REVERSE_CRITERIA_MAP[no_punct]

        # Case-insensitive / whitespace-normalized lookup fallback
        normalized = " ".join(cleaned.split()).lower()
        for k, v in REVERSE_CRITERIA_MAP.items():
            if " ".join(k.split()).lower() == normalized:
                return v

        return "unknown_key"

    @classmethod
    def parse_criteria_dict(cls, criteria_lst: Any) -> dict[str, float]:
        """Convert CTSV CriteriaLst into a dictionary of { criteria_vietnamese_title: max_point }."""
        if not criteria_lst:
            return {}
        result: dict[str, float] = {}

        if isinstance(criteria_lst, dict):
            for k, v in criteria_lst.items():
                viet_title = CRITERIA_MAP.get(k, k)
                result[viet_title] = float(v)
            return result

        if isinstance(criteria_lst, list):
            for item in criteria_lst:
                c_name = str(item.get("CName", "")).strip()
                max_point = float(item.get("CMaxPoint", 0.0))
                if c_name:
                    result[c_name] = max_point
                else:
                    key = str(item.get("key", "")).strip()
                    viet_title = CRITERIA_MAP.get(key, key)
                    result[viet_title] = max_point
        return result

    @classmethod
    def get_zero_criteria(cls, score_list: list[dict[str, Any]]) -> dict[str, list[float]]:
        """
        Extract criteria where student currently has 0 points and the section maximum point
        has not yet been reached.
        Provides both English slug and official Vietnamese title for seamless matching.
        """
        zero_criteria: dict[str, list[float]] = {}
        for section in score_list:
            if section.get("CTMaxPoint", 0.0) <= section.get("CTPoint", 0.0):
                continue
            for group in section.get("CriteriaGroupDetailsLst", []):
                for criterium in group.get("UserCriteriaDetailsLst", []):
                    uc_point = float(criterium.get("UCPoint", 0.0))
                    c_max_point = float(criterium.get("CMaxPoint", 0.0))
                    if uc_point == 0.0 and c_max_point > 0.0:
                        c_name = str(criterium.get("CName", "")).strip()
                        key = cls.key_reverse(c_name)
                        # Store both slug and Vietnamese title
                        zero_criteria[key] = [uc_point, c_max_point]
                        if c_name:
                            zero_criteria[c_name] = [uc_point, c_max_point]
        return zero_criteria

    @classmethod
    def classify_by_category(cls, activities: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
        """Classify a list of activities into main domain categories."""
        grouped: dict[str, list[dict[str, Any]]] = {
            "academic": [],
            "discipline": [],
            "extracurricular": [],
            "citizenship": [],
            "leadership": [],
            "penalty": [],
            "others": []
        }

        for activity in activities:
            criteria_keys = activity.get("criteriaLst", {}).keys()
            placed = False
            for k in criteria_keys:
                if k in GROUP_ACADEMIC:
                    grouped["academic"].append(activity)
                    placed = True
                    break
                elif k in GROUP_DISCIPLINE:
                    grouped["discipline"].append(activity)
                    placed = True
                    break
                elif k in GROUP_EXTRACURRICULAR:
                    grouped["extracurricular"].append(activity)
                    placed = True
                    break
                elif k in GROUP_CITIZENSHIP:
                    grouped["citizenship"].append(activity)
                    placed = True
                    break
                elif k in GROUP_LEADERSHIP:
                    grouped["leadership"].append(activity)
                    placed = True
                    break
                elif k in GROUP_PENALTY:
                    grouped["penalty"].append(activity)
                    placed = True
                    break
            if not placed:
                grouped["others"].append(activity)

        return grouped

    @classmethod
    def format_activity_for_frontend(cls, raw: dict[str, Any]) -> dict[str, Any]:
        """Transform raw CTSV activity into standardized camelCase format expected by the frontend."""
        raw_criteria = raw.get("CriteriaLst")
        criteria_dict = cls.parse_criteria_dict(raw_criteria)

        return {
            "id": raw.get("AId"),
            "code": raw.get("ACode"),
            "name": raw.get("AName"),
            "type": raw.get("AType"),
            "desc": raw.get("ADesc"),
            "startTime": raw.get("StartTime"),
            "finishTime": raw.get("FinishTime"),
            "place": raw.get("APlace"),
            "groupName": raw.get("GName"),
            "deadline": raw.get("Deadline"),
            "activityStatus": raw.get("AStatus"),
            "userStatus": raw.get("UAStatus"),
            "criteriaLst": criteria_dict
        }
