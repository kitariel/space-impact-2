import type { EnemyKind } from '../types';
export function waveAt(time: number): { kinds: EnemyKind[]; interval: number } {
  if (time < 10) return { kinds: [], interval: 1 };
  if (time < 30) return { kinds: ['scout'], interval: 2.2 };
  if (time < 50) return { kinds: ['scout', 'sine', 'scout'], interval: 1.4 };
  if (time < 75) return { kinds: ['asteroid', 'sine', 'scout'], interval: 1.15 };
  if (time < 105) return { kinds: ['turret', 'hunter', 'scout', 'asteroid'], interval: 1.2 };
  if (time < 130) return { kinds: ['heavy', 'hunter', 'sine', 'turret', 'scout'], interval: 0.95 };
  return { kinds: [], interval: 1 };
}
export function phaseAt(time: number): string {
  if (time < 10) return 'CROSSING THE SILENCE';
  if (time < 50) return 'ORBITAL RUINS';
  if (time < 75) return 'DEBRIS FIELD';
  if (time < 105) return 'HOSTILE FREQUENCY';
  if (time < 130) return 'THE LAST PERIMETER';
  return 'UNKNOWN MASS';
}
