"""
Application configuration management using pydantic-settings.
"""

from pathlib import Path
from typing import List, Optional
from pydantic import Field
from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
    PydanticBaseSettingsSource,
)

# Base backend directory
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BACKEND_DIR / ".env"

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH) if ENV_PATH.exists() else ".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls: type[BaseSettings],
        init_settings: PydanticBaseSettingsSource,
        env_settings: PydanticBaseSettingsSource,
        dotenv_settings: PydanticBaseSettingsSource,
        file_secret_settings: PydanticBaseSettingsSource,
    ) -> tuple[PydanticBaseSettingsSource, ...]:
        # Priority: init arguments -> .env file -> OS system environment variables
        # This prevents Windows system env var 'USERNAME=ASUS' from overriding student USERNAME in .env
        return (
            init_settings,
            dotenv_settings,
            env_settings,
            file_secret_settings,
        )

    # Project metadata
    PROJECT_NAME: str = "CTSV Activity Parser & Dashboard API"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    HOST: str = "127.0.0.1"
    PORT: int = 8000

    # Database configuration
    DB_FILENAME: str = "pdscores.db"
    
    @property
    def resolved_db_path(self) -> Path:
        """Resolve database path checking data/ folder first, then backend root fallback."""
        data_db = BACKEND_DIR / "data" / self.DB_FILENAME
        if data_db.exists():
            return data_db
        root_db = BACKEND_DIR / self.DB_FILENAME
        if root_db.exists():
            return root_db
        data_dir = BACKEND_DIR / "data"
        data_dir.mkdir(parents=True, exist_ok=True)
        return data_db

    # Cache TTL configuration
    CACHE_TTL_MINUTES: int = 30
    DEFAULT_SEMESTER: str = "2026-1"

    # CTSV Portal Auth & Tokens (Loaded from .env)
    CTSV_USERNAME: Optional[str] = Field(default=None, alias="USERNAME")
    X_STUDENT_PORTAL_TOKEN: Optional[str] = Field(default=None, alias="X-STUDENT-PORTAL-TOKEN")
    X_ACCESS_TOKEN: Optional[str] = Field(default=None, alias="X-ACCESS-TOKEN")
    TOKEN_CODE: Optional[str] = Field(default=None, alias="TOKENCODE")
    AUTHORIZATION: Optional[str] = Field(default=None, alias="AUTHORIZATION")

    # Fallback student credentials if needed for scripts
    STUDENT_ID: Optional[str] = Field(default=None, alias="STUDENT_ID")
    STUDENT_PASSWORD: Optional[str] = Field(default=None, alias="STUDENT_PASSWORD")

    # CORS configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "https://localhost:5173",
        "http://127.0.0.1:5173",
        "https://127.0.0.1:5173",
    ]

settings = Settings()
