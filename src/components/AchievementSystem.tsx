"use client";

import { useRPGSounds } from "@/lib/sounds";
import { useGuildWarStore } from "@/store/guildWarStore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNotifications } from "./NotificationSystem";

// Import types, constants, data, and utilities
import { CATEGORY_CONFIG, RARITY_CONFIG } from "@/constants/achievements";
import { ACHIEVEMENTS } from "@/data/achievements";
import type { Achievement, AchievementBadgeProps, AchievementModalProps } from "@/types/achievements";
import { calculateStats } from "@/utils/achievements";

function AchievementBadge({ achievement, isNew = false, onClick }: AchievementBadgeProps) {
  return (
    <div
      className={`
        relative group cursor-pointer
        w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2
        ${RARITY_CONFIG.colors[achievement.rarity]}
        ${RARITY_CONFIG.glow[achievement.rarity]}
        flex flex-col items-center justify-center
        transition-all duration-300
        hover:scale-110 hover:shadow-[0_0_20px_rgba(255,215,0,0.5)]
        ${isNew ? "animate-success-pop ring-4 ring-success ring-opacity-50" : ""}
        mx-auto
      `}
      onClick={onClick}
      title={`${achievement.title} - ${achievement.description}`}
    >
      {/* Achievement Icon */}
      <span className="text-lg sm:text-xl mb-1">{achievement.icon}</span>

      {/* Rarity Indicator */}
      <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-[#0D0D0D] border border-gold rounded-full flex items-center justify-center">
        <span className="text-xs">{RARITY_CONFIG.icons[achievement.rarity]}</span>
      </div>

      {/* Category Indicator */}
      <div
        className={`absolute -bottom-1 -left-1 px-1 py-0.5 rounded text-xs font-pixel-operator ${
          CATEGORY_CONFIG[achievement.category]
        }`}
      >
        {achievement.category.charAt(0).toUpperCase()}
      </div>

      {/* Achievement Title (visible on hover) */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
        <div className="bg-[#0D0D0D] border border-gold rounded-pixel px-2 py-1 text-xs font-pixel text-gold whitespace-nowrap">
          {achievement.title}
        </div>
        {/* Arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gold"></div>
      </div>
    </div>
  );
}

function AchievementModal({ achievement, isOpen, onClose }: AchievementModalProps) {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[99999] p-4">
      <div
        className={`card-rpg bg-battlefield max-w-md w-full border-2 ${
          RARITY_CONFIG.modalColors[achievement.rarity]
        } animate-success-pop`}
      >
        <div className="text-center p-6">
          {/* Achievement Icon with Glow Effect */}
          <div className="relative mb-6">
            <div className={`text-8xl animate-float ${achievement.color} filter drop-shadow-lg`}>
              {achievement.icon}
            </div>
            <div className="absolute inset-0 text-8xl animate-ping opacity-20">{achievement.icon}</div>
          </div>

          {/* Title and Description */}
          <h2 className="text-2xl font-pixel text-gold mb-3 text-glow">Achievement Unlocked!</h2>
          <h3 className={`text-xl font-pixel mb-4 ${achievement.color} text-glow`}>{achievement.title}</h3>
          <p className="text-text-secondary font-pixel-operator mb-6 leading-relaxed">{achievement.description}</p>

          {/* Rarity Badge */}
          <div
            className={`inline-block px-4 py-2 rounded-pixel font-pixel text-sm mb-6 ${
              achievement.rarity === "legendary"
                ? "bg-gold text-[#0D0D0D] shadow-glow-gold"
                : achievement.rarity === "epic"
                ? "bg-purple-600 text-white shadow-glow-purple"
                : achievement.rarity === "rare"
                ? "bg-blue-600 text-white shadow-glow-blue"
                : achievement.rarity === "mythic"
                ? "bg-pink-600 text-white shadow-pink-500/50"
                : "bg-gray-600 text-white"
            }`}
          >
            {achievement.rarity.toUpperCase()}
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <button onClick={onClose} className="btn-rpg text-lg px-8 py-3 hover:scale-105 transition-transform">
              🎉 Awesome!
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document root level
  return createPortal(modalContent, document.body);
}

export default function AchievementSystem() {
  const { attacks } = useGuildWarStore();
  const { showSuccess } = useNotifications();
  const { playVictory, isEnabled: soundEnabled } = useRPGSounds();
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Memoized stats calculation
  const stats = useMemo(() => calculateStats(attacks), [attacks]);

  // Memoized unlocked achievements
  const unlockedAchievementObjects = useMemo(
    () => ACHIEVEMENTS.filter((a) => unlockedAchievements.includes(a.id)),
    [unlockedAchievements]
  );

  // Memoized achievement check function
  const checkForNewAchievements = useCallback(() => {
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
        if (soundEnabled) playVictory();
      }

      // Clear new achievements after animation
      setTimeout(() => {
        setNewAchievements([]);
      }, 3000);
    }
  }, [unlockedAchievements, stats, showSuccess, soundEnabled, playVictory]);

  // Check for new achievements
  useEffect(() => {
    checkForNewAchievements();
  }, [checkForNewAchievements]);

  // Memoized handlers
  const handleAchievementClick = useCallback((achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedAchievement(null);
  }, []);

  if (unlockedAchievementObjects.length === 0) {
    return (
      <div className="card-rpg bg-battlefield p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="icon-rpg pixel-glow text-2xl">🏆</div>
          <h3 className="text-xl font-pixel text-gold text-glow">Achievements</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
          <div className="text-sm text-text-muted font-pixel-operator bg-[#1A1A1A] px-3 py-1 rounded-pixel border border-mystic-blue">
            0/{ACHIEVEMENTS.length}
          </div>
        </div>

        <div className="text-center py-12">
          <div className="icon-rpg text-6xl mb-6 animate-float">🏆</div>
          <div className="bg-[#1A1A1A] border border-mystic-blue rounded-pixel p-6 max-w-md mx-auto">
            <p className="text-text-muted font-pixel-operator text-sm leading-relaxed mb-4">
              No achievements unlocked yet.
            </p>
            <p className="text-text-secondary font-pixel-operator text-xs">Keep battling to earn your first badge!</p>
          </div>

          {/* Progress Bar for Empty State */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-muted font-pixel-operator">Progress</span>
              <span className="text-sm text-gold font-pixel">0%</span>
            </div>
            <div className="progress-rpg h-3">
              <div className="progress-rpg-fill bg-gradient-to-r from-gold to-yellow-400" style={{ width: "0%" }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card-rpg bg-battlefield p-6">
        <div className="flex items-center space-x-4 mb-8">
          <div className="icon-rpg pixel-glow text-2xl">🏆</div>
          <h3 className="text-xl font-pixel text-gold text-glow">Achievements</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
          <div className="text-sm text-text-muted font-pixel-operator bg-[#1A1A1A] px-3 py-1 border border-mystic-blue">
            {unlockedAchievementObjects.length}/{ACHIEVEMENTS.length}
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3 sm:gap-4 md:gap-6 justify-items-center py-4">
          {unlockedAchievementObjects.map((achievement) => (
            <div key={achievement.id} className="relative">
              <AchievementBadge
                achievement={achievement}
                isNew={newAchievements.includes(achievement.id)}
                onClick={() => handleAchievementClick(achievement)}
              />
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-muted font-pixel-operator">Progress</span>
            <span className="text-sm text-gold font-pixel">
              {Math.round((unlockedAchievementObjects.length / ACHIEVEMENTS.length) * 100)}%
            </span>
          </div>
          <div className="progress-rpg h-3">
            <div
              className="progress-rpg-fill bg-gradient-to-r from-gold to-yellow-400"
              style={{ width: `${(unlockedAchievementObjects.length / ACHIEVEMENTS.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Multiple Achievements Notification */}
        {newAchievements.length > 1 && (
          <div className="mt-6 text-center">
            <div className="bg-success/20 border-2 border-success rounded-pixel p-4">
              <p className="text-sm text-success font-pixel">
                🎉 +{newAchievements.length - 1} more achievements unlocked!
              </p>
            </div>
          </div>
        )}

        {/* Achievement Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-text-muted font-pixel-operator">Click on achievements to view details</p>
        </div>
      </div>

      <AchievementModal achievement={selectedAchievement!} isOpen={isModalOpen} onClose={handleModalClose} />
    </>
  );
}
