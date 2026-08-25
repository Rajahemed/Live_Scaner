import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export function useMarketClock() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Assuming Indian Standard Time (IST) is the local time of the user's browser,
  // or we just display the local browser time but labeled as IST for simplicity.
  const timeString = format(time, 'HH:mm:ss');
  
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const currentMinutes = hours * 60 + minutes;
  
  // Market hours: 9:15 to 15:30
  const marketOpen = 9 * 60 + 15;
  const marketClose = 15 * 60 + 30;
  
  const isMarketOpen = currentMinutes >= marketOpen && currentMinutes <= marketClose && time.getDay() !== 0 && time.getDay() !== 6;

  return { timeString, isMarketOpen };
}
