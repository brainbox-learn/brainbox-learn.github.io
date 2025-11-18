import { useProfiles } from '../../hooks/useProfiles';
import { Rocket, Flame, Star, Plant } from '@phosphor-icons/react';

export function StreakDisplay() {
  const { getMetadata } = useProfiles();
  const metadata = getMetadata();

  console.log('metadata', metadata)

  // Get the right icon based on streak
  const getStreakIcon = (streak) => {
    if (streak >= 30) return Rocket;
    if (streak >= 14) return Flame;
    if (streak >= 7) return Star;
    if (streak >= 3) return Plant;
    return Plant; // default
  };

  const StreakIcon = getStreakIcon(metadata.currentStreak);

  const getStreakText = () => {
    return `jours de suite!`; // french translation
  };

  return (
    <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-grade1-500 via-grade2-500 to-grade3-500 rounded-3xl text-base font-semibold transition-all transform hover:scale-105 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm mb-4">
      <StreakIcon size={28} weight="duotone" />
      <span className="text-xl font-bold">{metadata.currentStreak}</span>
      <span className="text-sm opacity-90">{getStreakText()}</span>
    </div>
  );
}