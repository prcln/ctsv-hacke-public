"""
API endpoints for Criteria evaluation details.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query

from app.api.deps import get_activity_service
from app.services.activity_service import ActivityService

router = APIRouter()

@router.get("/users/{username}/criteria")
async def get_criteria(
    username: str,
    semester: Optional[str] = Query(default=None),
    service: ActivityService = Depends(get_activity_service),
):
    """Fetch criteria breakdown and points for the student."""
    try:
        return await service.get_criteria_list(username=username, semester=semester)
    except Exception as e:
        print(f"Error fetching criteria: {e}")
        return {"data": [], "error": str(e)}

