export interface AttackRecord {
  id: string;
  playerName: string;
  date: string; // YYYY-MM-DD format
  attacks: number; // Total attacks (max 5)
  wins: number; // Number of wins
  losses: number; // Number of losses
  draws: number; // Number of draws
  points: number; // Total points earned (5*wins + 2*losses + 3*draws)
}

export interface DailyStats {
  date: string;
  totalAttacks: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  totalPoints: number;
  winRate: number;
  playerCount: number;
}

export interface WeeklyStats {
  weekStart: string; // YYYY-MM-DD format
  weekEnd: string; // YYYY-MM-DD format
  totalAttacks: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  totalPoints: number;
  winRate: number;
  dailyStats: DailyStats[];
  playerStats: PlayerWeeklyStats[];
}

export interface PlayerWeeklyStats {
  playerName: string;
  totalAttacks: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  totalPoints: number;
  winRate: number;
  dailyAttacks: AttackRecord[];
}

export interface GuildWarData {
  attacks: AttackRecord[];
  lastUpdated: string;
}

export interface ComparisonData {
  currentWeek: WeeklyStats;
  previousWeek: WeeklyStats | null;
  improvement: {
    winRateChange: number;
    totalAttacksChange: number;
    totalWinsChange: number;
  };
}
