from pydantic import BaseModel
from typing import Optional

class MinuteData(BaseModel):
    id: Optional[str] = None
    symbol: str
    security_id: str
    exchange: str
    segment: str
    minute_timestamp: str
    scan_date: str
    
    open: float
    high: float
    low: float
    close: float
    
    volume: int
    traded_value: float
    
    average_1min_volume: float
    volume_multiplier: float
    
    volume_threshold: float
    value_threshold: float
    
    volume_condition: bool
    value_condition: bool
    triggered: bool
    
    baseline_days: int
    data_source: str = "DHAN"
    
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class ScannerConfig(BaseModel):
    id: Optional[str] = None
    relative_volume_multiplier: float
    absolute_value_threshold: float
    baseline_days: int
    is_active: bool = True
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
