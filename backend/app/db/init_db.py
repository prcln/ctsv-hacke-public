"""
Database schema initialization script.
"""

import sys
from pathlib import Path

# Ensure root backend is in sys.path when run directly
backend_dir = Path(__file__).resolve().parent.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.core.config import settings
from app.db.session import get_db_connection

INIT_SQL = """
CREATE TABLE IF NOT EXISTS Activities (
    AId INTEGER PRIMARY KEY,
    ACode TEXT,
    AName TEXT,
    AType TEXT,
    ADesc TEXT,
    StartTime TEXT,
    FinishTime TEXT,
    APlace TEXT,
    GName TEXT,
    Deadline TEXT,
    AStatus INTEGER,
    UAStatus INTEGER,
    CriteriaList TEXT
);

CREATE TABLE IF NOT EXISTS UserActivity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    AID INTEGER NOT NULL,
    status INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activities_cache (
    username TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pd_points (
    semester TEXT PRIMARY KEY,
    total_score REAL,
    detailed_tree TEXT
);

CREATE INDEX IF NOT EXISTS idx_activities_uastatus ON Activities(UAStatus);
CREATE INDEX IF NOT EXISTS idx_user_activity_user ON UserActivity(username, AID);
"""

def init_db() -> None:
    """Initialize SQLite database tables and indexes."""
    db_path = settings.resolved_db_path
    print(f"Initializing database at: {db_path}")
    with get_db_connection() as conn:
        conn.executescript(INIT_SQL)
    print("Database tables initialized successfully.")

if __name__ == "__main__":
    init_db()

