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
      </div>
    </div>
  );
}
