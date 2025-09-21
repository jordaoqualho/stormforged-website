"use client";

import { useEffect, useRef, useState } from "react";

interface MusicTrack {
  id: string;
  name: string;
  url: string;
  volume: number;
  loop: boolean;
  description: string;
}

// Pre-generated RPG-style music tracks using Web Audio API
const RPG_MUSIC_TRACKS: MusicTrack[] = [
  {
    id: "tavern_ambience",
    name: "Tavern Ambience",
    url: "", // Will be generated procedurally
    volume: 0.3,
    loop: true,
    description: "Cozy tavern atmosphere with crackling fire and distant chatter",
  },
  {
    id: "battle_theme",
    name: "Battle Theme",
    url: "", // Will be generated procedurally
    volume: 0.4,
    loop: true,
    description: "Epic battle music for intense guild wars",
  },
  {
    id: "victory_fanfare",
    name: "Victory Fanfare",
    url: "", // Will be generated procedurally
    volume: 0.5,
    loop: false,
    description: "Triumphant fanfare for achievements and victories",
  },
  {
    id: "peaceful_village",
    name: "Peaceful Village",
    url: "", // Will be generated procedurally
    volume: 0.2,
    loop: true,
    description: "Calm village music for peaceful moments",
  },
];

export function useRPGBackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string>("tavern_ambience");
  const [volume, setVolume] = useState(0.3);
  const [isEnabled, setIsEnabled] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorRefs = useRef<OscillatorNode[]>([]);

  // Initialize Web Audio API
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
        gainNodeRef.current.gain.value = volume;
      } catch (error) {
        console.warn("Web Audio API not supported:", error);
        setIsEnabled(false);
      }
    }
  }, []);

  // Generate procedural RPG music
  const generateRPGSound = (trackId: string): OscillatorNode[] => {
    if (!audioContextRef.current || !gainNodeRef.current) return [];

    const oscillators: OscillatorNode[] = [];
    const now = audioContextRef.current.currentTime;

    switch (trackId) {
      case "tavern_ambience":
        // Create warm, cozy tavern sounds
        for (let i = 0; i < 3; i++) {
          const oscillator = audioContextRef.current.createOscillator();
          const gain = audioContextRef.current.createGain();

          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(220 + i * 110, now); // A3, A4, A5
          oscillator.connect(gain);
          if (gainNodeRef.current) {
            gain.connect(gainNodeRef.current);
          }

          // Gentle volume modulation for crackling fire effect
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.linearRampToValueAtTime(0.05, now + 2);
          gain.gain.linearRampToValueAtTime(0.1, now + 4);

          oscillators.push(oscillator);
        }
        break;

      case "battle_theme":
        // Create epic battle music
        const battleNotes = [261.63, 329.63, 392.0, 523.25]; // C4, E4, G4, C5
        battleNotes.forEach((freq, index) => {
          const oscillator = audioContextRef.current!.createOscillator();
          const gain = audioContextRef.current!.createGain();

          oscillator.type = "triangle";
          oscillator.frequency.setValueAtTime(freq, now);
          oscillator.connect(gain);
          if (gainNodeRef.current) {
            gain.connect(gainNodeRef.current);
          }

          // Battle rhythm
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.5);

          oscillators.push(oscillator);
        });
        break;

      case "victory_fanfare":
        // Create triumphant fanfare
        const fanfareNotes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        fanfareNotes.forEach((freq, index) => {
          const oscillator = audioContextRef.current!.createOscillator();
          const gain = audioContextRef.current!.createGain();

          oscillator.type = "square";
          oscillator.frequency.setValueAtTime(freq, now);
          oscillator.connect(gain);
          if (gainNodeRef.current) {
            gain.connect(gainNodeRef.current);
          }

          // Fanfare rhythm
          gain.gain.setValueAtTime(0.2, now + index * 0.2);
          gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.2 + 0.8);

          oscillators.push(oscillator);
        });
        break;

      case "peaceful_village":
        // Create peaceful village sounds
        const villageNotes = [196.0, 246.94, 293.66, 349.23]; // G3, B3, D4, F4
        villageNotes.forEach((freq, index) => {
          const oscillator = audioContextRef.current!.createOscillator();
          const gain = audioContextRef.current!.createGain();

          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(freq, now);
          oscillator.connect(gain);
          if (gainNodeRef.current) {
            gain.connect(gainNodeRef.current);
          }

          // Gentle, slow rhythm
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.linearRampToValueAtTime(0.04, now + 3);
          gain.gain.linearRampToValueAtTime(0.08, now + 6);

          oscillators.push(oscillator);
        });
        break;
    }

    return oscillators;
  };

  const playTrack = (trackId: string) => {
    if (!audioContextRef.current || !isEnabled) return;

    // Stop current track
    stopMusic();

    // Resume audio context if suspended
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }

    const oscillators = generateRPGSound(trackId);
    oscillatorRefs.current = oscillators;

    oscillators.forEach((oscillator) => {
      oscillator.start();
    });

    const track = RPG_MUSIC_TRACKS.find((t) => t.id === trackId);
    if (track?.loop) {
      // Schedule restart for looping tracks
      const duration = 8; // 8 seconds loop
      setTimeout(() => {
        if (isPlaying && currentTrack === trackId) {
          playTrack(trackId);
        }
      }, duration * 1000);
    }

    setCurrentTrack(trackId);
    setIsPlaying(true);
  };

  const stopMusic = () => {
    oscillatorRefs.current.forEach((oscillator) => {
      try {
        oscillator.stop();
      } catch (error) {
        // Oscillator might already be stopped
      }
    });
    oscillatorRefs.current = [];
    setIsPlaying(false);
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
    if (isPlaying) {
      playTrack(trackId);
    }
  };

  const updateVolume = (newVolume: number) => {
    setVolume(newVolume);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume;
    }
  };

  const toggleEnabled = () => {
    setIsEnabled(!isEnabled);
    if (!isEnabled && isPlaying) {
      stopMusic();
    }
  };

  // Play victory fanfare for achievements
  const playVictoryFanfare = () => {
    if (isEnabled) {
      playTrack("victory_fanfare");
      // Return to previous track after fanfare
      setTimeout(() => {
        if (isPlaying) {
          playTrack(currentTrack);
        }
      }, 3000);
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
