"use client";

import { Rarity } from "./CharmBuilderSimulator";
import PixelButton from "./PixelButton";

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
  hasLockedRow: boolean;
  onSelectRow: () => void;
  onRollSelected: () => void;
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
  hasLockedRow,
  onSelectRow,
  onRollSelected,
  getStatDef,
}: CharmRowCardProps) {
  const statDef = getStatDef(row.statKey);
  const isLocked = row.locked;

  return (
    <div
      className={`
        border-2 p-4 bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] transition-all duration-300
        ${rarityColor[row.rarity]}
        ${isSelected || isLocked ? rarityGlow[row.rarity] : "shadow-none"}
        ${isSelected && !isLocked ? "ring-2 ring-gold ring-opacity-50" : ""}
        ${isLocked ? "opacity-100" : hasLockedRow ? "opacity-60" : "opacity-100"}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="font-pixel text-sm">Row {index + 1}</span>
          <span className={`font-pixel text-xs ${rarityColor[row.rarity]}`}>{row.rarity}</span>
        </div>
        {isLocked && (
          <div className="flex items-center">
            <span className="text-gold text-lg" title="This row is locked for rolling">
              🔒
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
        ) : (
          // Only show Select button if no other row is locked
          !hasLockedRow && (
            <PixelButton variant="secondary" size="sm" onClick={onSelectRow} title="Select this row for rolling">
              🎯 Select
            </PixelButton>
          )
        )}
      </div>
    </div>
  );
}
