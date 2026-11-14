"""
API endpoints for Activity management and student participation.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import get_activity_service
from app.schemas.activity import ParticipatePayload
from app.services.activity_service import ActivityService

router = APIRouter()

@router.get("/users/{username}/activities")
async def fetch_activities(
    username: str,
    refresh: Optional[bool] = Query(default=False),
    incomplete_criteria: Optional[bool] = Query(default=False),
    semester: Optional[str] = Query(default=None),
    service: ActivityService = Depends(get_activity_service),
):
    """
    Fetch activities for a given student.
    - Uses 30-minute SQLite cache by default.
    - Pass refresh=true to force re-fetch from university CTSV portal.
    - Pass incomplete_criteria=true to filter activities matching unfulfilled criteria.
    """
    try:
        result = await service.get_user_activities(
            username=username,
            refresh=bool(refresh),
            incomplete_criteria=bool(incomplete_criteria),
            semester=semester
        )
        return result
    except Exception as e:
        print(f"Error in fetch_activities: {e}")
        return {
            "status": "error",
            "message": str(e),
            "data": []
        }

@router.put("/users/{username}/activities/{activity_id}")
async def participate(
    username: str,
    activity_id: int,
    payload: Optional[ParticipatePayload] = None,
    service: ActivityService = Depends(get_activity_service),
):
    """
    Register/assign user to an activity on CTSV.
    Supports both path parameter activity_id and request body ParticipatePayload.
    """
    target_username = payload.username if payload and payload.username else username
    target_id = payload.activityId if payload and payload.activityId else activity_id

    try:
        result = await service.participate(
            activity_id=target_id,
            username=target_username
        )
        return result
    except Exception as e:
        print(f"Error in participate endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to assign activity: {e}"
        )

