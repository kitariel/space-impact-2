import { BOSS_ARRIVAL, BOSS_WARNING, HEIGHT, PALETTES, WIDTH } from '../constants';
import { ENEMY_SPRITES } from '../sprites/enemies';
import { PLAYER_SPRITE } from '../sprites/player';
import type { DisplayMode } from '../types';
import { GameWorld } from './GameWorld';

export class Renderer {
  mode: DisplayMode = 'classic';
  reducedMotion = false;
  constructor(private ctx: CanvasRenderingContext2D) { ctx.imageSmoothingEnabled = false; }

  private sprite(matrix: readonly string[], x: number, y: number, flash = false) {
    const ctx = this.ctx, palette = PALETTES[this.mode];
    matrix.forEach((row, iy) => [...row].forEach((cell, ix) => {
      if (cell === '0') return;
      ctx.fillStyle = flash ? palette.mid : cell === '2' ? palette.background : palette.ink;
      ctx.fillRect(Math.round(x) + ix, Math.round(y) + iy, 1, 1);
    }));
  }

  private text(value: string, x: number, y: number, size = 7, align: CanvasTextAlign = 'left') {
    this.ctx.font = `bold ${size}px monospace`;
    this.ctx.textAlign = align; this.ctx.textBaseline = 'top';
    this.ctx.fillText(value, x, y);
  }

  render(world: GameWorld) {
    const c = this.ctx, p = PALETTES[this.mode], time = world.visualTime;
    c.fillStyle = p.background; c.fillRect(0, 0, WIDTH, HEIGHT);
    c.save();
    if (world.shake > 0 && !this.reducedMotion) c.translate(Math.round(Math.sin(time * 190) * 1.5), Math.round(Math.cos(time * 160)));
    this.environment(time);
    world.pickups.forEach(item => {
      c.strokeStyle = p.ink; c.strokeRect(Math.round(item.x), Math.round(item.y), 8, 8);
      c.fillStyle = p.ink; c.fillRect(Math.round(item.x) + 3, Math.round(item.y) + 1, 2, 6); c.fillRect(Math.round(item.x) + 1, Math.round(item.y) + 3, 6, 2);
    });
    world.enemies.forEach(e => this.sprite(ENEMY_SPRITES[e.kind], e.x, e.y, e.flash > 0));
    if (world.boss && world.status !== 'winning' && world.status !== 'victory') {
      const b = world.boss, x = Math.round(b.x), y = Math.round(b.y);
      c.fillStyle = b.flash > 0 ? p.mid : p.ink;
      c.fillRect(x + 18, y + 4, 40, 82); c.fillRect(x + 8, y + 15, 17, 60); c.fillRect(x + 40, y - 3, 18, 96);
      c.fillRect(x + 31, y + 27, 34, 32);
      c.fillStyle = p.background; c.fillRect(x + 25, y + 11, 8, 68);
      c.fillRect(x + 38, y + 7, 12, 6); c.fillRect(x + 38, y + 71, 12, 6);
      c.fillStyle = p.mid;
      for (let i = 0; i < 7; i++) c.fillRect(x + 43, y + 19 + i * 7, 12, 2);
      world.bossCores().forEach((core, i) => {
        c.fillStyle = b.cores[i] > 0 ? p.ink : p.mid; c.fillRect(Math.round(core.x), Math.round(core.y), core.w, core.h);
        if (b.cores[i] > 0) { c.fillStyle = Math.floor(time * 4) % 2 ? p.background : p.mid; c.fillRect(Math.round(core.x) + 3, Math.round(core.y) + 3, 5, 7); }
      });
    }
    world.projectiles.forEach(shot => {
      c.fillStyle = p.ink; const x = Math.round(shot.x), y = Math.round(shot.y);
      if (shot.hostile) { c.fillRect(x + 1, y, 2, 4); c.fillRect(x, y + 1, 4, 2); }
      else { c.fillRect(x, y, shot.w, shot.h); c.fillStyle = p.mid; c.fillRect(x - 3, y, 2, shot.h); }
    });
    if (!['dying', 'gameover'].includes(world.status) && (world.player.invincible <= 0 || Math.floor(time * 12) % 2 === 0)) {
      const ship = world.player, bob = Math.round(Math.sin(time * 5));
      this.sprite(PLAYER_SPRITE, ship.x - ship.recoil, ship.y + bob);
      c.fillStyle = p.ink; c.fillRect(Math.round(ship.x) - 3 - (Math.floor(time * 10) % 2) * 3, Math.round(ship.y) + 4 + bob, 4, 3);
      c.fillStyle = p.mid; c.fillRect(Math.round(ship.x) - 8, Math.round(ship.y) + 5 + bob, 3, 1);
    }
    world.particles.forEach(dot => { c.fillStyle = dot.life / dot.maxLife > 0.4 ? p.ink : p.mid; c.fillRect(Math.round(dot.x), Math.round(dot.y), dot.size, dot.size); });
    if (world.empRadius > 0) { c.strokeStyle = p.ink; c.lineWidth = 3; c.beginPath(); c.arc(world.player.x, world.player.y, world.empRadius, 0, Math.PI * 2); c.stroke(); c.lineWidth = 1; }
    c.restore();
    this.hud(world);
    if (world.flash > 0 && !this.reducedMotion) { c.fillStyle = p.ink; c.globalAlpha = 0.13; c.fillRect(0, 0, WIDTH, HEIGHT); c.globalAlpha = 1; }
  }

