"use client";

import { Howl } from "howler";
import { useEffect, useRef, useState } from "react";

interface MusicTrack {
  id: string;
  name: string;
  description: string;
  volume: number;
  loop: boolean;
}

// Music track definitions
const RPG_MUSIC_TRACKS: MusicTrack[] = [
  {
    id: "tavern_ambience",
    name: "Tavern Ambience",
    description: "Cozy 8-bit tavern with crackling fire & NES-style melody",
    volume: 0.3,
    loop: true,
  },
  {
    id: "battle_theme",
    name: "Battle Theme",
    description: "Epic 8-bit battle music with drums & arpeggios",
    volume: 0.4,
    loop: true,
  },
  {
    id: "victory_fanfare",
    name: "Victory Fanfare",
    description: "Triumphant chiptune fanfare for achievements",
    volume: 0.5,
    loop: false,
  },
  {
    id: "peaceful_village",
    name: "Peaceful Village",
    description: "Soft retro background with gentle 8-bit harmonies",
    volume: 0.2,
    loop: true,
  },
];

// Initialize Howler.js tracks
const tracks: Record<string, Howl> = {
  tavern_ambience: new Howl({
    src: ["/music/tavern-ambience.mp3"],
    loop: true,
    volume: 0.3,
    onload: () => console.log("Tavern ambience loaded"),
    onloaderror: (id: number, error: unknown) => console.error("Tavern ambience load error:", error),
  }),
  battle_theme: new Howl({
    src: ["/music/battle-theme.mp3"],
    loop: true,
    volume: 0.4,
    onload: () => console.log("Battle theme loaded"),
    onloaderror: (id: number, error: unknown) => console.error("Battle theme load error:", error),
  }),
  victory_fanfare: new Howl({
    src: ["/music/victory-fanfare.mp3"],
    loop: false,
    volume: 0.5,
    onload: () => console.log("Victory fanfare loaded"),
    onloaderror: (id: number, error: unknown) => console.error("Victory fanfare load error:", error),
  }),
  peaceful_village: new Howl({
    src: ["/music/peaceful-village.mp3"],
    loop: true,
    volume: 0.2,
    onload: () => console.log("Peaceful village loaded"),
    onloaderror: (id: number, error: unknown) => console.error("Peaceful village load error:", error),
  }),
};

export function useRPGBackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("rpg-music-track") || "tavern_ambience";
    }
    return "tavern_ambience";
  });
  const [volume, setVolume] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rpg-music-volume");
      return saved ? parseFloat(saved) : 0.3;
    }
    return 0.3;
  });
  const [isEnabled, setIsEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rpg-music-enabled");
      return saved ? JSON.parse(saved) : true;
    }
    return true;
  });
  const currentTrackRef = useRef<Howl | null>(null);

  // Initialize volume for all tracks
  useEffect(() => {
    Object.values(tracks).forEach((track) => {
      track.volume(volume);
    });
  }, [volume]);

  // Start playing if enabled and not already playing
  useEffect(() => {
    if (isEnabled && !isPlaying) {
      playTrack(currentTrack);
    }
  }, [isEnabled, isPlaying, currentTrack]);

  const stopMusic = () => {
    if (currentTrackRef.current) {
      currentTrackRef.current.stop();
      currentTrackRef.current = null;
    }
    setIsPlaying(false);
  };

  const playTrack = (trackId: string) => {
    if (!isEnabled) return;

    // Stop current track
    stopMusic();

    const track = tracks[trackId];
    if (!track) {
      console.error(`Track not found: ${trackId}`);
      return;
    }

    try {
      track.play();
      currentTrackRef.current = track;
      setIsPlaying(true);
      console.log(`Playing track: ${trackId}`);
    } catch (error) {
      console.error(`Error playing track ${trackId}:`, error);
    }
  };

  const toggleMusic = () => {
    if (isPlaying) {
      stopMusic();
    } else {
      playTrack(currentTrack);
    }
  };

  const changeTrack = (trackId: string) => {
    setCurrentTrack(trackId);
    if (typeof window !== "undefined") {
      localStorage.setItem("rpg-music-track", trackId);
    }
    if (isPlaying) {
      playTrack(trackId);
    }
  };

  const updateVolume = (newVolume: number) => {
    setVolume(newVolume);
    if (typeof window !== "undefined") {
      localStorage.setItem("rpg-music-volume", newVolume.toString());
    }
    
    // Update volume for all tracks
    Object.values(tracks).forEach((track) => {
      track.volume(newVolume);
    });
  };

  const toggleEnabled = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    if (typeof window !== "undefined") {
      localStorage.setItem("rpg-music-enabled", JSON.stringify(newEnabled));
    }
    if (!newEnabled && isPlaying) {
      stopMusic();
    }
  };

  // Play victory fanfare for achievements
  const playVictoryFanfare = () => {
    if (isEnabled) {
      const victoryTrack = tracks.victory_fanfare;
      if (victoryTrack) {
        victoryTrack.play();
        
        // Return to previous track after fanfare (if it was playing)
        if (isPlaying && currentTrack !== "victory_fanfare") {
          victoryTrack.once("end", () => {
            playTrack(currentTrack);
          });
        }
      }
    }
  };

  // Play battle theme for intense moments
  const playBattleTheme = () => {
    if (isEnabled && currentTrack !== "battle_theme") {
      playTrack("battle_theme");
    }
  };

  // Return to peaceful music
  const playPeacefulMusic = () => {
    if (isEnabled) {
      playTrack("peaceful_village");
    }
  };

  return {
    isPlaying,
    currentTrack,
    volume,
    isEnabled,
    tracks: RPG_MUSIC_TRACKS,
    playTrack,
    stopMusic,
    toggleMusic,
    changeTrack,
    updateVolume,
    toggleEnabled,
    playVictoryFanfare,
    playBattleTheme,
    playPeacefulMusic,
  };
}