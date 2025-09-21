"use client";

import { useGuildWarStore } from "@/store/guildWarStore";
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

export default function Charts() {
  const { currentWeekStats, comparison } = useGuildWarStore();

  if (!currentWeekStats) {
    return (
      <div className="card-rpg bg-battlefield">
        <div className="text-center py-12">
          <div className="icon-rpg text-6xl mb-4 animate-float">📈</div>
          <h2 className="text-xl font-pixel text-gold mb-2">Battle Analytics</h2>
          <p className="text-text-muted font-pixel-operator">
            No battle data available yet.
            <br />
            Record some battles to see the magic!
          </p>
        </div>
      </div>
    );
  }

  // Prepare daily data for charts with RPG styling
  const dailyData = currentWeekStats.dailyStats.map((day) => ({
    date: new Date(day.date).toLocaleDateString("en-US", { weekday: "short" }),
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
  const playerData = currentWeekStats.playerStats
    .sort((a, b) => b.totalAttacks - a.totalAttacks)
    .slice(0, 10) // Top 10 by attacks
    .map((player) => ({
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
    <div className="space-y-8">
      {/* Daily Performance Chart */}
      <div className="card-rpg bg-battlefield">
        <div className="flex items-center space-x-3 mb-6">
          <div className="icon-rpg pixel-glow">⚔️</div>
          <h3 className="text-lg font-pixel text-gold text-glow">Daily Battle Performance</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
        </div>

        <div className="h-80">
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
                name="⚔️ Strikes"
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
        <div className="card-rpg bg-battlefield">
          <div className="flex items-center space-x-3 mb-6">
            <div className="icon-rpg pixel-glow">👑</div>
            <h3 className="text-lg font-pixel text-gold text-glow">Top Warriors by Strikes</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
          </div>

          <div className="h-80">
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
                <Bar dataKey="attacks" fill="#FFD700" name="⚔️ Strikes" radius={[2, 2, 0, 0]} />
                <Bar dataKey="wins" fill="#2ECC71" name="🏆 Victories" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Weekly Comparison Chart */}
      {comparisonData && (
        <div className="card-rpg bg-battlefield">
          <div className="flex items-center space-x-3 mb-6">
            <div className="icon-rpg pixel-glow">📊</div>
            <h3 className="text-lg font-pixel text-gold text-glow">Week-over-Week Comparison</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
          </div>

          <div className="h-80">
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
                <Bar dataKey="attacks" fill="#FFD700" name="⚔️ Strikes" radius={[2, 2, 0, 0]} />
                <Bar dataKey="wins" fill="#2ECC71" name="🏆 Victories" radius={[2, 2, 0, 0]} />
                <Bar dataKey="winRate" fill="#3A3A75" name="📈 Victory Rate %" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Victory Rate Trend Chart */}
      <div className="card-rpg bg-battlefield">
        <div className="flex items-center space-x-3 mb-6">
          <div className="icon-rpg pixel-glow">📈</div>
          <h3 className="text-lg font-pixel text-gold text-glow">Victory Rate Trend</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
        </div>

        <div className="h-80">
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
