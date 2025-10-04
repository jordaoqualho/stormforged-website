"use client";

import { useRPGSounds } from "@/lib/sounds";
import { useEffect, useMemo, useRef, useState } from "react";
import CharmRowCard from "./CharmRowCard";
import CostTracker from "./CostTracker";
import PixelButton from "./PixelButton";
import ProgressPanel from "./ProgressPanel";

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
    values: [0.050, 0.055, 0.070, 0.080, 0.110],
    format: fmtFloat3,
  },
  { key: "HEALTH", label: "Health", values: [2400, 2625, 3200, 3600, 4800], format: fmtInt },
  { key: "ARMOR", label: "Armor", values: [1500, 1625, 2000, 2250, 3000], format: fmtInt },
  { key: "RESIST", label: "Resist", values: [1500, 1625, 2000, 2250, 3000], format: fmtInt },
  { key: "ARMOR_PEN_PCT", label: "Armor Penetration (%)", values: [11.0, 11.75, 14.0, 15.5, 20.0], format: fmtPct1 },
  { key: "ARMOR_PEN_FLAT", label: "Armor Pen. (Flat)", values: [4000, 4500, 6000, 7000, 10000], format: fmtInt },
  { key: "RESIST_PEN_PCT", label: "Resist Penetration (%)", values: [11.0, 11.75, 14.0, 15.5, 20.0], format: fmtPct1 },
  { key: "RESIST_PEN_FLAT", label: "Resist Pen. (Flat)", values: [4000, 4500, 6000, 7000, 10000], format: fmtInt },
  { key: "CRIT_CHANCE_PCT", label: "Critical Chance (%)", values: [30, 33, 40, 45, 60], format: fmtPct },
  {
    key: "CRIT_CHANCE_FLAT",
    label: "Critical Chance (Flat)",
    values: [0.030, 0.034, 0.045, 0.050, 0.075],
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
  id: string; // Unique charm identifier
  name: string; // User-defined charm name
  rarity: Rarity;
  maxRows: number;
  rows: Row[];
  rerolls: number;
  eyesSpent: number;
  goldSpent: number;
  tomesSpent: number;
  daysSpent: number;
  selectedRowIndex: number | null; // Currently selected row for rolling
  cloversSpent: number; // Clovers spent on upgrades (simulation only)
  rollLockedUntil: number | null; // Timestamp when roll lock expires
};

type CharmSlot = {
  id: string | null;
  name: string;
  isEmpty: boolean;
};

const STORAGE_KEY = "builder-charm-storage";
const MAX_CHARMS = 5;

