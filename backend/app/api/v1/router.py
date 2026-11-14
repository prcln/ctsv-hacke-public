"""
API v1 Router aggregator.
"""

from fastapi import APIRouter
from app.api.v1.endpoints import activities, criteria

api_router = APIRouter()

api_router.include_router(activities.router, tags=["Activities"])
api_router.include_router(criteria.router, tags=["Criteria"])

