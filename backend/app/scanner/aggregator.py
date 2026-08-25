import logging
from typing import Dict, Any, Callable, Optional
from datetime import datetime

from app.dhan.parser import MarketTick

logger = logging.getLogger(__name__)

class MinuteCandle:
    def __init__(self, security_id: str, minute_timestamp: str):
        self.security_id = security_id
        self.minute_timestamp = minute_timestamp # Format: "YYYY-MM-DD HH:MM:00"
        
        self.open = 0.0
        self.high = 0.0
        self.low = float('inf')
        self.close = 0.0
        
        self.volume = 0
        self.traded_value = 0.0
        
        self.is_completed = False
        self._initial_cumulative_volume = -1
        self._last_cumulative_volume = 0
        self.ticks_processed = 0

    def add_tick(self, tick: MarketTick):
        if self.open == 0.0:
            self.open = tick.last_price
            
        self.high = max(self.high, tick.last_price)
        self.low = min(self.low, tick.last_price)
        self.close = tick.last_price
        
        # Dhan usually sends cumulative volume. 
        # To get minute volume, we track the difference.
        if self._initial_cumulative_volume == -1:
            self._initial_cumulative_volume = tick.volume
            # Handle edge case where first tick of the day is the first tick of the minute
            if self.ticks_processed == 0 and tick.volume > 0:
                self._last_cumulative_volume = tick.volume - tick.quantity # approximate
            else:
                self._last_cumulative_volume = tick.volume
                
        # Calculate volume delta for this tick
        delta_volume = max(0, tick.volume - self._last_cumulative_volume)
        self.volume += delta_volume
        
        # Increment traded value (Volume * Price)
        self.traded_value += (delta_volume * tick.last_price)
        
        self._last_cumulative_volume = tick.volume
        self.ticks_processed += 1

class TickAggregator:
    def __init__(self):
        # Maps security_id -> current MinuteCandle
        self.current_candles: Dict[str, MinuteCandle] = {}
        # Callback when a candle is completed or updated
        self.on_candle_update: Optional[Callable[[MinuteCandle], None]] = None

    def set_callback(self, callback: Callable[[MinuteCandle], None]):
        self.on_candle_update = callback

    def process_tick(self, tick: MarketTick):
        minute_str = tick.timestamp.strftime("%Y-%m-%d %H:%M:00")
        
        if tick.security_id not in self.current_candles:
            self.current_candles[tick.security_id] = MinuteCandle(tick.security_id, minute_str)
            
        current_candle = self.current_candles[tick.security_id]
        
        # Check for minute rollover
        if current_candle.minute_timestamp != minute_str:
            current_candle.is_completed = True
            if self.on_candle_update:
                self.on_candle_update(current_candle)
            
            # Start new candle
            self.current_candles[tick.security_id] = MinuteCandle(tick.security_id, minute_str)
            current_candle = self.current_candles[tick.security_id]
            
        current_candle.add_tick(tick)
        
        # Trigger update for live calculations
        if self.on_candle_update:
            self.on_candle_update(current_candle)

tick_aggregator = TickAggregator()
