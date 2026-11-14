"""
Top-level entrypoint for backward compatibility.
Runs the refactored modular FastAPI application.
"""

import sys
from pathlib import Path
import uvicorn

# Ensure backend root directory is in sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app
from app.core.config import settings

if __name__ == "__main__":
    print(f"Starting server on http://{settings.HOST}:{settings.PORT} ...")
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
