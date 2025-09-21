"use client";

import { useGuildWarStore } from "@/store/guildWarStore";
import { useMemo, useState } from "react";

export default function CurrentWeekStats() {
  const { currentWeekStats, comparison, attacks } = useGuildWarStore();
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  // Calculate available weeks from attack data (war weeks start on Friday)
  const availableWeeks = useMemo(() => {
    if (!attacks.length) return [];

    const weeks = new Set<number>();
    attacks.forEach((attack) => {
      const date = new Date(attack.date);
      const startOfYear = new Date(date.getFullYear(), 0, 1);

      // Find the first Friday of the year
      const firstFriday = new Date(startOfYear);
      const firstFridayDay = firstFriday.getDay();
      const daysToFirstFriday = firstFridayDay <= 5 ? 5 - firstFridayDay : 12 - firstFridayDay;
      firstFriday.setDate(startOfYear.getDate() + daysToFirstFriday);

      // Calculate days since first Friday
      const daysSinceFirstFriday = Math.floor((date.getTime() - firstFriday.getTime()) / (1000 * 60 * 60 * 24));

      // Calculate week number (war weeks start on Friday)
      const weekNumber = Math.max(1, Math.ceil((daysSinceFirstFriday + 1) / 7));
      weeks.add(weekNumber);
    });

    return Array.from(weeks).sort((a, b) => b - a); // Most recent first
  }, [attacks]);

  // Get week range for display (Friday to Thursday)
  const getWeekRange = (weekNumber: number) => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

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
  };

  // Filter data based on selected week
  const filteredData = useMemo(() => {
    if (!selectedWeek || !attacks.length) return currentWeekStats;

    // Filter attacks for selected week (war weeks start on Friday)
    const weekAttacks = attacks.filter((attack) => {
      const date = new Date(attack.date);
      const startOfYear = new Date(date.getFullYear(), 0, 1);

      // Find the first Friday of the year
      const firstFriday = new Date(startOfYear);
      const firstFridayDay = firstFriday.getDay();
      const daysToFirstFriday = firstFridayDay <= 5 ? 5 - firstFridayDay : 12 - firstFridayDay;
      firstFriday.setDate(startOfYear.getDate() + daysToFirstFriday);

      // Calculate days since first Friday
      const daysSinceFirstFriday = Math.floor((date.getTime() - firstFriday.getTime()) / (1000 * 60 * 60 * 24));

      // Calculate week number (war weeks start on Friday)
      const weekNumber = Math.max(1, Math.ceil((daysSinceFirstFriday + 1) / 7));
      return weekNumber === selectedWeek;
    });

    // Calculate stats for selected week
    const totalAttacks = weekAttacks.reduce((sum, attack) => sum + attack.attacks, 0);
    const totalWins = weekAttacks.reduce((sum, attack) => sum + attack.wins, 0);
    const totalLosses = weekAttacks.reduce((sum, attack) => sum + attack.losses, 0);
    const totalDraws = weekAttacks.reduce((sum, attack) => sum + (attack.draws ?? 0), 0);
    const totalPoints = weekAttacks.reduce((sum, attack) => sum + (attack.points ?? 0), 0);
    const winRate = totalAttacks > 0 ? Math.round((totalWins / totalAttacks) * 100) : 0;

    return {
      totalAttacks,
      totalWins,
      totalLosses,
      totalDraws,
      totalPoints,
      winRate,
      weekStart: weekAttacks.length > 0 ? weekAttacks[0].date : "",
      weekEnd: weekAttacks.length > 0 ? weekAttacks[weekAttacks.length - 1].date : "",
    };
  }, [selectedWeek, attacks, currentWeekStats]);

  const displayData = filteredData || currentWeekStats;

  if (!displayData) {
    return (
      <div className="bg-[#1E1E2E] border-2 border-[#FFD700] rounded-lg p-6 shadow-lg">
        <div className="text-center py-12">
          <div className="text-6xl mb-4 animate-float">⚔️</div>
          <h2 className="text-xl font-bold text-[#F1FA8C] mb-2">Battle Command Center</h2>
          <p className="text-[#8BE9FD] text-sm">
            No battles recorded this week yet.
            <br />
            Ready your members for combat!
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getImprovementColor = (value: number) => {
    if (value > 0) return "text-[#50FA7B]";
    if (value < 0) return "text-[#FF5555]";
    return "text-[#F1FA8C]";
  };

  const getImprovementIcon = (value: number) => {
    if (value > 0) return "📈";
    if (value < 0) return "📉";
    return "➡️";
  };

  const getWinRateColor = (rate: number) => {
    if (rate >= 80) return "text-[#8BE9FD]";
    if (rate >= 60) return "text-[#F1FA8C]";
    return "text-[#FF79C6]";
  };

  const getWinRateIcon = (rate: number) => {
    if (rate >= 80) return "👑";
    if (rate >= 60) return "🏆";
    return "⚔️";
  };

  return (
    <div className="bg-[#1E1E2E] border-2 border-[#FFD700] rounded-lg p-6 shadow-lg transition-all duration-300 hover:bg-[#282A36]">
      <div className="relative">
        {/* Enhanced Header with Week Selector */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">🏰</div>
            <div>
              <h2 className="text-2xl font-bold text-[#F1FA8C]">Command Center</h2>
              <div className="text-sm text-[#8BE9FD]">
                {selectedWeek ? `Week ${selectedWeek}` : "Current Week"} • {formatDate(displayData.weekStart)} -{" "}
                {formatDate(displayData.weekEnd)}
              </div>
            </div>
          </div>

          {/* Week Selector */}
          <div className="relative">
            <select
              value={selectedWeek || ""}
              onChange={(e) => setSelectedWeek(e.target.value ? parseInt(e.target.value) : null)}
              className="bg-[#282A36] border border-[#FFD700] text-[#F1FA8C] px-3 py-2 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition-all duration-200"
            >
              <option value="">Current Week</option>
              {availableWeeks.map((week) => {
                const range = getWeekRange(week);
                return (
                  <option key={week} value={week}>
                    Week {week} ({range.start} - {range.end})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {/* Total Attacks */}
          <div
            className="bg-[#282A36] border border-[#FFD700] rounded-lg p-4 hover:bg-[#2A2A3A] transition-all duration-200 group"
            title="Total Attacks: Number of battles launched this week"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">⚔️</div>
              {comparison?.improvement.totalAttacksChange !== undefined &&
                comparison.improvement.totalAttacksChange !== 0 && (
                  <div className={`text-xs ${getImprovementColor(comparison.improvement.totalAttacksChange)}`}>
                    {getImprovementIcon(comparison.improvement.totalAttacksChange)}
                    {Math.abs(comparison.improvement.totalAttacksChange)}
                  </div>
                )}
            </div>
            <div className="text-2xl font-bold text-[#F1FA8C] text-center">{displayData.totalAttacks}</div>
            <div className="text-xs text-[#8BE9FD] text-center font-medium">Total Attacks</div>
          </div>

          {/* Victories */}
          <div
            className="bg-[#282A36] border border-[#FFD700] rounded-lg p-4 hover:bg-[#2A2A3A] transition-all duration-200 group"
            title="Victories: Number of battles won this week"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">🏆</div>
              {comparison?.improvement.totalWinsChange !== undefined &&
                comparison.improvement.totalWinsChange !== 0 && (
                  <div className={`text-xs ${getImprovementColor(comparison.improvement.totalWinsChange)}`}>
                    {getImprovementIcon(comparison.improvement.totalWinsChange)}
                    {Math.abs(comparison.improvement.totalWinsChange)}
                  </div>
                )}
            </div>
            <div className="text-2xl font-bold text-[#50FA7B] text-center">{displayData.totalWins}</div>
            <div className="text-xs text-[#8BE9FD] text-center font-medium">Victories</div>
          </div>

          {/* Defeats */}
          <div
            className="bg-[#282A36] border border-[#FFD700] rounded-lg p-4 hover:bg-[#2A2A3A] transition-all duration-200 group"
            title="Defeats: Number of battles lost this week"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">💀</div>
            </div>
            <div className="text-2xl font-bold text-[#FF5555] text-center">{displayData.totalLosses}</div>
            <div className="text-xs text-[#8BE9FD] text-center font-medium">Defeats</div>
          </div>
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Draws */}
          <div
            className="bg-[#282A36] border border-[#FFD700] rounded-lg p-4 hover:bg-[#2A2A3A] transition-all duration-200 group"
            title="Draws: Number of battles that ended in a tie"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">🤝</div>
            </div>
            <div className="text-2xl font-bold text-[#F1FA8C] text-center">{displayData.totalDraws}</div>
            <div className="text-xs text-[#8BE9FD] text-center font-medium">Draws</div>
          </div>

          {/* Total Points */}
          <div
            className="bg-[#282A36] border border-[#FFD700] rounded-lg p-4 hover:bg-[#2A2A3A] transition-all duration-200 group"
            title="Total Points: Points earned from all battles this week"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">⭐</div>
            </div>
            <div className="text-2xl font-bold text-[#F1FA8C] text-center">{displayData.totalPoints}</div>
            <div className="text-xs text-[#8BE9FD] text-center font-medium">Total Points</div>
          </div>
        </div>

        {/* Victory Rate Display */}
        <div className="mb-6">
          <div
            className="bg-[#282A36] border border-[#FFD700] max-w-xs mx-auto rounded-lg p-4 hover:bg-[#2A2A3A] transition-all duration-200 group"
            title="Victory Rate: Percentage of battles won this week"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">{getWinRateIcon(displayData.winRate)}</div>
              {comparison?.improvement.winRateChange !== undefined && comparison.improvement.winRateChange !== 0 && (
                <div className={`text-xs ${getImprovementColor(comparison.improvement.winRateChange)}`}>
                  {getImprovementIcon(comparison.improvement.winRateChange)}
                  {Math.abs(comparison.improvement.winRateChange)}%
                </div>
              )}
            </div>
            <div className={`text-2xl font-bold text-center ${getWinRateColor(displayData.winRate)}`}>
              {displayData.winRate}%
            </div>
            <div className="text-xs text-[#8BE9FD] text-center font-medium">Victory Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}
