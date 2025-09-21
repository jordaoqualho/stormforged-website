"use client";

export default function AchievementSystemSkeleton() {
  return (
    <div className="card-rpg bg-battlefield p-6 animate-pulse">
      <div className="flex items-center space-x-4 mb-10">
        <div className="icon-rpg pixel-glow text-2xl">🏆</div>
        <h3 className="text-xl font-pixel text-gold text-glow">Achievements</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
        <div className="h-6 bg-gray-600 rounded w-16"></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8 justify-items-center py-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="achievement-badge w-24 h-24 animate-pulse">
            <div className="w-16 h-16 bg-gray-600 rounded-full"></div>
          </div>
        ))}
      </div>

      <div className="text-center mt-6">
        <div className="h-4 bg-gray-600 rounded w-48 mx-auto"></div>
      </div>
    </div>
  );
}
