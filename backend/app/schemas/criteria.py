"""
Pydantic schemas for Criteria responses.
"""

from typing import Any, Optional
from pydantic import BaseModel

class UserCriteriaDetails(BaseModel):
    CName: Optional[str] = None
    UCPoint: Optional[float] = 0.0
    TCPoint: Optional[float] = 0.0
    CMaxPoint: Optional[float] = 0.0
    UserCriteriaActivityLst: Optional[list[Any]] = None

class CriteriaGroup(BaseModel):
    CGName: Optional[str] = None
    CGPoint: Optional[float] = 0.0
    TCGPoint: Optional[float] = 0.0
    UserCriteriaDetailsLst: Optional[list[UserCriteriaDetails]] = None

class CriteriaTypeSection(BaseModel):
    CTName: Optional[str] = None
    CTPoint: Optional[float] = 0.0
    TCTPoint: Optional[float] = 0.0
    CTMaxPoint: Optional[float] = 0.0
    CriteriaGroupDetailsLst: Optional[list[CriteriaGroup]] = None

class CriteriaListResponse(BaseModel):
    data: list[Any]

