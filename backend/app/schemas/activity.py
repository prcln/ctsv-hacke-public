"""
Pydantic schemas for Activities and Participation.
"""

from typing import Any, Optional
from pydantic import BaseModel, Field, ConfigDict

class ParticipatePayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    username: str
    activityId: int = Field(..., alias="activityId")

class ActivityItem(BaseModel):
    id: Optional[int] = None
    code: Optional[str] = None
    name: Optional[str] = None
    type: Optional[str] = None
    desc: Optional[str] = None
    startTime: Optional[str] = None
    finishTime: Optional[str] = None
    place: Optional[str] = None
    groupName: Optional[str] = None
    deadline: Optional[str] = None
    activityStatus: Optional[int] = None
    userStatus: Optional[int] = None
    criteriaLst: dict[str, float] = Field(default_factory=dict)

class ApiResponse(BaseModel):
    status: str
    message: Optional[str] = None
    data: Any = None

