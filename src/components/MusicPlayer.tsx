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
          className="btn-rpg text-sm px-3 py-2 hover:scale-105 transition-transform"
          title="Music Controls"
        >
          🎵
        </button>

        <button
          onClick={handleToggle}
          disabled={!isEnabled}
          className={`
            btn-rpg text-lg px-3 py-2 hover:scale-105 transition-transform
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
        <div className="absolute bottom-full right-0 mb-2 bg-[#2A2A2A] border-2 border-mystic-blue rounded-pixel shadow-[8px_8px_0px_rgba(0,0,0,0.8)] p-4 min-w-80 music-controls-enter">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-pixel text-gold text-lg">🎵 Music Player</h3>
            <button
              onClick={handleEnabledToggle}
              className={`
                btn-rpg text-sm px-2 py-1
                ${isEnabled ? "bg-success" : "bg-danger"}
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
          <div className="mb-4">
            <label className="block font-pixel text-sm text-gold mb-2">🎶 Select Track</label>
            <div className="grid grid-cols-1 gap-2">
              {tracks.map((track) => (
                <button
                  key={track.id}
                  onClick={() => handleTrackChange(track.id)}
                  className={`
                    text-left p-2 rounded-pixel border border-mystic-blue
                    transition-all duration-200 hover:scale-105
                    ${
                      currentTrack === track.id
                        ? "bg-gold text-[#0D0D0D] border-gold"
                        : "bg-[#1A1A1A] text-text-secondary hover:bg-mystic-blue hover:text-text-primary"
                    }
                  `}
                >
                  <div className="font-pixel text-sm">{track.name}</div>
                  <div className="text-xs font-pixel-operator opacity-75">{track.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Volume Control */}
          <div className="mb-4">
            <label className="block font-pixel text-sm text-gold mb-2">🔊 Volume: {Math.round(volume * 100)}%</label>
            <div className="flex items-center space-x-2">
              <span className="text-text-muted">🔇</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="flex-1 h-2 bg-[#1A1A1A] border border-mystic-blue rounded-pixel appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #FFD700 0%, #FFD700 ${volume * 100}%, #1A1A1A ${
                    volume * 100
                  }%, #1A1A1A 100%)`,
                }}
              />
              <span className="text-text-muted">🔊</span>
            </div>
          </div>

          {/* Music Status */}
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span className="font-pixel-operator">
              Status: {isEnabled ? (isPlaying ? "Playing" : "Paused") : "Disabled"}
            </span>
            <span className="font-pixel-operator">🎮 RPG Mode</span>
          </div>
        </div>
      )}
    </div>
  );
}
