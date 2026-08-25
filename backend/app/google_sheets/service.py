import gspread
from google.oauth2.service_account import Credentials
import asyncio
import logging
from typing import List, Dict, Any, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

class GoogleSheetsService:
    def __init__(self):
        self.scopes = [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive'
        ]
        self.credentials = None
        self.client = None
        self.spreadsheet = None

    def connect(self):
        """Synchronous connect method - useful for startup."""
        try:
            self.credentials = Credentials.from_service_account_file(
                settings.GOOGLE_SERVICE_ACCOUNT_JSON,
                scopes=self.scopes
            )
            self.client = gspread.authorize(self.credentials)
            self.spreadsheet = self.client.open_by_key(settings.GOOGLE_SPREADSHEET_ID)
            logger.info("Successfully connected to Google Sheets")
            self._ensure_worksheets()
        except Exception as e:
            logger.error(f"Failed to connect to Google Sheets: {e}")
            raise

    def _ensure_worksheets(self):
        """Ensures all required worksheets exist."""
        required_sheets = [
            "Instruments",
            "MinuteData",
            "ScannerEvents",
            "Baselines",
            "ScannerConfig",
            "SystemLogs"
        ]
        existing_sheets = [ws.title for ws in self.spreadsheet.worksheets()]
        for sheet_name in required_sheets:
            if sheet_name not in existing_sheets:
                self.spreadsheet.add_worksheet(title=sheet_name, rows=1000, cols=30)
                logger.info(f"Created missing worksheet: {sheet_name}")

    async def batch_append(self, sheet_name: str, values: List[List[Any]]) -> bool:
        """Appends multiple rows to a sheet asynchronously."""
        if not self.spreadsheet:
            logger.error("Not connected to Google Sheets.")
            return False
            
        try:
            # Run the synchronous gspread call in a thread pool
            worksheet = self.spreadsheet.worksheet(sheet_name)
            await asyncio.to_thread(
                worksheet.append_rows,
                values,
                value_input_option='USER_ENTERED'
            )
            return True
        except Exception as e:
            logger.error(f"Failed to batch append to {sheet_name}: {e}")
            return False

    async def get_all_records(self, sheet_name: str) -> List[Dict[str, Any]]:
        if not self.spreadsheet:
            logger.error("Not connected to Google Sheets.")
            return []
            
        try:
            worksheet = self.spreadsheet.worksheet(sheet_name)
            records = await asyncio.to_thread(worksheet.get_all_records)
            return records
        except Exception as e:
            logger.error(f"Failed to get records from {sheet_name}: {e}")
            return []

google_sheets_service = GoogleSheetsService()
