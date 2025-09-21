"use client";

import { useGuildWarStore } from "@/store/guildWarStore";

export default function DailyBattleLog() {
  const { currentWeekStats } = useGuildWarStore();

  if (!currentWeekStats) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Reorder days to start from Friday (war week starts on Friday)
  const reorderDaysForWarWeek = (dailyStats: any[], weekStart: string) => {
    const dayOrder = ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"];
    const orderedDays = [];

    // Create a map for quick lookup
    const dayMap = new Map();
    dailyStats.forEach((day) => {
      const dayName = new Date(day.date).toLocaleDateString("en-US", { weekday: "short" });
      dayMap.set(dayName, day);
    });

    // Calculate the actual week start date
    const weekStartDate = new Date(weekStart);

    // Add days in war week order (Friday to Thursday)
    dayOrder.forEach((dayName, index) => {
      if (dayMap.has(dayName)) {
        orderedDays.push(dayMap.get(dayName));
      } else {
        // Create empty day entry for missing days using the correct week boundaries
        const emptyDate = new Date(weekStartDate);
        emptyDate.setDate(weekStartDate.getDate() + index);

        orderedDays.push({
          date: emptyDate.toISOString().split("T")[0],
          totalAttacks: 0,
          totalWins: 0,
          totalLosses: 0,
          totalDraws: 0,
          playerCount: 0,
          winRate: 0,
        });
      }
    });

    return orderedDays;
  };

  const orderedDays = reorderDaysForWarWeek(currentWeekStats.dailyStats, currentWeekStats.weekStart);

  return (
    <div className="card-rpg bg-battlefield p-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="icon-rpg pixel-glow text-xl">📅</div>
        <h3 className="text-xl font-pixel text-gold text-glow">Daily Battle Log</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {orderedDays.map((day, index) => (
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
  );
}
