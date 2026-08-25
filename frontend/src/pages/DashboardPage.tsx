import { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { StatusCards } from '../components/dashboard/StatusCards';
import { StatisticsRow } from '../components/dashboard/StatisticsRow';
import { LiveTriggers } from '../components/dashboard/LiveTriggers';
import { MarketScanner } from '../components/dashboard/MarketScanner';
import { SummaryPanel } from '../components/dashboard/SummaryPanel';
import { TopSpikes } from '../components/dashboard/TopSpikes';
import { useScannerStream } from '../hooks/useScannerStream';
import { fetchHistoricalEvents, fetchMinuteData } from '../hooks/useApi';

export function DashboardPage() {
  const { events, minuteData, setEvents, setMinuteData } = useScannerStream();
  const [loading, setLoading] = useState(true);

  // Initial load of history
  useEffect(() => {
    const loadInitialData = async () => {
      const [histEvents, histMinuteData] = await Promise.all([
        fetchHistoricalEvents(),
        fetchMinuteData()
      ]);
      setEvents(histEvents);
      setMinuteData(histMinuteData);
      setLoading(false);
    };
    
    loadInitialData();
  }, [setEvents, setMinuteData]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto p-4 flex flex-col gap-6 mt-4">
        <StatusCards />
        
        <StatisticsRow />
        
        {loading ? (
          <div className="h-64 bg-slate-800 rounded-lg animate-pulse border border-slate-700"></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 flex flex-col gap-6">
              {/* Main Trigger Table */}
              <LiveTriggers events={events} />
              
              {/* Secondary Scanner Table */}
              <MarketScanner minuteData={minuteData} />
            </div>
            
            <div className="lg:col-span-1 flex flex-col gap-6">
              {/* Right Sidebar Widgets */}
              <div className="h-96">
                <SummaryPanel />
              </div>
              <div className="h-96">
                <TopSpikes />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
