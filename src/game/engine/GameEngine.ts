import { STEP } from '../constants';
import type { DisplayMode, GameSnapshot } from '../types';
import { AudioSystem } from '../systems/AudioSystem';
import { GameWorld } from './GameWorld';
import { InputManager } from './InputManager';
import { Renderer } from './Renderer';

export class GameEngine {
  readonly world: GameWorld;
  readonly input: InputManager;
  readonly audio = new AudioSystem();
  readonly renderer: Renderer;
  private raf = 0;
  private last = 0;
  private accumulator = 0;
  private lastSnapshot = 0;
  private visible = true;
  private alive = true;
  private observer: IntersectionObserver;
  private motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  private fps = 60;

  constructor(private canvas: HTMLCanvasElement, private onSnapshot: (snapshot: GameSnapshot) => void, onFinish: (score: number) => void) {
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Your browser could not initialize the LCD display.');
    this.renderer = new Renderer(context);
    this.world = new GameWorld({ sound: this.audio.play, finish: onFinish });
    this.input = new InputManager(canvas, () => this.togglePause());
    this.observer = new IntersectionObserver(entries => {
      this.visible = entries[0].isIntersecting;
      if (!this.visible) this.pause();
    }, { threshold: 0.01 });
    this.observer.observe(canvas);
    document.addEventListener('visibilitychange', this.onVisibility);
    window.addEventListener('blur', this.pause);
    canvas.addEventListener('blur', this.onCanvasBlur);
    this.motionQuery.addEventListener('change', this.onMotion);
    this.onMotion();
    this.raf = requestAnimationFrame(this.frame);
    this.emit();
  }

  private onMotion = () => { this.renderer.reducedMotion = this.motionQuery.matches; };
  private onVisibility = () => { if (document.hidden) this.pause(); };
  private onCanvasBlur = () => { this.input.clear(); };
  private frame = (time: number) => {
    if (!this.alive) return;
    const delta = this.last ? Math.min(0.1, (time - this.last) / 1000) : STEP;
    this.last = time;
    this.fps += ((1 / Math.max(delta, 0.001)) - this.fps) * 0.05;
    if (this.visible && !document.hidden) {
      // Reduced motion keeps the attract scene still; actual gameplay is unaffected.
      if (!(this.world.status === 'demo' && this.renderer.reducedMotion)) {
        this.accumulator += delta;
        while (this.accumulator >= STEP) { this.world.update(STEP, this.input.read()); this.accumulator -= STEP; }
      }
      this.renderer.render(this.world);
      if (time - this.lastSnapshot > 125) { this.lastSnapshot = time; this.emit(); }
    } else this.accumulator = 0;
    this.raf = requestAnimationFrame(this.frame);
  };
  private emit() { this.input.enabled = ['playing','paused'].includes(this.world.status); this.onSnapshot(this.world.snapshot(Math.min(120, Math.round(this.fps)))); }
  start() { this.world.reset(false); this.accumulator = 0; this.last = 0; this.input.clear(); this.input.enabled = true; this.audio.unlock(); this.canvas.focus({ preventScroll: true }); this.emit(); }
  attract() { this.world.reset(true); this.input.clear(); this.input.enabled = false; this.emit(); }
  pause = () => { this.world.pause(); this.input.clear(); this.emit(); };
  resume() { this.world.resume(); this.input.clear(); this.canvas.focus({ preventScroll: true }); this.emit(); }
  togglePause() { if (this.world.status === 'paused') this.resume(); else this.pause(); }
  setDisplay(mode: DisplayMode) { this.renderer.mode = mode; }
  setAudio(enabled: boolean) { this.audio.enabled = enabled; if (enabled) this.audio.unlock(); }
  destroy() {
    this.alive = false; cancelAnimationFrame(this.raf); this.input.destroy(); this.audio.destroy(); this.observer.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility); window.removeEventListener('blur', this.pause);
    this.canvas.removeEventListener('blur', this.onCanvasBlur); this.motionQuery.removeEventListener('change', this.onMotion);
  }
}
