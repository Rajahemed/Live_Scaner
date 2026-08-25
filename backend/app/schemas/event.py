from pydantic import BaseModel
from typing import Optional

class ScannerEvent(BaseModel):
    id: Optional[str] = None
    symbol: str
    security_id: str
    exchange: str
    segment: str
    
    scan_date: str
    trigger_timestamp: str
    minute_timestamp: str
    
    open: float
    high: float
    low: float
    close: float
    current_price: float
    
    current_volume: int
    average_1min_volume: float
    volume_multiplier: float
    
    current_traded_value: float
    
    relative_volume_threshold: float
    absolute_value_threshold: float
    
    volume_condition: bool
    value_condition: bool
    
    triggered: bool
    trigger_reason: str
    
    baseline_days: int
    data_source: str = "DHAN"
    
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
