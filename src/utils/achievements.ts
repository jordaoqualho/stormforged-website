// Achievement System Utility Functions

import type { AchievementStats } from "@/types/achievements";

export const calculateStats = (attacks: any[]): AchievementStats => {
  const totalAttacks = attacks.reduce((sum, attack) => sum + attack.attacks, 0);
  const totalWins = attacks.reduce((sum, attack) => sum + attack.wins, 0);
  const totalLosses = attacks.reduce((sum, attack) => sum + attack.losses, 0);
  const totalDraws = attacks.reduce((sum, attack) => sum + (attack.draws ?? 0), 0);
  
  // Calculate points-based success rate
  const actualPoints = (totalWins * 5) + (totalDraws * 3) + (totalLosses * 2);
  const maxPossiblePoints = (totalWins + totalDraws + totalLosses) * 5;
  const winRate = maxPossiblePoints > 0 ? Math.round((actualPoints / maxPossiblePoints) * 100) : 0;
  
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
