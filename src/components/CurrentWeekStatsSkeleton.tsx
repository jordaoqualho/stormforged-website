"use client";

export default function CurrentWeekStatsSkeleton() {
  return (
    <div className="card-rpg bg-battlefield p-4 sm:p-6 animate-pulse">
      <div className="flex items-center space-x-4 mb-6">
        <div className="icon-rpg pixel-glow text-xl">📊</div>
        <h3 className="text-xl font-pixel text-gold text-glow">Weekly Performance</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="stat-rpg min-h-[90px] py-2 px-3">
            <div className="h-4 bg-gray-600 rounded mb-2"></div>
            <div className="h-8 bg-gray-500 rounded"></div>
          </div>
        ))}
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="stat-rpg min-h-[90px] py-2 px-3">
            <div className="h-4 bg-gray-600 rounded mb-2"></div>
            <div className="h-8 bg-gray-500 rounded"></div>
          </div>
        ))}
      </div>

      {/* Win Rate Display */}
      <div className="stat-rpg min-h-[90px] py-2 px-3 my-4">
        <div className="h-4 bg-gray-600 rounded mb-2"></div>
        <div className="h-8 bg-gray-500 rounded"></div>
      </div>

      {/* Weekly Performance Bar */}
      <div className="mt-6">
        <div className="h-4 bg-gray-600 rounded mb-2"></div>
        <div className="progress-rpg h-4">
          <div className="progress-rpg-fill w-0"></div>
        </div>
      </div>
    </div>
  );
}
