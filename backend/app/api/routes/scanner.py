from fastapi import APIRouter, Query, HTTPException, Request
from typing import List, Dict, Any, Optional
import asyncio
import json
from sse_starlette.sse import EventSourceResponse
from app.google_sheets.service import google_sheets_service
from app.services.persistence import persistence_queue

router = APIRouter(prefix="/api/scanner", tags=["scanner"])

@router.get("/stream")
async def scanner_stream(request: Request):
    async def event_generator():
        client_queue = asyncio.Queue()
        persistence_queue.clients.append(client_queue)
        try:
            while True:
                if await request.is_disconnected():
                    break
                message = await client_queue.get()
                yield json.dumps(message)
        except asyncio.CancelledError:
            pass
        finally:
            persistence_queue.clients.remove(client_queue)

    return EventSourceResponse(event_generator())

@router.get("/summary")
async def get_summary():
    try:
        # Fetch today's events for the summary (Simplified for now)
        records = await google_sheets_service.get_all_records("ScannerEvents")
        
        # In a real scenario, filter by today's date
        today_records = records
        
        counts = {
            "20x_30x": 0,
            "30x_50x": 0,
            "50x_100x": 0,
            "100x_plus": 0
        }
        
        # Sort by spike
        sorted_records = sorted(today_records, key=lambda x: float(x.get("volume_multiplier", 0)), reverse=True)
        top_spikes = sorted_records[:5]
        
        sorted_by_value = sorted(today_records, key=lambda x: float(x.get("current_traded_value", 0)), reverse=True)
        top_value = sorted_by_value[:5]
        
        for r in today_records:
            mult = float(r.get("volume_multiplier", 0))
            if 20 <= mult < 30:
                counts["20x_30x"] += 1
            elif 30 <= mult < 50:
                counts["30x_50x"] += 1
            elif 50 <= mult < 100:
                counts["50x_100x"] += 1
            elif mult >= 100:
                counts["100x_plus"] += 1
                
        return {
            "success": True,
            "counts": counts,
            "total": len(today_records),
            "top_spikes": top_spikes,
            "top_value": top_value
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_status():
    return {
        "status": "running",
        "google_sheets_connected": google_sheets_service.spreadsheet is not None
    }

@router.get("/events")
async def get_events(
    limit: int = Query(50, ge=1, le=500),
    symbol: Optional[str] = None
) -> Dict[str, Any]:
    try:
        # Note: In a production app with huge sheets, getting all records might be slow.
        # This is simplified. In a real system, you might paginate with sheet ranges or a memory cache.
        records = await google_sheets_service.get_all_records("ScannerEvents")
        
        # Apply filters
        if symbol:
            records = [r for r in records if r.get("symbol") == symbol]
            
        # Reverse to get newest first (assuming appended at bottom)
        records.reverse()
        
        return {
            "success": True,
            "data": records[:limit],
            "pagination": {
                "limit": limit,
                "total": len(records)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/minute-data")
async def get_minute_data(
    limit: int = Query(100, ge=1, le=1000),
    symbol: Optional[str] = None
) -> Dict[str, Any]:
    try:
        records = await google_sheets_service.get_all_records("MinuteData")
        
        if symbol:
            records = [r for r in records if r.get("symbol") == symbol]
            
        records.reverse()
        
        return {
            "success": True,
            "data": records[:limit],
            "pagination": {
                "limit": limit,
                "total": len(records)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stocks")
async def get_stocks():
    try:
        records = await google_sheets_service.get_all_records("Instruments")
        return {
            "success": True,
            "data": records,
            "total": len(records)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
