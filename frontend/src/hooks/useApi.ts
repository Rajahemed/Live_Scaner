import { useState, useEffect } from 'react';
import type { ScannerEvent, MinuteData, SummaryStats, SystemStatus } from '../types';

const API_BASE = 'http://localhost:8000/api/scanner';

export function useSystemStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/status`);
        const data = await res.json();
        setStatus(data);
      } catch (e) {
        setStatus({ status: 'error', google_sheets_connected: false });
      }
    };
    
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return status;
}

export function useSummary() {
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch(`${API_BASE}/summary`);
        const data = await res.json();
        if (data.success) {
          setSummary(data);
        }
      } catch (e) {
        console.error("Failed to fetch summary");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSummary();
    const interval = setInterval(fetchSummary, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  return { summary, loading };
}

export async function fetchHistoricalEvents(symbol?: string) {
  try {
    const url = symbol ? `${API_BASE}/events?symbol=${symbol}` : `${API_BASE}/events`;
    const res = await fetch(url);
    const data = await res.json();
    return data.success ? (data.data as ScannerEvent[]) : [];
  } catch (e) {
    console.error("Failed to fetch historical events", e);
    return [];
  }
}

export async function fetchMinuteData(symbol?: string) {
  try {
    const url = symbol ? `${API_BASE}/minute-data?symbol=${symbol}` : `${API_BASE}/minute-data`;
    const res = await fetch(url);
    const data = await res.json();
    return data.success ? (data.data as MinuteData[]) : [];
  } catch (e) {
    console.error("Failed to fetch minute data", e);
    return [];
  }
}
