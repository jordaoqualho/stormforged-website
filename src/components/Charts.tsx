"use client";

import { getCurrentWeekNumber, getWeekNumberForDate, getWeekRange, parseDate } from "@/lib/calculations";
import { useGuildWarStore } from "@/store/guildWarStore";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import RPGWeekSelector from "./RPGWeekSelector";

export default function Charts() {
  const { currentWeekStats, comparison, attacks } = useGuildWarStore();
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [currentWeekNumber, setCurrentWeekNumber] = useState<number | null>(null);

  // Get current week number
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

    // Get current week number to avoid duplication
    const currentWeek = getCurrentWeekNumber();

    // Add current week if it's not already in the set
    if (!weeks.has(currentWeek)) {
      weeks.add(currentWeek);
    }

    return Array.from(weeks).sort((a, b) => b - a); // Most recent first
  }, [attacks]);

  // Use centralized getWeekRange function (Thursday to Wednesday)

  // Filter data based on selected week
  const filteredData = useMemo(() => {
    if (!selectedWeek || !attacks.length) return currentWeekStats;

    // Filter attacks for selected week (war weeks start on Thursday and end on Wednesday)
    const weekAttacks = attacks.filter((attack) => {
      const weekNumber = getWeekNumberForDate(attack.date);
      return weekNumber === selectedWeek;
    });

    // Calculate stats for selected week
    const totalAttacks = weekAttacks.reduce((sum, attack) => sum + attack.attacks, 0);
    const totalWins = weekAttacks.reduce((sum, attack) => sum + attack.wins, 0);
    const totalLosses = weekAttacks.reduce((sum, attack) => sum + attack.losses, 0);
    const winRate = totalAttacks > 0 ? Math.round((totalWins / totalAttacks) * 100) : 0;

    // Group by day
    const dailyStats = weekAttacks.reduce((acc, attack) => {
      const date = attack.date;
      if (!acc[date]) {
        acc[date] = { date, totalAttacks: 0, totalWins: 0, totalLosses: 0, playerCount: 0, players: new Set() };
      }
      acc[date].totalAttacks += attack.attacks;
      acc[date].totalWins += attack.wins;
      acc[date].totalLosses += attack.losses;
      acc[date].players.add(attack.playerName);
      acc[date].playerCount = acc[date].players.size;
      return acc;
    }, {} as any);

    // Group by player
    const playerStats = weekAttacks.reduce((acc, attack) => {
      if (!acc[attack.playerName]) {
        acc[attack.playerName] = { playerName: attack.playerName, totalAttacks: 0, totalWins: 0, totalLosses: 0 };
      }
      acc[attack.playerName].totalAttacks += attack.attacks;
      acc[attack.playerName].totalWins += attack.wins;
      acc[attack.playerName].totalLosses += attack.losses;
      return acc;
    }, {} as any);

    return {
      totalAttacks,
      totalWins,
      totalLosses,
      winRate,
      uniquePlayers: new Set(weekAttacks.map((a) => a.playerName)).size,
      dailyStats: Object.values(dailyStats).sort(
        (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
      playerStats: Object.values(playerStats) as any[],
    };
  }, [selectedWeek, attacks, currentWeekStats]);

  // Use filtered data for charts
  const statsData = filteredData || currentWeekStats;

  if (!statsData) {
    return (
      <div className="card-rpg bg-battlefield py-16">
        <div className="text-center">
          <div className="icon-rpg text-6xl mb-8 animate-float">📈</div>
          <h2 className="text-2xl font-pixel text-gold mb-6">Battle Analytics</h2>
          <div className="bg-[#1A1A1A] border border-mystic-blue rounded-pixel p-6 max-w-md mx-auto">
            <p className="text-text-muted font-pixel-operator text-sm leading-relaxed mb-4">
              No battle data available yet.
            </p>
            <p className="text-text-secondary font-pixel-operator text-xs">Record some battles to see the magic!</p>
          </div>
        </div>
      </div>
    );
  }

  // Prepare daily data for charts with RPG styling
  const dailyData = statsData.dailyStats.map((day: any) => ({
    date: parseDate(day.date).toLocaleDateString("en-US", { weekday: "short" }),
    attacks: day.totalAttacks,
    wins: day.totalWins,
    losses: day.totalLosses,
    winRate: day.winRate,
    players: day.playerCount,
  }));

  // Prepare comparison data if available
  const comparisonData = comparison?.previousWeek
    ? [
        {
          week: "Previous",
          attacks: comparison.previousWeek.totalAttacks,
          wins: comparison.previousWeek.totalWins,
          winRate: comparison.previousWeek.winRate,
        },
        {
          week: "Current",
          attacks: comparison.currentWeek.totalAttacks,
          wins: comparison.currentWeek.totalWins,
          winRate: comparison.currentWeek.winRate,
        },
      ]
    : null;

  // Prepare player data for bar chart
  const playerData = statsData.playerStats
    .sort((a: any, b: any) => b.totalAttacks - a.totalAttacks)
    .slice(0, 10) // Top 10 by attacks
    .map((player: any) => ({
      name: player.playerName.length > 8 ? player.playerName.substring(0, 8) + "..." : player.playerName,
      attacks: player.totalAttacks,
      wins: player.totalWins,
      winRate: player.winRate,
    }));

  // Custom tooltip component with RPG styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="panel-rpg p-3 border-gold shadow-glow-gold">
          <p className="font-pixel text-gold text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="font-pixel-operator text-text-primary text-xs">
              <span style={{ color: entry.color }}>●</span> {entry.name}: {entry.value}
              {entry.dataKey === "winRate" ? "%" : ""}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 sm:space-y-6 overflow-visible">
      {/* Week Selector */}
      {availableWeeks.length > 0 && (
        <div className="card-rpg bg-battlefield p-4 sm:p-6 overflow-visible">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="icon-rpg pixel-glow text-xl">📅</div>
              <h3 className="text-lg sm:text-xl font-pixel text-gold text-glow">Select Week</h3>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <RPGWeekSelector
                selectedWeek={selectedWeek}
                onWeekChange={setSelectedWeek}
                availableWeeks={availableWeeks}
                currentWeekNumber={currentWeekNumber}
                getWeekRange={getWeekRange}
                className="w-full sm:min-w-64"
              />
              <div className="text-sm text-text-muted font-pixel-operator text-center sm:text-left">
                {selectedWeek ? `Week ${selectedWeek}` : "Current Week"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Performance Chart */}
      <div className="card-rpg bg-battlefield p-4 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="icon-rpg pixel-glow text-xl">⚔️</div>
            <h3 className="text-lg sm:text-xl font-pixel text-gold text-glow">Daily Battle Performance</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
          </div>
          {selectedWeek && (
            <div className="text-sm text-text-muted font-pixel-operator mb-2">
              {(() => {
                const range = getWeekRange(selectedWeek);
                return `Week ${selectedWeek}: ${range.start} – ${range.end}`;
              })()}
            </div>
          )}
        </div>

        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3A3A75" opacity={0.3} />
              <XAxis dataKey="date" stroke="#FFD700" fontSize={12} fontFamily="var(--font-pixel-operator)" />
              <YAxis stroke="#FFD700" fontSize={12} fontFamily="var(--font-pixel-operator)" />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  fontFamily: "var(--font-pixel-operator)",
                  fontSize: "12px",
                  color: "#FFD700",
                }}
              />
              <Line
                type="monotone"
                dataKey="attacks"
                stroke="#FFD700"
                strokeWidth={3}
                name="⚔️ Attacks"
                dot={{ fill: "#FFD700", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#FFD700", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="wins"
                stroke="#2ECC71"
                strokeWidth={3}
                name="🏆 Victories"
                dot={{ fill: "#2ECC71", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#2ECC71", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="losses"
                stroke="#C83737"
                strokeWidth={3}
                name="💀 Defeats"
                dot={{ fill: "#C83737", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#C83737", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Player Performance Chart */}
      {playerData.length > 0 && (
        <div className="card-rpg bg-battlefield p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="icon-rpg pixel-glow text-xl">👑</div>
              <h3 className="text-lg sm:text-xl font-pixel text-gold text-glow">Top Members by Attacks</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
            </div>
            {selectedWeek && (
              <div className="text-sm text-text-muted font-pixel-operator mb-2">
                {(() => {
                  const range = getWeekRange(selectedWeek);
                  return `Week ${selectedWeek}: ${range.start} – ${range.end}`;
                })()}
              </div>
            )}
          </div>

          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={playerData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3A3A75" opacity={0.3} />
                <XAxis dataKey="name" stroke="#FFD700" fontSize={12} fontFamily="var(--font-pixel-operator)" />
                <YAxis stroke="#FFD700" fontSize={12} fontFamily="var(--font-pixel-operator)" />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    fontFamily: "var(--font-pixel-operator)",
                    fontSize: "12px",
                    color: "#FFD700",
                  }}
                />
                <Bar dataKey="attacks" fill="#FFD700" name="⚔️ Attacks" radius={[2, 2, 0, 0]} />
                <Bar dataKey="wins" fill="#2ECC71" name="🏆 Victories" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Weekly Comparison Chart */}
      {comparisonData && (
        <div className="card-rpg bg-battlefield p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="icon-rpg pixel-glow text-xl">📊</div>
              <h3 className="text-lg sm:text-xl font-pixel text-gold text-glow">Week-over-Week Comparison</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
            </div>
          </div>

          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3A3A75" opacity={0.3} />
                <XAxis dataKey="week" stroke="#FFD700" fontSize={12} fontFamily="var(--font-pixel-operator)" />
                <YAxis stroke="#FFD700" fontSize={12} fontFamily="var(--font-pixel-operator)" />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    fontFamily: "var(--font-pixel-operator)",
                    fontSize: "12px",
                    color: "#FFD700",
                  }}
                />
                <Bar dataKey="attacks" fill="#FFD700" name="⚔️ Attacks" radius={[2, 2, 0, 0]} />
                <Bar dataKey="wins" fill="#2ECC71" name="🏆 Victories" radius={[2, 2, 0, 0]} />
                <Bar dataKey="winRate" fill="#3A3A75" name="📈 Victory Rate %" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Victory Rate Trend Chart */}
      <div className="card-rpg bg-battlefield p-4 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="icon-rpg pixel-glow text-xl">📈</div>
            <h3 className="text-lg sm:text-xl font-pixel text-gold text-glow">Victory Rate Trend</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
          </div>
          {selectedWeek && (
            <div className="text-sm text-text-muted font-pixel-operator mb-2">
              {(() => {
                const range = getWeekRange(selectedWeek);
                return `Week ${selectedWeek}: ${range.start} – ${range.end}`;
              })()}
            </div>
          )}
        </div>

        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3A3A75" opacity={0.3} />
              <XAxis dataKey="date" stroke="#FFD700" fontSize={12} fontFamily="var(--font-pixel-operator)" />
              <YAxis domain={[0, 100]} stroke="#FFD700" fontSize={12} fontFamily="var(--font-pixel-operator)" />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  fontFamily: "var(--font-pixel-operator)",
                  fontSize: "12px",
                  color: "#FFD700",
                }}
              />
              <Line
                type="monotone"
                dataKey="winRate"
                stroke="#3A3A75"
                strokeWidth={4}
                dot={{ fill: "#3A3A75", strokeWidth: 3, r: 5 }}
                activeDot={{ r: 7, stroke: "#3A3A75", strokeWidth: 3 }}
                name="📈 Victory Rate %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
