// Enhanced RPG Sound Effects using Web Audio API

class RPGSoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private isEnabled = true;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    // Don't initialize AudioContext immediately to avoid autoplay policy warnings
    this.setupUserGestureListener();
  }

  private setupUserGestureListener() {
    if (typeof window === "undefined") return;

    // Listen for any user interaction to initialize AudioContext
    const initOnUserGesture = () => {
      if (!this.isInitialized) {
        this.initializeAudioContext();
      }
      // Remove listeners after first initialization
      document.removeEventListener("click", initOnUserGesture);
      document.removeEventListener("keydown", initOnUserGesture);
      document.removeEventListener("touchstart", initOnUserGesture);
    };

    document.addEventListener("click", initOnUserGesture, { once: true });
    document.addEventListener("keydown", initOnUserGesture, { once: true });
    document.addEventListener("touchstart", initOnUserGesture, { once: true });
  }

  private async initializeAudioContext() {
    if (this.isInitialized || this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = new Promise<void>((resolve) => {
      try {
        this.audioContext = new AudioContext();

        // Resume AudioContext if it's suspended (common in modern browsers)
        if (this.audioContext.state === "suspended") {
          this.audioContext.resume().then(() => {
            this.generateSounds();
            this.isInitialized = true;
            resolve();
          });
        } else {
          this.generateSounds();
          this.isInitialized = true;
          resolve();
        }
      } catch (error) {
        console.warn("Failed to initialize AudioContext:", error);
        this.isInitialized = true;
        resolve();
      }
    });

    return this.initializationPromise;
  }

  private generateSounds() {
    if (!this.audioContext) return;

    // Generate enhanced RPG sound effects
    this.generateClickSound();
    this.generateSuccessSound();
    this.generateErrorSound();
    this.generateSwordSound();
    this.generateMagicSound();
    this.generateHoverSound();
    this.generateVictorySound();
    this.generateNotificationSound();
    this.generateEpicSound();
    this.generateLegendarySound();
  }

  private generateClickSound() {
    if (!this.audioContext) return;

    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.08, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.audioContext.sampleRate;
      // Crisp, short click with slight pitch variation
      const frequency = 1000 + Math.sin(t * 20) * 200;
      data[i] = Math.sin(2 * Math.PI * frequency * t) * 0.15 * Math.exp(-t * 15);
    }

    this.sounds.set("click", buffer);
  }

  private generateSuccessSound() {
    if (!this.audioContext) return;

    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.6, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.audioContext.sampleRate;
      // Ascending chord progression (C-E-G)
      const note1 = Math.sin(2 * Math.PI * 523.25 * t) * 0.2; // C5
      const note2 = Math.sin(2 * Math.PI * 659.25 * t) * 0.15; // E5
      const note3 = Math.sin(2 * Math.PI * 783.99 * t) * 0.1; // G5
      const envelope = Math.exp(-t * 2);
      data[i] = (note1 + note2 + note3) * envelope;
    }

    this.sounds.set("success", buffer);
  }

  private generateErrorSound() {
    if (!this.audioContext) return;

    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.4, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.audioContext.sampleRate;
      // Descending dissonant chord
      const note1 = Math.sin(2 * Math.PI * (400 - t * 200) * t) * 0.2;
      const note2 = Math.sin(2 * Math.PI * (350 - t * 150) * t) * 0.15;
      const envelope = Math.exp(-t * 3);
      data[i] = (note1 + note2) * envelope;
    }

    this.sounds.set("error", buffer);
  }

  private generateSwordSound() {
    if (!this.audioContext) return;

    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.3, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.audioContext.sampleRate;
      // Metallic sword clash with noise and harmonics
      const noise = (Math.random() - 0.5) * 0.4;
      const harmonic1 = Math.sin(2 * Math.PI * 800 * t) * 0.1;
      const harmonic2 = Math.sin(2 * Math.PI * 1200 * t) * 0.05;
      const envelope = Math.exp(-t * 6);
      data[i] = (noise + harmonic1 + harmonic2) * envelope;
    }

    this.sounds.set("sword", buffer);
  }

  private generateMagicSound() {
    if (!this.audioContext) return;

    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 1.0, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.audioContext.sampleRate;
      // Mystical shimmering sound with frequency modulation
      const carrierFreq = 440 + Math.sin(t * 8) * 100;
      const modulatorFreq = 5 + Math.sin(t * 3) * 3;
      const modulation = Math.sin(2 * Math.PI * modulatorFreq * t) * 50;
      const envelope = Math.exp(-t * 1.5) * (1 + Math.sin(t * 20) * 0.3);
      data[i] = Math.sin(2 * Math.PI * (carrierFreq + modulation) * t) * 0.25 * envelope;
    }

    this.sounds.set("magic", buffer);
  }

  private generateHoverSound() {
    if (!this.audioContext) return;

    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.05, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.audioContext.sampleRate;
      // Subtle hover sound
      const frequency = 1200 + Math.sin(t * 30) * 100;
      data[i] = Math.sin(2 * Math.PI * frequency * t) * 0.08 * Math.exp(-t * 20);
    }

    this.sounds.set("hover", buffer);
  }

  private generateVictorySound() {
    if (!this.audioContext) return;

    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 1.2, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.audioContext.sampleRate;
      // Triumphant fanfare (C-E-G-C octave)
      const note1 = Math.sin(2 * Math.PI * 523.25 * t) * 0.15; // C5
      const note2 = Math.sin(2 * Math.PI * 659.25 * t) * 0.12; // E5
      const note3 = Math.sin(2 * Math.PI * 783.99 * t) * 0.1; // G5
      const note4 = Math.sin(2 * Math.PI * 1046.5 * t) * 0.08; // C6
      const envelope = Math.exp(-t * 1.2) * (1 + Math.sin(t * 15) * 0.2);
      data[i] = (note1 + note2 + note3 + note4) * envelope;
    }

    this.sounds.set("victory", buffer);
  }

  private generateNotificationSound() {
    if (!this.audioContext) return;

    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.3, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.audioContext.sampleRate;
      // Gentle notification chime
      const note1 = Math.sin(2 * Math.PI * 880 * t) * 0.1; // A5
      const note2 = Math.sin(2 * Math.PI * 1108.73 * t) * 0.08; // C#6
      const envelope = Math.exp(-t * 4);
      data[i] = (note1 + note2) * envelope;
    }

    this.sounds.set("notification", buffer);
  }

  private generateEpicSound() {
    if (!this.audioContext) return;

    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.8, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.audioContext.sampleRate;
      // Epic purple-themed sound with mystical undertones
      const note1 = Math.sin(2 * Math.PI * 554.37 * t) * 0.15; // C#5
      const note2 = Math.sin(2 * Math.PI * 739.99 * t) * 0.12; // F#5
      const note3 = Math.sin(2 * Math.PI * 987.77 * t) * 0.1; // B5
      const shimmer = Math.sin(2 * Math.PI * 2200 * t) * 0.05 * Math.sin(t * 15); // Shimmer effect
      const envelope = Math.exp(-t * 1.5) * (1 + Math.sin(t * 12) * 0.3);
      data[i] = (note1 + note2 + note3 + shimmer) * envelope;
    }

    this.sounds.set("epic", buffer);
  }

  private generateLegendarySound() {
    if (!this.audioContext) return;

    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 1.5, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.audioContext.sampleRate;
      // Legendary gold-themed sound with triumphant fanfare
      const note1 = Math.sin(2 * Math.PI * 523.25 * t) * 0.2; // C5
      const note2 = Math.sin(2 * Math.PI * 659.25 * t) * 0.18; // E5
      const note3 = Math.sin(2 * Math.PI * 783.99 * t) * 0.15; // G5
      const note4 = Math.sin(2 * Math.PI * 1046.5 * t) * 0.12; // C6
      const note5 = Math.sin(2 * Math.PI * 1318.51 * t) * 0.1; // E6
      const goldenShimmer = Math.sin(2 * Math.PI * 3000 * t) * 0.08 * Math.sin(t * 20); // Golden shimmer
      const envelope = Math.exp(-t * 1.0) * (1 + Math.sin(t * 8) * 0.4);
      data[i] = (note1 + note2 + note3 + note4 + note5 + goldenShimmer) * envelope;
    }

    this.sounds.set("legendary", buffer);
  }

  private async playSound(soundName: string, volume = 0.5) {
    if (!this.isEnabled || !this.sounds.has(soundName)) {
      return;
    }

    try {
      // Ensure AudioContext is initialized before playing
      await this.initializeAudioContext();

      if (!this.audioContext) {
        return;
      }

      // Ensure AudioContext is running
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = this.sounds.get(soundName)!;
      gainNode.gain.value = volume;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start();
    } catch (error) {
      // Silently fail to avoid console spam
    }
  }

  // Enhanced public methods with better volumes and timing
  playClick() {
    this.playSound("click", 0.2);
  }

  playSuccess() {
    this.playSound("success", 0.3);
  }

  playError() {
    this.playSound("error", 0.25);
  }

  playSword() {
    this.playSound("sword", 0.3);
  }

  playMagic() {
    this.playSound("magic", 0.2);
  }

  playHover() {
    this.playSound("hover", 0.1);
  }

  playVictory() {
    this.playSound("victory", 0.4);
  }

  playNotification() {
    this.playSound("notification", 0.15);
  }

  playEpic() {
    this.playSound("epic", 0.35);
  }

  playLegendary() {
    this.playSound("legendary", 0.4);
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  isSoundEnabled() {
    return this.isEnabled;
  }

  toggleSound() {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }
}

// Create a singleton instance
export const soundManager = new RPGSoundManager();

// Hook for using sounds in React components
export function useRPGSounds() {
  return {
    playClick: () => soundManager.playClick(),
    playSuccess: () => soundManager.playSuccess(),
    playError: () => soundManager.playError(),
    playSword: () => soundManager.playSword(),
    playMagic: () => soundManager.playMagic(),
    playHover: () => soundManager.playHover(),
    playVictory: () => soundManager.playVictory(),
    playNotification: () => soundManager.playNotification(),
    playEpic: () => soundManager.playEpic(),
    playLegendary: () => soundManager.playLegendary(),
    setEnabled: (enabled: boolean) => soundManager.setEnabled(enabled),
    isEnabled: soundManager.isSoundEnabled(),
    toggleSound: () => soundManager.toggleSound(),
  };
}
