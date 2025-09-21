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

// Initialize Howler.js tracks with better error handling
let tracks: Record<string, Howl> = {};

// Initialize tracks only when needed and in browser environment
const initializeTracks = () => {
  if (typeof window === "undefined" || Object.keys(tracks).length > 0) {
    return tracks;
  }

  // Check if audio is supported
  if (typeof window !== "undefined" && !window.AudioContext && !(window as any).webkitAudioContext) {
    console.warn("Audio not supported in this environment");
    return {};
  }

  // Check if Howler is available
  if (typeof Howl === "undefined") {
    console.warn("Howler.js not available");
    return {};
  }

  try {
    tracks = {
      tavern_ambience: new Howl({
        src: ["/music/tavern-ambience.mp3"],
        loop: true,
        volume: 0.3,
        onload: () => console.log("Tavern ambience loaded"),
        onloaderror: (id: number, error: unknown) => {
          console.warn("Tavern ambience load error:", error);
          // Don't throw error, just log warning
        },
      }),
      battle_theme: new Howl({
        src: ["/music/battle-theme.mp3"],
        loop: true,
        volume: 0.4,
        onload: () => console.log("Battle theme loaded"),
        onloaderror: (id: number, error: unknown) => {
          console.warn("Battle theme load error:", error);
        },
      }),
      victory_fanfare: new Howl({
        src: ["/music/victory-fanfare.mp3"],
        loop: false,
        volume: 0.5,
        onload: () => console.log("Victory fanfare loaded"),
        onloaderror: (id: number, error: unknown) => {
          console.warn("Victory fanfare load error:", error);
        },
      }),
      peaceful_village: new Howl({
        src: ["/music/peaceful-village.mp3"],
        loop: true,
        volume: 0.2,
        onload: () => console.log("Peaceful village loaded"),
        onloaderror: (id: number, error: unknown) => {
          console.warn("Peaceful village load error:", error);
        },
      }),
    };
  } catch (error) {
    console.warn("Failed to initialize audio tracks:", error);
    // Return empty tracks object if initialization fails
    tracks = {};
  }

  return tracks;
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
  const [audioContextResumed, setAudioContextResumed] = useState(false);
  const currentTrackRef = useRef<Howl | null>(null);

  // Initialize tracks and volume
  useEffect(() => {
    const initializedTracks = initializeTracks();
    Object.values(initializedTracks).forEach((track) => {
      track.volume(volume);
    });
  }, [volume]);

  // Resume audio context on first user interaction
  const resumeAudioContext = async () => {
    if (audioContextResumed) return true;
    
    try {
      // Resume Howler's audio context
      if (typeof window !== "undefined" && (window as any).Howl) {
        const Howl = (window as any).Howl;
        if (Howl.ctx && Howl.ctx.state === 'suspended') {
          await Howl.ctx.resume();
        }
      }
      
      // Also try to resume any existing AudioContext
      if (typeof window !== "undefined") {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const audioContext = new AudioContext();
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }
        }
      }
      
      setAudioContextResumed(true);
      return true;
    } catch (error) {
      console.warn("Failed to resume audio context:", error);
      return false;
    }
  };

  // Start playing if enabled and not already playing (only after user interaction)
  useEffect(() => {
    if (isEnabled && !isPlaying && audioContextResumed) {
      playTrack(currentTrack);
    }
  }, [isEnabled, isPlaying, currentTrack, audioContextResumed]);

  const stopMusic = () => {
    if (currentTrackRef.current) {
      currentTrackRef.current.stop();
      currentTrackRef.current = null;
    }
    setIsPlaying(false);
  };

  const playTrack = async (trackId: string) => {
    if (!isEnabled) return;

    // Ensure audio context is resumed before playing
    const contextResumed = await resumeAudioContext();
    if (!contextResumed) {
      console.warn("Audio context could not be resumed");
      return;
    }

    // Stop current track
    stopMusic();

    const initializedTracks = initializeTracks();
    const track = initializedTracks[trackId];
    if (!track) {
      console.warn(`Track not found: ${trackId}`);
      return;
    }

    try {
      track.play();
      currentTrackRef.current = track;
      setIsPlaying(true);
      console.log(`Playing track: ${trackId}`);
    } catch (error) {
      console.warn(`Error playing track ${trackId}:`, error);
    }
  };

  const toggleMusic = async () => {
    if (isPlaying) {
      stopMusic();
    } else {
      await playTrack(currentTrack);
    }
  };

  const changeTrack = async (trackId: string) => {
    setCurrentTrack(trackId);
    if (typeof window !== "undefined") {
      localStorage.setItem("rpg-music-track", trackId);
    }
    if (isPlaying) {
      await playTrack(trackId);
    }
  };

  const updateVolume = (newVolume: number) => {
    setVolume(newVolume);
    if (typeof window !== "undefined") {
      localStorage.setItem("rpg-music-volume", newVolume.toString());
    }

    // Update volume for all tracks
    const initializedTracks = initializeTracks();
    Object.values(initializedTracks).forEach((track) => {
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
  const playVictoryFanfare = async () => {
    if (isEnabled) {
      // Ensure audio context is resumed
      const contextResumed = await resumeAudioContext();
      if (!contextResumed) return;
      
      const initializedTracks = initializeTracks();
      const victoryTrack = initializedTracks.victory_fanfare;
      if (victoryTrack) {
        try {
          victoryTrack.play();

          // Return to previous track after fanfare (if it was playing)
          if (isPlaying && currentTrack !== "victory_fanfare") {
            victoryTrack.once("end", () => {
              playTrack(currentTrack);
            });
          }
        } catch (error) {
          console.warn("Error playing victory fanfare:", error);
        }
      }
    }
  };

  // Play battle theme for intense moments
  const playBattleTheme = async () => {
    if (isEnabled && currentTrack !== "battle_theme") {
      await playTrack("battle_theme");
    }
  };

  // Return to peaceful music
  const playPeacefulMusic = async () => {
    if (isEnabled) {
      await playTrack("peaceful_village");
    }
  };

  return {
    isPlaying,
    currentTrack,
    volume,
    isEnabled,
    audioContextResumed,
    tracks: RPG_MUSIC_TRACKS,
    playTrack,
    stopMusic,
    toggleMusic,
    changeTrack,
    updateVolume,
    toggleEnabled,
    resumeAudioContext,
    playVictoryFanfare,
    playBattleTheme,
    playPeacefulMusic,
  };
}
