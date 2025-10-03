"use client";

import { Rarity } from "./CharmBuilderSimulator";

interface ProgressPanelProps {
  rarity: Rarity;
  maxRows: number;
  charmProgress: {
    totalPoints: number;
    maxPossiblePoints: number;
    percentage: number;
    isComplete: boolean;
  };
  onCloverUpgrade: () => void;
  onEyeUpgrade: () => void;
  onEyeUnlock: () => void;
  onEyeReroll: () => void;
  canCloverUpgrade: boolean;
  canEyeUpgrade: boolean;
  canEyeUnlock: boolean;
  canEyeReroll: boolean;
}

const rarityColor: Record<Rarity, string> = {
  Common: "text-gray-300",
  Uncommon: "text-green-400",
  Rare: "text-mystic-blue-light",
  Epic: "text-purple-400",
  Legendary: "text-gold",
};

const rarityIcon: Record<Rarity, string> = {
  Common: "⚪",
  Uncommon: "🟢",
  Rare: "🔵",
  Epic: "🟣",
  Legendary: "⭐",
};

export default function ProgressPanel({
  rarity,
  maxRows,
  charmProgress,
  onCloverUpgrade,
  onEyeUpgrade,
  onEyeUnlock,
  onEyeReroll,
  canCloverUpgrade,
  canEyeUpgrade,
  canEyeUnlock,
  canEyeReroll,
}: ProgressPanelProps) {
  const MAX_ROWS = 5;

  return (
    <div className="space-y-6">
      {/* Charm Status */}
      <div className="bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] border-2 border-mystic-blue shadow-[4px_4px_0px_rgba(0,0,0,0.8)] p-4 transition-all duration-300 hover:border-gold">
        <div className="flex items-center space-x-2 mb-3">
          <span className="font-pixel text-gold text-glow">Charm Status</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-pixel-operator text-text-muted text-sm">Rarity</span>
            <div className="flex items-center space-x-2">
              <span className="text-lg">{rarityIcon[rarity]}</span>
              <span className={`font-pixel ${rarityColor[rarity]} animate-pulse`}>{rarity}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-pixel-operator text-text-muted text-sm">Unlocked Rows</span>
            <span className="font-pixel text-gold">
              {maxRows}/{MAX_ROWS}
            </span>
          </div>

          {/* Charm Rarity Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-text-muted font-pixel-operator mb-1">
              <span>Charm Rows Rarity Progress</span>
              <span>{charmProgress.percentage}%</span>
            </div>
            <div className="w-full bg-[#2A2A2A] rounded-pixel h-2">
              <div
                className={`h-2 rounded-pixel transition-all duration-500 ${
                  charmProgress.isComplete
                    ? "bg-gradient-to-r from-gold to-yellow-300 animate-pulse"
                    : "bg-gradient-to-r from-purple-500 to-gold"
                }`}
                style={{ width: `${charmProgress.percentage}%` }}
              />
            </div>
            <div className="text-xs text-text-muted font-pixel-operator mt-1">
              {charmProgress.totalPoints}/{charmProgress.maxPossiblePoints} points
              {charmProgress.isComplete && " - COMPLETE! ⭐"}
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Controls */}
      <div className="bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] border-2 border-mystic-blue shadow-[4px_4px_0px_rgba(0,0,0,0.8)] p-4 transition-all duration-300 hover:border-gold">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-lg">⬆️</span>
          <span className="font-pixel text-gold text-glow">Upgrade Options</span>
        </div>

        <div className="space-y-2">
          <button
            onClick={onCloverUpgrade}
            disabled={!canCloverUpgrade}
            className="w-full btn-rpg py-2 px-3 text-sm bg-green-600 border-green-500 hover:bg-green-500 hover:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed space-x-2"
            title={
              rarity === "Legendary" && maxRows === 5
                ? "Unlock locked rows with 100 Clovers"
                : "Upgrade with 100 Clovers (instant)"
            }
          >
                 
            {rarity === "Legendary" && maxRows === 5 ? <span>Unlock</span>: <span>Upgrade</span>}
                 <span className="text-xs opacity-75">(100 🍀)</span>
          </button>

          <button
            onClick={onEyeUpgrade}
            disabled={!canEyeUpgrade}
            className="w-full btn-rpg py-2 px-3 text-sm border-mystic-blue-light hover:bg-purple-500 hover:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed space-x-2"
            title="Upgrade with 10 Eyes (max Rare)"
          >
            <span>Upgrade</span>
            <span className="text-xs opacity-75">(10 👁️)</span>
          </button>

          <button
            onClick={onEyeReroll}
            disabled={!canEyeReroll}
            className="w-full btn-rpg py-2 px-3 text-sm bg-orange-600 border-orange-500 hover:bg-purple-500 hover:border-purple-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Reroll selected row stats with 20 Eyes (keep rarity)"
          >
            <div className="flex items-center justify-center space-x-2">
              <span>Reroll Stats</span>
              <span className="text-xs opacity-75">(20 👁️)</span>
            </div>
          </button>

          <button
            onClick={onEyeUnlock}
            disabled={!canEyeUnlock}
            className="w-full btn-rpg py-2 px-3 text-sm bg-purple-600 border-purple-500 hover:bg-purple-500 hover:border-purple-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Unlock currently locked row with 100 Eyes"
          >
            <div className="flex items-center justify-center space-x-2">
              <span>Unlock Row</span>
              <span className="text-xs opacity-75">(100 👁️)</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
