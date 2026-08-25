import { useState, useMemo } from 'react';
import type { MinuteData } from '../../types';

interface MarketScannerProps {
  minuteData: MinuteData[];
}

export function MarketScanner({ minuteData }: MarketScannerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use useMemo to filter only the latest data point per symbol and apply search
  const latestData = useMemo(() => {
    const map = new Map<string, MinuteData>();
    // Since data arrives chronologically, we iterate and overwrite, 
    // or reverse iterate and break. Assuming minuteData is descending (newest first) 
    // from our stream or API.
    for (const item of minuteData) {
      if (!map.has(item.symbol)) {
        map.set(item.symbol, item);
      }
    }
    
    let results = Array.from(map.values());
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(item => item.symbol.toLowerCase().includes(term));
    }
    
    // Sort by volume multiplier descending
    results.sort((a, b) => b.volume_multiplier - a.volume_multiplier);
    
    return results;
  }, [minuteData, searchTerm]);

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden flex flex-col h-[500px]">
      <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Market Scanner</h2>
          <p className="text-sm text-slate-400">Live feed of all monitored stocks</p>
        </div>
        <div>
          <input 
            type="text" 
            placeholder="Search symbol..." 
            className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-48 p-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-auto flex-1">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase sticky top-0 shadow-sm z-10">
            <tr>
              <th className="px-4 py-3">Symbol</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">1M Vol</th>
              <th className="px-4 py-3">Multiple</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3 text-center">Vol Cond</th>
              <th className="px-4 py-3 text-center">Val Cond</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {latestData.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  No active stock data found.
                </td>
              </tr>
            ) : (
              latestData.map((item) => {
                const valueCr = (item.traded_value / 10000000).toFixed(2);
                
                return (
                  <tr key={item.id} className="hover:bg-slate-700/30">
                    <td className="px-4 py-3 font-bold text-slate-200">{item.symbol}</td>
                    <td className="px-4 py-3">₹{item.close.toFixed(2)}</td>
                    <td className="px-4 py-3">{item.volume.toLocaleString()}</td>
                    <td className="px-4 py-3">{item.volume_multiplier.toFixed(1)}x</td>
                    <td className="px-4 py-3">₹{valueCr} Cr</td>
                    <td className="px-4 py-3 text-center">
                      {item.volume_condition ? (
                        <span className="text-green-400 font-bold">PASS</span>
                      ) : (
                        <span className="text-slate-500">FAIL</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.value_condition ? (
                        <span className="text-green-400 font-bold">PASS</span>
                      ) : (
                        <span className="text-slate-500">FAIL</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.triggered ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-green-400/10 text-green-400 border border-green-400/20">
                          TRIGGERED
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-slate-700 text-slate-400 border border-slate-600">
                          NORMAL
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
