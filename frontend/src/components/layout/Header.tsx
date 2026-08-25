import { useMarketClock } from '../../hooks/useMarketClock';
import { useScannerStream } from '../../hooks/useScannerStream';
import { Activity } from 'lucide-react';

export function Header() {
  const { timeString, isMarketOpen } = useMarketClock();
  const { isConnected } = useScannerStream();

  return (
    <header className="bg-slate-800 border-b border-slate-700 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Activity className="text-blue-400" size={28} />
          <div>
            <h1 className="text-xl font-bold text-slate-100">Dhan 1-Minute Scanner</h1>
            <p className="text-xs text-slate-400">Real-time NSE equity volume & value spike detector</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-300">
              Market: <span className={isMarketOpen ? "text-green-400" : "text-gray-400"}>{isMarketOpen ? "OPEN" : "CLOSED"}</span>
            </span>
            <span className="text-sm font-semibold text-slate-300">
              Scanner: <span className={isConnected ? "text-green-400" : "text-red-400"}>{isConnected ? "RUNNING" : "STOPPED"}</span>
            </span>
          </div>
          <div className="bg-slate-900 px-4 py-2 rounded-lg border border-slate-700">
            <span className="font-mono text-lg font-bold text-blue-400">{timeString} IST</span>
          </div>
        </div>
      </div>
    </header>
  );
}
