"""
Basic sanity tests for CTSV Parser backend.
"""

import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.core.config import settings
from app.core.constants import CRITERIA_MAP, REVERSE_CRITERIA_MAP
from app.services.criteria_service import CriteriaService
from app.db.repositories.activity_repo import ActivityRepository

def test_settings_load():
    assert settings.PROJECT_NAME is not None
    assert settings.resolved_db_path.exists()
    print("✓ test_settings_load passed")

def test_criteria_mapping():
    assert len(CRITERIA_MAP) > 0
    assert len(REVERSE_CRITERIA_MAP) > 0
    # Test reverse mapping
    first_title = next(iter(CRITERIA_MAP.values()))
    slug = CriteriaService.key_reverse(first_title)
    assert slug != "unknown_key"
    print("✓ test_criteria_mapping passed")

def test_zero_criteria_extraction():
    sample_scores = [
        {
            "CTMaxPoint": 20.0,
            "CTPoint": 10.0,
            "CriteriaGroupDetailsLst": [
                {
                    "UserCriteriaDetailsLst": [
                        {
                            "CName": "Có kết quả học tập ở mức  GPA ≥ 3.6",
                            "UCPoint": 0.0,
                            "CMaxPoint": 4.0
                        },
                        {
                            "CName": "Có nỗ lực trong học tập",
                            "UCPoint": 2.0,
                            "CMaxPoint": 2.0
                        }
                    ]
                }
            ]
        }
    ]
    zero = CriteriaService.get_zero_criteria(sample_scores)
    assert "gpa_excellent" in zero
    assert zero["gpa_excellent"] == [0.0, 4.0]
    print("✓ test_zero_criteria_extraction passed")

def test_activity_repository():
    repo = ActivityRepository()
    activities = repo.fetch_activities(max_user_status=2)
    assert isinstance(activities, list)
    print(f"✓ test_activity_repository passed (found {len(activities)} activities)")

if __name__ == "__main__":
    test_settings_load()
    test_criteria_mapping()
    test_zero_criteria_extraction()
    test_activity_repository()
    print("\nAll sanity tests passed successfully! 🎉")

