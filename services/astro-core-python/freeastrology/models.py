from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class HoroscopeSummary(BaseModel):
  date: datetime = Field(default_factory=datetime.utcnow)
  sunSign: str
  guidance: str
  mood: str | None = None
  luckyNumber: str | None = None
  luckyColor: str | None = None
  snapshot: dict[str, Any] | None = None


class ProviderMetadata(BaseModel):
  provider: str = "freeastrologyapi"
  generatedAt: datetime = Field(default_factory=datetime.utcnow)
  timezone: str | None = None
  raw: Any | None = None


class DailyHoroscopeResult(BaseModel):
  source: str = "freeastrologyapi"
  metadata: ProviderMetadata
  horoscope: HoroscopeSummary


class PanchangDetails(BaseModel):
  date: datetime
  tithi: str
  nakshatra: str
  yoga: str
  karana: str
  sunrise: str
  sunset: str


class PanchangResult(BaseModel):
  source: str = "freeastrologyapi"
  metadata: ProviderMetadata
  panchang: PanchangDetails


class ErrorResponse(BaseModel):
  error: str
  message: str
  details: Any | None = None
