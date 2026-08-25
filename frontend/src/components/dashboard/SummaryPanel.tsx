import { useSummary } from '../../hooks/useApi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function SummaryPanel() {
  const { summary, loading } = useSummary();

  if (loading || !summary) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 h-full animate-pulse flex flex-col justify-between">
        <div className="h-6 w-1/2 bg-slate-700 rounded mb-4"></div>
        <div className="flex-1 flex justify-center items-center">
          <div className="w-32 h-32 rounded-full border-4 border-slate-700 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  const { counts } = summary;
  
  const data = [
    { name: '20x - 30x', value: counts['20x_30x'], color: '#3b82f6' }, // blue-500
    { name: '30x - 50x', value: counts['30x_50x'], color: '#8b5cf6' }, // violet-500
    { name: '50x - 100x', value: counts['50x_100x'], color: '#ec4899' }, // pink-500
    { name: '100x+', value: counts['100x_plus'], color: '#ef4444' } // red-500
  ].filter(item => item.value > 0);

  return (
    <div className="bg-slate-800 rounded-lg p-5 border border-slate-700 h-full flex flex-col">
      <h2 className="text-lg font-bold text-slate-100 mb-4">Today's Summary</h2>
      
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
          No triggers today yet.
        </div>
      ) : (
        <>
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
              <span className="text-2xl font-bold text-slate-200">{summary.total}</span>
              <span className="text-xs text-slate-500">Total</span>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            {data.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="font-bold text-slate-100">{item.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
