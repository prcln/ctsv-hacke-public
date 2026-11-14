"""
Repository for SQLite database operations related to Activities, Cache, and User scores.
"""

import json
from typing import Any, Optional
from app.db.session import get_db_connection
from app.core.constants import REVERSE_CRITERIA_MAP, CRITERIA_MAP

def serialize_criteria_list(criteria_lst: Any) -> str:
    """Transform raw criteria list into JSON dictionary mapped to Vietnamese criteria titles."""
    if not criteria_lst:
        return "{}"
    if isinstance(criteria_lst, dict):
        converted = {CRITERIA_MAP.get(k, k): float(v) for k, v in criteria_lst.items()}
        return json.dumps(converted, ensure_ascii=False)
    criteria_dict: dict[str, float] = {}
    for item in criteria_lst:
        c_name = str(item.get("CName", "")).strip()
        max_point = float(item.get("CMaxPoint", 0.0))
        if c_name:
            criteria_dict[c_name] = max_point
        else:
            key = str(item.get("key", "")).strip()
            criteria_dict[CRITERIA_MAP.get(key, key)] = max_point
    return json.dumps(criteria_dict, ensure_ascii=False)

class ActivityRepository:
    """Handles CRUD queries for Activities and Cache tables."""

    def get_cache(self, username: str) -> Optional[dict[str, Any]]:
        """Fetch cached JSON string and last_updated timestamp for a given username."""
        query = "SELECT data, last_updated FROM activities_cache WHERE username = ?"
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (username,))
            row = cursor.fetchone()
            if row:
                return {
                    "data": row["data"],
                    "last_updated": row["last_updated"]
                }
        return None

    def set_cache(self, username: str, data_json: str) -> bool:
        """Upsert activity cache with CURRENT_TIMESTAMP."""
        query = """
            INSERT OR REPLACE INTO activities_cache (username, data, last_updated)
            VALUES (?, ?, CURRENT_TIMESTAMP)
        """
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (username, data_json))
            return cursor.rowcount > 0

    def invalidate_cache(self, username: str) -> bool:
        """Clear cache for a specific user."""
        query = "DELETE FROM activities_cache WHERE username = ?"
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (username,))
            return cursor.rowcount > 0

    def save_activity(self, activity: dict[str, Any]) -> None:
        """Insert or replace a single activity in Activities table."""
        query = """
            INSERT OR REPLACE INTO Activities 
            (AId, ACode, AName, AType, ADesc, StartTime, FinishTime, APlace, GName, Deadline, AStatus, UAStatus, CriteriaList) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        raw_criteria = activity.get("CriteriaLst")
        criteria_str = serialize_criteria_list(raw_criteria)

        values = (
            activity.get("AId"),
            activity.get("ACode"),
            activity.get("AName"),
            activity.get("AType"),
            activity.get("ADesc"),
            activity.get("StartTime"),
            activity.get("FinishTime"),
            activity.get("APlace"),
            activity.get("GName"),
            activity.get("Deadline"),
            activity.get("AStatus"),
            activity.get("UAStatus"),
            criteria_str
        )
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, values)

    def save_all_activities(self, activities: list[dict[str, Any]]) -> None:
        """Bulk insert or replace activities for high performance."""
        query = """
            INSERT OR REPLACE INTO Activities 
            (AId, ACode, AName, AType, ADesc, StartTime, FinishTime, APlace, GName, Deadline, AStatus, UAStatus, CriteriaList) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        records = []
        for activity in activities:
            raw_criteria = activity.get("CriteriaLst")
            criteria_str = serialize_criteria_list(raw_criteria)
            records.append((
                activity.get("AId"),
                activity.get("ACode"),
                activity.get("AName"),
                activity.get("AType"),
                activity.get("ADesc"),
                activity.get("StartTime"),
                activity.get("FinishTime"),
                activity.get("APlace"),
                activity.get("GName"),
                activity.get("Deadline"),
                activity.get("AStatus"),
                activity.get("UAStatus"),
                criteria_str
            ))

        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.executemany(query, records)

    def fetch_activities(self, max_user_status: int = 1) -> list[dict[str, Any]]:
        """Fetch activities from database with user status below max_user_status."""
        query = """
            SELECT AId, AName, CriteriaList, UAStatus, StartTime, FinishTime, Deadline 
            FROM Activities 
            WHERE UAStatus <= ?
        """
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (max_user_status,))
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    def save_score(self, semester: str, score: float, data: str) -> None:
        """Save student criteria tree score into pd_points table."""
        query = "INSERT OR REPLACE INTO pd_points (semester, total_score, detailed_tree) VALUES (?, ?, ?)"
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (semester, score, data))

    def fetch_score(self, semester: str) -> Optional[dict[str, Any]]:
        """Fetch student score tree for a specific semester."""
        query = "SELECT detailed_tree FROM pd_points WHERE semester = ?"
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (semester,))
            row = cursor.fetchone()
            if row and row["detailed_tree"]:
                return json.loads(row["detailed_tree"])
        return None

