from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from contextlib import asynccontextmanager

from app.core.config import settings
from app.google_sheets.service import google_sheets_service
from app.services.persistence import persistence_queue

from app.scanner.baseline import baseline_engine
from app.scanner.aggregator import tick_aggregator
from app.scanner.engine import scanner_engine
from app.dhan.client import dhan_ws_client
import asyncio
import logging

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up application...")
    
    # 1. Connect to Google Sheets
    google_sheets_service.connect()
    
    # 2. Start Persistence Queue
    persistence_queue.start()
    
    # 3. Load Instruments (Placeholder for loading from Sheets)
    try:
        instruments = await google_sheets_service.get_all_records("Instruments")
        scanner_engine.set_instrument_map(instruments)
        logger.info(f"Loaded {len(instruments)} instruments from Google Sheets")
    except Exception as e:
        logger.error(f"Failed to load instruments: {e}")
        
    # 4. Load Baselines
    try:
        await baseline_engine.load_baselines_from_sheets()
    except Exception as e:
        logger.error(f"Failed to load baselines: {e}")
        
    # 5. Wire Aggregator to Engine
    tick_aggregator.set_callback(scanner_engine.process_candle)
    
    # 6. Wire Dhan Client to Aggregator
    dhan_ws_client.set_callback(tick_aggregator.process_tick)
    
    # 7. Subscribe to all active instruments (if any)
    active_sids = [str(i["security_id"]) for i in scanner_engine.instrument_map.values() if str(i.get("is_active")).upper() == "TRUE"]
    if active_sids:
        dhan_ws_client.subscribed_instruments = active_sids
        
    # 8. Start Dhan WS in background
    asyncio.create_task(dhan_ws_client.connect())
    
    yield
    
    # Shutdown
    logger.info("Shutting down application...")
    await dhan_ws_client.disconnect()
    await persistence_queue.stop()

app = FastAPI(
    title="Dhan 1-Minute Scanner",
    description="Real-time stock scanner using Dhan WebSocket and Google Sheets",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.routes import scanner

app.include_router(scanner.router)

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "google_sheets": "connected" if google_sheets_service.spreadsheet else "disconnected",
        "scanner": "running"
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.BACKEND_PORT, reload=True)
