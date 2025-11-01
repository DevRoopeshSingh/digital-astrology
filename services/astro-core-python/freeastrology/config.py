from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
  free_api_base_url: str = "https://json.freeastrologyapi.com"
  free_api_key: str
  default_locale: str = "en"
  default_timezone: str = "Asia/Kolkata"
  default_latitude: float = 28.6139
  default_longitude: float = 77.2090
  default_altitude: float = 0.0
  http_timeout_seconds: float = 8.0
  app_port: int = 4001

  model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
  return Settings()