  private environment(time: number) {
    const c = this.ctx, p = PALETTES[this.mode];
    for (let layer = 0; layer < 2; layer++) {
      c.fillStyle = layer ? p.mid : p.faint;
      for (let i = 0; i < 42; i++) {
        const x = ((i * 83.17 + layer * 44 - time * (layer ? 9 : 3)) % WIDTH + WIDTH) % WIDTH;
        const y = 24 + (i * 37.71 + layer * 13) % 175;
        c.fillRect(Math.round(x), Math.round(y), i % 13 === 0 ? 2 : 1, 1);
        if (i % 17 === 0) c.fillRect(Math.round(x) + 1, Math.round(y) - 1, 1, 3);
      }
    }
    const planetX = 256 - (time * 1.6) % 490;
    c.fillStyle = p.faint;
    // Scanline-built planet keeps every silhouette on the physical pixel grid.
    for (let y = -29; y <= 29; y++) {
      const half = Math.floor(Math.sqrt(29 * 29 - y * y));
      c.fillRect(Math.round(planetX) - half, 65 + y, half * 2, 1);
      if (y % 4 === 0) { c.fillStyle = p.background; c.fillRect(Math.round(planetX) - half + 5, 65 + y, Math.max(0, half * 1.4), 1); c.fillStyle = p.faint; }
    }
    c.strokeStyle = p.faint; c.beginPath(); c.ellipse(planetX, 68, 45, 9, -0.32, 0, Math.PI * 2); c.stroke();
    const stationX = 480 - (time * 4) % 620;
    c.fillStyle = p.faint;
    c.fillRect(stationX, 115, 5, 33); c.fillRect(stationX - 20, 125, 45, 3);
    for (let i = 0; i < 4; i++) { c.fillRect(stationX - 21 + i * 5, 119, 3, 17); c.fillRect(stationX + 9 + i * 5, 119, 3, 17); }
    for (let i = 0; i < 51; i++) {
      const x = ((i * 8 - time * 13) % 408 + 408) % 408 - 12;
      const h = 3 + Math.sin(i * 1.6) * 2 + (i % 9 === 0 ? 6 : 0);
      c.fillStyle = p.faint; c.fillRect(Math.round(x), HEIGHT - 8 - h, 9, 8 + h);
      c.fillStyle = p.mid; c.fillRect(Math.round(x), HEIGHT - h * 0.6, 9, h);
    }
  }

  private hud(world: GameWorld) {
    const c = this.ctx, p = PALETTES[this.mode];
    c.fillStyle = p.background; c.fillRect(0, 0, WIDTH, 19);
    c.fillStyle = p.ink;
    for (let i = 0; i < 3; i++) {
      const x = 11 + i * 13;
      if (i < world.player.health) {
        c.fillRect(x, 7, 3, 3); c.fillRect(x + 5, 7, 3, 3); c.fillRect(x, 9, 8, 3); c.fillRect(x + 2, 12, 4, 2); c.fillRect(x + 3, 14, 2, 1);
      } else { c.strokeStyle = p.mid; c.strokeRect(x + 1, 8, 6, 5); }
    }
    this.text(String(world.score).padStart(6, '0'), WIDTH / 2, 7, 8, 'center');
    this.text('STAGE 01', WIDTH - 11, 8, 7, 'right');
    c.fillStyle = p.mid; c.fillRect(10, 20, WIDTH - 20, 1);
    if (world.boss && !['winning','victory'].includes(world.status)) {
      c.fillStyle = p.ink; this.text('THE MACHINE', WIDTH / 2, 28, 6, 'center');
      c.strokeStyle = p.ink; c.strokeRect(134, 37, 116, 4);
      c.fillRect(135, 38, 114 * world.boss.cores.reduce((a, b) => a + b, 0) / 80, 2);
    } else if (world.elapsed >= BOSS_WARNING && world.elapsed < BOSS_ARRIVAL && world.status !== 'demo') {
      c.fillStyle = p.background; c.fillRect(73, 77, 238, 54); c.fillStyle = p.ink;
      this.text('!! SIGNAL DETECTED !!', WIDTH / 2, 85, 10, 'center');
      this.text('UNKNOWN MASS APPROACHING', WIDTH / 2, 106, 7, 'center');
    } else if (world.elapsed < 7 && world.status === 'playing') {
      c.fillStyle = p.ink; this.text('MISSION 001 / ORBITAL RUINS', WIDTH / 2, 74, 8, 'center');
      this.text('HOLD FIRE. KEEP MOVING.', WIDTH / 2, 89, 6, 'center');
    }
    if (world.combo >= 3) { c.fillStyle = p.ink; this.text(`${world.combo} CHAIN  x${Math.min(4, 1 + Math.floor(world.combo / 5))}`, WIDTH - 12, 189, 7, 'right'); }
    if (world.noticeTimer > 0) { c.fillStyle = p.background; c.fillRect(94, 176, 196, 13); c.fillStyle = p.ink; this.text(world.notice, WIDTH / 2, 180, 7, 'center'); }
  }
}
