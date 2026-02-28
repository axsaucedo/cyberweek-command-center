import type { SoundConfig } from '../types';

class SoundEngineImpl {
  private ctx: AudioContext | null = null;
  private config: SoundConfig = {
    enabled: true,
    masterVolume: 0.5,
    orderSounds: true,
    comboSounds: true,
    milestoneSounds: true,
  };
  private throttleLevel = 0;
  private lastTickTime = 0;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  setConfig(config: SoundConfig) {
    this.config = config;
  }

  setThrottle(opm: number) {
    this.throttleLevel = opm;
  }

  private shouldSkipTick(): boolean {
    const now = performance.now();
    const minInterval = this.throttleLevel > 1000 ? 200 : this.throttleLevel > 500 ? 100 : 50;
    if (now - this.lastTickTime < minInterval) return true;
    this.lastTickTime = now;
    return false;
  }

  private playTone(frequency: number, duration: number, volume: number, type: OscillatorType = 'sine') {
    if (!this.config.enabled) return;
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(volume * this.config.masterVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // ignore audio errors
    }
  }

  playOrderTick(amount: number) {
    if (!this.config.orderSounds || this.shouldSkipTick()) return;
    const freq = 800 + (amount / 500) * 400;
    this.playTone(freq, 0.06, 0.08, 'sine');
  }

  playHighValueOrder() {
    if (!this.config.orderSounds) return;
    this.playTone(600, 0.15, 0.15, 'triangle');
    setTimeout(() => this.playTone(900, 0.15, 0.12, 'triangle'), 80);
  }

  playComboTierUp(level: number) {
    if (!this.config.comboSounds) return;
    const baseFreq = 400 + level * 100;
    this.playTone(baseFreq, 0.2, 0.2, 'triangle');
    setTimeout(() => this.playTone(baseFreq * 1.25, 0.2, 0.18, 'triangle'), 100);
    setTimeout(() => this.playTone(baseFreq * 1.5, 0.3, 0.15, 'triangle'), 200);
  }

  playComboLost() {
    if (!this.config.comboSounds) return;
    this.playTone(400, 0.2, 0.15, 'sawtooth');
    setTimeout(() => this.playTone(300, 0.3, 0.12, 'sawtooth'), 100);
  }

  playMilestone() {
    if (!this.config.milestoneSounds) return;
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.25, 0.15, 'triangle'), i * 120);
    });
  }
}

export const soundEngine = new SoundEngineImpl();
