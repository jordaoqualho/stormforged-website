"use client";

import { useRPGBackgroundMusic } from "@/lib/music";
import { useRPGSounds } from "@/lib/sounds";
import { useState } from "react";

export default function MusicPlayer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isPlaying, currentTrack, volume, isEnabled, tracks, toggleMusic, changeTrack, updateVolume, toggleEnabled } =
    useRPGBackgroundMusic();

  const { playClick } = useRPGSounds();

  const currentTrackInfo = tracks.find((track) => track.id === currentTrack);

  const handleToggle = () => {
    toggleMusic();
    playClick();
  };

  const handleTrackChange = (trackId: string) => {
    changeTrack(trackId);
    playClick();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateVolume(parseFloat(e.target.value));
  };

  const handleEnabledToggle = () => {
    toggleEnabled();
    playClick();
  };

  const handleExpandToggle = () => {
    setIsExpanded(!isExpanded);
    playClick();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Main Music Control Button */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleExpandToggle}
          className="btn-rpg text-sm px-4 py-2 hover:scale-105 transition-transform min-h-[48px]"
          title="Music Controls"
        >
          🎵
        </button>

        <button
          onClick={handleToggle}
          disabled={!isEnabled}
          className={`
            btn-rpg text-lg px-4 py-2 hover:scale-105 transition-transform min-h-[48px]
            ${!isEnabled ? "opacity-50 cursor-not-allowed" : ""}
            ${isPlaying ? "bg-gold text-[#0D0D0D] music-playing" : ""}
          `}
          title={isPlaying ? "Stop Music" : "Play Music"}
        >
          {isPlaying ? "⏸️" : "▶️"}
        </button>
      </div>

      {/* Expanded Music Controls */}
      {isExpanded && (
        <div className="absolute bottom-full right-0 mb-2 bg-[#2A2A2A] border-2 border-mystic-blue rounded-pixel shadow-[8px_8px_0px_rgba(0,0,0,0.8)] p-4 min-w-80 max-w-sm sm:max-w-md music-controls-enter space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-yellow-600 pb-4">
            <h3 className="font-pixel text-gold text-lg text-glow">🎵 8-BIT MUSIC</h3>
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

          {/* Current Track Info */}
          {currentTrackInfo && (
            <div className="mb-4 p-3 bg-[#1A1A1A] border border-mystic-blue rounded-pixel">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-gold text-lg">🎼</span>
                <span className="font-pixel text-text-primary">{currentTrackInfo.name}</span>
              </div>
              <p className="text-xs text-text-muted font-pixel-operator">{currentTrackInfo.description}</p>
            </div>
          )}

          {/* Track Selection */}
          <div>
            <label className="block font-pixel text-sm text-gold mb-2">🎶 Select Track</label>
            <div className="grid grid-cols-1 gap-2">
              {tracks.map((track) => (
                <button
                  key={track.id}
                  onClick={() => handleTrackChange(track.id)}
                  className={`
                    text-left p-3 rounded-pixel border transition-all duration-200 hover:brightness-125 min-h-[48px]
                    ${
                      currentTrack === track.id
                        ? "bg-yellow-500 text-black border-yellow-400 shadow-[0_0_10px_rgba(255,215,0,0.6)]"
                        : "bg-[#1A1A1A] text-text-secondary border-mystic-blue hover:bg-mystic-blue hover:text-text-primary"
                    }
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
                  <div className="absolute -top-6 left-0 right-0 flex justify-between text-xs text-text-muted font-pixel-operator">
                    <span>0%</span>
                    <span className="text-gold font-pixel">{Math.round(volume * 100)}%</span>
                    <span>100%</span>
                  </div>
                </div>
                <button
                  onClick={() => updateVolume(1)}
                  className="btn-rpg text-sm px-2 py-1 hover:scale-105 transition-transform min-h-[48px]"
                  title="Max Volume"
                >
                  🔊
                </button>
              </div>
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => updateVolume(0.3)}
                  className="btn-rpg text-xs px-2 py-1 hover:scale-105 transition-transform"
                  title="Reset Volume"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Track Progress Bar */}
            {isPlaying && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-text-muted font-pixel-operator mb-1">
                  <span>Progress</span>
                  <span>8-BIT AUDIO</span>
                </div>
                <div className="w-full h-2 bg-[#1A1A1A] border border-mystic-blue rounded-pixel overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-gold to-yellow-400 animate-pulse"></div>
                </div>
              </div>
            )}
          </div>

          {/* Music Status & 8-BIT Mode */}
          <div className="border-t border-yellow-600 pt-4">
            <div className="flex items-center justify-between text-xs text-text-muted mb-3">
              <span className="font-pixel-operator">
                Status: {isEnabled ? (isPlaying ? "Playing" : "Paused") : "Disabled"}
              </span>
            </div>

            {/* 8-BIT MODE Toggle */}
            <div className="flex items-center justify-center">
              <button
                onClick={handleEnabledToggle}
                className={`
                  btn-rpg px-4 py-2 font-pixel min-h-[48px] transition-all duration-300
                  ${
                    isEnabled
                      ? "bg-gradient-to-r from-yellow-400 to-gold text-black shadow-[0_0_15px_rgba(255,215,0,0.6)]"
                      : "bg-gradient-to-r from-gray-600 to-gray-800 text-gray-300"
                  }
                  hover:scale-105 hover:brightness-125
                `}
                title={isEnabled ? "Disable 8-BIT MODE" : "Enable 8-BIT MODE"}
              >
                🎮 8-BIT MODE {isEnabled ? "ON" : "OFF"}
              </button>
            </div>
          </div>

          {/* Pixel Waveform Animation */}
          {isPlaying && (
            <div className="mt-3 flex items-center justify-center">
              <div className="pixel-waveform">
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
                <div className="wave-bar"></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
