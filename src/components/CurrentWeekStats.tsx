"use client";

import { getCurrentWeekNumber, getWeekNumberForDate, getWeekRange, parseDate } from "@/lib/calculations";
import { useGuildWarStore } from "@/store/guildWarStore";
import { useEffect, useMemo, useState } from "react";
import RPGWeekSelector from "./RPGWeekSelector";

export default function CurrentWeekStats() {
  const { currentWeekStats, comparison, attacks, selectedWeek, setSelectedWeek } = useGuildWarStore();
  const [currentWeekNumber, setCurrentWeekNumber] = useState<number | null>(null);

  // Calculate current week number
  useEffect(() => {
    const weekNumber = getCurrentWeekNumber();
    setCurrentWeekNumber(weekNumber);
  }, []);

  // Calculate available weeks from attack data (war weeks start on Thursday and end on Wednesday)
  const availableWeeks = useMemo(() => {
    if (!attacks.length) return [];

    const weeks = new Set<number>();
    attacks.forEach((attack) => {
      const weekNumber = getWeekNumberForDate(attack.date);
      weeks.add(weekNumber);
    });

    return Array.from(weeks).sort((a, b) => b - a); // Most recent first
  }, [attacks]);

  // Filter data based on selected week
  const filteredData = useMemo(() => {
    // If no week is selected, return current week stats
    if (!selectedWeek) return currentWeekStats;

    // Filter attacks for selected week (war weeks start on Friday)
    const weekAttacks = attacks.filter((attack) => {
      const weekNumber = getWeekNumberForDate(attack.date);
      return weekNumber === selectedWeek;
    });

    // Calculate stats for selected week (will be zeros if no attacks)
    const totalAttacks = weekAttacks.reduce((sum, attack) => sum + attack.attacks, 0);
    const totalWins = weekAttacks.reduce((sum, attack) => sum + attack.wins, 0);
    const totalLosses = weekAttacks.reduce((sum, attack) => sum + attack.losses, 0);
    const totalDraws = weekAttacks.reduce((sum, attack) => sum + (attack.draws ?? 0), 0);
    const totalPoints = weekAttacks.reduce((sum, attack) => sum + (attack.points ?? 0), 0);
    const winRate = totalAttacks > 0 ? Math.round((totalWins / totalAttacks) * 100) : 0;

    // Calculate the correct week range for the selected week
    const weekRange = getWeekRange(selectedWeek);
    const weekStart = weekRange.start;
    const weekEnd = weekRange.end;

    return {
      totalAttacks,
      totalWins,
      totalLosses,
      totalDraws,
      totalPoints,
      winRate,
      weekStart,
      weekEnd,
    };
  }, [selectedWeek, attacks, currentWeekStats]);

  const displayData = filteredData || currentWeekStats;

  if (!displayData) {
    return (
      <div className="card-rpg bg-battlefield">
        <div className="text-center py-12">
          <div className="icon-rpg text-6xl mb-4 animate-float">⚔️</div>
          <h2 className="text-xl font-pixel text-gold mb-2">Battle Command Center</h2>
          <p className="text-text-muted font-pixel-operator">
            No battles recorded this week yet.
            <br />
            Ready your members for combat!
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return parseDate(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getImprovementColor = (value: number) => {
    if (value > 0) return "text-success";
    if (value < 0) return "text-danger";
    return "text-gold";
  };

  const getImprovementIcon = (value: number) => {
    if (value > 0) return "📈";
    if (value < 0) return "📉";
    return "➡️";
  };

  const getWinRateColor = (rate: number) => {
    if (rate >= 80) return "text-success";
    if (rate >= 60) return "text-warning";
    return "text-danger";
  };

  const getWinRateIcon = (rate: number) => {
    if (rate >= 80) return "👑";
    if (rate >= 60) return "🏆";
    return "⚔️";
  };

  return (
    <div className="card-rpg bg-battlefield">
      <div className="relative p-4 sm:p-6">
        {/* RPG Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="icon-rpg pixel-glow">🏰</div>
            <div>
              <h2 className="text-xl sm:text-2xl font-pixel text-gold text-glow">Command Center</h2>
              <div className="text-xs sm:text-sm text-text-muted font-pixel-operator">
                {selectedWeek
                  ? `Week ${selectedWeek}`
                  : currentWeekNumber
                  ? `Week ${currentWeekNumber}`
                  : "Current Week"}{" "}
                • {displayData.weekStart} - {displayData.weekEnd}
              </div>
            </div>
          </div>

          {/* Week Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <RPGWeekSelector
              selectedWeek={selectedWeek}
              onWeekChange={setSelectedWeek}
              availableWeeks={availableWeeks}
              currentWeekNumber={currentWeekNumber}
              getWeekRange={getWeekRange}
              className="w-full sm:min-w-64"
            />
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {/* Total Attacks */}
          <div
            className="stat-rpg border-mystic-blue min-h-[90px] py-2 px-3"
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
            <div className="text-2xl font-pixel text-gold text-center">{displayData.totalAttacks}</div>
            <div className="text-xs text-text-muted font-pixel-operator text-center">Total Attacks</div>
          </div>

          {/* Victories */}
          <div
            className="stat-rpg border-success min-h-[90px] py-2 px-3"
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
            <div className="text-2xl font-pixel text-success text-center">{displayData.totalWins}</div>
            <div className="text-xs text-text-muted font-pixel-operator text-center">Victories</div>
          </div>

          {/* Defeats */}
          <div
            className="stat-rpg border-danger min-h-[90px] py-2 px-3"
            title="Defeats: Number of battles lost this week"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">💀</div>
            </div>
            <div className="text-2xl font-pixel text-danger text-center">{displayData.totalLosses}</div>
            <div className="text-xs text-text-muted font-pixel-operator text-center">Defeats</div>
          </div>

          {/* Draws - Mobile Only */}
          <div
            className="stat-rpg border-warning min-h-[90px] py-2 px-3 sm:hidden"
            title="Draws: Number of battles that ended in a tie"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">🤝</div>
            </div>
            <div className="text-2xl font-pixel text-warning text-center">{displayData.totalDraws}</div>
            <div className="text-xs text-text-muted font-pixel-operator text-center">Draws</div>
          </div>
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {/* Draws - Desktop Only */}
          <div
            className="stat-rpg border-warning min-h-[90px] py-2 px-3 hidden sm:block"
            title="Draws: Number of battles that ended in a tie"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">🤝</div>
            </div>
            <div className="text-2xl font-pixel text-warning text-center">{displayData.totalDraws}</div>
            <div className="text-xs text-text-muted font-pixel-operator text-center">Draws</div>
          </div>

          {/* Total Points */}
          <div
            className="stat-rpg border-gold min-h-[90px] py-2 px-3"
            title="Total Points: Points earned from all battles this week"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">⭐</div>
            </div>
            <div className="text-2xl font-pixel text-gold text-center">{displayData.totalPoints}</div>
            <div className="text-xs text-text-muted font-pixel-operator text-center">Total Points</div>
          </div>
        </div>

        {/* Victory Rate Display */}
        <div className="mb-6">
          <div
            className="stat-rpg border-gold max-w-xs mx-auto my-4 min-h-[90px] py-2 px-3"
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
            <div className={`text-2xl font-pixel text-center ${getWinRateColor(displayData.winRate)}`}>
              {displayData.winRate}%
            </div>
            <div className="text-xs text-text-muted font-pixel-operator text-center">Victory Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}
