import logging
from datetime import datetime
from app.scanner.aggregator import MinuteCandle
from app.scanner.baseline import baseline_engine
from app.services.persistence import persistence_queue
from app.core.config import settings

logger = logging.getLogger(__name__)

class ScannerEngine:
    def __init__(self):
        # We need a symbol mapping to convert security_id -> symbol, exchange, segment.
        # This will be populated from the Instruments sheet on startup.
        self.instrument_map = {}

    def set_instrument_map(self, instruments_data: list):
        self.instrument_map = {str(item["security_id"]): item for item in instruments_data}

    def process_candle(self, candle: MinuteCandle):
        # Only evaluate if we have volume
        if candle.volume == 0:
            return

        security_id = candle.security_id
        
        instrument = self.instrument_map.get(security_id, {})
        symbol = instrument.get("symbol", f"UNKNOWN_{security_id}")
        exchange = instrument.get("exchange", "NSE")
        segment = instrument.get("segment", "EQUITY")
        
        scan_date = candle.minute_timestamp.split(" ")[0]
        
        # 1. Get Baseline
        avg_1min_volume = baseline_engine.get_baseline_volume(security_id, candle.minute_timestamp)
        
        # 2. Calculate Multiplier
        volume_multiplier = 0.0
        if avg_1min_volume > 0:
            volume_multiplier = candle.volume / avg_1min_volume
            
        # 3. Calculate Traded Value
        traded_value = candle.traded_value
        
        # 4. Evaluate Conditions
        vol_threshold = settings.REL_MULTIPLIER
        val_threshold = settings.ABS_THRESHOLD
        
        volume_condition = volume_multiplier >= vol_threshold
        value_condition = traded_value >= val_threshold
        
        triggered = volume_condition and value_condition

        # 5. Prepare Minute Data Row (Matching Google Sheets Columns)
        # id, symbol, security_id, exchange, segment, minute_timestamp, scan_date,
        # open, high, low, close, volume, traded_value, average_1min_volume, volume_multiplier,
        # volume_threshold, value_threshold, volume_condition, value_condition, triggered,
        # baseline_days, data_source, created_at, updated_at
        
        now_str = datetime.now().isoformat()
        
        minute_row = [
            f"{security_id}_{candle.minute_timestamp}", # ID
            symbol,
            security_id,
            exchange,
            segment,
            candle.minute_timestamp,
            scan_date,
            candle.open,
            candle.high,
            candle.low,
            candle.close,
            candle.volume,
            traded_value,
            avg_1min_volume,
            volume_multiplier,
            vol_threshold,
            val_threshold,
            volume_condition,
            value_condition,
            triggered,
            settings.BASELINE_DAYS,
            "DHAN",
            now_str,
            now_str
        ]
        
        # Enqueue Minute Data
        persistence_queue.enqueue_minute_data(minute_row, security_id, candle.minute_timestamp)
        
        # 6. Prepare Event Row (If triggered)
        if triggered:
            # id, symbol, security_id, exchange, segment, scan_date, trigger_timestamp, minute_timestamp,
            # open, high, low, close, current_price, current_volume, average_1min_volume, volume_multiplier,
            # current_traded_value, relative_volume_threshold, absolute_value_threshold, volume_condition,
            # value_condition, triggered, trigger_reason, baseline_days, data_source, created_at, updated_at
            
            val_cr = traded_value / 10000000
            thresh_cr = val_threshold / 10000000
            
            trigger_reason = f"Volume {volume_multiplier:.1f}x above {settings.BASELINE_DAYS}-day average and traded value ₹{val_cr:.2f} Cr exceeded ₹{thresh_cr:.2f} Cr threshold."
            
            event_row = [
                f"EVT_{security_id}_{candle.minute_timestamp}", # ID
                symbol,
                security_id,
                exchange,
                segment,
                scan_date,
                now_str, # trigger_timestamp
                candle.minute_timestamp,
                candle.open,
                candle.high,
                candle.low,
                candle.close,
                candle.close, # current_price
                candle.volume,
                avg_1min_volume,
                volume_multiplier,
                traded_value,
                vol_threshold,
                val_threshold,
                volume_condition,
                value_condition,
                True,
                trigger_reason,
                settings.BASELINE_DAYS,
                "DHAN",
                now_str,
                now_str
            ]
            
            logger.info(f"TRIGGER DETECTED: {symbol} at {candle.minute_timestamp} -> {trigger_reason}")
            persistence_queue.enqueue_event(event_row, security_id, candle.minute_timestamp)

scanner_engine = ScannerEngine()
