"""Configuration settings for SCOTOMA backend using pydantic-settings."""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables or defaults."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    gemini_api_key: str = Field(default="", description="Google Gemini API key")
    gemini_model: str = Field(
        default="gemini-2.5-flash",
        description="Gemini model identifier",
    )
    environment: str = Field(default="development", description="App environment")
    port: int = Field(default=8000, description="Server port")
    allowed_origins: str = Field(
        default="http://localhost:5173,http://localhost:8000",
        description="Comma-separated CORS allowed origins",
    )
    rate_limit_per_minute: int = Field(
        default=10,
        description="Max requests per minute per IP for analysis endpoints",
    )
    database_url: str = Field(
        default="sqlite:///./scotoma.db",
        description="Database connection string",
    )

    @property
    def cors_origins(self) -> list[str]:
        """Return list of allowed CORS origins."""
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


settings = Settings()
