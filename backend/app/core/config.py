from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DHAN_CLIENT_ID: str = ""
    DHAN_ACCESS_TOKEN: str = ""
    
    GOOGLE_SPREADSHEET_ID: str = ""
    GOOGLE_SERVICE_ACCOUNT_JSON: str = "credentials.json"
    
    REL_MULTIPLIER: float = 20.0
    ABS_THRESHOLD: float = 50000000.0
    BASELINE_DAYS: int = 5
    
    BACKEND_PORT: int = 8000
    FRONTEND_PORT: int = 5173

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
