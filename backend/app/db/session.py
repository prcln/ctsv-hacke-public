"""
Thread-safe SQLite database connection manager.
"""

import sqlite3
from contextlib import contextmanager
from typing import Generator
from app.core.config import settings

@contextmanager
def get_db_connection() -> Generator[sqlite3.Connection, None, None]:
    """
    Context manager that yields an isolated SQLite connection.
    Configures Row factory and WAL mode for high concurrency.
    """
    db_path = settings.resolved_db_path
    conn = sqlite3.connect(db_path, timeout=10.0)
    conn.row_factory = sqlite3.Row
    
    # Enable WAL mode and foreign keys for better concurrent reading/writing
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

