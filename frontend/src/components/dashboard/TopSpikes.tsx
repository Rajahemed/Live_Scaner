import { useSummary } from '../../hooks/useApi';

export function TopSpikes() {
  const { summary, loading } = useSummary();

  if (loading || !summary) {
    return (
      <div className="bg-slate-800 rounded-lg p-5 border border-slate-700 h-full animate-pulse flex flex-col gap-4">
        <div className="h-6 w-1/2 bg-slate-700 rounded"></div>
        <div className="space-y-3 mt-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-4 bg-slate-700 rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  const { top_spikes, top_value } = summary;

  return (
    <div className="grid grid-cols-1 gap-4 h-full">
      {/* Top Volume Spikes */}
      <div className="bg-slate-800 rounded-lg p-5 border border-slate-700 flex flex-col">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">
          Top Volume Spikes
        </h2>
        {top_spikes.length === 0 ? (
          <p className="text-slate-500 text-sm italic">No data today</p>
        ) : (
          <div className="space-y-3">
            {top_spikes.map((event, idx) => (
              <div key={`spike-${idx}`} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-slate-600 font-mono w-4">{idx + 1}.</span>
                  <span className="font-semibold text-slate-200">{event.symbol}</span>
                </div>
                <span className="font-bold text-purple-400">{event.volume_multiplier.toFixed(1)}x</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Traded Value Spikes */}
      <div className="bg-slate-800 rounded-lg p-5 border border-slate-700 flex flex-col">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">
          Top Traded Value
        </h2>
        {top_value.length === 0 ? (
          <p className="text-slate-500 text-sm italic">No data today</p>
        ) : (
          <div className="space-y-3">
            {top_value.map((event, idx) => {
              const valueCr = (event.current_traded_value / 10000000).toFixed(2);
              return (
                <div key={`val-${idx}`} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600 font-mono w-4">{idx + 1}.</span>
                    <span className="font-semibold text-slate-200">{event.symbol}</span>
                  </div>
                  <span className="font-bold text-emerald-400">₹{valueCr} Cr</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
