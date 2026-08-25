import { useState, useEffect } from 'react';
import type { ScannerEvent, MinuteData } from '../types';

export function useScannerStream() {
  const [events, setEvents] = useState<ScannerEvent[]>([]);
  const [minuteData, setMinuteData] = useState<MinuteData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // We connect to the backend stream
    const eventSource = new EventSource('http://localhost:8000/api/scanner/stream');

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'events') {
          // Add new events to the top
          setEvents(prev => [...data.data, ...prev]);
        } else if (data.type === 'minute_data') {
          setMinuteData(prev => [...data.data, ...prev]);
        }
      } catch (err) {
        console.error("Failed to parse SSE message", err);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      setError("Lost connection to real-time stream. Reconnecting...");
      // EventSource automatically attempts to reconnect.
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return { events, minuteData, isConnected, error, setEvents, setMinuteData };
}
