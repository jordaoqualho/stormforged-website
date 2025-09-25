// Achievement System Utility Functions

import type { AchievementStats } from "@/types/achievements";

export const calculateStats = (attacks: any[]): AchievementStats => {
  const totalAttacks = attacks.reduce((sum, attack) => sum + attack.attacks, 0);
  const totalWins = attacks.reduce((sum, attack) => sum + attack.wins, 0);
  const totalLosses = attacks.reduce((sum, attack) => sum + attack.losses, 0);
  const winRate = (totalWins + totalLosses) > 0 ? Math.round((totalWins / (totalWins + totalLosses)) * 100) : 0;
  const uniquePlayers = new Set(attacks.map((attack) => attack.playerName)).size;
  const totalPoints = attacks.reduce((sum, attack) => sum + (attack.points ?? 0), 0);

  return {
    totalAttacks,
    totalWins,
    winRate,
    uniquePlayers,
    consecutiveWins: 0, // Placeholder - would need complex calculation
    consecutiveDays: 0, // Placeholder - would need complex calculation
    totalPoints,
  };
};
