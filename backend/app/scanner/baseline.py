import logging
from typing import Dict
from app.google_sheets.service import google_sheets_service
from app.core.config import settings

logger = logging.getLogger(__name__)

class BaselineEngine:
    def __init__(self):
        # Cache for baseline data: security_id -> minute_of_day (e.g., "10:25") -> avg_volume
        self._baselines: Dict[str, Dict[str, float]] = {}

    async def load_baselines_from_sheets(self):
        """Loads historical 5-day baselines into memory from Google Sheets."""
        logger.info("Loading baselines from Google Sheets...")
        records = await google_sheets_service.get_all_records("Baselines")
        
        self._baselines.clear()
        loaded_count = 0
        
        for row in records:
            security_id = str(row.get("security_id"))
            minute_of_day = str(row.get("minute_of_day"))
            avg_volume = float(row.get("average_volume", 0.0))
            sample_days = int(row.get("sample_days", 0))
            
            # Ensure we only use valid 5-day baselines
            if sample_days >= settings.BASELINE_DAYS:
                if security_id not in self._baselines:
                    self._baselines[security_id] = {}
                self._baselines[security_id][minute_of_day] = avg_volume
                loaded_count += 1
                
        logger.info(f"Loaded {loaded_count} valid baseline records.")

    def get_baseline_volume(self, security_id: str, minute_timestamp: str) -> float:
        """
        Retrieves the 5-day baseline volume for a specific stock at a specific minute.
        minute_timestamp format expected: "YYYY-MM-DD HH:MM:00"
        Extracts "HH:MM" for the lookup.
        """
        try:
            minute_of_day = minute_timestamp.split(" ")[1][:5] # "10:25"
            
            if security_id in self._baselines:
                if minute_of_day in self._baselines[security_id]:
                    return self._baselines[security_id][minute_of_day]
            
            return 0.0
        except Exception as e:
            logger.error(f"Error getting baseline volume: {e}")
            return 0.0

baseline_engine = BaselineEngine()
