"use client";

import { calculateWeeklyStats, getWeekNumberForDate, getWeekStart } from "@/lib/calculations";
import { useGuildWarStore } from "@/store/guildWarStore";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

interface MemberRankingsProps {
  selectedDate?: string | null;
}

export default function MemberRankings({ selectedDate }: MemberRankingsProps) {
  const { currentWeekStats, attacks, deleteAttack, selectedWeek } = useGuildWarStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<string | null>(null);
  const [playerAttacks, setPlayerAttacks] = useState<any[]>([]);

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
    const sampleDate = weekAttacks[0]?.date || new Date().toISOString().split("T")[0];
    const weekStart = getWeekStart(sampleDate);

    return calculateWeeklyStats(weekAttacks, weekStart);
  }, [attacks, selectedWeek, currentWeekStats]);

  if (!weeklyStats || weeklyStats.playerStats.length === 0) {
    return null;
  }

  // Filter player stats by selected date if provided
  const getFilteredPlayerStats = () => {
    if (!selectedDate) {
      return weeklyStats.playerStats;
    }

    // Get attacks for the selected date
    const dayAttacks = attacks.filter((attack) => attack.date === selectedDate);

    if (dayAttacks.length === 0) {
      return [];
    }

    // Calculate stats for each player for the selected date
    const playerStatsMap = new Map();

    dayAttacks.forEach((attack) => {
      const playerName = attack.playerName;
      if (!playerStatsMap.has(playerName)) {
        playerStatsMap.set(playerName, {
          playerName,
          totalAttacks: 0,
          totalWins: 0,
          totalLosses: 0,
          totalDraws: 0,
          totalPoints: 0,
          winRate: 0,
          dailyAttacks: [],
        });
      }

      const stats = playerStatsMap.get(playerName);
      stats.totalAttacks += attack.attacks;
      stats.totalWins += attack.wins;
      stats.totalLosses += attack.losses;
      stats.totalDraws += attack.draws;
      stats.totalPoints += attack.points;
      stats.dailyAttacks.push(attack);
    });

    // Calculate points-based success rates
    const playerStats = Array.from(playerStatsMap.values()).map((stats) => ({
      ...stats,
      winRate: (() => {
        const actualPoints = stats.totalWins * 5 + stats.totalDraws * 3 + stats.totalLosses * 2;
        const maxPossiblePoints = (stats.totalWins + stats.totalDraws + stats.totalLosses) * 5;
        return maxPossiblePoints > 0 ? Math.round((actualPoints / maxPossiblePoints) * 100) : 0;
      })(),
    }));

    return playerStats;
  };

  const playerStats = getFilteredPlayerStats();
  const isDayView = selectedDate !== null;

  const handleDeleteClick = (e: React.MouseEvent, playerName: string, playerAttacks: any[]) => {
    e.stopPropagation(); // Prevent row click
    setPlayerToDelete(playerName);
    setPlayerAttacks(playerAttacks);
    setShowDeleteModal(true);
  };

  const confirmDelete = async (attackId: string) => {
    try {
      await deleteAttack(attackId);
      setShowDeleteModal(false);
      setPlayerToDelete(null);
      setPlayerAttacks([]);
    } catch (error) {
      console.error("Error deleting attack:", error);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPlayerToDelete(null);
    setPlayerAttacks([]);
  };

  if (isDayView && playerStats.length === 0) {
    return (
      <div className="card-rpg bg-battlefield p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="icon-rpg pixel-glow text-xl">👑</div>
          <h3 className="text-xl font-pixel text-gold text-glow">
            {isDayView ? `Member Rankings - ${new Date(selectedDate!).toLocaleDateString()}` : "Member Rankings"}
          </h3>
          <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
        </div>
        <div className="text-center py-8">
          <div className="text-text-muted font-pixel-operator">No battles recorded for this day</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-rpg bg-battlefield p-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="icon-rpg pixel-glow text-xl">👑</div>
        <h3 className="text-xl font-pixel text-gold text-glow">
          {isDayView ? `Member Rankings - ${new Date(selectedDate!).toLocaleDateString()}` : "Member Rankings"}
        </h3>
        <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
      </div>
      <div className="panel-rpg overflow-hidden rounded-md border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-mystic-blue">
                <th className="text-xs sm:text-sm text-gray-300 font-pixel py-2 sm:py-3 px-2 sm:px-3 text-center">
                  Rank
                </th>
                <th className="text-xs sm:text-sm text-gray-300 font-pixel py-2 sm:py-3 px-2 sm:px-3 text-left">
                  Member
                </th>
                <th className="text-xs sm:text-sm text-gray-300 font-pixel py-2 sm:py-3 px-2 sm:px-3 text-center">
                  Victories
                </th>
                <th className="text-xs sm:text-sm text-gray-300 font-pixel py-2 sm:py-3 px-2 sm:px-3 text-center hidden sm:table-cell">
                  Draws
                </th>
                <th className="text-xs sm:text-sm text-gray-300 font-pixel py-2 sm:py-3 px-2 sm:px-3 text-center hidden sm:table-cell">
                  Defeats
                </th>
                <th className="text-xs sm:text-sm text-gray-300 font-pixel py-2 sm:py-3 px-2 sm:px-3 text-center">
                  Points
                </th>
                <th className="text-xs sm:text-sm text-gray-300 font-pixel py-2 sm:py-3 px-2 sm:px-3 text-center">
                  Win %
                </th>
                <th className="text-xs sm:text-sm text-gray-300 font-pixel py-2 sm:py-3 px-2 sm:px-3 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {playerStats
                .sort((a, b) => {
                  // Sort by points first, then by win rate, then by total attacks (calculated)
                  if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
                  if (b.winRate !== a.winRate) return b.winRate - a.winRate;
                  const aTotalAttacks = a.totalWins + a.totalLosses + (a.totalDraws || 0);
                  const bTotalAttacks = b.totalWins + b.totalLosses + (b.totalDraws || 0);
                  return bTotalAttacks - aTotalAttacks;
                })
                .map((player, index) => (
                  <tr
                    key={player.playerName}
                    className="border-b border-dark-gray hover:bg-mystic-blue hover:bg-opacity-20 transition-colors group"
                    title={`${player.playerName} - ${
                      player.totalWins + player.totalLosses + (player.totalDraws || 0)
                    } total attacks (${player.winRate}% win rate)`}
                  >
                    <td className="py-2 px-2 sm:px-3 text-center">
                      <div className="flex items-center justify-center">
                        {index === 0 ? (
                          <div className="achievement-badge bg-gradient-to-b from-yellow-400 to-yellow-600 border-yellow-500 shadow-glow-gold">
                            🥇
                          </div>
                        ) : index === 1 ? (
                          <div className="achievement-badge  bg-gradient-to-b from-gray-400 to-gray-600 border-gray-500">
                            🥈
                          </div>
                        ) : index === 2 ? (
                          <div className="achievement-badge bg-gradient-to-b from-yellow-600 to-yellow-800 border-yellow-700">
                            🥉
                          </div>
                        ) : (
                          <span className="font-pixel text-text-muted text-xs sm:text-sm">#{index + 1}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-2 sm:px-3 font-pixel text-text-primary text-xs sm:text-sm">
                      {player.playerName}
                    </td>
                    <td className="py-2 px-2 sm:px-3 text-center font-pixel text-success text-xs sm:text-sm">
                      {player.totalWins}
                    </td>
                    <td className="py-2 px-2 sm:px-3 text-center font-pixel text-orange-400 text-xs sm:text-sm hidden sm:table-cell">
                      {player.totalDraws || 0}
                    </td>
                    <td className="py-2 px-2 sm:px-3 text-center font-pixel text-danger text-xs sm:text-sm hidden sm:table-cell">
                      {player.totalLosses}
                    </td>
                    <td className="py-2 px-2 sm:px-3 text-center font-pixel text-gold text-xs sm:text-sm">
                      {player.totalPoints}
                    </td>
                    <td className="py-2 px-2 sm:px-3 text-center font-pixel text-xs sm:text-sm">
                      <div
                        className={`px-2 py-1 rounded-full inline-block ${
                          player.winRate >= 80
                            ? "bg-green-700/80 text-green-100"
                            : player.winRate >= 60
                            ? "bg-yellow-700/80 text-yellow-100"
                            : player.winRate >= 40
                            ? "bg-orange-700/80 text-orange-100"
                            : "bg-red-700/80 text-red-100"
                        }`}
                      >
                        {player.winRate}%
                      </div>
                    </td>
                    <td className="py-2 px-2 sm:px-3 text-center">
                      <button
                        onClick={(e) => handleDeleteClick(e, player.playerName, player.dailyAttacks)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded px-2 py-1 transition-colors text-xs font-pixel"
                        title="Delete player records"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Modal - Rendered as Portal to avoid clipping */}
      {showDeleteModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
            <div className="card-rpg bg-battlefield p-6 max-w-md w-full mx-4 relative">
              <div className="flex items-center space-x-4 mb-6">
                <div className="icon-rpg pixel-glow text-xl">🗑️</div>
                <h3 className="text-xl font-pixel text-red-400">Delete Records</h3>
              </div>

              <div className="mb-4">
                <p className="text-text-primary font-pixel-operator mb-4">
                  Select which record to delete for <span className="text-gold font-pixel">{playerToDelete}</span>:
                </p>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {playerAttacks.map((attack: any) => (
                    <div
                      key={attack.id}
                      className="panel-rpg p-3 border border-gray-700 hover:border-red-500 transition-colors cursor-pointer group"
                      onClick={() => confirmDelete(attack.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-pixel text-text-primary">
                            {new Date(attack.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="text-xs text-text-muted font-pixel-operator">
                            {attack.wins + attack.losses + attack.draws} attacks • {attack.wins}W/{attack.draws || 0}D/
                            {attack.losses}L • {attack.points} points
                          </div>
                        </div>
                        <div className="text-red-400 group-hover:text-red-300 transition-colors">🗑️</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 font-pixel text-text-muted hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
