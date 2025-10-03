"use client";

import { useState } from "react";

interface CostTrackerProps {
  nextRerollCost: {
    gold: number;
    tomes: number;
  };
  totalCosts: {
    goldSpent: number;
    tomesSpent: number;
    eyesSpent: number;
    daysSpent: number;
    clovers: number;
  };
}

// Helper function to format numbers
const formatNumber = (num: number, useShort: boolean): string => {
  if (!useShort) {
    return num.toLocaleString();
  }

  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

export default function CostTracker({ nextRerollCost, totalCosts }: CostTrackerProps) {
  const [useShortFormat, setUseShortFormat] = useState(false);
  return (
    <div className="bg-[#1A1A1A] border-2 border-[#3A3A3A] rounded-pixel p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-lg">💰</span>
          <span className="font-pixel text-gold text-glow">Costs & Resources</span>
        </div>
        <button
          onClick={() => setUseShortFormat(!useShortFormat)}
          className="px-2 py-1 bg-[#2A2A2A] border border-[#3A3A3A] rounded-pixel text-xs font-pixel text-text-primary hover:text-gold hover:border-gold transition-colors duration-200"
          title={useShortFormat ? "Show full numbers" : "Show short numbers"}
        >
          {useShortFormat ? "Full" : "Short"}
        </button>
      </div>

      {/* Next Reroll Cost */}
      <div className="mb-4 p-3 bg-[#2A2A2A] rounded-pixel border border-[#3A3A3A]">
        <div className="font-pixel-operator text-text-muted text-xs mb-2">Next Reroll Cost</div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🪙</span>
            <span className="font-pixel text-sm text-gold cursor-help" title={nextRerollCost.gold.toLocaleString()}>
              {formatNumber(nextRerollCost.gold, useShortFormat)} gold
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">📖</span>
            <span className="font-pixel text-sm text-gold cursor-help" title={nextRerollCost.tomes.toLocaleString()}>
              {formatNumber(nextRerollCost.tomes, useShortFormat)} tomes
            </span>
          </div>
        </div>
      </div>

      {/* Total Costs Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center space-x-2 p-2 bg-[#2A2A2A] rounded-pixel border border-[#3A3A3A]">
          <span className="text-lg">🪙</span>
          <div>
            <div className="font-pixel-operator text-text-muted text-xs">Gold Spent</div>
            <div className="font-pixel text-sm text-gold cursor-help" title={totalCosts.goldSpent.toLocaleString()}>
              {formatNumber(totalCosts.goldSpent, useShortFormat)}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 p-2 bg-[#2A2A2A] rounded-pixel border border-[#3A3A3A]">
          <span className="text-lg">📖</span>
          <div>
            <div className="font-pixel-operator text-text-muted text-xs">Tomes Spent</div>
            <div className="font-pixel text-sm text-gold cursor-help" title={totalCosts.tomesSpent.toLocaleString()}>
              {formatNumber(totalCosts.tomesSpent, useShortFormat)}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 p-2 bg-[#2A2A2A] rounded-pixel border border-[#3A3A3A]">
          <span className="text-lg">👁️</span>
          <div>
            <div className="font-pixel-operator text-text-muted text-xs">Eyes Spent</div>
            <div className="font-pixel text-sm text-gold cursor-help" title={totalCosts.eyesSpent.toLocaleString()}>
              {formatNumber(totalCosts.eyesSpent, useShortFormat)}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 p-2 bg-[#2A2A2A] rounded-pixel border border-[#3A3A3A]">
          <span className="text-lg">🍀</span>
          <div>
            <div className="font-pixel-operator text-text-muted text-xs">Clovers</div>
            <div className="font-pixel text-sm text-green-400 cursor-help" title={totalCosts.clovers.toLocaleString()}>
              {formatNumber(totalCosts.clovers, useShortFormat)}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 p-2 bg-[#2A2A2A] rounded-pixel border border-[#3A3A3A]">
          <span className="text-lg">⏱️</span>
          <div>
            <div className="font-pixel-operator text-text-muted text-xs">Days Spent</div>
            <div className="font-pixel text-sm text-gold cursor-help" title={totalCosts.daysSpent.toLocaleString()}>
              {formatNumber(totalCosts.daysSpent, useShortFormat)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
