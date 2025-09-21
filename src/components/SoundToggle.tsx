"use client";

import { useRPGSounds } from "@/lib/sounds";
import { useEffect, useState } from "react";

export default function SoundToggle() {
  const { isEnabled, toggleSound } = useRPGSounds();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    toggleSound();
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative w-12 h-12 rounded-full border-2 transition-all duration-300
        ${isEnabled ? "bg-gold border-[#B8860B] shadow-glow-gold" : "bg-[#3A3A3A] border-[#3A3A3A]"}
        ${isHovered ? "scale-110" : "scale-100"}
        flex items-center justify-center
      `}
      title={isEnabled ? "Disable Sound Effects" : "Enable Sound Effects"}
    >
      <span className="text-xl">{isEnabled ? "🔊" : "🔇"}</span>

      {isEnabled && <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse" />}

      {/* Sound waves animation when enabled */}
      {isEnabled && (
        <div className="absolute inset-0 rounded-full">
          <div className="absolute inset-0 border-2 border-gold rounded-full animate-ping opacity-20" />
          <div
            className="absolute inset-0 border border-gold rounded-full animate-ping opacity-10"
            style={{ animationDelay: "0.5s" }}
          />
        </div>
      )}
    </button>
  );
}
