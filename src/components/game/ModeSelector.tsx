'use client';
import { animate, createScope, spring } from 'animejs';
import { useEffect, useRef } from 'react';
import type { DisplayMode } from '@/game/types';
const MODES: { id: DisplayMode; label: string }[] = [{ id: 'classic', label: 'CLASSIC' }, { id: 'phosphor', label: 'PHOSPHOR' }, { id: 'terminal', label: 'DARK TERMINAL' }];
export function ModeSelector({ mode, onChange }: { mode: DisplayMode; onChange: (mode: DisplayMode) => void }) {
  const root = useRef<HTMLDivElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);
  useEffect(() => {
    scope.current = createScope({ root, mediaQueries: { reduceMotion: '(prefers-reduced-motion: reduce)' } }).add(self => {
      self?.add('select', (index: number) => { animate('.mode-indicator', { x: `${index * 100}%`, duration: self.matches.reduceMotion ? 1 : 350, ease: spring({ bounce: 0.12, duration: 350 }) }); });
    });
    return () => scope.current?.revert();
  }, []);
  useEffect(() => { scope.current?.methods.select(MODES.findIndex(m => m.id === mode)); }, [mode]);
  return <div ref={root} className="mode-selector" role="group" aria-label="LCD display mode"><span className="mode-indicator" aria-hidden="true"/>{MODES.map(m => <button key={m.id} aria-pressed={mode === m.id} onClick={() => onChange(m.id)}>{m.label}</button>)}</div>;
}
