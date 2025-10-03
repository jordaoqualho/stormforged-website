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

// Rarity points for progress calculation
const RARITY_POINTS: Record<Rarity, number> = {
  Common: 1,
  Uncommon: 2,
  Rare: 3,
  Epic: 4,
  Legendary: 5,
};
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
const fmtPct = (v: number) => `+${v.toFixed(0)}%`;
const fmtPct1 = (v: number) => `+${v.toFixed(1)}%`;
const fmtPct1Neg = (v: number) => `${v.toFixed(1)}%`;

// Substat pool transcribed from the provided image
const SUBSTAT_POOL: StatDefinition[] = [
  { key: "ATTACK", label: "Attack", values: [450, 487, 600, 675, 900], format: fmtInt },
  { key: "ATTACK_SPEED_PCT", label: "Attack Speed (%)", values: [15, 18, 22, 26, 38], format: fmtPct },
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
  { key: "CRIT_DAMAGE", label: "Critical Damage (%)", values: [30, 34, 45, 53, 75], format: fmtPct },
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
  clovers: number; // Clover currency for upgrades
  rollLockedUntil: number | null; // Timestamp when roll lock expires
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
    clovers: 100, // Start with 100 clovers
    rollLockedUntil: null,
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
  const [showReferenceModal, setShowReferenceModal] = useState(false);

  const { playClick, playSuccess, playError } = useRPGSounds();

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

  // Calculate charm progress based on row rarities
  const charmProgress = useMemo(() => {
    const totalPoints = state.rows.reduce((sum, row) => sum + RARITY_POINTS[row.rarity], 0);
    const maxPossiblePoints = MAX_ROWS * RARITY_POINTS.Legendary; // 5 * 5 = 25 points
    const percentage = Math.round((totalPoints / maxPossiblePoints) * 100);

    return {
      totalPoints,
      maxPossiblePoints,
      percentage,
      isComplete:
        state.rarity === "Legendary" &&
        state.rows.length === MAX_ROWS &&
        state.rows.every((row) => row.rarity === "Legendary"),
    };
  }, [state.rows, state.rarity]);

  // Real-time countdown state
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every second when locked
  useEffect(() => {
    if (!state.rollLockedUntil) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 100); // Update every 100ms for smooth countdown

    return () => clearInterval(interval);
  }, [state.rollLockedUntil]);

  // Check if rolling is currently locked
  const isRollLocked = useMemo(() => {
    if (!state.rollLockedUntil) return false;
    return currentTime < state.rollLockedUntil;
  }, [state.rollLockedUntil, currentTime]);

  // Calculate remaining lock time
  const rollLockTimeRemaining = useMemo(() => {
    if (!state.rollLockedUntil || !isRollLocked) return null;
    const remaining = Math.ceil((state.rollLockedUntil - currentTime) / 1000);
    return Math.max(0, remaining);
  }, [state.rollLockedUntil, isRollLocked, currentTime]);

  const selectRowForRolling = (rowIndex: number) => {
    setState((prev) => {
      const rows = [...prev.rows];
      const existing = rows[rowIndex];

      // Check if any row is already locked (prevent selecting others)
      const hasLockedRow = rows.some((row) => row.locked);
      if (hasLockedRow && !existing?.locked) {
        playError();
        return prev;
      }

      if (existing?.locked) {
        playError();
        return prev;
      }

      playClick();
      // Select this row for rolling (this automatically locks it)
      rows[rowIndex] = { ...existing, locked: true };
      return {
        ...prev,
        selectedRowIndex: rowIndex,
        rows,
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

      // Check if rolling is locked
      if (isRollLocked) {
        playError();
        return prev;
      }

      playClick();
      const rows = [...prev.rows];
      const newRow = rollFullRow();
      rows[prev.selectedRowIndex] = { ...newRow };
      const { gold, tomes } = computeNextCost(prev.rerolls);

      // Check if the rolled stat is Epic or Legendary to apply lock
      const shouldLock = newRow.rarity === "Epic" || newRow.rarity === "Legendary";
      const lockUntil = shouldLock ? Date.now() + 3000 : null; // 3 seconds lock

      return {
        ...prev,
        rows,
        rerolls: prev.rerolls + 1,
        goldSpent: prev.goldSpent + gold,
        tomesSpent: prev.tomesSpent + tomes,
        rollLockedUntil: lockUntil,
      };
    });
  };

  const upgradeWithClovers = () => {
    setState((prev) => {
      if (prev.rarity === "Legendary" && prev.maxRows === MAX_ROWS) {
        playError();
        return prev;
      }
      if (prev.clovers < 100) {
        playError();
        return prev;
      }
      playSuccess();
      const newRarity = rarityUp(prev.rarity);
      const newMaxRows = Math.min(prev.maxRows + 1, MAX_ROWS);
      const rows = [...prev.rows];
      // Unlock all existing rows (keep their current stats)
      for (let i = 0; i < rows.length; i++) {
        rows[i] = { ...rows[i], locked: false };
      }
      // If we've unlocked all 5 rows, the charm becomes Legendary
      const finalRarity = newMaxRows === MAX_ROWS ? "Legendary" : newRarity;

      // Add new row if upgrading gives us more slots
      if (newMaxRows > rows.length) {
        rows.push(rollFullRow());
      }

      return {
        ...prev,
        rarity: finalRarity,
        maxRows: newMaxRows,
        rows,
        clovers: prev.clovers - 100, // Spend 100 clovers
        selectedRowIndex: null, // Clear selection after upgrade
        rerolls: 0, // Reset reroll cost
        rollLockedUntil: null, // Clear roll lock after upgrade
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
      // Unlock all existing rows (keep their current stats)
      for (let i = 0; i < rows.length; i++) {
        rows[i] = { ...rows[i], locked: false };
      }
      // Add new row if upgrading gives us more slots
      if (newMaxRows > rows.length) rows.push(rollFullRow());
      return {
        ...prev,
        rarity: newRarity,
        maxRows: newMaxRows,
        rows,
        eyesSpent: prev.eyesSpent + 10,
        selectedRowIndex: null, // Clear selection after upgrade
        rerolls: 0, // Reset reroll cost
        rollLockedUntil: null, // Clear roll lock after upgrade
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
      // Check if there's a selected/locked row to unlock
      if (prev.selectedRowIndex === null) {
        playError();
        return prev;
      }

      playSuccess();
      const rows = [...prev.rows];

      // Only unlock the currently selected/locked row
      if (prev.selectedRowIndex < rows.length) {
        rows[prev.selectedRowIndex] = { ...rows[prev.selectedRowIndex], locked: false };
      }

      return {
        ...prev,
        rows,
        eyesSpent: prev.eyesSpent + 100,
        selectedRowIndex: null, // Clear selection after unlock
        rerolls: 0, // Reset reroll cost
        rollLockedUntil: null, // Clear roll lock after unlock
      };
    });
  };

  const newCharm = () => {
    playSuccess();
    setState(createNewCharm());
    setShowNewCharmConfirm(false);
  };

  const canEyeUpgrade = rarityIdx < rarityIndex("Rare");
  const canEyeUnlock = state.selectedRowIndex !== null;

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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-xl">⚔️</span>
                <span className="font-pixel text-gold text-glow text-lg">Charm Rows</span>
              </div>
              <button
                onClick={() => setShowReferenceModal(true)}
                className="text-mystic-blue hover:text-mystic-blue-light transition-colors duration-200"
                title="Charm Builder Information"
              >
                <span className="text-2xl">ℹ️</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.rows.map((row, idx) => (
                <CharmRowCard
                  key={row.id}
                  row={row}
                  index={idx}
                  isSelected={state.selectedRowIndex === idx}
                  isRollLocked={isRollLocked}
                  rollLockTimeRemaining={rollLockTimeRemaining}
                  onSelectRow={() => selectRowForRolling(idx)}
                  onRollSelected={() => rollSelectedRow()}
                  onEyeReroll={() => eyeReroll20(idx)}
                  getStatDef={(key: string) => getStatDef(key as any)}
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
            charmProgress={charmProgress}
            onCloverUpgrade={upgradeWithClovers}
            onEyeUpgrade={eyeUpgrade10}
            onEyeUnlock={eyeUnlock100}
            canCloverUpgrade={(state.rarity !== "Legendary" || state.maxRows < MAX_ROWS) && state.clovers >= 100}
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
            clovers: state.clovers,
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

      {/* Reference Information Modal */}
      {showReferenceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] border-2 border-gold rounded-pixel max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0D0D0D] to-[#1A1A1A] border-b-2 border-gold p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📘</span>
                  <h2 className="font-pixel text-gold text-glow text-xl">Charm Builder Guide</h2>
                </div>
                <button
                  onClick={() => setShowReferenceModal(false)}
                  className="text-text-muted hover:text-gold transition-colors duration-200"
                  title="Close Guide"
                >
                  <span className="text-xl">❌</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-6">
                {/* Rolling Mechanics */}
                <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-pixel p-4">
                  <h3 className="font-pixel text-gold mb-3 flex items-center space-x-2">
                    <span className="text-lg">🎲</span>
                    <span>Rolling Mechanics</span>
                  </h3>
                  <ul className="space-y-2 font-pixel-operator text-sm text-text-primary leading-relaxed">
                    <li className="flex items-start space-x-3">
                      <span className="text-text-muted mt-0.5">•</span>
                      <span>
                        <strong className="text-cyan-400">Rarity Odds:</strong> Common 50%, Uncommon 30%, Rare 15%, Epic
                        4%, <strong className="text-yellow-400">Legendary 1%</strong>
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-text-muted mt-0.5">•</span>
                      <span>
                        <strong className="text-blue-400">Selection Lock:</strong> Select a row to lock it for rolling
                        (prevents selecting others)
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-text-muted mt-0.5">•</span>
                      <span>
                        <strong className="text-purple-400">Epic/Legendary Lock:</strong> 3-second cooldown after
                        rolling Epic or Legendary stats
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Upgrade Options */}
                <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-pixel p-4">
                  <h3 className="font-pixel text-gold mb-3 flex items-center space-x-2">
                    <span className="text-lg">🔼</span>
                    <span>Upgrade Options</span>
                  </h3>
                  <ul className="space-y-2 font-pixel-operator text-sm text-text-primary leading-relaxed">
                    <li className="flex items-start space-x-3">
                      <span className="text-lg mt-0.5">🍀</span>
                      <span>
                        <strong className="text-green-400">Clover Upgrade:</strong> 100 clovers for instant upgrade (30
                        clovers/day gained)
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-lg mt-0.5">👁️</span>
                      <span>
                        <strong className="text-blue-400">Eye Upgrade:</strong> 10 eyes to upgrade rarity (max Rare)
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-lg mt-0.5">👁️</span>
                      <span>
                        <strong className="text-blue-400">Eye Unlock:</strong> 100 eyes to unlock currently locked row
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Special Rules */}
                <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-pixel p-4">
                  <h3 className="font-pixel text-gold mb-3 flex items-center space-x-2">
                    <span className="text-lg">📜</span>
                    <span>Special Rules</span>
                  </h3>
                  <ul className="space-y-2 font-pixel-operator text-sm text-text-primary leading-relaxed">
                    <li className="flex items-start space-x-3">
                      <span className="text-text-muted mt-0.5">•</span>
                      <span>
                        <strong className="text-cyan-400">Stat Preservation:</strong> Upgrading preserves all existing
                        row stats
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-text-muted mt-0.5">•</span>
                      <span>
                        <strong className="text-yellow-400">Auto-Legendary:</strong> Unlocking all 5 rows makes charm{" "}
                        <strong className="text-yellow-400">Legendary</strong>
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-text-muted mt-0.5">•</span>
                      <span>
                        <strong className="text-yellow-400">Complete Charm:</strong>{" "}
                        <strong className="text-yellow-400">Legendary</strong> rarity + all 5{" "}
                        <strong className="text-yellow-400">Legendary</strong> rows (25 points)
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-lg mt-0.5">👁️</span>
                      <span>
                        <strong className="text-blue-400">Eye Reroll:</strong> 20 eyes to reroll specific row (preserves
                        rarity)
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Progress Tracking */}
                <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-pixel p-4">
                  <h3 className="font-pixel text-gold mb-3 flex items-center space-x-2">
                    <span className="text-lg">📊</span>
                    <span>Progress Tracking</span>
                  </h3>
                  <ul className="space-y-2 font-pixel-operator text-sm text-text-primary leading-relaxed">
                    <li className="flex items-start space-x-3">
                      <span className="text-text-muted mt-0.5">•</span>
                      <span>
                        <strong className="text-blue-400">Unlocked Rows:</strong> Shows how many row slots are available
                        (max 5)
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-text-muted mt-0.5">•</span>
                      <span>
                        <strong className="text-yellow-400">Charm Rarity Progress:</strong> Points based on row rarities
                        (Common=1, Uncommon=2, Rare=3, Epic=4, Legendary=5)
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="text-text-muted mt-0.5">•</span>
                      <span>
                        <strong className="text-yellow-400">Maximum Points:</strong> 25 points (5{" "}
                        <strong className="text-yellow-400">Legendary</strong> rows)
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#2A2A2A] border-t border-[#3A3A3A] p-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowReferenceModal(false)}
                  className="btn-rpg px-6 py-2 flex items-center space-x-2 hover:scale-105 transition-transform duration-200"
                >
                  <span>✅</span>
                  <span>Got it!</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