function randomOf<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedRarityRoll(): Rarity {
  const total = RARITIES.reduce((sum, r) => sum + RARITY_WEIGHTS[r], 0);
  const roll = Math.random() * total;
  let cumulativeWeight = 0;

  for (const r of RARITIES) {
    cumulativeWeight += RARITY_WEIGHTS[r];
    if (roll <= cumulativeWeight) return r;
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

function createNewCharm(name: string = "New Charm"): CharmState {
  const rarity: Rarity = "Common";
  const maxRows = 1;
  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    rarity,
    maxRows,
    rows: Array.from({ length: maxRows }, () => rollFullRow()),
    rerolls: 0,
    eyesSpent: 0,
    goldSpent: 0,
    tomesSpent: 0,
    daysSpent: 0,
    selectedRowIndex: null,
    cloversSpent: 0, // Start with 0 clovers spent
    rollLockedUntil: null,
  };
}

// Charm Management Functions
function loadSavedCharms(): CharmState[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveCharm(charm: CharmState): void {
  if (typeof window === "undefined") return;
  try {
    const saved = loadSavedCharms();
    const existingIndex = saved.findIndex((c) => c.id === charm.id);

    if (existingIndex >= 0) {
      saved[existingIndex] = charm;
    } else {
      saved.push(charm);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // Silently handle save errors
  }
}

function deleteCharm(charmId: string): void {
  if (typeof window === "undefined") return;
  try {
    const saved = loadSavedCharms();
    const filtered = saved.filter((c) => c.id !== charmId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // Silently handle delete errors
  }
}

function getCharmSlots(): CharmSlot[] {
  const saved = loadSavedCharms();
  const slots: CharmSlot[] = [];

  for (let i = 0; i < MAX_CHARMS; i++) {
    const charm = saved[i];
    slots.push({
      id: charm?.id || null,
      name: charm?.name || `Slot ${i + 1}`,
      isEmpty: !charm,
    });
  }

  return slots;
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
  const [showReferenceModal, setShowReferenceModal] = useState(false);
  const [showCharmDropdown, setShowCharmDropdown] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [newCharmName, setNewCharmName] = useState("");
  const [charmSlots, setCharmSlots] = useState<CharmSlot[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { playClick, playSuccess, playError, playEpic, playLegendary } = useRPGSounds();

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
    setCharmSlots(getCharmSlots());

    // Try to load the last used charm or create a new one
    try {
      const saved = loadSavedCharms();
      if (saved.length > 0) {
        // Load the first saved charm as default
        const savedState = saved[0];
        // Reset days count to 0 when loading saved state
        setState({ ...savedState, daysSpent: 0, cloversSpent: savedState.cloversSpent || 0 });
      }
    } catch {
      // Silently handle loading errors
    }
  }, []);

  // Save current charm when state changes
  useEffect(() => {
    if (isClient && state.id) {
      try {
        saveCharm(state);
        setCharmSlots(getCharmSlots());
      } catch {
        // Silently handle save errors
      }
    }
  }, [state, isClient]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCharmDropdown(false);
      }
    };

    if (showCharmDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCharmDropdown]);

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

      const rows = [...prev.rows];
      const newRow = rollFullRow();
      // Keep the row locked when rolling
      rows[prev.selectedRowIndex] = { ...newRow, locked: true };
      const { gold, tomes } = computeNextCost(prev.rerolls);

      // Play sounds based on rarity
      if (newRow.rarity === "Epic") {
        playEpic();
      } else if (newRow.rarity === "Legendary") {
        playLegendary();
      } else if (newRow.rarity === "Common" || newRow.rarity === "Uncommon") {
        // Play general click sound for Common and Uncommon only
        playClick();
      }
      // No sound for Rare rolls

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
      // Check if upgrade is allowed: less than 5 rows OR has locked rows
      const hasLockedRow = prev.rows.some((row) => row.locked);
      const canUpgrade = prev.maxRows < 5 || hasLockedRow;

      if (!canUpgrade) {
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
        cloversSpent: prev.cloversSpent + 100, // Track clovers spent
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
      // Keep the row locked when rerolling with eyes
      rows[rowIndex] = {
        ...row,
        statKey: def.key,
        value: def.values[idx],
        locked: true,
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

  const canEyeUpgrade = rarityIdx < rarityIndex("Rare");
  const canEyeUnlock = state.selectedRowIndex !== null;

  // Prevent hydration mismatch by showing loading state until client-side
  // Charm management functions
  const loadCharm = (charmId: string) => {
    const saved = loadSavedCharms();
    const charm = saved.find((c) => c.id === charmId);
    if (charm) {
      setState({ ...charm, daysSpent: 0, cloversSpent: charm.cloversSpent || 0 }); // Reset days count when loading
      playSuccess();
    } else {
      playError();
    }
  };

  const deleteCharmSlot = (charmId: string) => {
    if (state.id === charmId) {
      // If deleting current charm, create a new one
      const newCharm = createNewCharm();
      setState(newCharm);
    }
    deleteCharm(charmId);
    setCharmSlots(getCharmSlots());
    playSuccess();
  };

  const createCharmInSlot = (name: string) => {
    // Find the first empty slot
    const emptySlotIndex = charmSlots.findIndex((s) => s.isEmpty);
    if (emptySlotIndex === -1) {
      playError();
      return;
    }

    const newCharm = createNewCharm(name);
    setState(newCharm);

    // Save the charm immediately
    saveCharm(newCharm);

    // Update slots and close modal
    setCharmSlots(getCharmSlots());
    setShowNameInput(false);
    setNewCharmName("");
    playSuccess();
  };

  if (!isClient) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] border-2 border-mystic-blue shadow-[4px_4px_0px_rgba(0,0,0,0.8)] p-6 mb-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-32 bg-gray-600 rounded"></div>
            </div>
            <div className="h-8 w-32 bg-gray-600 rounded"></div>
          </div>
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Charm Rows Skeleton */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] border-2 border-mystic-blue shadow-[4px_4px_0px_rgba(0,0,0,0.8)] p-6 animate-pulse">
              <div className="flex items-center justify-between mb-6">
                <div className="h-6 w-24 bg-gray-600 rounded"></div>
                <div className="h-6 w-6 bg-gray-600 rounded"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="border-2 border-gray-600 p-4 bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] animate-pulse"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-4 w-16 bg-gray-600 rounded"></div>
                      <div className="h-4 w-20 bg-gray-600 rounded"></div>
                    </div>
                    <div className="h-6 w-32 bg-gray-600 rounded mb-3"></div>
                    <div className="h-8 w-20 bg-gray-600 rounded mx-auto"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Controls Skeleton */}
          <div className="space-y-6">
            {/* Charm Status Skeleton */}
            <div className="bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] border-2 border-mystic-blue shadow-[4px_4px_0px_rgba(0,0,0,0.8)] p-4 animate-pulse">
              <div className="h-6 w-24 bg-gray-600 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 w-20 bg-gray-600 rounded"></div>
                <div className="h-4 w-16 bg-gray-600 rounded"></div>
                <div className="h-4 w-24 bg-gray-600 rounded"></div>
              </div>
            </div>

            {/* Upgrade Options Skeleton */}
            <div className="bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] border-2 border-mystic-blue shadow-[4px_4px_0px_rgba(0,0,0,0.8)] p-4 animate-pulse">
              <div className="h-6 w-32 bg-gray-600 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="h-10 w-full bg-gray-600 rounded"></div>
                <div className="h-10 w-full bg-gray-600 rounded"></div>
                <div className="h-10 w-full bg-gray-600 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Cost Tracker Skeleton */}
        <div className="bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] border-2 border-mystic-blue shadow-[4px_4px_0px_rgba(0,0,0,0.8)] p-4 animate-pulse">
          <div className="h-6 w-32 bg-gray-600 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-16 bg-gray-600 rounded"></div>
            <div className="h-16 bg-gray-600 rounded"></div>
            <div className="h-16 bg-gray-600 rounded"></div>
            <div className="h-16 bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-rpg relative p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className={`text-2xl sm:text-3xl font-pixel transition-all duration-500`}>Charm Builder</h1>
              <div className="text-text-muted font-pixel-operator text-sm transition-colors duration-300">
                Idle Horizon Charm Crafting
              </div>
            </div>
          </div>

          {/* Charm Management Dropdown */}
          <div ref={dropdownRef} className="relative">
            <PixelButton
              variant="primary"
              size="lg"
              onClick={() => {
                playClick();
                setShowCharmDropdown(!showCharmDropdown);
              }}
              title="Manage your charms"
            >
              Charm Slots ({charmSlots.filter((s) => !s.isEmpty).length}/5)
            </PixelButton>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Charm Rows */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] border-2 border-mystic-blue shadow-[4px_4px_0px_rgba(0,0,0,0.8)] p-6 transition-all duration-300 hover:border-gold">
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
                  hasLockedRow={state.rows.some((r) => r.locked)}
                  onSelectRow={() => selectRowForRolling(idx)}
                  onRollSelected={() => rollSelectedRow()}
                  getStatDef={(key: string) => getStatDef(key as any)}
                />
              ))}
            </div>

            {state.rows.length < state.maxRows && (
              <div className="mt-4 p-3 bg-[#2A2A2A] border border-[#3A3A3A]">
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
            onEyeReroll={() => eyeReroll20(state.selectedRowIndex!)}
            canCloverUpgrade={state.maxRows < 5 || state.rows.some((row) => row.locked)}
            canEyeUpgrade={canEyeUpgrade}
            canEyeUnlock={canEyeUnlock}
            canEyeReroll={state.selectedRowIndex !== null}
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
            cloversSpent: state.cloversSpent,
          }}
        />
      </div>

      {/* Reference Information Modal */}
      {showReferenceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] border-2 border-gold max-w-2xl w-full max-h-[80vh] overflow-hidden">
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
                <div className="bg-[#2A2A2A] border border-[#3A3A3A] p-4">
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
                    <li className="flex items-start space-x-3">
                      <span className="text-text-muted mt-0.5">•</span>
                      <span>
                        <strong className="text-yellow-400">Reroll Cost:</strong> Each reroll increases cost by 10%
                        (base: 10K gold, 1K tomes)
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Upgrade Options */}
                <div className="bg-[#2A2A2A] border border-[#3A3A3A] p-4">
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
                <div className="bg-[#2A2A2A] border border-[#3A3A3A] p-4">
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
                <div className="bg-[#2A2A2A] border border-[#3A3A3A] p-4">
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

      {/* Name Input Modal */}
      {showNameInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] border-2 border-gold max-w-md w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0D0D0D] to-[#1A1A1A] border-b-2 border-gold p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-gold font-pixel text-lg">✨ Create New Charm</h2>
                <button
                  onClick={() => {
                    setShowNameInput(false);
                    setNewCharmName("");
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ❌
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="text-white font-pixel text-sm">Enter a name for your new charm:</div>

              <input
                type="text"
                value={newCharmName}
                onChange={(e) => setNewCharmName(e.target.value)}
                placeholder="Enter charm name..."
                className="w-full px-3 py-2 bg-[#2A2A2A] border border-gray-600 rounded text-white font-pixel text-sm focus:border-gold focus:outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newCharmName.trim()) {
                    createCharmInSlot(newCharmName.trim());
                  }
                }}
              />

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => {
                    setShowNameInput(false);
                    setNewCharmName("");
                  }}
                  className="px-4 py-2 bg-gray-600 border border-gray-500 rounded text-white font-pixel text-sm hover:bg-gray-500 transition-colors"
                >
                  ❌ Cancel
                </button>
                <button
                  onClick={() => {
                    if (newCharmName.trim()) {
                      createCharmInSlot(newCharmName.trim());
                    }
                  }}
                  disabled={!newCharmName.trim()}
                  className="px-4 py-2 bg-green-600 border border-green-500 rounded text-white font-pixel text-sm hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✨ Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charm Slots Management Modal */}
      {showCharmDropdown && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            ref={dropdownRef}
            className="bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] border-2 border-gold shadow-[4px_4px_0px_rgba(0,0,0,0.8)] max-w-lg w-full max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0D0D0D] to-[#1A1A1A] border-b-2 border-gold p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🎲</span>
                  <h2 className="text-gold font-pixel text-lg text-glow">Charm Management</h2>
                </div>
                <button
                  onClick={() => {
                    playClick();
                    setShowCharmDropdown(false);
                  }}
                  className="text-gray-400 hover:text-white transition-colors text-xl"
                  title="Close modal"
                >
                  ❌
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
              {/* Current Charm Info */}
              <div className="bg-[#1A1A1A] border border-gold p-3">
                <div className="text-center">
                  <div className="text-gold font-pixel text-sm mb-1">Current Charm</div>
                  <div className="text-white font-pixel text-base">{state.name}</div>
                  <div className="text-gray-400 font-pixel-operator text-xs mt-1">
                    {charmSlots.filter((s) => !s.isEmpty).length}/5 slots used
                  </div>
                </div>
              </div>

              {/* Charm Slots */}
              <div className="space-y-3">
                <div className="text-gold font-pixel text-sm text-center mb-2">Charm Slots</div>

                {charmSlots.map((slot, index) => (
                  <div key={index} className="bg-[#1A1A1A] border border-[#3A3A3A] p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">⚔️</span>
                          <div>
                            <div className="text-white font-pixel text-sm">
                              {slot.isEmpty ? `Slot ${index + 1}` : slot.name}
                            </div>
                            {slot.isEmpty ? (
                              <div className="text-gray-500 font-pixel-operator text-xs">Empty</div>
                            ) : (
                              <div className="text-gray-400 font-pixel-operator text-xs">
                                ID: {slot.id?.substring(0, 8)}...
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {slot.isEmpty ? (
                          <button
                            onClick={() => {
                              playClick();
                              setShowNameInput(true);
                              setShowCharmDropdown(false);
                            }}
                            className="px-3 py-1 bg-green-600 border border-green-500 text-xs text-white font-pixel hover:bg-green-500 transition-colors shadow-[2px_2px_0px_rgba(0,0,0,0.6)]"
                            title="Create new charm in this slot"
                          >
                            ✨ New
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                playClick();
                                loadCharm(slot.id!);
                                setShowCharmDropdown(false);
                              }}
                              className="px-3 py-1 bg-blue-600 border border-blue-500 text-xs text-white font-pixel hover:bg-blue-500 transition-colors shadow-[2px_2px_0px_rgba(0,0,0,0.6)]"
                              title="Load this charm"
                            >
                              📂 Load
                            </button>
                            <button
                              onClick={() => {
                                playClick();
                                deleteCharmSlot(slot.id!);
                                setShowCharmDropdown(false);
                              }}
                              className="px-3 py-1 bg-red-600 border border-red-500 text-xs text-white font-pixel hover:bg-red-500 transition-colors shadow-[2px_2px_0px_rgba(0,0,0,0.6)]"
                              title="Delete this charm"
                            >
                              🗑️ Del
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Info */}
              <div className="text-center text-gray-500 font-pixel-operator text-xs pt-2 border-t border-[#3A3A3A]">
                Click outside or press ❌ to close
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
