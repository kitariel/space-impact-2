import type { Rect } from '../types';
export function overlaps(a: Rect, b: Rect, inset = 0): boolean {
  return a.x + inset < b.x + b.w && a.x + a.w - inset > b.x && a.y + inset < b.y + b.h && a.y + a.h - inset > b.y;
}
export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
