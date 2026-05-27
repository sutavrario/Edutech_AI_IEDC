import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "EduTech AI Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "YOUR_SUPER_SECRET_KEY_FOR_JWT"  # In production, get this from .env
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "edutech_db"
    DATABASE_URL: str | None = None
    SQLALCHEMY_DATABASE_URI: str | None = None
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
# Use DATABASE_URL if provided (PostgreSQL), otherwise fall back to SQLite for local dev
if settings.DATABASE_URL:
    settings.SQLALCHEMY_DATABASE_URI = settings.DATABASE_URL
else:
    settings.SQLALCHEMY_DATABASE_URI = "sqlite:///./edutech_db.sqlite"
