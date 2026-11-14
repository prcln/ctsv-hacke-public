import sys
import asyncio
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app
from app.core.config import settings
import httpx
import pytest

@pytest.mark.anyio
async def test_endpoint():
    target_user = settings.CTSV_USERNAME or "2024xxxx"
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get(f"/api/users/{target_user}/criteria")
        assert res.status_code == 200
        data = res.json().get("data", [])
        assert len(data) == 5
        print(f"Status: {res.status_code}, Received {len(data)} sections:")
        for sec in data:
            print(f"  • {sec.get('CTName')} (Max: {sec.get('CTMaxPoint')} pts)")

if __name__ == "__main__":
    asyncio.run(test_endpoint())

