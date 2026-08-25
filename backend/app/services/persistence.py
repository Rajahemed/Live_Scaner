import asyncio
import logging
from typing import List, Dict, Any
from app.google_sheets.service import google_sheets_service

logger = logging.getLogger(__name__)

class PersistenceQueue:
    def __init__(self, batch_size: int = 50, flush_interval: float = 5.0):
        self.events_queue: List[List[Any]] = []
        self.minute_data_queue: List[List[Any]] = []
        self.logs_queue: List[List[Any]] = []
        
        self.batch_size = batch_size
        self.flush_interval = flush_interval
        
        # Simple in-memory cache to prevent duplicates
        # Keys are "security_id_minute_timestamp"
        self.processed_events = set()
        self.processed_minutes = set()
        
        self.clients: List[asyncio.Queue] = []
        
        self._running = False
        self._task = None

    async def broadcast(self, message: Dict[str, Any]):
        for client in self.clients:
            await client.put(message)

    def start(self):
        self._running = True
        self._task = asyncio.create_task(self._flush_loop())
        logger.info("PersistenceQueue started")

    async def stop(self):
        self._running = False
        if self._task:
            await self._task
        # Final flush
        await self._flush_all()
        logger.info("PersistenceQueue stopped")

    def enqueue_event(self, event_row: List[Any], security_id: str, minute_timestamp: str):
        key = f"{security_id}_{minute_timestamp}"
        if key not in self.processed_events:
            self.processed_events.add(key)
            self.events_queue.append(event_row)

    def enqueue_minute_data(self, minute_row: List[Any], security_id: str, minute_timestamp: str):
        key = f"{security_id}_{minute_timestamp}"
        if key not in self.processed_minutes:
            self.processed_minutes.add(key)
            self.minute_data_queue.append(minute_row)

    def enqueue_log(self, log_row: List[Any]):
        self.logs_queue.append(log_row)

    async def _flush_loop(self):
        while self._running:
            await asyncio.sleep(self.flush_interval)
            await self._flush_all()

    async def _flush_all(self):
        # Flush Events (Highest Priority)
        if self.events_queue:
            batch = self.events_queue[:self.batch_size]
            success = await google_sheets_service.batch_append("ScannerEvents", batch)
            if success:
                self.events_queue = self.events_queue[len(batch):]
                await self.broadcast({"type": "events", "data": batch})
            else:
                logger.warning("Failed to flush ScannerEvents, will retry later")

        # Flush Minute Data
        if self.minute_data_queue:
            batch = self.minute_data_queue[:self.batch_size]
            success = await google_sheets_service.batch_append("MinuteData", batch)
            if success:
                self.minute_data_queue = self.minute_data_queue[len(batch):]
                await self.broadcast({"type": "minute_data", "data": batch})
            else:
                logger.warning("Failed to flush MinuteData, will retry later")
                
        # Flush Logs
        if self.logs_queue:
            batch = self.logs_queue[:self.batch_size]
            success = await google_sheets_service.batch_append("SystemLogs", batch)
            if success:
                self.logs_queue = self.logs_queue[len(batch):]

persistence_queue = PersistenceQueue()
