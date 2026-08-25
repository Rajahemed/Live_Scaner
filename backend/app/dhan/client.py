import asyncio
import websockets
import logging
from typing import List, Callable, Optional

from app.core.config import settings
from app.dhan.parser import DhanBinaryParser, MarketTick

logger = logging.getLogger(__name__)

class DhanWebSocketClient:
    def __init__(self, client_id: str, access_token: str):
        self.client_id = client_id
        self.access_token = access_token
        # WSS endpoint for Dhan Market Feed. Adjust to the official production URL.
        self.wss_url = f"wss://api-feed.dhan.co?version=2&token={access_token}&clientId={client_id}"
        
        self.connection: Optional[websockets.WebSocketClientProtocol] = None
        self._running = False
        self._reconnect_delay = 1.0
        self.on_tick_callback: Optional[Callable[[MarketTick], None]] = None
        self.subscribed_instruments = []

    def set_callback(self, callback: Callable[[MarketTick], None]):
        self.on_tick_callback = callback

    async def connect(self):
        self._running = True
        while self._running:
            try:
                logger.info("Connecting to Dhan WebSocket...")
                async with websockets.connect(self.wss_url) as ws:
                    self.connection = ws
                    logger.info("Successfully connected to Dhan WebSocket")
                    self._reconnect_delay = 1.0 # Reset backoff
                    
                    if self.subscribed_instruments:
                        await self.subscribe(self.subscribed_instruments)
                    
                    await self._receive_loop()
            except Exception as e:
                logger.error(f"Dhan WebSocket connection error: {e}")
                self.connection = None
                if self._running:
                    logger.info(f"Reconnecting in {self._reconnect_delay} seconds...")
                    await asyncio.sleep(self._reconnect_delay)
                    self._reconnect_delay = min(self._reconnect_delay * 2, 60.0)

    async def disconnect(self):
        self._running = False
        if self.connection:
            await self.connection.close()
            self.connection = None
            logger.info("Disconnected from Dhan WebSocket")

    async def subscribe(self, security_ids: List[str]):
        """Subscribes to a list of security IDs for market feed."""
        self.subscribed_instruments = security_ids
        if not self.connection:
            logger.warning("Cannot subscribe: WebSocket is not connected")
            return
            
        # Example JSON payload for subscription. Adjust to Dhan's format.
        # Often it's a JSON containing a list of objects or a specific byte structure.
        # Assuming JSON for subscription request.
        try:
            payload = {
                "RequestCode": 15, # Example code for Market Feed Subscribe
                "InstrumentCount": len(security_ids),
                "InstrumentList": [{"ExchangeSegment": 1, "SecurityId": int(sid)} for sid in security_ids]
            }
            import json
            await self.connection.send(json.dumps(payload))
            logger.info(f"Sent subscription request for {len(security_ids)} instruments")
        except Exception as e:
            logger.error(f"Failed to send subscription: {e}")

    async def _receive_loop(self):
        while self._running and self.connection:
            try:
                # Dhan sends binary data for market feeds
                message = await self.connection.recv()
                if isinstance(message, bytes):
                    tick = DhanBinaryParser.parse_packet(message)
                    if tick and self.on_tick_callback:
                        self.on_tick_callback(tick)
            except websockets.exceptions.ConnectionClosed:
                logger.warning("WebSocket connection closed by server")
                break
            except Exception as e:
                logger.error(f"Error in receive loop: {e}")

dhan_ws_client = DhanWebSocketClient(
    client_id=settings.DHAN_CLIENT_ID,
    access_token=settings.DHAN_ACCESS_TOKEN
)
