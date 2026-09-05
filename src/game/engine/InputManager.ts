import type { InputState } from '../types';

const GAME_KEYS = new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','Space','ShiftLeft','ShiftRight','KeyX']);
export class InputManager {
  private keys = new Set<string>();
  private touch = new Set<string>();
  enabled = false;
  constructor(private canvas: HTMLCanvasElement, private onPause: () => void) {
    window.addEventListener('keydown', this.down);
    window.addEventListener('keyup', this.up);
    window.addEventListener('blur', this.clear);
  }
  private down = (event: KeyboardEvent) => {
    if (!this.enabled || event.metaKey || event.ctrlKey || event.altKey) return;
    const focused = document.activeElement;
    if (event.code === 'Escape') { event.preventDefault(); if (!event.repeat) this.onPause(); this.clear(); return; }
    if (focused !== this.canvas) return;
    if (GAME_KEYS.has(event.code)) { event.preventDefault(); this.keys.add(event.code); }
  };
  private up = (event: KeyboardEvent) => { this.keys.delete(event.code); };
  clear = () => { this.keys.clear(); this.touch.clear(); };
  setTouch(action: string, pressed: boolean) { if (pressed) this.touch.add(action); else this.touch.delete(action); }
  read(): InputState {
    const has = (...keys: string[]) => keys.some(key => this.keys.has(key) || this.touch.has(key));
    return {
      x: Number(has('ArrowRight','KeyD','right')) - Number(has('ArrowLeft','KeyA','left')),
      y: Number(has('ArrowDown','KeyS','down')) - Number(has('ArrowUp','KeyW','up')),
      fire: has('Space','fire'), special: has('ShiftLeft','ShiftRight','KeyX','special'),
    };
  }
  destroy() { this.clear(); window.removeEventListener('keydown', this.down); window.removeEventListener('keyup', this.up); window.removeEventListener('blur', this.clear); }
}
