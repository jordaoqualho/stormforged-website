"use client";

export default function MemberRankingsSkeleton() {
  return (
    <div className="card-rpg bg-battlefield p-6 animate-pulse">
      <div className="flex items-center space-x-4 mb-6">
        <div className="icon-rpg pixel-glow text-xl">👑</div>
        <h3 className="text-xl font-pixel text-gold text-glow">Member Rankings</h3>
        <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700] to-transparent"></div>
      </div>
      <div className="panel-rpg overflow-hidden rounded-md border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mystic-blue">
                <th className="text-sm text-gray-300 font-pixel py-3 px-3 text-center">Rank</th>
                <th className="text-sm text-gray-300 font-pixel py-3 px-3 text-left">Member</th>
                <th className="text-sm text-gray-300 font-pixel py-3 px-3 text-center">Attacks</th>
                <th className="text-sm text-gray-300 font-pixel py-3 px-3 text-center">Victories</th>
                <th className="text-sm text-gray-300 font-pixel py-3 px-3 text-center">Defeats</th>
                <th className="text-sm text-gray-300 font-pixel py-3 px-3 text-center">Rate</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b border-dark-gray">
                  <td className="py-2 px-3 text-center">
                    <div className="w-8 h-8 bg-gray-600 rounded-full mx-auto"></div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="h-4 bg-gray-600 rounded w-20"></div>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="h-4 bg-gray-600 rounded w-8 mx-auto"></div>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="h-4 bg-gray-600 rounded w-8 mx-auto"></div>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="h-4 bg-gray-600 rounded w-8 mx-auto"></div>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="h-6 bg-gray-600 rounded-full w-12 mx-auto"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
