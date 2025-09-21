"use client";

export default function DailyBattleLogSkeleton() {
  return (
    <div className="card-rpg bg-battlefield p-6 animate-pulse">
      <div className="flex items-center space-x-4 mb-6">
        <div className="icon-rpg pixel-glow text-xl">📅</div>
        <h3 className="text-xl font-pixel text-gold text-glow">Daily Battle Log</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="panel-rpg p-3 text-center w-full aspect-[3/4] animate-pulse">
            <div className="h-4 bg-gray-600 rounded mb-2"></div>
            <div className="h-3 bg-gray-700 rounded mb-3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-600 rounded"></div>
              <div className="h-4 bg-gray-500 rounded"></div>
              <div className="h-3 bg-gray-600 rounded"></div>
              <div className="h-4 bg-gray-500 rounded"></div>
              <div className="h-3 bg-gray-600 rounded"></div>
              <div className="h-4 bg-gray-500 rounded"></div>
              <div className="h-3 bg-gray-600 rounded"></div>
              <div className="h-3 bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
