import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import json
from app.services.criteria_service import CriteriaService

def test_all_2026_criteria_resolve():
    criteria_file = backend_dir / "data" / "criteria_2026_1.json"
    assert criteria_file.exists(), "criteria_2026_1.json does not exist"
    
    data = json.load(open(criteria_file, "r", encoding="utf-8"))
    unmapped = []
    total = 0
    
    for sec in data:
        for grp in sec.get("CriteriaGroupDetailsLst", []):
            for rule in grp.get("UserCriteriaDetailsLst", []):
                total += 1
                cname = rule.get("CName", "").strip()
                slug = CriteriaService.key_reverse(cname)
                if slug == "unknown_key":
                    unmapped.append(cname)
                    
    assert len(unmapped) == 0, f"Found {len(unmapped)} unmapped criteria: {unmapped}"
    print(f"✓ test_all_2026_criteria_resolve passed (100% of {total} criteria resolved)")

if __name__ == "__main__":
    test_all_2026_criteria_resolve()

