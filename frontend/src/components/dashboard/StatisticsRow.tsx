import { useSummary } from '../../hooks/useApi';
import { TrendingUp, BarChart2, Activity } from 'lucide-react';

export function StatisticsRow() {
  const { summary, loading } = useSummary();

  if (loading) {
    return <div className="h-24 bg-slate-800/50 rounded-lg animate-pulse mb-6"></div>;
  }

  const highestSpike = summary?.top_spikes?.[0]?.volume_multiplier || 0;
  const highestValue = summary?.top_value?.[0]?.current_traded_value || 0;
  const highestValueCr = (highestValue / 10000000).toFixed(2);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-slate-800/80 rounded-lg p-5 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="text-blue-400" size={20} />
          <h3 className="text-slate-400 text-sm font-medium">Triggers Today</h3>
        </div>
        <p className="text-3xl font-bold text-slate-100">{summary?.total || 0}</p>
      </div>

      <div className="bg-slate-800/80 rounded-lg p-5 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="text-purple-400" size={20} />
          <h3 className="text-slate-400 text-sm font-medium">Highest Volume Spike</h3>
        </div>
        <p className="text-3xl font-bold text-purple-400">{highestSpike.toFixed(1)}x</p>
      </div>

      <div className="bg-slate-800/80 rounded-lg p-5 border border-slate-700/50">
        <div className="flex items-center gap-3 mb-2">
          <BarChart2 className="text-emerald-400" size={20} />
          <h3 className="text-slate-400 text-sm font-medium">Highest Traded Value</h3>
        </div>
        <p className="text-3xl font-bold text-emerald-400">₹{highestValueCr} Cr</p>
      </div>
    </div>
  );
}
