import type { SoundKind } from '../types';
const TONES: Record<SoundKind, [number, number, number, OscillatorType]> = {
  shot: [680, 230, 0.055, 'square'], hit: [110, 36, 0.16, 'sawtooth'], explosion: [150, 28, 0.16, 'square'],
  special: [720, 45, 0.48, 'sawtooth'], warning: [180, 420, 0.42, 'square'], pickup: [500, 1100, 0.15, 'sine'], victory: [330, 1320, 0.75, 'triangle'],
};
export class AudioSystem {
  enabled = false;
  private context: AudioContext | null = null;
  private nodes = new Set<OscillatorNode>();
  unlock() {
    if (!this.enabled) return;
    try { this.context ??= new AudioContext(); if (this.context.state === 'suspended') void this.context.resume().catch(() => {}); } catch { /* Audio is optional. */ }
  }
  play = (kind: SoundKind, pitch = 1) => {
    const ctx = this.context;
    if (!this.enabled || !ctx || ctx.state !== 'running' || this.nodes.size > 10) return;
    const [from, to, duration, type] = TONES[kind];
    const oscillator = ctx.createOscillator(), gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from * pitch, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(to * pitch, ctx.currentTime + duration);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(kind === 'shot' ? 0.018 : 0.045, ctx.currentTime + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    oscillator.connect(gain); gain.connect(ctx.destination); this.nodes.add(oscillator);
    oscillator.onended = () => { this.nodes.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(); oscillator.stop(ctx.currentTime + duration + 0.01);
  };
  destroy() { this.nodes.forEach(n => { try { n.stop(); } catch {} }); this.nodes.clear(); if (this.context) void this.context.close().catch(() => {}); this.context = null; }
}
