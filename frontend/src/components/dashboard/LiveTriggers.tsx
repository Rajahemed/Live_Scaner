import { useEffect, useState } from 'react';
import type { ScannerEvent } from '../../types';

interface LiveTriggersProps {
  events: ScannerEvent[];
}

export function LiveTriggers({ events }: LiveTriggersProps) {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // When a new event arrives, it gets prepended. We highlight the top row briefly.
  useEffect(() => {
    if (events.length > 0) {
      const latestId = events[0].id;
      setHighlightedId(latestId);
      const timer = setTimeout(() => setHighlightedId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [events]);

  if (events.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
        <p className="text-slate-400 text-lg mb-2">No triggers detected yet.</p>
        <p className="text-slate-500 text-sm">Scanner is actively monitoring NSE stocks.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Live Triggers</h2>
          <p className="text-sm text-slate-400">Stocks currently meeting the volume and value criteria</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Symbol</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">1M Volume</th>
              <th className="px-4 py-3">5D Avg</th>
              <th className="px-4 py-3">Spike</th>
              <th className="px-4 py-3">Traded Value</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {events.slice(0, 50).map((event) => {
              const isNew = event.id === highlightedId;
              const valueCr = (event.current_traded_value / 10000000).toFixed(2);
              
              return (
                <tr 
                  key={event.id} 
                  className={`hover:bg-slate-700/30 transition-colors duration-500 ${isNew ? 'bg-blue-900/40' : ''}`}
                >
                  <td className="px-4 py-3 whitespace-nowrap">{event.minute_timestamp.split(' ')[1].slice(0, 5)}</td>
                  <td className="px-4 py-3 font-bold text-blue-400 cursor-pointer hover:underline">{event.symbol}</td>
                  <td className="px-4 py-3">₹{event.current_price.toFixed(2)}</td>
                  <td className="px-4 py-3">{event.current_volume.toLocaleString()}</td>
                  <td className="px-4 py-3">{Math.round(event.average_1min_volume).toLocaleString()}</td>
                  <td className="px-4 py-3 font-semibold text-purple-400">{event.volume_multiplier.toFixed(1)}x</td>
                  <td className="px-4 py-3 font-semibold text-emerald-400">₹{valueCr} Cr</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-green-400/10 text-green-400 border border-green-400/20">
                      TRIGGERED
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
