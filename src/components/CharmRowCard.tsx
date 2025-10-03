"use client";

import { Rarity } from "./CharmBuilderSimulator";
import PixelButton from "./PixelButton";

type StatKey = string; // Simplified for interface compatibility

interface CharmRowCardProps {
  row: {
    id: string;
    locked: boolean;
    statKey: string;
    rarity: Rarity;
    value: number;
  };
  index: number;
  isSelected: boolean;
  isRollLocked: boolean;
  rollLockTimeRemaining: number | null;
  onSelectRow: () => void;
  onRollSelected: () => void;
  onEyeReroll: () => void;
  getStatDef: (key: string) => any;
}

const rarityColor: Record<Rarity, string> = {
  Common: "border-gray-400 text-gray-300",
  Uncommon: "border-green-400 text-green-400",
  Rare: "border-mystic-blue-light text-mystic-blue-light",
  Epic: "border-purple-400 text-purple-400",
  Legendary: "border-gold text-gold",
};

const rarityGlow: Record<Rarity, string> = {
  Common: "shadow-none",
  Uncommon: "shadow-glow-green",
  Rare: "shadow-glow-blue",
  Epic: "shadow-glow-purple",
  Legendary: "shadow-glow-gold",
};

export default function CharmRowCard({
  row,
  index,
  isSelected,
  isRollLocked,
  rollLockTimeRemaining,
  onSelectRow,
  onRollSelected,
  onEyeReroll,
  getStatDef,
}: CharmRowCardProps) {
  const statDef = getStatDef(row.statKey);
  const isLocked = row.locked;

  return (
    <div
      className={`
        rounded-pixel border-2 p-4 bg-[#1A1A1A] transition-all duration-300
        ${rarityColor[row.rarity]}
        ${rarityGlow[row.rarity]}
        ${isSelected ? "ring-2 ring-gold ring-opacity-50" : ""}
        ${isLocked ? "opacity-75" : "hover:scale-[1.02]"}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="font-pixel text-sm">Row {index + 1}</span>
          <span className={`font-pixel text-xs ${rarityColor[row.rarity]}`}>{row.rarity}</span>
        </div>
        {(isLocked || isRollLocked) && (
          <div className="flex items-center">
            <span
              className="text-gold text-lg"
              title={isRollLocked ? `Roll locked for ${rollLockTimeRemaining}s` : "This row is locked for rolling"}
            >
              {isRollLocked ? `🔒 ${rollLockTimeRemaining}s` : "🔒"}
            </span>
          </div>
        )}
      </div>

      {/* Stat Info */}
      <div className="text-center mb-4">
        <div className="font-pixel-operator text-text-muted text-sm mb-1">{statDef.label}</div>
        <div className={`font-pixel text-2xl ${rarityColor[row.rarity]}`}>{statDef.format(row.value)}</div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-2">
        {isSelected ? (
          <PixelButton
            variant="primary"
            size="sm"
            onClick={onRollSelected}
            disabled={isRollLocked}
            title={
              isRollLocked ? `Roll locked for ${rollLockTimeRemaining}s` : "Roll the selected row with gold & tomes"
            }
          >
            {isRollLocked ? `🔒 ${rollLockTimeRemaining}s` : "🎲 Roll"}
          </PixelButton>
        ) : null}

        <PixelButton variant="eye" size="sm" onClick={onEyeReroll} title="Reroll with 20 Eyes (keep rarity)">
          👁️
        </PixelButton>
      </div>
    </div>
  );
}
