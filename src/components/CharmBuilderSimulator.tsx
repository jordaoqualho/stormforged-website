"use client";

import { useRPGSounds } from "@/lib/sounds";
import { useEffect, useMemo, useState } from "react";
import CharmRowCard from "./CharmRowCard";
import CostTracker from "./CostTracker";
import PixelButton from "./PixelButton";
import ProgressPanel from "./ProgressPanel";
import RPGConfirmModal from "./RPGConfirmModal";

export type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

const RARITIES: Rarity[] = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
const RARITY_WEIGHTS: Record<Rarity, number> = {
  Common: 50,
  Uncommon: 30,
  Rare: 15,
  Epic: 4,
  Legendary: 1,
};

const MAX_ROWS = 5;

type StatKey =
  | "ATTACK"
  | "ATTACK_SPEED_PCT"
  | "ATTACK_SPEED_FLAT"
  | "HEALTH"
  | "ARMOR"
  | "RESIST"
  | "ARMOR_PEN_PCT"
  | "ARMOR_PEN_FLAT"
  | "RESIST_PEN_PCT"
  | "RESIST_PEN_FLAT"
  | "CRIT_CHANCE_PCT"
  | "CRIT_CHANCE_FLAT"
  | "CRIT_DAMAGE"
  | "MOVE_SPEED"
  | "RESIST_SHRED";

type StatDefinition = {
  key: StatKey;
  label: string;
  values: number[];
  format: (v: number) => string;
};

// Helper formatters
const fmtInt = (v: number) => `+${Math.round(v)}`;
const fmtFloat3 = (v: number) => `+${v.toFixed(3)}`;
const fmtFloat2 = (v: number) => `+${v.toFixed(2)}`;
const fmtPct = (v: number) => `+${v.toFixed(0)}%`;
const fmtPct1 = (v: number) => `+${v.toFixed(1)}%`;
const fmtPct1Neg = (v: number) => `${v.toFixed(1)}%`;

// Substat pool transcribed from the provided image
const SUBSTAT_POOL: StatDefinition[] = [
  { key: "ATTACK", label: "Attack", values: [450, 487, 600, 675, 900], format: fmtInt },
  { key: "ATTACK_SPEED_PCT", label: "Attack Speed (%)", values: [15, 17, 22, 26, 35], format: fmtPct },
  {
    key: "ATTACK_SPEED_FLAT",
    label: "Attack Speed (Flat)",
    values: [0.05, 0.055, 0.07, 0.08, 0.11],
    format: fmtFloat3,
  },
  { key: "HEALTH", label: "Health", values: [2400, 2625, 3200, 3600, 4800], format: fmtInt },
  { key: "ARMOR", label: "Armor", values: [1500, 1625, 2000, 2250, 3000], format: fmtInt },
  { key: "RESIST", label: "Resist", values: [1500, 1625, 2000, 2250, 3000], format: fmtInt },
  { key: "ARMOR_PEN_PCT", label: "Armor Penetration (%)", values: [11.0, 11.75, 14.0, 15.5, 20.0], format: fmtPct1 },
  { key: "ARMOR_PEN_FLAT", label: "Armor Pen. (Flat)", values: [4000, 4500, 6000, 7000, 10000], format: fmtInt },
  { key: "RESIST_PEN_PCT", label: "Resist Penetration (%)", values: [11.0, 11.75, 14.0, 15.5, 20.0], format: fmtPct1 },
  { key: "RESIST_PEN_FLAT", label: "Resist Pen. (Flat)", values: [4000, 4500, 6000, 7000, 10000], format: fmtInt },
  { key: "CRIT_CHANCE_PCT", label: "Critical Chance (%)", values: [30, 33, 40, 45, 50], format: fmtPct },
  {
    key: "CRIT_CHANCE_FLAT",
    label: "Critical Chance (Flat)",
    values: [0.03, 0.034, 0.045, 0.05, 0.075],
    format: fmtFloat3,
  },
  { key: "CRIT_DAMAGE", label: "Critical Damage (x)", values: [0.9, 0.98, 1.3, 1.45, 2.0], format: fmtFloat2 },
  { key: "MOVE_SPEED", label: "Move Speed (tile/sec)", values: [0.45, 0.487, 0.6, 0.675, 0.9], format: fmtFloat3 },
  {
    key: "RESIST_SHRED",
    label: "Resist Shred per Magic Hit (max 10)",
    values: [-1.5, -1.6, -2.0, -2.3, -3.0],
    format: fmtPct1Neg,
  },
];

