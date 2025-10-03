"use client";

import { Rarity } from "./CharmBuilderSimulatorV2";

interface ProgressPanelProps {
  rarity: Rarity;
  maxRows: number;
  lockedRows: number;
  rerolls: number;
  daysSpent: number;
  onUpgrade: () => void;
  onEyeUpgrade: () => void;
  onEyeUnlock: () => void;
  canUpgrade: boolean;
  canEyeUpgrade: boolean;
  canEyeUnlock: boolean;
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
  lockedRows,
  rerolls,
  daysSpent,
  onUpgrade,
  onEyeUpgrade,
  onEyeUnlock,
  canUpgrade,
  canEyeUpgrade,
  canEyeUnlock,
}: ProgressPanelProps) {
  const MAX_ROWS = 5;
  const progressPercentage = (maxRows / MAX_ROWS) * 100;

  return (
    <div className="space-y-6">
      {/* Charm Status */}
      <div className="bg-[#1A1A1A] border-2 border-mystic-blue rounded-pixel p-4">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-lg">🔹</span>
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

          <div className="flex items-center justify-between">
            <span className="font-pixel-operator text-text-muted text-sm">Locked Rows</span>
            <span className="font-pixel text-gold">{lockedRows}</span>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-text-muted font-pixel-operator mb-1">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-[#2A2A2A] rounded-pixel h-2">
              <div
                className="bg-gradient-to-r from-mystic-blue to-gold h-2 rounded-pixel transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Controls */}
      <div className="bg-[#1A1A1A] border-2 border-warning rounded-pixel p-4">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-lg">⬆️</span>
          <span className="font-pixel text-gold text-glow">Upgrade Options</span>
        </div>

        <div className="space-y-2">
          <button
            onClick={onUpgrade}
            disabled={!canUpgrade}
            className="w-full btn-rpg py-2 px-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Free upgrade (+1 row, +3 days)"
          >
            ⬆️ Upgrade (+1 Row)
          </button>

          <button
            onClick={onEyeUpgrade}
            disabled={!canEyeUpgrade}
            className="w-full btn-rpg py-2 px-3 text-sm bg-mystic-blue border-mystic-blue-light disabled:opacity-50 disabled:cursor-not-allowed"
            title="Upgrade with 10 Eyes (max Rare)"
          >
            👁️ Upgrade (10 Eyes)
          </button>

          <button
            onClick={onEyeUnlock}
            disabled={!canEyeUnlock}
            className="w-full btn-rpg py-2 px-3 text-sm bg-mystic-blue border-mystic-blue-light disabled:opacity-50 disabled:cursor-not-allowed"
            title="Unlock row slot with 100 Eyes"
          >
            👁️ Unlock Row (100 Eyes)
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[#1A1A1A] border-2 border-[#3A3A3A] rounded-pixel p-4">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-lg">📊</span>
          <span className="font-pixel text-gold text-glow">Stats</span>
        </div>

        <div className="space-y-2 text-sm font-pixel-operator text-text-primary">
          <div className="flex items-center justify-between">
            <span>Paid Rerolls</span>
            <span className="text-gold">{rerolls}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Days Invested</span>
            <span className="text-gold">{daysSpent}</span>
          </div>
        </div>
      </div>

      {/* Reference */}
      <div className="bg-[#1A1A1A] border-2 border-[#3A3A3A] rounded-pixel p-4">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-lg">📘</span>
          <span className="font-pixel text-gold text-glow">Reference</span>
        </div>

        <div className="text-xs font-pixel-operator text-text-muted space-y-2">
          <div>• Row rarity odds: Common 50%, Uncommon 30%, Rare 15%, Epic 4%, Legendary 1%</div>
          <div>• Upgrading rerolls only unlocked rows; locked rows persist</div>
          <div>• Eye actions: 10→Upgrade (max Rare), 20→Reroll (keep rarity), 100→Unlock row</div>
        </div>
      </div>
    </div>
  );
}
