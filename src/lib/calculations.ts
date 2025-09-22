import { AttackRecord, ComparisonData, DailyStats, PlayerWeeklyStats, WeeklyStats } from "@/types";

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatDate(date: Date): string {
  // Format date in local timezone to avoid UTC conversion issues
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDate(dateString: string): Date {
  // Parse date string correctly to avoid UTC conversion issues
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getWeekStart(date: string): string {
  const d = parseDate(date);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday

  // Calculate days to subtract to get to the most recent Friday
  let daysToSubtract;
  if (day === 5) {
    // Friday
    daysToSubtract = 0; // Already Friday
  } else if (day === 6) {
    // Saturday
    daysToSubtract = 1; // Go back 1 day to Friday
  } else {
    // Sunday (0) through Thursday (4)
    daysToSubtract = day + 2; // Go back to previous Friday
  }

  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() - daysToSubtract);
  return formatDate(weekStart);
}

export function getWeekEnd(date: string): string {
  const weekStart = parseDate(getWeekStart(date));
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
  const totalLosses = dayAttacks.reduce((sum, attack) => sum + attack.losses, 0);
  const totalDraws = dayAttacks.reduce((sum, attack) => sum + (attack.draws ?? 0), 0);
  const totalPoints = dayAttacks.reduce((sum, attack) => sum + (attack.points ?? 0), 0);
  const winRate = totalAttacks > 0 ? (totalWins / totalAttacks) * 100 : 0;
  const playerCount = new Set(dayAttacks.map((attack) => attack.playerName)).size;

  const result = {
    date,
    totalAttacks,
    totalWins,
    totalLosses,
    totalDraws,
    totalPoints,
    winRate: Math.round(winRate * 100) / 100,
    playerCount,
  };

  return result;
}

export function calculateWeeklyStats(attacks: AttackRecord[], weekStart: string): WeeklyStats {
  const weekEnd = getWeekEnd(weekStart);
  const weekAttacks = attacks.filter((attack) => attack.date >= weekStart && attack.date <= weekEnd);

  // Calculate daily stats for the week
  const dailyStats: DailyStats[] = [];
  const startDate = parseDate(weekStart);

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
      existing.totalDraws += attack.draws ?? 0;
      existing.totalPoints += attack.points ?? 0;
      existing.dailyAttacks.push(attack);
    } else {
      playerMap.set(attack.playerName, {
        playerName: attack.playerName,
        totalAttacks: attack.attacks,
        totalWins: attack.wins,
        totalLosses: attack.losses,
        totalDraws: attack.draws ?? 0,
        totalPoints: attack.points ?? 0,
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
  const totalLosses = weekAttacks.reduce((sum, attack) => sum + attack.losses, 0);
  const totalDraws = weekAttacks.reduce((sum, attack) => sum + (attack.draws ?? 0), 0);
  const totalPoints = weekAttacks.reduce((sum, attack) => sum + (attack.points ?? 0), 0);
  const winRate = totalAttacks > 0 ? Math.round((totalWins / totalAttacks) * 10000) / 100 : 0;

  return {
    weekStart,
    weekEnd,
    totalAttacks,
    totalWins,
    totalLosses,
    totalDraws,
    totalPoints,
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

export function getCurrentWeekNumber(date?: Date): number {
  const targetDate = date || new Date();
  const startOfYear = new Date(targetDate.getFullYear(), 0, 1);

  // Find the first Friday of the year
  const firstFriday = new Date(startOfYear);
  const firstFridayDay = firstFriday.getDay(); // 0 = Sunday, 5 = Friday
  const daysToFirstFriday = firstFridayDay <= 5 ? 5 - firstFridayDay : 12 - firstFridayDay;
  firstFriday.setDate(startOfYear.getDate() + daysToFirstFriday);

  // Calculate days since first Friday
  const daysSinceFirstFriday = Math.floor((targetDate.getTime() - firstFriday.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate week number (war weeks start on Friday)
  return Math.max(1, Math.ceil((daysSinceFirstFriday + 1) / 7));
}

export function getWeekNumberForDate(date: string): number {
  return getCurrentWeekNumber(new Date(date));
}

export function getWeekRange(weekNumber: number, year?: number): { start: string; end: string } {
  const targetYear = year || new Date().getFullYear();
  const startOfYear = new Date(targetYear, 0, 1);

  // Find the first Friday of the year
  const firstFriday = new Date(startOfYear);
  const firstFridayDay = firstFriday.getDay();
  const daysToFirstFriday = firstFridayDay <= 5 ? 5 - firstFridayDay : 12 - firstFridayDay;
  firstFriday.setDate(startOfYear.getDate() + daysToFirstFriday);

  // Calculate the start date for the selected week
  const weekStart = new Date(firstFriday);
  weekStart.setDate(firstFriday.getDate() + (weekNumber - 1) * 7);

  // Calculate the end date (Thursday)
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return {
    start: weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    end: weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
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
