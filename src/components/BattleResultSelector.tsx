"use client";

import { useRPGSounds } from "@/lib/sounds";
import { useEffect, useState } from "react";

export type BattleResult = "victory" | "draw" | "loss";

interface BattleResultSelectorProps {
  onResultsChange: (results: BattleResult[]) => void;
  initialResults?: BattleResult[];
  className?: string;
}

const BATTLE_ICONS = {
  victory: "⚔️", // Sword up - victory
  draw: "🤝", // Handshake - draw
  loss: "💀", // Skull - loss
} as const;

const BATTLE_COLORS = {
  victory: "text-success border-success bg-success/20",
  draw: "text-warning border-warning bg-warning/20",
  loss: "text-danger border-danger bg-danger/20",
} as const;

const BATTLE_STATES: BattleResult[] = ["victory", "draw", "loss"];

export default function BattleResultSelector({
  onResultsChange,
  initialResults = Array(5).fill("victory" as BattleResult),
  className = "",
}: BattleResultSelectorProps) {
  const [results, setResults] = useState<BattleResult[]>(initialResults);
  const { playClick, playSword } = useRPGSounds();

  // Notify parent component when results change
  useEffect(() => {
    onResultsChange(results);
  }, [results, onResultsChange]);

  const cycleState = (index: number) => {
    playClick();

    setResults((prev) => {
      const updated = [...prev];
      const currentState = updated[index];
      const currentIndex = BATTLE_STATES.indexOf(currentState);
      const nextIndex = (currentIndex + 1) % BATTLE_STATES.length;
      updated[index] = BATTLE_STATES[nextIndex];

      // Play different sound effects based on result
      if (updated[index] === "victory") {
        playSword();
      }

      return updated;
    });
  };

  const resetAll = () => {
    playClick();
    setResults(Array(5).fill("victory"));
  };

  const getResultStats = () => {
    const victories = results.filter((r) => r === "victory").length;
    const draws = results.filter((r) => r === "draw").length;
    const losses = results.filter((r) => r === "loss").length;

    return { victories, draws, losses };
  };

  const stats = getResultStats();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Battle Icons Grid */}
      <div className="bg-[#2A2A2A] border-2 border-mystic-blue rounded-pixel p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-pixel text-gold text-lg">⚔️ Battle Results</h3>
          <button
            type="button"
            onClick={resetAll}
            className="btn-rpg text-sm px-3 py-1 hover:scale-105"
            title="Reset all to victories"
          >
            Reset
          </button>
        </div>

        {/* Icon Grid */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {results.map((result, index) => (
            <button
              key={index}
              type="button"
              onClick={() => cycleState(index)}
              className={`
                relative w-16 h-16 border-2 rounded-pixel
                flex items-center justify-center text-2xl font-pixel
                transition-all duration-300 cursor-pointer
                hover:scale-110 hover:shadow-lg
                ${BATTLE_COLORS[result]}
                ${result === "victory" ? "hover:shadow-[0_0_15px_rgba(34,197,94,0.6)]" : ""}
                ${result === "draw" ? "hover:shadow-[0_0_15px_rgba(245,158,11,0.6)]" : ""}
                ${result === "loss" ? "hover:shadow-[0_0_15px_rgba(239,68,68,0.6)]" : ""}
              `}
              title={`Attack ${index + 1}: Click to cycle ${result} → ${
                BATTLE_STATES[(BATTLE_STATES.indexOf(result) + 1) % BATTLE_STATES.length]
              }`}
            >
              {BATTLE_ICONS[result]}

              {/* Attack number indicator */}
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#2A2A2A] border border-mystic-blue rounded-full flex items-center justify-center">
                <span className="text-xs font-pixel text-text-secondary">{index + 1}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center space-x-6 text-sm font-pixel-operator mt-2">
          <div className="flex items-center space-x-2">
            <span className="text-success">⚔️</span>
            <span className="text-text-secondary">Victory (5 pts)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-warning">🤝</span>
            <span className="text-text-secondary">Draw (3 pts)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-danger">💀</span>
            <span className="text-text-secondary">Loss (2 pts)</span>
          </div>
        </div>
      </div>

      {/* Battle Summary */}
      <div className="bg-[#1A1A1A] border border-mystic-blue rounded-pixel p-3">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="stat-rpg">
            <div className="text-lg font-pixel text-success">⚔️</div>
            <div className="text-xl font-pixel text-success">{stats.victories}</div>
            <div className="text-xs text-text-muted font-pixel-operator">Victories</div>
          </div>

          <div className="stat-rpg">
            <div className="text-lg font-pixel text-warning">🤝</div>
            <div className="text-xl font-pixel text-warning">{stats.draws}</div>
            <div className="text-xs text-text-muted font-pixel-operator">Draws</div>
          </div>

          <div className="stat-rpg">
            <div className="text-lg font-pixel text-danger">💀</div>
            <div className="text-xl font-pixel text-danger">{stats.losses}</div>
            <div className="text-xs text-text-muted font-pixel-operator">Losses</div>
          </div>

          <div className="stat-rpg">
            <div className="text-lg font-pixel text-gold">⭐</div>
            <div className="text-xl font-pixel text-gold">
              {stats.victories * 5 + stats.draws * 3 + stats.losses * 2}
            </div>
            <div className="text-xs text-text-muted font-pixel-operator">Points</div>
          </div>
        </div>
      </div>
    </div>
  );
}
