import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./xtramagical.db")
    database_url_sync: str = os.getenv("DATABASE_URL_SYNC", "sqlite:///./xtramagical.db")
    redis_url: str = "redis://localhost:6379/0"

    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    s3_bucket_temp: str = "xtramagical-temp"
    s3_bucket_prod: str = "xtramagical-prod"
    s3_region: str = "us-east-1"

    openai_api_key: str = ""
    replicate_api_token: str = ""
    google_application_credentials: str = ""

    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration: int = 86400

    next_public_api_url: str = "http://localhost:8000"

    class Config:
        env_file = ".env"


@lru_cache
def get_settings():
    return Settings()
