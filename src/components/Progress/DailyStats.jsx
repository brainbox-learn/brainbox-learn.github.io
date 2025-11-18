import { useProfiles } from '../../hooks/useProfiles';
import { CalendarDot } from '@phosphor-icons/react';

export function TodayStats() {
  const { getMetadata } = useProfiles();
  const metadata = getMetadata();
  const today = new Date().toISOString().split('T')[0];
  const todayStats = metadata.dailyStats?.[today];
  
  if (!todayStats) {
    return (
      <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl text-white">
        <p className="text-sm opacity-75">No practice yet today</p>
      </div>
    );
  }
  
  const accuracy = todayStats.attempts > 0 
    ? ((todayStats.correct / todayStats.attempts) * 100).toFixed(0)
    : 0;
    
  const timeMinutes = Math.round(todayStats.timeSpent / 60000);

  const getDailyText = (lang = 'fr') => {
	const translations = {
	  fr: {
		title: "Pratique d'aujourd'hui",
		attempts: 'Essais',
		accuracy: 'Précision',
		words: 'Mots',
		minutes: 'Minutes',
	  },
	  en: {
		title: "Today's Practice",
		attempts: 'Attempts',
		accuracy: 'Accuracy',
		words: 'Words',
		minutes: 'Minutes',
	  }
	};
	
	return translations[lang];
  }
  
  return (
    <div className="p-6 bg-gradient-to-r from-grade1-500 via-grade2-500 to-grade3-500 rounded-3xl text-white mb-4">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><CalendarDot size={24} weight="duotone" /> {getDailyText().title}</h3>
      
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center">	
          <div className="text-3xl font-bold">{todayStats.attempts}</div>
          <div className="text-sm opacity-75">{getDailyText().attempts}</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold">{accuracy}%</div>
          <div className="text-sm opacity-75">{getDailyText().accuracy}</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold">{todayStats.wordsAttempted.length}</div>
          <div className="text-sm opacity-75">{getDailyText().words}</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold">{timeMinutes}</div>
          <div className="text-sm opacity-75">{getDailyText().minutes}</div>
        </div>
      </div>
    </div>
  );
}