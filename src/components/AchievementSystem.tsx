"use client";

import { useGuildWarStore } from "@/store/guildWarStore";
import { useEffect, useState } from "react";
import { useNotifications } from "./NotificationSystem";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  condition: (stats: any) => boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_battle",
    title: "First Blood",
    description: "Record your first battle",
    icon: "⚔️",
    color: "text-gold",
    rarity: "common",
    condition: (stats) => stats.totalAttacks >= 1,
  },
  {
    id: "perfect_week",
    title: "Perfect Victory",
    description: "Achieve 100% win rate in a week",
    icon: "👑",
    color: "text-gold",
    rarity: "legendary",
    condition: (stats) => stats.winRate === 100 && stats.totalAttacks >= 5,
  },
  {
    id: "warrior_spirit",
    title: "Warrior Spirit",
    description: "Complete 50 total attacks",
    icon: "🏆",
    color: "text-success",
    rarity: "rare",
    condition: (stats) => stats.totalAttacks >= 50,
  },
  {
    id: "guild_master",
    title: "Guild Master",
    description: "Have 10+ warriors in your guild",
    icon: "🏰",
    color: "text-mystic-blue-light",
    rarity: "epic",
    condition: (stats) => stats.uniquePlayers >= 10,
  },
  {
    id: "consecutive_wins",
    title: "Unstoppable Force",
    description: "Win 10 battles in a row",
    icon: "🔥",
    color: "text-danger",
    rarity: "epic",
    condition: (stats) => stats.consecutiveWins >= 10,
  },
  {
    id: "daily_warrior",
    title: "Daily Warrior",
    description: "Battle for 7 consecutive days",
    icon: "📅",
    color: "text-warning",
    rarity: "rare",
    condition: (stats) => stats.consecutiveDays >= 7,
  },
  {
    id: "efficient_fighter",
    title: "Efficient Fighter",
    description: "Maintain 80%+ win rate over 20 battles",
    icon: "⚡",
    color: "text-success",
    rarity: "rare",
    condition: (stats) => stats.winRate >= 80 && stats.totalAttacks >= 20,
  },
];

interface AchievementBadgeProps {
  achievement: Achievement;
  isNew?: boolean;
  onClick?: () => void;
}

function AchievementBadge({ achievement, isNew = false, onClick }: AchievementBadgeProps) {
  const rarityColors = {
    common: "border-gray-400 bg-gray-600",
    rare: "border-blue-400 bg-blue-600",
    epic: "border-purple-400 bg-purple-600",
    legendary: "border-gold bg-gold-dark",
  };

  const rarityGlow = {
    common: "shadow-none",
    rare: "shadow-glow-blue",
    epic: "shadow-glow-blue",
    legendary: "shadow-glow-gold",
  };

  return (
    <div
      className={`
        relative group cursor-pointer
        w-20 h-20 rounded-full border-2
        ${rarityColors[achievement.rarity]}
        ${rarityGlow[achievement.rarity]}
        flex items-center justify-center
        transition-all duration-300
        hover:scale-110
        ${isNew ? "animate-success-pop" : ""}
      `}
      onClick={onClick}
    >
      <span className="text-2xl">{achievement.icon}</span>

      {isNew && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full animate-pulse">
          <span className="text-xs text-[#0D0D0D] font-pixel">!</span>
        </div>
      )}

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-[#0D0D0D] border border-gold rounded-pixel p-2 shadow-[8px_8px_0px_rgba(0,0,0,0.8)] whitespace-nowrap">
          <div className={`font-pixel text-xs ${achievement.color}`}>{achievement.title}</div>
          <div className="text-xs text-text-secondary font-pixel-operator">{achievement.description}</div>
          <div className="text-xs text-gold font-pixel-operator capitalize">{achievement.rarity}</div>
        </div>
      </div>
    </div>
  );
}

interface AchievementModalProps {
  achievement: Achievement;
  isOpen: boolean;
  onClose: () => void;
}

function AchievementModal({ achievement, isOpen, onClose }: AchievementModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="card-rpg bg-battlefield max-w-md mx-4 animate-success-pop">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-float">{achievement.icon}</div>
          <h2 className="text-2xl font-pixel text-gold mb-2">Achievement Unlocked!</h2>
          <h3 className={`text-xl font-pixel mb-4 ${achievement.color}`}>{achievement.title}</h3>
          <p className="text-text-secondary font-pixel-operator mb-6">{achievement.description}</p>
          <div className="flex justify-center space-x-4">
            <button onClick={onClose} className="btn-rpg">
              🎉 Awesome!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AchievementSystem() {
  const { attacks } = useGuildWarStore();
  const { showSuccess } = useNotifications();
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate stats for achievements
  const stats = {
    totalAttacks: attacks.reduce((sum, attack) => sum + attack.attacks, 0),
    totalWins: attacks.reduce((sum, attack) => sum + attack.wins, 0),
    winRate: 0,
    uniquePlayers: new Set(attacks.map((attack) => attack.playerName)).size,
    consecutiveWins: 0, // This would need more complex logic
    consecutiveDays: 0, // This would need more complex logic
  };

  if (stats.totalAttacks > 0) {
    stats.winRate = Math.round((stats.totalWins / stats.totalAttacks) * 100);
  }

  // Check for new achievements
  useEffect(() => {
    const newUnlocked: string[] = [];

    ACHIEVEMENTS.forEach((achievement) => {
      if (!unlockedAchievements.includes(achievement.id) && achievement.condition(stats)) {
        newUnlocked.push(achievement.id);
      }
    });

    if (newUnlocked.length > 0) {
      setUnlockedAchievements((prev) => [...prev, ...newUnlocked]);
      setNewAchievements(newUnlocked);

      // Show notification for first achievement
      const firstNew = ACHIEVEMENTS.find((a) => a.id === newUnlocked[0]);
      if (firstNew) {
        showSuccess(`Achievement Unlocked: ${firstNew.title}! ${firstNew.icon}`);
      }

      // Clear new achievements after animation
      setTimeout(() => {
        setNewAchievements([]);
      }, 3000);
    }
  }, [attacks, unlockedAchievements, showSuccess]);

  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setIsModalOpen(true);
  };

  const unlockedAchievementObjects = ACHIEVEMENTS.filter((a) => unlockedAchievements.includes(a.id));

  if (unlockedAchievementObjects.length === 0) {
    return (
      <div className="card-rpg bg-battlefield">
        <div className="text-center py-8">
          <div className="icon-rpg text-4xl mb-4">🏆</div>
          <h3 className="font-pixel text-gold mb-2">Achievements</h3>
          <p className="text-text-muted font-pixel-operator text-sm">
            No achievements unlocked yet.
            <br />
            Keep battling to earn your first badge!
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card-rpg bg-battlefield">
        <div className="flex items-center space-x-3 mb-6">
          <div className="icon-rpg pixel-glow">🏆</div>
          <h3 className="text-lg font-pixel text-gold text-glow">Achievements</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
          <div className="text-sm text-text-muted font-pixel-operator">
            {unlockedAchievementObjects.length}/{ACHIEVEMENTS.length}
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
          {unlockedAchievementObjects.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              isNew={newAchievements.includes(achievement.id)}
              onClick={() => handleAchievementClick(achievement)}
            />
          ))}
        </div>

        {newAchievements.length > 1 && (
          <div className="mt-4 text-center">
            <p className="text-xs text-success font-pixel">+{newAchievements.length - 1} more achievements unlocked!</p>
          </div>
        )}
      </div>

      <AchievementModal
        achievement={selectedAchievement!}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAchievement(null);
        }}
      />
    </>
  );
}