const rarityIndex = (r: Rarity) => RARITIES.indexOf(r);

type Row = {
  id: string;
  locked: boolean;
  statKey: StatKey;
  rarity: Rarity;
  value: number;
};

type CharmState = {
  rarity: Rarity;
  maxRows: number;
  rows: Row[];
  rerolls: number;
  eyesSpent: number;
  goldSpent: number;
  tomesSpent: number;
  daysSpent: number;
  selectedRowIndex: number | null; // Currently selected row for rolling
};

const STORAGE_KEY = "ih_charm_builder_v2";

function randomOf<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedRarityRoll(): Rarity {
  const total = RARITIES.reduce((sum, r) => sum + RARITY_WEIGHTS[r], 0);
  let roll = Math.random() * total;
  for (const r of RARITIES) {
    roll -= RARITY_WEIGHTS[r];
    if (roll <= 0) return r;
  }
  return "Common";
}

function rollStatForRarity(r: Rarity): { key: StatKey; value: number } {
  const def = randomOf(SUBSTAT_POOL);
  const idx = rarityIndex(r);
  return { key: def.key, value: def.values[idx] };
}

function rollFullRow(): Row {
  const r = weightedRarityRoll();
  const { key, value } = rollStatForRarity(r);
  return {
    id: Math.random().toString(36).substr(2, 9), // Use Math.random instead of crypto.randomUUID for SSR compatibility
    locked: false,
    statKey: key,
    rarity: r,
    value,
  };
}

function createNewCharm(): CharmState {
  const rarity: Rarity = "Common";
  const maxRows = 1;
  return {
    rarity,
    maxRows,
    rows: Array.from({ length: maxRows }, () => rollFullRow()),
    rerolls: 0,
    eyesSpent: 0,
    goldSpent: 0,
    tomesSpent: 0,
    daysSpent: 0,
    selectedRowIndex: null,
  };
}

function rarityUp(r: Rarity): Rarity {
  const idx = rarityIndex(r);
  return RARITIES[Math.min(idx + 1, RARITIES.length - 1)];
}

function getStatDef(key: StatKey): StatDefinition {
  const def = SUBSTAT_POOL.find((s) => s.key === key)!;
  return def;
}

function computeNextCost(rerolls: number) {
  const baseGold = 10000;
  const baseTomes = 1000;
  const factor = Math.pow(1.1, rerolls);
  const gold = Math.round(baseGold * factor);
  const tomes = Math.round(baseTomes * factor);
  return { gold, tomes };
}

