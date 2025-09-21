"use client";

import { useRPGBackgroundMusic } from "@/lib/music";
import { useRPGSounds } from "@/lib/sounds";
import { useState } from "react";

export default function MusicPlayer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    isPlaying,
    currentTrack,
    volume,
    isEnabled,
    audioContextResumed,
    tracks,
    toggleMusic,
    changeTrack,
    updateVolume,
    toggleEnabled,
    resumeAudioContext,
  } = useRPGBackgroundMusic();

  const { playClick } = useRPGSounds();

  const handleToggle = async () => {
    setIsLoading(true);
    await toggleMusic();
    playClick();
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleTrackChange = async (trackId: string) => {
    setIsLoading(true);
    await changeTrack(trackId);
    playClick();
    setTimeout(() => setIsLoading(false), 800);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateVolume(parseFloat(e.target.value));
  };

  const handleEnabledToggle = () => {
    toggleEnabled();
    playClick();
  };

  const handleExpandToggle = async () => {
    if (!audioContextResumed) {
      await resumeAudioContext();
    }
    setIsExpanded(!isExpanded);
    playClick();
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 pointer-events-none" style={{ position: 'fixed' }}>
      {/* Audio Context Status Indicator */}
      {!audioContextResumed && (
        <div className="mb-2 p-2 bg-yellow-600/20 border border-yellow-600 rounded-md text-xs text-yellow-300 font-pixel-operator pointer-events-auto">
          🔊 Click any music control to enable audio
        </div>
      )}

      {/* Main Music Control Button */}
      <div className="flex items-center space-x-2 pointer-events-auto">
        <button
          onClick={handleExpandToggle}
          className="btn-rpg text-sm px-4 py-2 hover:scale-105 transition-transform min-h-[48px]"
          title="Music Controls"
        >
          🎵
        </button>

        <button
          onClick={handleToggle}
          disabled={!isEnabled || isLoading}
          className={`
            btn-rpg text-lg px-4 py-2 hover:scale-105 transition-transform min-h-[48px]
            ${!isEnabled || isLoading ? "opacity-50 cursor-not-allowed" : ""}
            ${isPlaying ? "bg-gold text-[#0D0D0D] music-playing" : ""}
          `}
          title={isPlaying ? "Stop Music" : "Play Music"}
        >
          {isLoading ? <div className="loading-rpg w-4 h-4" /> : isPlaying ? "⏸️" : "▶️"}
        </button>
      </div>

      {/* Expanded Music Controls */}
      {isExpanded && (
        <div className="absolute bottom-full right-0 mb-2 bg-[#2A2A2A] border-2 border-mystic-blue rounded-pixel shadow-[8px_8px_0px_rgba(0,0,0,0.8)] p-4 min-w-80 max-w-sm sm:max-w-md music-controls-enter space-y-4 pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-yellow-600 pb-4">
            <h3 className="font-pixel text-gold text-lg text-glow">🎵 MUSIC</h3>
            <button
              onClick={handleEnabledToggle}
              className={`
                btn-rpg text-sm px-4 py-2 font-pixel min-h-[48px]
                ${isEnabled ? "bg-success text-[#0D0D0D]" : "bg-danger text-white"}
                hover:scale-105 transition-transform
              `}
              title={isEnabled ? "Disable Music" : "Enable Music"}
            >
              {isEnabled ? "ON" : "OFF"}
            </button>
          </div>

          {/* Track Selection */}
          <div>
            <label className="block font-pixel text-sm text-gold mb-2">🎶 Select Track</label>
            <div className="grid grid-cols-1 gap-2">
              {tracks.map((track) => (
                <button
                  key={track.id}
                  onClick={() => handleTrackChange(track.id)}
                  disabled={isLoading}
                  className={`
                    text-left p-3 rounded-pixel border transition-all duration-200 hover:brightness-125 min-h-[48px]
                    ${
                      currentTrack === track.id
                        ? "bg-yellow-500 text-black border-yellow-400 shadow-[0_0_10px_rgba(255,215,0,0.6)]"
                        : "bg-[#1A1A1A] text-text-secondary border-mystic-blue hover:bg-mystic-blue hover:text-text-primary"
                    }
                    ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                  title={`Play ${track.name}`}
                >
                  <div className="font-pixel text-sm">{track.name}</div>
                  <div
                    className={`text-xs font-pixel-operator ${
                      currentTrack === track.id ? "text-black" : "text-yellow-200 opacity-75"
                    }`}
                  >
                    {track.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Volume Control */}
          <div>
            <label className="block font-pixel text-sm text-gold mb-2 text-left">
              {volume > 0 ? "🔊" : "🔇"} VOLUME: {Math.round(volume * 100)}%
            </label>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => updateVolume(0)}
                  className="btn-rpg text-sm px-2 py-1 hover:scale-105 transition-transform min-h-[48px]"
                  title="Mute"
                >
                  🔇
                </button>
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full h-4 bg-[#1A1A1A] border-2 border-mystic-blue rounded-pixel appearance-none cursor-pointer slider-rpg min-h-[48px]"
                    style={{
                      background: `linear-gradient(to right, #FFD700 0%, #FFD700 ${volume * 100}%, #1A1A1A ${
                        volume * 100
                      }%, #1A1A1A 100%)`,
                    }}
                  />
                </div>
                <button
                  onClick={() => updateVolume(1)}
                  className="btn-rpg text-sm px-2 py-1 hover:scale-105 transition-transform min-h-[48px]"
                  title="Max Volume"
                >
                  🔊
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
