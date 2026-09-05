import { BOSS_ARRIVAL, BOSS_WARNING, EMP_COOLDOWN, FIRE_INTERVAL, HEIGHT, PLAYER_SPEED, WIDTH } from '../constants';
import type { Boss, Enemy, EnemyKind, GameEvents, GameSnapshot, GameStatus, InputState, Particle, Pickup, Player, Projectile, Rect } from '../types';
import { ENEMY_SPRITES } from '../sprites/enemies';
import { waveAt } from '../systems/LevelSystem';
import { clamp, overlaps } from './Collision';

const HEALTH: Record<EnemyKind, number> = { scout: 1, sine: 2, hunter: 2, turret: 4, heavy: 7, asteroid: 4 };
const SPEED: Record<EnemyKind, number> = { scout: 55, sine: 38, hunter: 34, turret: 20, heavy: 18, asteroid: 29 };
const VALUE: Record<EnemyKind, number> = { scout: 100, sine: 150, hunter: 200, turret: 250, heavy: 400, asteroid: 75 };

/** Pure fixed-step simulation. No DOM, rendering, storage, or React dependencies. */
export class GameWorld {
  player!: Player;
  enemies: Enemy[] = [];
  projectiles: Projectile[] = [];
  particles: Particle[] = [];
  pickups: Pickup[] = [];
  boss: Boss | null = null;
  status: GameStatus = 'demo';
  elapsed = 0;
  visualTime = 0;
  score = 0;
  combo = 0;
  comboTimer = 0;
  specialCooldown = 0;
  empRadius = 0;
  shake = 0;
  flash = 0;
  freeze = 0;
  endTimer = 0;
  notice = '';
  noticeTimer = 0;
  private seed = 421;
  private spawnTimer = 1;
  private pickupTimer = 32;
  private serial = 0;
  private kills = 0;
  private warned = false;
  private demo = true;

  constructor(private events: GameEvents = {}) { this.reset(true); }

