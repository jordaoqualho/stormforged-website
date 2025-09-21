"use client";

import { useGuildWarStore } from "@/store/guildWarStore";
import { useState } from "react";
import RPGConfirmModal from "./RPGConfirmModal";

interface MemberRankingsProps {
  selectedDate?: string | null;
}

export default function MemberRankings({ selectedDate }: MemberRankingsProps) {
  const { currentWeekStats, attacks, deleteAttack } = useGuildWarStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [attackToDelete, setAttackToDelete] = useState<string | null>(null);

  if (!currentWeekStats || currentWeekStats.playerStats.length === 0) {
    return null;
  }

  // Filter player stats by selected date if provided
  const getFilteredPlayerStats = () => {
    if (!selectedDate) {
      return currentWeekStats.playerStats;
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

    // Calculate win rates
    const playerStats = Array.from(playerStatsMap.values()).map((stats) => ({
      ...stats,
      winRate: stats.totalAttacks > 0 ? Math.round((stats.totalWins / stats.totalAttacks) * 100) : 0,
    }));

    return playerStats;
  };

  const playerStats = getFilteredPlayerStats();
  const isDayView = selectedDate !== null;

  const handleDeleteClick = (e: React.MouseEvent, attackId: string) => {
    e.stopPropagation(); // Prevent row click
    setAttackToDelete(attackId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (attackToDelete) {
      try {
        await deleteAttack(attackToDelete);
        setShowDeleteModal(false);
        setAttackToDelete(null);
      } catch (error) {
        console.error("Error deleting attack:", error);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setAttackToDelete(null);
  };

  if (isDayView && playerStats.length === 0) {
    return (
      <div className="card-rpg bg-battlefield p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="icon-rpg pixel-glow text-xl">👑</div>
          <h3 className="text-xl font-pixel text-gold text-glow">
            {isDayView ? `Member Rankings - ${new Date(selectedDate).toLocaleDateString()}` : "Member Rankings"}
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
          {isDayView ? `Member Rankings - ${new Date(selectedDate).toLocaleDateString()}` : "Member Rankings"}
        </h3>
        <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
      </div>
      <div className="panel-rpg overflow-hidden rounded-md border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mystic-blue">
                <th className="text-sm text-gray-300 font-pixel py-3 px-3 text-center">Rank</th>
                <th className="text-sm text-gray-300 font-pixel py-3 px-3 text-left">Member</th>
                <th className="text-sm text-gray-300 font-pixel py-3 px-3 text-center">Attacks</th>
                <th className="text-sm text-gray-300 font-pixel py-3 px-3 text-center">Victories</th>
                <th className="text-sm text-gray-300 font-pixel py-3 px-3 text-center">Defeats</th>
                <th className="text-sm text-gray-300 font-pixel py-3 px-3 text-center">Points</th>
                <th className="text-sm text-gray-300 font-pixel py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {playerStats
                .flatMap((player) =>
                  player.dailyAttacks.map((attack) => ({ ...attack, playerName: player.playerName }))
                )
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((attack, index) => (
                  <tr
                    key={attack.id}
                    className="border-b border-dark-gray hover:bg-mystic-blue hover:bg-opacity-20 transition-colors group"
                    title={`${attack.playerName} - ${new Date(attack.date).toLocaleDateString()}`}
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
                    <td className="py-2 px-3 font-pixel text-text-primary text-sm">{attack.playerName}</td>
                    <td className="py-2 px-3 text-center font-pixel text-gold text-sm">{attack.attacks}</td>
                    <td className="py-2 px-3 text-center font-pixel text-success text-sm">{attack.wins}</td>
                    <td className="py-2 px-3 text-center font-pixel text-danger text-sm">{attack.losses}</td>
                    <td className="py-2 px-3 text-center font-pixel text-gold text-sm">{attack.points}</td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={(e) => handleDeleteClick(e, attack.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded px-2 py-1 transition-colors text-xs"
                        title="Delete attack record"
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

      {/* Delete Confirmation Modal */}
      <RPGConfirmModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Battle Record"
        message="Are you sure you want to delete this battle record? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}
