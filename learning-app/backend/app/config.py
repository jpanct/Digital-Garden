from __future__ import annotations
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ANTHROPIC_API_KEY: str = ""
    TAVILY_API_KEY: str = ""
    DATABASE_URL: str = "sqlite:///./digital_garden.db"
    FRONTEND_URL: str = "http://localhost:5173"
    CLAUDE_MODEL: str = "claude-sonnet-4-6"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