export default function CharmBuilderSimulatorV2() {
  const [state, setState] = useState<CharmState>(() => createNewCharm());
  const [isClient, setIsClient] = useState(false);
  const [showNewCharmConfirm, setShowNewCharmConfirm] = useState(false);

  const { playClick, playSuccess, playError, playHover } = useRPGSounds();

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const savedState = JSON.parse(raw) as CharmState;
        setState(savedState);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {}
    }
  }, [state, isClient]);

  const rarityIdx = useMemo(() => rarityIndex(state.rarity), [state.rarity]);
  const nextPaidCost = useMemo(() => computeNextCost(state.rerolls), [state.rerolls]);

  const selectRowForRolling = (rowIndex: number) => {
    setState((prev) => {
      const rows = [...prev.rows];
      const existing = rows[rowIndex];
      if (existing?.locked) {
        playError();
        return prev;
      }
      playClick();
      // Select this row for rolling (this locks it for rolling)
      return {
        ...prev,
        selectedRowIndex: rowIndex,
        // Reset reroll cost for the new selected row
        rerolls: 0,
      };
    });
  };

  const rollSelectedRow = () => {
    setState((prev) => {
      if (prev.selectedRowIndex === null) {
        playError();
        return prev;
      }
      playClick();
      const rows = [...prev.rows];
      const newRow = rollFullRow();
      rows[prev.selectedRowIndex] = { ...newRow };
      const { gold, tomes } = computeNextCost(prev.rerolls);
      return {
        ...prev,
        rows,
        rerolls: prev.rerolls + 1,
        goldSpent: prev.goldSpent + gold,
        tomesSpent: prev.tomesSpent + tomes,
      };
    });
  };

  const toggleLock = (rowIndex: number) => {
    setState((prev) => {
      const rows = [...prev.rows];
      if (!rows[rowIndex]) return prev;
      const isLocking = !rows[rowIndex].locked;
      rows[rowIndex] = { ...rows[rowIndex], locked: isLocking };
      playClick();
      return { ...prev, rows };
    });
  };

  const upgradeFree = () => {
    setState((prev) => {
      if (prev.rarity === "Legendary") {
        playError();
        return prev;
      }
      playSuccess();
      const newRarity = rarityUp(prev.rarity);
      const newMaxRows = Math.min(prev.maxRows + 1, MAX_ROWS);
      const rows = [...prev.rows];
      for (let i = 0; i < rows.length; i++) {
        if (!rows[i].locked) {
          rows[i] = rollFullRow();
        }
      }
      if (newMaxRows > rows.length) {
        rows.push(rollFullRow());
      }
      return {
        ...prev,
        rarity: newRarity,
        maxRows: newMaxRows,
        rows,
        daysSpent: prev.daysSpent + 3,
        selectedRowIndex: null, // Clear selection after upgrade
        rerolls: 0, // Reset reroll cost
      };
    });
  };

  const eyeUpgrade10 = () => {
    setState((prev) => {
      if (rarityIndex(prev.rarity) >= rarityIndex("Rare")) {
        playError();
        return prev;
      }
      playSuccess();
      const newRarity = rarityUp(prev.rarity);
      const newMaxRows = Math.min(prev.maxRows + 1, MAX_ROWS);
      const rows = [...prev.rows];
      for (let i = 0; i < rows.length; i++) {
        if (!rows[i].locked) rows[i] = rollFullRow();
      }
      if (newMaxRows > rows.length) rows.push(rollFullRow());
      return {
        ...prev,
        rarity: newRarity,
        maxRows: newMaxRows,
        rows,
        eyesSpent: prev.eyesSpent + 10,
        selectedRowIndex: null, // Clear selection after upgrade
        rerolls: 0, // Reset reroll cost
      };
    });
  };

  const eyeReroll20 = (rowIndex: number) => {
    setState((prev) => {
      const rows = [...prev.rows];
      const row = rows[rowIndex];
      if (!row) return prev;
      playClick();
      const def = randomOf(SUBSTAT_POOL);
      const idx = rarityIndex(row.rarity);
      rows[rowIndex] = {
        ...row,
        statKey: def.key,
        value: def.values[idx],
      };
      return { ...prev, rows, eyesSpent: prev.eyesSpent + 20 };
    });
  };

  const eyeUnlock100 = () => {
    setState((prev) => {
      if (prev.rarity === "Legendary" || prev.maxRows >= MAX_ROWS) {
        playError();
        return prev;
      }
      playSuccess();
      const rows = [...prev.rows];
      rows.push(rollFullRow());
      return {
        ...prev,
        maxRows: prev.maxRows + 1,
        rows,
        eyesSpent: prev.eyesSpent + 100,
        selectedRowIndex: null, // Clear selection after unlock
        rerolls: 0, // Reset reroll cost
      };
    });
  };

  const newCharm = () => {
    playSuccess();
    setState(createNewCharm());
    setShowNewCharmConfirm(false);
  };

  const lockedRows = state.rows.filter((r) => r.locked).length;
  const canUpgrade = state.rarity !== "Legendary";
  const canEyeUpgrade = rarityIdx < rarityIndex("Rare");
  const canEyeUnlock = state.maxRows < MAX_ROWS && state.rarity !== "Legendary";

  const rarityColor: Record<Rarity, string> = {
    Common: "text-gray-300",
    Uncommon: "text-green-400",
    Rare: "text-mystic-blue-light",
    Epic: "text-purple-400",
    Legendary: "text-gold",
  };

  const rarityTitleColor = rarityColor[state.rarity];

  // Prevent hydration mismatch by showing loading state until client-side
  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-gold font-pixel text-lg">Loading Charm Builder...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="icon-rpg pixel-glow text-2xl">🧿</div>
          <div>
            <h1 className={`text-2xl sm:text-3xl font-pixel text-glow ${rarityTitleColor} animate-pulse`}>
              Charm Builder Simulator
            </h1>
            <div className="text-text-muted font-pixel-operator text-sm">Idle Horizon Charm Crafting</div>
          </div>
        </div>

        {/* New Charm Button */}
        <PixelButton
          variant="primary"
          size="lg"
          onClick={() => {
            playClick();
            setShowNewCharmConfirm(true);
          }}
          title="Start a new charm from scratch"
        >
          ✨ New Charm
        </PixelButton>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Charm Rows */}
        <div className="lg:col-span-2">
          <div className="bg-[#1A1A1A] border-2 border-warning rounded-pixel p-6">
            <div className="flex items-center space-x-2 mb-6">
              <span className="text-xl">⚔️</span>
              <span className="font-pixel text-gold text-glow text-lg">Charm Rows</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.rows.map((row, idx) => (
                <CharmRowCard
                  key={row.id}
                  row={row}
                  index={idx}
                  isSelected={state.selectedRowIndex === idx}
                  onSelectRow={() => selectRowForRolling(idx)}
                  onToggleLock={() => toggleLock(idx)}
                  onRollSelected={() => rollSelectedRow()}
                  onEyeReroll={() => eyeReroll20(idx)}
                  getStatDef={getStatDef}
                />
              ))}
            </div>

            {state.rows.length < state.maxRows && (
              <div className="mt-4 p-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-pixel">
                <div className="text-text-muted font-pixel-operator text-sm text-center">
                  New row slot available. Roll to fill.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Controls & Progress */}
        <div className="space-y-6">
          <ProgressPanel
            rarity={state.rarity}
            maxRows={state.maxRows}
            lockedRows={lockedRows}
            rerolls={state.rerolls}
            daysSpent={state.daysSpent}
            onUpgrade={upgradeFree}
            onEyeUpgrade={eyeUpgrade10}
            onEyeUnlock={eyeUnlock100}
            canUpgrade={canUpgrade}
            canEyeUpgrade={canEyeUpgrade}
            canEyeUnlock={canEyeUnlock}
          />
        </div>
      </div>

      {/* Bottom: Cost Tracker */}
      <div className="mt-6">
        <CostTracker
          nextRerollCost={nextPaidCost}
          totalCosts={{
            goldSpent: state.goldSpent,
            tomesSpent: state.tomesSpent,
            eyesSpent: state.eyesSpent,
            daysSpent: state.daysSpent,
          }}
        />
      </div>

      {/* Confirmation Modal */}
      <RPGConfirmModal
        isOpen={showNewCharmConfirm}
        onClose={() => setShowNewCharmConfirm(false)}
        onConfirm={newCharm}
        title="Start New Charm"
        message="Are you sure you want to start over? All progress on your current charm will be lost!"
        type="warning"
        icon="⚠️"
      />
    </div>
  );
}
