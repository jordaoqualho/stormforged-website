// RPG Sound Effects using Web Audio API
class RPGSoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private isEnabled = true;

  constructor() {
    if (typeof window !== "undefined") {
      this.audioContext = new AudioContext();
      this.generateSounds();
    }
  }

  private generateSounds() {
    if (!this.audioContext) return;

    // Generate different types of sounds using Web Audio API
    this.generateClickSound();
    this.generateSuccessSound();
    this.generateErrorSound();
    this.generateSwordSound();
    this.generateMagicSound();
  }

  private generateClickSound() {
    if (!this.audioContext) return;

    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.1, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      data[i] = Math.sin((2 * Math.PI * 800 * i) / this.audioContext.sampleRate) * 0.1;
    }

    this.sounds.set("click", buffer);
  }

  private generateSuccessSound() {
    if (!this.audioContext) return;

    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.5, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.audioContext.sampleRate;
      data[i] = Math.sin(2 * Math.PI * (523 + t * 200) * t) * 0.3 * Math.exp(-t * 3);
    }

    this.sounds.set("success", buffer);
  }

  private generateErrorSound() {
    if (!this.audioContext) return;

    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.3, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.audioContext.sampleRate;
      data[i] = Math.sin(2 * Math.PI * (200 - t * 100) * t) * 0.2 * Math.exp(-t * 4);
    }

    this.sounds.set("error", buffer);
  }

  private generateSwordSound() {
    if (!this.audioContext) return;

    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.2, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.audioContext.sampleRate;
      data[i] = (Math.random() - 0.5) * 0.3 * Math.exp(-t * 8);
    }

    this.sounds.set("sword", buffer);
  }

  private generateMagicSound() {
    if (!this.audioContext) return;

    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.8, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.audioContext.sampleRate;
      data[i] = Math.sin(2 * Math.PI * (440 + Math.sin(t * 10) * 50) * t) * 0.2 * Math.exp(-t * 2);
    }

    this.sounds.set("magic", buffer);
  }

  private async playSound(soundName: string, volume = 0.5) {
    if (!this.isEnabled || !this.audioContext || !this.sounds.has(soundName)) {
      return;
    }

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = this.sounds.get(soundName)!;
      gainNode.gain.value = volume;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start();
    } catch (error) {
      console.warn("Could not play sound:", error);
    }
  }

  // Public methods
  playClick() {
    this.playSound("click", 0.3);
  }

  playSuccess() {
    this.playSound("success", 0.4);
  }

  playError() {
    this.playSound("error", 0.4);
  }

  playSword() {
    this.playSound("sword", 0.5);
  }

  playMagic() {
    this.playSound("magic", 0.3);
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
    setEnabled: (enabled: boolean) => soundManager.setEnabled(enabled),
    isEnabled: soundManager.isSoundEnabled(),
    toggleSound: () => soundManager.toggleSound(),
  };
}
