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
    cloversSpent: number | undefined;
  };
}

// Helper function to format numbers
const formatNumber = (num: number | undefined, useShort: boolean): string => {
  // Handle undefined or null values
  if (num === undefined || num === null) {
    return "0";
  }

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
  const [useShortFormat, setUseShortFormat] = useState(true);

  // Calculate days spent based on clovers spent (30 clovers = 1 day)
  const daysSpent = Math.ceil((totalCosts.cloversSpent || 0) / 30);
  return (
    <div className="bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] border-2 border-mystic-blue shadow-[4px_4px_0px_rgba(0,0,0,0.8)] p-4 transition-all duration-300 hover:border-gold">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-lg">💰</span>
          <span className="font-pixel text-gold text-glow">Costs & Resources</span>
        </div>
        <button
          onClick={() => setUseShortFormat(!useShortFormat)}
          className="px-3 py-2 bg-[#2A2A2A] border-2 border-mystic-blue text-sm font-pixel text-text-muted hover:text-gold hover:border-gold transition-all duration-300 shadow-[2px_2px_0px_rgba(0,0,0,0.6)] hover:shadow-[2px_2px_0px_rgba(0,0,0,0.8)]"
          title={useShortFormat ? "Show full numbers" : "Show short numbers"}
        >
          {useShortFormat ? "Full" : "Short"}
        </button>
      </div>

      {/* Next Reroll Cost */}
      <div className="mb-4 p-3 bg-[#2A2A2A] border border-[#3A3A3A] shadow-[2px_2px_0px_rgba(0,0,0,0.6)]">
        <div className="font-pixel-operator text-text-muted text-xs mb-2">Next Reroll Cost</div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🪙</span>
            <span className="font-pixel text-sm text-gold">
              {formatNumber(nextRerollCost.gold, useShortFormat)} gold
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">📖</span>
            <span className="font-pixel text-sm text-gold">
              {formatNumber(nextRerollCost.tomes, useShortFormat)} tomes
            </span>
          </div>
        </div>
      </div>

      {/* Total Costs Grid - 2x2 Layout */}
      <div className="grid grid-cols-2 gap-3">
        {/* Top Row */}
        <div className="flex items-center space-x-3 p-3 bg-[#2A2A2A] border border-[#3A3A3A] shadow-[2px_2px_0px_rgba(0,0,0,0.6)]">
          <span className="text-xl">🪙</span>
          <div className="flex-1">
            <div className="font-pixel-operator text-text-muted text-xs mb-1">Gold Spent</div>
            <div className="font-pixel text-sm text-gold">{formatNumber(totalCosts.goldSpent, useShortFormat)}</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-[#2A2A2A] border border-[#3A3A3A] shadow-[2px_2px_0px_rgba(0,0,0,0.6)]">
          <span className="text-xl">📖</span>
          <div className="flex-1">
            <div className="font-pixel-operator text-text-muted text-xs mb-1">Tomes Spent</div>
            <div className="font-pixel text-sm text-gold">{formatNumber(totalCosts.tomesSpent, useShortFormat)}</div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex items-center space-x-3 p-3 bg-[#2A2A2A] border border-[#3A3A3A] shadow-[2px_2px_0px_rgba(0,0,0,0.6)]">
          <span className="text-xl">👁️</span>
          <div className="flex-1">
            <div className="font-pixel-operator text-text-muted text-xs mb-1">Eyes Spent</div>
            <div className="font-pixel text-sm text-gold">{formatNumber(totalCosts.eyesSpent, useShortFormat)}</div>
          </div>
        </div>

        {/* Combined Clovers & Days Spent */}
        <div className="p-3 bg-[#2A2A2A] border border-[#3A3A3A] shadow-[2px_2px_0px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between h-full">
            {/* Clovers Spent - Left Half */}
            <div className="flex items-center space-x-2 flex-1">
              <span className="text-xl">🍀</span>
              <div>
                <div className="font-pixel-operator text-text-muted text-xs mb-1">Clovers Spent</div>
                <div className="font-pixel text-sm text-green-400">
                  {formatNumber(totalCosts.cloversSpent || 0, useShortFormat)}
                </div>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="w-px h-8 bg-[#3A3A3A] mx-2"></div>

            {/* Days Spent - Right Half */}
            <div className="flex items-center space-x-2 flex-1">
              <span className="text-xl">⏱️</span>
              <div>
                <div className="font-pixel-operator text-text-muted text-xs mb-1">Days Spent</div>
                <div className="font-pixel text-sm text-gold">{formatNumber(daysSpent, useShortFormat)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
