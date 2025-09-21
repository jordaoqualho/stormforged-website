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
      <div className="relative p-4 sm:p-6">
        {/* RPG Header */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="icon-rpg pixel-glow">🏰</div>
          <h2 className="text-2xl font-pixel text-gold text-glow">Command Center</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
          <div className="text-sm text-text-muted font-pixel-operator">
            {formatDate(currentWeekStats.weekStart)} - {formatDate(currentWeekStats.weekEnd)}
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <div className="stat-rpg border-mystic-blue min-h-[90px] py-2 px-3">
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

          <div className="stat-rpg border-success min-h-[90px] py-2 px-3">
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

          <div className="stat-rpg border-danger min-h-[90px] py-2 px-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">💀</div>
            </div>
            <div className="text-2xl font-pixel text-danger">{currentWeekStats.totalLosses}</div>
            <div className="text-xs text-text-muted font-pixel-operator">Defeats</div>
          </div>
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <div className="stat-rpg border-warning min-h-[90px] py-2 px-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">🤝</div>
            </div>
            <div className="text-2xl font-pixel text-warning">{currentWeekStats.totalDraws}</div>
            <div className="text-xs text-text-muted font-pixel-operator">Draws</div>
          </div>

          <div className="stat-rpg border-gold min-h-[90px] py-2 px-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl">⭐</div>
            </div>
            <div className="text-2xl font-pixel text-gold">{currentWeekStats.totalPoints}</div>
            <div className="text-xs text-text-muted font-pixel-operator">Total Points</div>
          </div>
        </div>

        {/* Win Rate Display */}
        <div className="mb-6">
          <div className="stat-rpg border-gold max-w-xs mx-auto my-4 min-h-[90px] py-2 px-3">
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
        <div className="panel-rpg mb-6">
          <h3 className="font-pixel text-gold mb-4 flex items-center space-x-2 text-left">
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
            <div className="progress-rpg h-4 w-full">
              <div className="progress-rpg-fill h-full" style={{ width: `${currentWeekStats.winRate}%` }} />
            </div>
            <div className="flex justify-between text-xs text-text-muted">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Daily Battle Log */}
        <div className="mb-8 mt-6 border-t pt-6">
          <h3 className="font-pixel text-gold mb-6 flex items-center space-x-2 text-left">
            <span>📅</span>
            <span>Daily Battle Log</span>
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {currentWeekStats.dailyStats.map((day, index) => (
              <div
                key={day.date}
                className="panel-rpg p-3 text-center w-full aspect-[3/4] hover:brightness-110 transition-all duration-300 group"
              >
                <div className="text-sm font-pixel text-gold mb-2 font-bold">
                  {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div className="text-xs text-text-muted mb-3 font-pixel-operator">{formatDate(day.date)}</div>

                {day.totalAttacks > 0 ? (
                  <div className="space-y-2">
                    <div className="flex flex-col items-center space-y-1">
                      <div className="text-xs font-bold text-gray-300">Strikes</div>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm">⚔️</span>
                        <span className="text-lg font-pixel text-gold">{day.totalAttacks}</span>
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

                    <div className="text-xs text-text-muted mt-2">{day.playerCount} warriors</div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-text-muted">
                    <div className="text-xs font-pixel-operator">No data</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Warrior Rankings */}
        {currentWeekStats.playerStats.length > 0 && (
          <div className="gap-4">
            <h3 className="font-pixel text-gold mb-6 flex items-center space-x-2 text-left">
              <span>👑</span>
              <span>Warrior Rankings</span>
            </h3>
            <div className="panel-rpg overflow-hidden rounded-md border border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-mystic-blue">
                      <th className="text-sm text-gray-300 font-pixel py-3 px-3 text-center">Rank</th>
                      <th className="text-sm text-gray-300 font-pixel py-3 px-3 text-left">Warrior</th>
                      <th className="text-sm text-gray-300 font-pixel py-3 px-3 text-center">Strikes</th>
                      <th className="text-sm text-gray-300 font-pixel py-3 px-3 text-center">Victories</th>
                      <th className="text-sm text-gray-300 font-pixel py-3 px-3 text-center">Defeats</th>
                      <th className="text-sm text-gray-300 font-pixel py-3 px-3 text-center">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentWeekStats.playerStats
                      .sort((a, b) => b.winRate - a.winRate)
                      .map((player, index) => (
                        <tr
                          key={player.playerName}
                          className="border-b border-dark-gray hover:bg-mystic-blue hover:bg-opacity-20 transition-colors group"
                          title={`${player.playerName} – ${player.winRate}% Win Rate`}
                        >
                          <td className="py-2 px-3 text-center">
                            <div className="flex items-center justify-center">
                              {index === 0 ? (
                                <div className="achievement-badge w-8 h-8 text-xs bg-gradient-to-b from-yellow-400 to-yellow-600 border-yellow-500 shadow-glow-gold">
                                  🥇
                                </div>
                              ) : index === 1 ? (
                                <div className="achievement-badge w-8 h-8 text-xs bg-gradient-to-b from-gray-400 to-gray-600 border-gray-500">
                                  🥈
                                </div>
                              ) : index === 2 ? (
                                <div className="achievement-badge w-8 h-8 text-xs bg-gradient-to-b from-yellow-600 to-yellow-800 border-yellow-700">
                                  🥉
                                </div>
                              ) : (
                                <span className="font-pixel text-text-muted text-sm">#{index + 1}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3 font-pixel text-text-primary text-sm">{player.playerName}</td>
                          <td className="py-2 px-3 text-center font-pixel text-gold text-sm">{player.totalAttacks}</td>
                          <td className="py-2 px-3 text-center font-pixel text-success text-sm">{player.totalWins}</td>
                          <td className="py-2 px-3 text-center font-pixel text-danger text-sm">{player.totalLosses}</td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`font-pixel text-sm px-2 py-1 rounded-full ${
                                player.winRate >= 80
                                  ? "bg-green-700/80 text-white"
                                  : player.winRate >= 60
                                  ? "bg-yellow-700/80 text-white"
                                  : "bg-red-700/80 text-white"
                              }`}
                            >
                              {player.winRate}%
                            </span>
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
