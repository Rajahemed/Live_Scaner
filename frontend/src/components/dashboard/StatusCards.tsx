import { useSystemStatus } from '../../hooks/useApi';
import { useMarketClock } from '../../hooks/useMarketClock';
import { useScannerStream } from '../../hooks/useScannerStream';
import { Globe, Activity, Database, CheckCircle, XCircle } from 'lucide-react';

export function StatusCards() {
  const systemStatus = useSystemStatus();
  const { isMarketOpen } = useMarketClock();
  const { isConnected } = useScannerStream();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Market Card */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex items-center justify-between">
        <div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">MARKET</h3>
          <p className={`text-lg font-bold ${isMarketOpen ? 'text-green-400' : 'text-gray-400'}`}>
            {isMarketOpen ? 'OPEN' : 'CLOSED'}
          </p>
          <p className="text-xs text-slate-500 mt-1">09:15 - 15:30 IST</p>
        </div>
        <Globe size={32} className={isMarketOpen ? 'text-green-400/20' : 'text-gray-400/20'} />
      </div>

      {/* Scanner Card */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex items-center justify-between">
        <div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">SCANNER</h3>
          <p className={`text-lg font-bold ${systemStatus?.status === 'running' ? 'text-green-400' : 'text-red-400'}`}>
            {systemStatus?.status === 'running' ? 'RUNNING' : 'STOPPED'}
          </p>
          <p className="text-xs text-slate-500 mt-1">Status from API</p>
        </div>
        <Activity size={32} className={systemStatus?.status === 'running' ? 'text-green-400/20' : 'text-red-400/20'} />
      </div>

      {/* Dhan WebSocket Card */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex items-center justify-between">
        <div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">DHAN WEBSOCKET</h3>
          <div className="flex items-center gap-2">
            {isConnected ? <CheckCircle size={16} className="text-green-400"/> : <XCircle size={16} className="text-red-400"/>}
            <p className={`text-lg font-bold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </p>
          </div>
          <p className="text-xs text-slate-500 mt-1">Live Feed</p>
        </div>
      </div>

      {/* Google Sheets Card */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex items-center justify-between">
        <div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">GOOGLE SHEETS</h3>
          <div className="flex items-center gap-2">
            {systemStatus?.google_sheets_connected ? <CheckCircle size={16} className="text-green-400"/> : <XCircle size={16} className="text-red-400"/>}
            <p className={`text-lg font-bold ${systemStatus?.google_sheets_connected ? 'text-green-400' : 'text-red-400'}`}>
              {systemStatus?.google_sheets_connected ? 'CONNECTED' : 'ERROR'}
            </p>
          </div>
          <p className="text-xs text-slate-500 mt-1">Persistence Storage</p>
        </div>
        <Database size={32} className={systemStatus?.google_sheets_connected ? 'text-green-400/20' : 'text-red-400/20'} />
      </div>
    </div>
  );
}
