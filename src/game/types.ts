export type DisplayMode = 'classic' | 'phosphor' | 'terminal';
export type GameStatus = 'demo' | 'playing' | 'paused' | 'dying' | 'gameover' | 'winning' | 'victory';
export type EnemyKind = 'scout' | 'sine' | 'turret' | 'hunter' | 'heavy' | 'asteroid';
export type SoundKind = 'shot' | 'hit' | 'explosion' | 'special' | 'warning' | 'pickup' | 'victory';
export interface Vec2 { x: number; y: number }
export interface Rect extends Vec2 { w: number; h: number }
export interface InputState { x: number; y: number; fire: boolean; special: boolean }
export interface Player extends Rect { health: number; invincible: number; cooldown: number; recoil: number; upgrade: number }
export interface Enemy extends Rect { id: number; kind: EnemyKind; hp: number; maxHp: number; speed: number; originY: number; age: number; cooldown: number; flash: number }
export interface Projectile extends Rect { vx: number; vy: number; hostile: boolean; alive: boolean }
export interface Particle extends Vec2 { vx: number; vy: number; life: number; maxLife: number; size: number }
export interface Pickup extends Rect { age: number }
export interface Boss extends Rect { age: number; cooldown: number; cores: number[]; flash: number }
export interface GameSnapshot { status: GameStatus; score: number; health: number; elapsed: number; special: number; upgrade: number; combo: number; bossHealth: number | null; fps: number }
export interface GameEvents { sound?: (kind: SoundKind, pitch?: number) => void; finish?: (score: number) => void }
export const EMPTY_INPUT: InputState = { x: 0, y: 0, fire: false, special: false };
