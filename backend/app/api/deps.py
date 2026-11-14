"""
FastAPI dependencies for dependency injection in endpoints.
"""

from fastapi import Depends
from app.db.repositories.activity_repo import ActivityRepository
from app.clients.ctsv_client import CTSVClient
from app.services.activity_service import ActivityService

def get_activity_repository() -> ActivityRepository:
    """Yields ActivityRepository instance."""
    return ActivityRepository()

def get_ctsv_client() -> CTSVClient:
    """Yields CTSVClient instance."""
    return CTSVClient()

def get_activity_service(
    repo: ActivityRepository = Depends(get_activity_repository),
    client: CTSVClient = Depends(get_ctsv_client),
) -> ActivityService:
    """Yields configured ActivityService."""
    return ActivityService(repo=repo, client=client)

