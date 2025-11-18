import { useProfiles } from '../../hooks/useProfiles';
import { ChartLine } from '@phosphor-icons/react';

export function WeeklyStats() {
  const { getMetadata } = useProfiles();
  const metadata = getMetadata();
  const dailyStats = metadata.dailyStats || {};
  
  const getWeeklyText = (lang = 'fr') => {
    const translations = {
      fr: {
        title: 'Cette semaine',
        totalThisWeek: 'Total cette semaine',
        attempts: 'essais',
        daysShort: {
          Mon: 'Lun',
          Tue: 'Mar',
          Wed: 'Mer',
          Thu: 'Jeu',
          Fri: 'Ven',
          Sat: 'Sam',
          Sun: 'Dim'
        }
      },
      en: {
        title: 'This Week',
        totalThisWeek: 'Total this week',
        attempts: 'attempts',
        daysShort: {
          Mon: 'Mon',
          Tue: 'Tue',
          Wed: 'Wed',
          Thu: 'Thu',
          Fri: 'Fri',
          Sat: 'Sat',
          Sun: 'Sun'
        }
      }
    };
    
    return translations[lang];
  };

  const text = getWeeklyText('fr');
  
  // Get last 7 days starting from today going back
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i)); // Start from 6 days ago
    return date.toISOString().split('T')[0];
  });
  
  const weekData = last7Days.map(date => {
    const dayEn = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    
    return {
      date,
      dayEn: dayEn,
      dayFr: text.daysShort[dayEn], // French day name
      attempts: dailyStats[date]?.attempts || 0,
      accuracy: dailyStats[date]?.attempts 
        ? ((dailyStats[date].correct / dailyStats[date].attempts) * 100).toFixed(0)
        : 0
    };
  });
  
  const maxAttempts = Math.max(...weekData.map(d => d.attempts), 1);
  const totalAttempts = weekData.reduce((sum, d) => sum + d.attempts, 0);
  
  return (
    <div className="p-6 bg-gradient-to-r from-grade1-500 via-grade2-500 to-grade3-500 rounded-3xl text-white mb-4">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <ChartLine size={24} weight="duotone" /> {text.title}
      </h3>
      
      <div className="flex items-end justify-between gap-2 h-32">
        {weekData.map(day => (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
            <div 
              className="w-full bg-white/40 rounded-t-lg transition-all hover:bg-white/60"
              style={{ 
                height: `${(day.attempts / maxAttempts) * 100}%`,
                minHeight: day.attempts > 0 ? '8px' : '2px'
              }}
            />
            <div className="text-xs opacity-75">{day.dayFr}</div>
            <div className="text-xs font-bold">{day.attempts}</div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-sm opacity-75 text-center">
        {text.totalThisWeek}: {totalAttempts} {text.attempts}
      </div>
    </div>
  );
}