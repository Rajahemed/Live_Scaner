from pydantic import BaseModel
from typing import Optional

class InstrumentBase(BaseModel):
    symbol: str
    security_id: str
    exchange: str
    segment: str
    instrument_type: str
    is_active: bool = True

class Instrument(InstrumentBase):
    id: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