  random() {
    this.seed = (1664525 * this.seed + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }

  reset(demo = false) {
    this.demo = demo;
    this.seed = 421;
    this.status = demo ? 'demo' : 'playing';
    this.player = { x: 39, y: 104, w: 19, h: 11, health: 3, invincible: 0, cooldown: 0, recoil: 0, upgrade: 0 };
    this.enemies = []; this.projectiles = []; this.particles = []; this.pickups = []; this.boss = null;
    this.elapsed = demo ? 37 : 0; this.visualTime = 0; this.score = 0; this.combo = 0;
    this.comboTimer = 0; this.specialCooldown = 0; this.empRadius = 0; this.shake = 0;
    this.flash = 0; this.freeze = 0; this.endTimer = 0; this.notice = ''; this.noticeTimer = 0;
    this.spawnTimer = demo ? 0.4 : 10; this.pickupTimer = 32; this.serial = 0; this.kills = 0; this.warned = false;
    if (demo) {
      this.spawn('scout', 240, 75); this.spawn('sine', 285, 120); this.spawn('heavy', 335, 88);
    }
  }

  pause() { if (this.status === 'playing') this.status = 'paused'; }
  resume() { if (this.status === 'paused') this.status = 'playing'; }

  spawn(kind: EnemyKind, x = WIDTH + 20, y = 32 + this.random() * 143) {
    const sprite = ENEMY_SPRITES[kind];
    this.enemies.push({ id: ++this.serial, kind, x, y, w: sprite[0].length, h: sprite.length, hp: HEALTH[kind], maxHp: HEALTH[kind], speed: SPEED[kind], originY: y, age: 0, cooldown: 1.3 + this.random(), flash: 0 });
  }

  burst(x: number, y: number, count = 12, strength = 1) {
    for (let i = 0; i < count; i++) {
      const angle = this.random() * Math.PI * 2, speed = (15 + this.random() * 45) * strength;
      const life = 0.22 + this.random() * 0.5;
      this.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life, maxLife: life, size: this.random() > 0.8 ? 2 : 1 });
    }
  }

  private sound(kind: Parameters<NonNullable<GameEvents['sound']>>[0], pitch = 1) {
    if (!this.demo) this.events.sound?.(kind, pitch);
  }

  private shoot() {
    const p = this.player;
    const offsets = p.upgrade === 0 ? [0] : p.upgrade === 1 ? [-3, 3] : [-5, 0, 5];
    offsets.forEach(offset => this.projectiles.push({ x: p.x + p.w - 1, y: p.y + 5 + offset, w: 6, h: 2, vx: 228, vy: p.upgrade === 2 ? offset * 4 : 0, hostile: false, alive: true }));
    p.cooldown = FIRE_INTERVAL; p.recoil = 1;
    this.sound('shot');
  }

  special() {
    if (this.specialCooldown > 0 || this.status !== 'playing') return;
    this.specialCooldown = EMP_COOLDOWN; this.empRadius = 1; this.flash = 0.09; this.shake = 0.18; this.freeze = 0.04;
    this.projectiles = this.projectiles.filter(p => !p.hostile);
    this.enemies.forEach(e => { e.hp -= 6; e.flash = 0.15; });
    if (this.boss) this.boss.cores = this.boss.cores.map(hp => Math.max(0, hp - 8));
    this.sound('special');
  }

  damage() {
    if (this.demo || this.player.invincible > 0 || this.status !== 'playing') return;
    this.player.health--; this.player.invincible = 2.5; this.combo = 0;
    this.shake = 0.18; this.flash = 0.065; this.sound('hit');
    this.burst(this.player.x + 8, this.player.y + 5, 18);
    if (this.player.health <= 0) { this.status = 'dying'; this.endTimer = 0; this.burst(this.player.x + 9, this.player.y + 5, 38, 1.4); this.sound('explosion'); }
  }

  bossCores(): Rect[] {
    if (!this.boss) return [];
    return this.boss.cores.map((_, i) => ({ x: this.boss!.x - 3, y: this.boss!.y + 8 + i * 28, w: 12, h: 13 }));
  }

  private kill(enemy: Enemy) {
    this.combo++; this.comboTimer = 3.2; this.kills++;
    this.score += VALUE[enemy.kind] * Math.min(4, 1 + Math.floor(this.combo / 5));
    this.burst(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, enemy.kind === 'heavy' ? 24 : 12);
    this.sound('explosion', 1 + Math.min(this.combo, 10) * 0.04);
    if (this.kills % 14 === 0) this.pickups.push({ x: enemy.x, y: enemy.y, w: 8, h: 8, age: 0 });
    const upgrade = this.score >= 2800 ? 2 : this.score >= 800 ? 1 : 0;
    if (upgrade > this.player.upgrade) { this.player.upgrade = upgrade; this.notice = upgrade === 1 ? 'DOUBLE PLASMA ONLINE' : 'SPREAD PLASMA ONLINE'; this.noticeTimer = 2.5; this.sound('pickup'); }
  }

  update(dt: number, input: InputState) {
    if (this.status === 'paused' || this.status === 'gameover' || this.status === 'victory') return;
    this.visualTime += dt;
    this.flash = Math.max(0, this.flash - dt); this.shake = Math.max(0, this.shake - dt);
    this.noticeTimer = Math.max(0, this.noticeTimer - dt);
    this.particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; p.vy += 14 * dt; });
    this.particles = this.particles.filter(p => p.life > 0);
    if (this.freeze > 0) { this.freeze -= dt; return; }
    if (this.status === 'dying' || this.status === 'winning') {
      this.endTimer += dt;
      if (this.status === 'dying' && this.endTimer < 0.25) this.enemies.forEach(e => e.x -= e.speed * dt * 0.15);
      if (this.status === 'winning' && this.endTimer < 0.85 && Math.floor(this.endTimer * 60) % 5 === 0) this.burst(280 + this.random() * 60, 60 + this.random() * 90, 10);
      if (this.endTimer > (this.status === 'dying' ? 0.85 : 1.8)) {
        this.status = this.status === 'dying' ? 'gameover' : 'victory';
        this.events.finish?.(this.score);
      }
      return;
    }
    this.elapsed += dt;
    if (this.demo && this.elapsed > 125) { this.reset(true); return; }
    const p = this.player;
    p.invincible = Math.max(0, p.invincible - dt); p.cooldown -= dt; p.recoil = Math.max(0, p.recoil - dt * 12);
    this.specialCooldown = Math.max(0, this.specialCooldown - dt);
    if (this.empRadius) { this.empRadius += dt * 620; if (this.empRadius > WIDTH * 1.4) this.empRadius = 0; }
    this.comboTimer -= dt; if (this.comboTimer <= 0) this.combo = 0;
    if (this.demo) {
      p.y = 101 + Math.sin(this.visualTime * 0.65) * 35;
      p.x = 42 + Math.sin(this.visualTime * 0.3) * 7;
      if (p.cooldown <= 0) this.shoot();
    } else {
      const length = Math.max(1, Math.hypot(input.x, input.y));
      p.x = clamp(p.x + input.x / length * PLAYER_SPEED * dt, 6, WIDTH - p.w - 7);
      p.y = clamp(p.y + input.y / length * PLAYER_SPEED * dt, 25, HEIGHT - p.h - 15);
      if (input.fire && p.cooldown <= 0) this.shoot();
      if (input.special) this.special();
    }
    const wave = waveAt(this.elapsed);
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = wave.interval;
      if (wave.kinds.length) {
        this.spawn(wave.kinds[this.serial % wave.kinds.length]);
        if (this.elapsed > 30 && this.serial % 4 === 0) this.spawn('scout', WIDTH + 45, 48 + this.random() * 120);
      }
    }
    this.pickupTimer -= dt;
    if (this.pickupTimer <= 0 && this.elapsed < BOSS_WARNING) { this.pickupTimer = 32; this.pickups.push({ x: WIDTH, y: 45 + this.random() * 125, w: 8, h: 8, age: 0 }); }
    if (this.elapsed >= BOSS_WARNING && !this.warned && !this.demo) { this.warned = true; this.sound('warning'); }
    if (this.elapsed >= BOSS_ARRIVAL && !this.boss && !this.demo) {
      this.boss = { x: WIDTH + 30, y: 62, w: 65, h: 91, age: 0, cooldown: 1.5, cores: [24, 32, 24], flash: 0 };
      this.sound('warning');
    }
    this.enemies.forEach(e => {
      e.age += dt; e.x -= e.speed * dt; e.cooldown -= dt; e.flash = Math.max(0, e.flash - dt);
      if (e.kind === 'sine') e.y = clamp(e.originY + Math.sin(e.age * 3) * 25, 26, HEIGHT - 28);
      if (e.kind === 'hunter') e.y += clamp(p.y - e.y, -26 * dt, 26 * dt);
      if (['turret', 'heavy'].includes(e.kind) && e.cooldown <= 0 && e.x < WIDTH - 10 && e.x > p.x + 15) {
        e.cooldown = e.kind === 'heavy' ? 2.4 : 2;
        this.enemyShot(e.x, e.y + e.h / 2, 65);
      }
      if (e.hp > 0 && overlaps(p, e, 3)) { this.damage(); e.hp = 0; }
    });
    this.updateBoss(dt);
    this.projectiles.forEach(shot => {
      shot.x += shot.vx * dt; shot.y += shot.vy * dt;
      if (!shot.alive) return;
      if (shot.hostile) {
        if (overlaps(p, shot, 3)) { shot.alive = false; this.damage(); }
      } else {
        const hit = this.enemies.find(e => e.hp > 0 && overlaps(shot, e));
        if (hit) { hit.hp--; hit.flash = 0.08; shot.alive = false; this.burst(shot.x, shot.y, 3, 0.4); }
        if (shot.alive && this.boss) {
          const cores = this.bossCores();
          const index = cores.findIndex((core, i) => this.boss!.cores[i] > 0 && overlaps(shot, core));
          if (index !== -1) { this.boss.cores[index]--; this.boss.flash = 0.06; shot.alive = false; this.burst(shot.x, shot.y, 4); this.score += 20; }
          else if (overlaps(shot, this.boss)) { shot.alive = false; this.burst(shot.x, shot.y, 2, 0.4); }
        }
      }
    });
    this.enemies.filter(e => e.hp <= 0).forEach(e => this.kill(e));
    this.enemies = this.enemies.filter(e => e.hp > 0 && e.x + e.w > -10);
    this.projectiles = this.projectiles.filter(s => s.alive && s.x > -12 && s.x < WIDTH + 12 && s.y > 18 && s.y < HEIGHT);
    this.pickups.forEach(item => {
      item.x -= 26 * dt; item.age += dt;
      if (overlaps(p, item)) { p.health = Math.min(3, p.health + 1); this.score += 100; this.specialCooldown = Math.max(0, this.specialCooldown - 5); item.x = -30; this.sound('pickup'); this.notice = 'SHIELD CELL COLLECTED'; this.noticeTimer = 1.8; }
    });
    this.pickups = this.pickups.filter(p => p.x > -15);
    if (this.boss && this.boss.cores.every(hp => hp <= 0) && this.status === 'playing') {
      this.score += 5000; this.status = 'winning'; this.endTimer = 0; this.projectiles = []; this.enemies = [];
      this.burst(this.boss.x + 25, this.boss.y + 40, 80, 1.6); this.shake = 0.3; this.flash = 0.1;
      this.sound('victory');
    }
  }

  private enemyShot(x: number, y: number, speed: number, offset = 0) {
    const angle = Math.atan2(this.player.y + 5 - y, this.player.x + 8 - x) + offset;
    this.projectiles.push({ x, y, w: 3, h: 3, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, hostile: true, alive: true });
  }

  private updateBoss(dt: number) {
    const b = this.boss; if (!b) return;
    b.age += dt; b.flash = Math.max(0, b.flash - dt); b.cooldown -= dt;
    b.x = Math.max(WIDTH - 79, b.x - 24 * dt);
    b.y = 63 + Math.sin(b.age * 0.65) * 25;
    if (b.cooldown <= 0 && b.x < WIDTH - 65) {
      b.cooldown = 1.5;
      this.bossCores().forEach((core, i) => { if (b.cores[i] > 0) this.enemyShot(core.x, core.y + 6, 60, (i - 1) * 0.09); });
    }
    if (overlaps(this.player, b, 3)) this.damage();
  }

  snapshot(fps = 60): GameSnapshot {
    return { status: this.status, score: this.score, health: this.player.health, elapsed: this.elapsed, special: 1 - this.specialCooldown / EMP_COOLDOWN, upgrade: this.player.upgrade, combo: this.combo, bossHealth: this.boss ? this.boss.cores.reduce((a, b) => a + b, 0) / 80 : null, fps };
  }
}
