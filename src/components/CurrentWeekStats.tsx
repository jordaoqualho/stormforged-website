"use client";

import { useGuildWarStore } from "@/store/guildWarStore";

export default function CurrentWeekStats() {
  const { currentWeekStats, comparison } = useGuildWarStore();

  if (!currentWeekStats) {
    return (
      <div className="card-rpg bg-battlefield">
        <div className="text-center py-12">
          <div className="icon-rpg text-6xl mb-4 animate-float">⚔️</div>
          <h2 className="text-xl font-pixel text-gold mb-2">Battle Command Center</h2>
          <p className="text-text-muted font-pixel-operator">
            No battles recorded this week yet.
            <br />
            Ready your warriors for combat!
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
      <div className="relative">
        {/* RPG Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="icon-rpg pixel-glow">🏰</div>
          <h2 className="text-xl font-pixel text-gold text-glow">Guild Command Center</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
          <div className="text-sm text-text-muted font-pixel-operator">
            {formatDate(currentWeekStats.weekStart)} - {formatDate(currentWeekStats.weekEnd)}
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="stat-rpg border-mystic-blue">
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
            <div className="text-2xl font-pixel text-gold">{currentWeekStats.totalAttacks}</div>
            <div className="text-xs text-text-muted font-pixel-operator">Total Strikes</div>
          </div>

          <div className="stat-rpg border-success">
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
            <div className="text-2xl font-pixel text-success">{currentWeekStats.totalWins}</div>
            <div className="text-xs text-text-muted font-pixel-operator">Victories</div>
          </div>

          <div className="stat-rpg border-danger">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">💀</div>
            </div>
            <div className="text-2xl font-pixel text-danger">{currentWeekStats.totalLosses}</div>
            <div className="text-xs text-text-muted font-pixel-operator">Defeats</div>
          </div>

          <div className="stat-rpg border-gold">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">{getWinRateIcon(currentWeekStats.winRate)}</div>
              {comparison?.improvement.winRateChange !== undefined && comparison.improvement.winRateChange !== 0 && (
                <div className={`text-xs ${getImprovementColor(comparison.improvement.winRateChange)}`}>
                  {getImprovementIcon(comparison.improvement.winRateChange)}
                  {Math.abs(comparison.improvement.winRateChange)}%
                </div>
              )}
            </div>
            <div className={`text-2xl font-pixel ${getWinRateColor(currentWeekStats.winRate)}`}>
              {currentWeekStats.winRate}%
            </div>
            <div className="text-xs text-text-muted font-pixel-operator">Victory Rate</div>
          </div>
        </div>

        {/* Weekly Progress Bar */}
        <div className="panel-rpg mb-8">
          <h3 className="font-pixel text-gold mb-4 flex items-center space-x-2">
            <span>📊</span>
            <span>Weekly Performance</span>
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-pixel-operator text-text-secondary">Guild Victory Rate</span>
              <span className={`font-pixel ${getWinRateColor(currentWeekStats.winRate)}`}>
                {currentWeekStats.winRate}%
              </span>
            </div>
            <div className="progress-rpg h-4">
              <div className="progress-rpg-fill h-full" style={{ width: `${currentWeekStats.winRate}%` }} />
            </div>
            <div className="flex justify-between text-xs text-text-muted">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Daily Battle Log */}
        <div className="mb-8">
          <h3 className="font-pixel text-gold mb-4 flex items-center space-x-2">
            <span>📅</span>
            <span>Daily Battle Log</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
            {currentWeekStats.dailyStats.map((day, index) => (
              <div key={day.date} className="panel-rpg p-3 text-center">
                <div className="text-sm font-pixel text-gold mb-1">
                  {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div className="text-xs text-text-muted mb-2 font-pixel-operator">{formatDate(day.date)}</div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-sm">⚔️</span>
                    <span className="text-lg font-pixel text-gold">{day.totalAttacks}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-sm">🏆</span>
                    <span className="text-sm font-pixel text-success">{day.totalWins}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-sm">💀</span>
                    <span className="text-sm font-pixel text-danger">{day.totalLosses}</span>
                  </div>
                  <div className={`text-xs font-pixel ${getWinRateColor(day.winRate)}`}>{day.winRate}%</div>
                  <div className="text-xs text-text-muted">{day.playerCount} warriors</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warrior Rankings */}
        {currentWeekStats.playerStats.length > 0 && (
          <div>
            <h3 className="font-pixel text-gold mb-4 flex items-center space-x-2">
              <span>👑</span>
              <span>Warrior Rankings</span>
            </h3>
            <div className="panel-rpg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-mystic-blue">
                      <th className="text-left py-3 font-pixel text-gold">Rank</th>
                      <th className="text-left py-3 font-pixel text-gold">Warrior</th>
                      <th className="text-center py-3 font-pixel text-gold">Strikes</th>
                      <th className="text-center py-3 font-pixel text-gold">Victories</th>
                      <th className="text-center py-3 font-pixel text-gold">Defeats</th>
                      <th className="text-center py-3 font-pixel text-gold">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentWeekStats.playerStats
                      .sort((a, b) => b.winRate - a.winRate)
                      .map((player, index) => (
                        <tr
                          key={player.playerName}
                          className="border-b border-dark-gray hover:bg-mystic-blue hover:bg-opacity-20 transition-colors"
                        >
                          <td className="py-3 text-center">
                            <div className="flex items-center justify-center">
                              {index === 0 ? (
                                <div className="achievement-badge w-8 h-8 text-xs">👑</div>
                              ) : index === 1 ? (
                                <div className="achievement-badge w-8 h-8 text-xs bg-gradient-to-b from-gray-400 to-gray-600 border-gray-500">
                                  🥈
                                </div>
                              ) : index === 2 ? (
                                <div className="achievement-badge w-8 h-8 text-xs bg-gradient-to-b from-yellow-600 to-yellow-800 border-yellow-700">
                                  🥉
                                </div>
                              ) : (
                                <span className="font-pixel text-text-muted">#{index + 1}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 font-pixel text-text-primary">{player.playerName}</td>
                          <td className="py-3 text-center font-pixel text-gold">{player.totalAttacks}</td>
                          <td className="py-3 text-center font-pixel text-success">{player.totalWins}</td>
                          <td className="py-3 text-center font-pixel text-danger">{player.totalLosses}</td>
                          <td className="py-3 text-center">
                            <span className={`font-pixel ${getWinRateColor(player.winRate)}`}>{player.winRate}%</span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
