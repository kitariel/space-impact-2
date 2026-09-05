import type { DisplayMode } from '@/game/types';
export interface Settings { highScore: number; audioEnabled: boolean; displayMode: DisplayMode; hasSeenIntro: boolean }
export const STORAGE_KEY = 'impact_01_settings';
export const DEFAULT_SETTINGS: Settings = { highScore: 0, audioEnabled: false, displayMode: 'classic', hasSeenIntro: false };
let fallback: Settings = { ...DEFAULT_SETTINGS };
export function readSettings(): Settings {
  if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS };
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!value || typeof value !== 'object') return fallback;
    const data = value as Partial<Settings>;
    fallback = {
      highScore: typeof data.highScore === 'number' && Number.isFinite(data.highScore) ? Math.max(0, Math.floor(data.highScore)) : 0,
      audioEnabled: data.audioEnabled === true,
      displayMode: data.displayMode && ['classic','phosphor','terminal'].includes(data.displayMode) ? data.displayMode : 'classic',
      hasSeenIntro: data.hasSeenIntro === true,
    };
  } catch { /* Private browsing / blocked storage still supports play. */ }
  return fallback;
}
export function saveSettings(patch: Partial<Settings>) {
  fallback = { ...readSettings(), ...patch };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback)); } catch {}
  window.dispatchEvent(new Event('impact-settings'));
  return fallback;
}
export function saveHighScore(score: number) { return saveSettings({ highScore: Math.max(readSettings().highScore, score) }); }
