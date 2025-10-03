"use client";

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
  };
}

export default function CostTracker({ nextRerollCost, totalCosts }: CostTrackerProps) {
  return (
    <div className="bg-[#1A1A1A] border-2 border-[#3A3A3A] rounded-pixel p-4">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-lg">💰</span>
        <span className="font-pixel text-gold text-glow">Costs & Resources</span>
      </div>

      {/* Next Reroll Cost */}
      <div className="mb-4 p-3 bg-[#2A2A2A] rounded-pixel border border-[#3A3A3A]">
        <div className="font-pixel-operator text-text-muted text-xs mb-2">Next Reroll Cost</div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🪙</span>
            <span className="font-pixel text-sm text-gold">{nextRerollCost.gold.toLocaleString()} gold</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">📖</span>
            <span className="font-pixel text-sm text-gold">{nextRerollCost.tomes.toLocaleString()} tomes</span>
          </div>
        </div>
      </div>

      {/* Total Costs Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center space-x-2 p-2 bg-[#2A2A2A] rounded-pixel border border-[#3A3A3A]">
          <span className="text-lg">🪙</span>
          <div>
            <div className="font-pixel-operator text-text-muted text-xs">Gold Spent</div>
            <div className="font-pixel text-sm text-gold">{totalCosts.goldSpent.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex items-center space-x-2 p-2 bg-[#2A2A2A] rounded-pixel border border-[#3A3A3A]">
          <span className="text-lg">📖</span>
          <div>
            <div className="font-pixel-operator text-text-muted text-xs">Tomes Spent</div>
            <div className="font-pixel text-sm text-gold">{totalCosts.tomesSpent.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex items-center space-x-2 p-2 bg-[#2A2A2A] rounded-pixel border border-[#3A3A3A]">
          <span className="text-lg">👁️</span>
          <div>
            <div className="font-pixel-operator text-text-muted text-xs">Eyes Spent</div>
            <div className="font-pixel text-sm text-gold">{totalCosts.eyesSpent.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex items-center space-x-2 p-2 bg-[#2A2A2A] rounded-pixel border border-[#3A3A3A]">
          <span className="text-lg">⏱️</span>
          <div>
            <div className="font-pixel-operator text-text-muted text-xs">Days Spent</div>
            <div className="font-pixel text-sm text-gold">{totalCosts.daysSpent.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
