"""Конфигурация приложения, считываемая из переменных окружения."""

from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Единый объект настроек для API и фоновых задач."""

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = "postgresql+asyncpg://user:password@db:5432/dbname"
    cors_origins: str = ""
    upload_dir: str = "./data/uploads"
    legacy_media_import_dir: str = ""
    static_seed_images_dir: str = ""
    force_legacy_media_reimport: bool = False

    smtp_host: str = ""
    smtp_port: int = Field(default=587, ge=1, le=65535)
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_use_tls: bool = True
    feedback_from_email: str = ""
    feedback_to_email: str = ""

    @property
    def cors_origin_list(self) -> List[str]:
        """Возвращает список origin для CORS middleware."""
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def database_url_sync(self) -> str:
        """Преобразует asyncpg URL в psycopg2 URL для sync-инструментов."""
        url = self.database_url
        if "+asyncpg" in url:
            return url.replace("+asyncpg", "+psycopg2", 1)
        return url


@lru_cache
def get_settings() -> Settings:
    """Возвращает кешированный экземпляр настроек."""
    return Settings()
