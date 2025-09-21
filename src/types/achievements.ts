// Achievement System Types

export type AchievementRarity = "common" | "rare" | "epic" | "legendary" | "mythic";
export type AchievementCategory = "daily" | "weekly" | "lifetime" | "special";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  condition: (stats: AchievementStats, dailyStats?: DailyStats, weeklyStats?: WeeklyStats) => boolean;
  rarity: AchievementRarity;
  category: AchievementCategory;
  progress?: (stats: AchievementStats, dailyStats?: DailyStats, weeklyStats?: WeeklyStats) => number;
  maxProgress?: number;
}

export interface AchievementStats {
  totalAttacks: number;
  totalWins: number;
  winRate: number;
  uniquePlayers: number;
  consecutiveWins: number;
  consecutiveDays: number;
}

export interface DailyStats {
  dailyAttacks: number;
  dailyWins: number;
  dailyMembers: number;
  dailyWinRate: number;
}

export interface WeeklyStats {
  weeklyAttacks: number;
  weeklyWins: number;
  weeklyWinRate: number;
  activeDays: number;
  weekComplete: boolean;
}

export interface AchievementBadgeProps {
  achievement: Achievement;
  isNew?: boolean;
  onClick?: () => void;
  progress?: number;
  maxProgress?: number;
}

export interface AchievementModalProps {
  achievement: Achievement;
  isOpen: boolean;
  onClose: () => void;
}
