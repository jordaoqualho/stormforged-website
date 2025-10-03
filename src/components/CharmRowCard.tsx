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
  onSelectRow: () => void;
  onToggleLock: () => void;
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
  onSelectRow,
  onToggleLock,
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
        {isLocked && <div className="text-gold text-lg">🔒</div>}
      </div>

      {/* Stat Info */}
      <div className="text-center mb-4">
        <div className="font-pixel-operator text-text-muted text-sm mb-1">{statDef.label}</div>
        <div className={`font-pixel text-2xl ${rarityColor[row.rarity]}`}>{statDef.format(row.value)}</div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-2">
        <PixelButton
          variant={isLocked ? "danger" : "secondary"}
          size="sm"
          onClick={onToggleLock}
          title={isLocked ? "Unlock this row" : "Lock this row"}
        >
          {isLocked ? "🔓" : "🔒"}
        </PixelButton>

        {isSelected ? (
          <PixelButton
            variant="primary"
            size="sm"
            onClick={onRollSelected}
            title="Roll the selected row with gold & tomes"
          >
            🎲 Roll
          </PixelButton>
        ) : (
          <PixelButton
            variant="secondary"
            size="sm"
            onClick={onSelectRow}
            disabled={isLocked}
            title="Select this row for rolling"
          >
            🎯 Select
          </PixelButton>
        )}

        <PixelButton variant="eye" size="sm" onClick={onEyeReroll} title="Reroll with 20 Eyes (keep rarity)">
          👁️
        </PixelButton>
      </div>
    </div>
  );
}
