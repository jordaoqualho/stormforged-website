"use client";

import { calculateWeeklyStats, getWeekEnd, getWeekNumberForDate, getWeekStart, parseDate, getWeekRange } from "@/lib/calculations";
import { useGuildWarStore } from "@/store/guildWarStore";
import { useMemo } from "react";

interface DailyBattleLogProps {
  onDayClick?: (date: string) => void;
  selectedDate?: string | null;
}

export default function DailyBattleLog({ onDayClick, selectedDate }: DailyBattleLogProps) {
  const { currentWeekStats, attacks, selectedWeek } = useGuildWarStore();

  // Calculate weekly stats based on selected week
  const weeklyStats = useMemo(() => {
    if (!attacks.length) return currentWeekStats;

    if (!selectedWeek) {
      return currentWeekStats;
    }

    // Filter attacks for selected week
    const weekAttacks = attacks.filter((attack) => {
      const weekNumber = getWeekNumberForDate(attack.date);
      return weekNumber === selectedWeek;
    });

    if (weekAttacks.length === 0) {
      return currentWeekStats;
    }

    // Get the correct week start date for the selected week number using centralized function
    // We need to find a date that falls within the selected week to get the week start
    const sampleDate = weekAttacks[0]?.date || new Date().toISOString().split('T')[0];
    const weekStart = getWeekStart(sampleDate);

    return calculateWeeklyStats(weekAttacks, weekStart);
  }, [attacks, selectedWeek, currentWeekStats]);

  if (!weeklyStats) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return parseDate(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Daily stats are already in the correct order (Thursday to Wednesday) from calculateWeeklyStats
  const orderedDays = weeklyStats.dailyStats;

  const handleDayClick = (date: string) => {
    if (onDayClick) {
      onDayClick(date);
    }
  };

  return (
    <div className="card-rpg bg-battlefield p-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="icon-rpg pixel-glow text-xl">📅</div>
        <h3 className="text-xl font-pixel text-gold text-glow">Daily Battle</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-1 sm:gap-2">
        {orderedDays.map((day) => {
          const isSelected = selectedDate === day.date;

          return (
            <div
              key={day.date}
              className={`panel-rpg p-2 sm:p-3 text-center w-full aspect-[3/4] transition-all duration-300 group cursor-pointer ${
                isSelected ? "ring-2 ring-gold bg-gold/10 brightness-110" : "hover:brightness-110"
              }`}
              onClick={() => handleDayClick(day.date)}
            >
              <div className="text-xs sm:text-sm font-pixel text-gold mb-1 sm:mb-2 font-bold">
                {parseDate(day.date).toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div className="text-xs text-text-muted mb-2 sm:mb-3 font-pixel-operator">{formatDate(day.date)}</div>

              {day.totalAttacks > 0 ? (
                <div className="space-y-2">
                  <div className="flex flex-col items-center space-y-1">
                    <div className="text-xs font-bold text-gray-300">Points</div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">⭐</span>
                      <span className="text-lg font-pixel text-gold">{day.totalPoints || 0}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-1">
                    <div className="text-xs font-bold text-gray-300">Wins</div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">🏆</span>
                      <span className="text-sm font-pixel text-success">{day.totalWins}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-1">
                    <div className="text-xs font-bold text-gray-300">Losses</div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">💀</span>
                      <span className="text-sm font-pixel text-danger">{day.totalLosses}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-1">
                    <div className="text-xs font-bold text-gray-300">Rate</div>
                    <div
                      className={`text-xs font-pixel px-2 py-0.5 rounded-full ${
                        day.winRate >= 80
                          ? "bg-green-700/80 text-white"
                          : day.winRate >= 60
                          ? "bg-yellow-700/80 text-white"
                          : "bg-red-700/80 text-white"
                      }`}
                    >
                      {day.winRate}%
                    </div>
                  </div>

                  <div className="text-xs text-text-muted mt-2 whitespace-nowrap">{day.playerCount} members</div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-col items-center space-y-1">
                    <div className="text-xs font-bold text-gray-300">Points</div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">⭐</span>
                      <span className="text-lg font-pixel text-gray-500">0</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-1">
                    <div className="text-xs font-bold text-gray-300">Wins</div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">🏆</span>
                      <span className="text-sm font-pixel text-gray-500">0</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-1">
                    <div className="text-xs font-bold text-gray-300">Losses</div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">💀</span>
                      <span className="text-sm font-pixel text-gray-500">0</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-1">
                    <div className="text-xs font-bold text-gray-300">Rate</div>
                    <div className="text-xs font-pixel px-2 py-0.5 rounded-full bg-gray-700/80 text-gray-400">0%</div>
                  </div>

                  <div className="text-xs text-text-muted mt-2 whitespace-nowrap">0 members</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
