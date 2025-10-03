"use client";

import SoundToggle from "./SoundToggle";

export default function SiteHeader() {
  const weekDisplayText = "Week 40 Legend"; // You can make this dynamic if needed

  return (
    <header className="bg-gradient-to-r from-[#0D0D0D] via-[#1A1A1A] to-[#0D0D0D] border-b-2 border-gold">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="icon-rpg text-2xl sm:text-4xl pixel-glow">🏰</div>
            <div>
              <h1 className="text-lg sm:text-2xl font-pixel text-gold text-glow">Stormforged</h1>
              <p className="text-xs sm:text-sm text-text-secondary font-pixel-operator hidden sm:block">
              Idle Horizon Guild Manager and Tools
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm text-gold font-pixel">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="text-xs text-text-muted font-pixel-operator">{weekDisplayText}</div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <SoundToggle />
            </div>
          </div>
        </div>
        {/* Mobile Date Display */}
        <div className="sm:hidden pb-3">
          <div className="text-sm text-gold font-pixel text-center">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="text-xs text-text-muted font-pixel-operator text-center">{weekDisplayText}</div>
        </div>
      </div>
    </header>
  );
}
