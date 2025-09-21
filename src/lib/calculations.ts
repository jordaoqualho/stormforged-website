import { AttackRecord, ComparisonData, DailyStats, PlayerWeeklyStats, WeeklyStats } from "@/types";

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getWeekStart(date: string): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const weekStart = new Date(d.setDate(diff));
  return formatDate(weekStart);
}

export function getWeekEnd(date: string): string {
  const weekStart = new Date(getWeekStart(date));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return formatDate(weekEnd);
}

export function isSameWeek(date1: string, date2: string): boolean {
  return getWeekStart(date1) === getWeekStart(date2);
}

export function calculateDailyStats(attacks: AttackRecord[], date: string): DailyStats {
  const dayAttacks = attacks.filter((attack) => attack.date === date);

  const totalAttacks = dayAttacks.reduce((sum, attack) => sum + attack.attacks, 0);
  const totalWins = dayAttacks.reduce((sum, attack) => sum + attack.wins, 0);
  const totalLosses = totalAttacks - totalWins;
  const winRate = totalAttacks > 0 ? (totalWins / totalAttacks) * 100 : 0;
  const playerCount = new Set(dayAttacks.map((attack) => attack.playerName)).size;

  return {
    date,
    totalAttacks,
    totalWins,
    totalLosses,
    winRate: Math.round(winRate * 100) / 100,
    playerCount,
  };
}

export function calculateWeeklyStats(attacks: AttackRecord[], weekStart: string): WeeklyStats {
  const weekEnd = getWeekEnd(weekStart);
  const weekAttacks = attacks.filter((attack) => attack.date >= weekStart && attack.date <= weekEnd);

  // Calculate daily stats for the week
  const dailyStats: DailyStats[] = [];
  const startDate = new Date(weekStart);
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateStr = formatDate(currentDate);
    dailyStats.push(calculateDailyStats(attacks, dateStr));
  }

  // Calculate player stats
  const playerMap = new Map<string, PlayerWeeklyStats>();

  weekAttacks.forEach((attack) => {
    const existing = playerMap.get(attack.playerName);
    if (existing) {
      existing.totalAttacks += attack.attacks;
      existing.totalWins += attack.wins;
      existing.totalLosses += attack.losses;
      existing.dailyAttacks.push(attack);
    } else {
      playerMap.set(attack.playerName, {
        playerName: attack.playerName,
        totalAttacks: attack.attacks,
        totalWins: attack.wins,
        totalLosses: attack.losses,
        winRate: 0,
        dailyAttacks: [attack],
      });
    }
  });

  // Calculate win rates for each player
  playerMap.forEach((player) => {
    player.winRate = player.totalAttacks > 0 ? Math.round((player.totalWins / player.totalAttacks) * 10000) / 100 : 0;
  });

  const totalAttacks = weekAttacks.reduce((sum, attack) => sum + attack.attacks, 0);
  const totalWins = weekAttacks.reduce((sum, attack) => sum + attack.wins, 0);
  const totalLosses = totalAttacks - totalWins;
  const winRate = totalAttacks > 0 ? Math.round((totalWins / totalAttacks) * 10000) / 100 : 0;

  return {
    weekStart,
    weekEnd,
    totalAttacks,
    totalWins,
    totalLosses,
    winRate,
    dailyStats,
    playerStats: Array.from(playerMap.values()),
  };
}

export function calculateComparison(currentWeek: WeeklyStats, previousWeek: WeeklyStats | null): ComparisonData {
  if (!previousWeek) {
    return {
      currentWeek,
      previousWeek: null,
      improvement: {
        winRateChange: 0,
        totalAttacksChange: 0,
        totalWinsChange: 0,
      },
    };
  }

  const winRateChange = Math.round((currentWeek.winRate - previousWeek.winRate) * 100) / 100;
  const totalAttacksChange = currentWeek.totalAttacks - previousWeek.totalAttacks;
  const totalWinsChange = currentWeek.totalWins - previousWeek.totalWins;

  return {
    currentWeek,
    previousWeek,
    improvement: {
      winRateChange,
      totalAttacksChange,
      totalWinsChange,
    },
  };
}

export function getCurrentWeekStats(attacks: AttackRecord[]): WeeklyStats {
  const today = formatDate(new Date());
  const weekStart = getWeekStart(today);
  return calculateWeeklyStats(attacks, weekStart);
}

export function getPreviousWeekStats(attacks: AttackRecord[]): WeeklyStats | null {
  const today = formatDate(new Date());
  const currentWeekStart = new Date(getWeekStart(today));
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(currentWeekStart.getDate() - 7);

  const previousWeekStartStr = formatDate(previousWeekStart);
  const previousWeekEnd = getWeekEnd(previousWeekStartStr);

  // Check if there are any attacks in the previous week
  const hasPreviousWeekData = attacks.some(
    (attack) => attack.date >= previousWeekStartStr && attack.date <= previousWeekEnd
  );

  if (!hasPreviousWeekData) {
    return null;
  }

  return calculateWeeklyStats(attacks, previousWeekStartStr);
}
