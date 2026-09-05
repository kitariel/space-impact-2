'use client';
import { animate, stagger } from 'animejs';
import { ArrowRight, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useAnimeScope } from '@/hooks/useAnimeScope';
import type { Scope } from 'animejs';
import type { GameSnapshot } from '@/game/types';

function menuMotion(scope: Scope) {
  animate('.menu-piece', { opacity: [0, 1], y: scope.matches.reduceMotion ? 0 : [9, 0], delay: stagger(45), duration: scope.matches.reduceMotion ? 1 : 380, ease: 'outExpo' });
}
export function GameMenu({ snapshot, best, compact, onStart, onResume, onExit }: { snapshot: GameSnapshot; best: number; compact: boolean; onStart: () => void; onResume: () => void; onExit: () => void }) {
  const root = useAnimeScope<HTMLDivElement>(menuMotion);
  const firstButton = useRef<HTMLButtonElement>(null);
  const status = snapshot.status, demo = status === 'demo', paused = status === 'paused', won = status === 'victory';
  useEffect(() => { if (!demo) firstButton.current?.focus({ preventScroll: true }); }, [demo, status]);
  if (demo && compact) return <button className="quick-play" onClick={onStart} aria-label="Click to pilot the live game preview"><CrosshairMini/><span>CLICK TO PILOT</span><span className="quick-live">LIVE DEMO</span></button>;
  return <div ref={root} className={`game-menu ${compact ? 'compact-menu' : ''}`} role="region" aria-label={paused ? 'Game paused' : demo ? 'Mission ready' : 'Mission result'}>
    <div className="menu-piece menu-eyebrow">{demo ? 'INTERSTELLAR DEFENSE SYSTEM' : paused ? 'FLIGHT CONTROLS ON HOLD' : won ? 'MISSION 001 / COMPLETE' : 'TRANSMISSION TERMINATED'}</div>
    <h2 className="menu-piece">{demo ? <>THE VOID<br/>IS WAITING.</> : paused ? 'SIGNAL PAUSED.' : won ? 'SIGNAL CLEARED.' : 'SIGNAL LOST.'}</h2>
    {demo ? <p className="menu-piece menu-description">Three shields. One ship. Make it count.</p> : !paused ? <div className="menu-piece result-scores"><span>SCORE<strong>{String(snapshot.score).padStart(6, '0')}</strong></span><span>PERSONAL BEST<strong>{String(best).padStart(6, '0')}</strong></span></div> : <p className="menu-piece menu-description">Take a breath. The signal can wait.</p>}
    <div className="menu-piece menu-actions">
      <button ref={firstButton} className="lcd-button" onClick={paused ? onResume : onStart}>{paused ? 'RESUME FLIGHT' : demo ? 'LAUNCH MISSION' : won ? 'RUN AGAIN' : 'RETRY MISSION'}{demo || paused ? <ArrowRight size={17}/> : <RotateCcw size={16}/>}</button>
      {!demo && (compact ? <button className="lcd-link" onClick={onExit}>EXIT PREVIEW</button> : <Link className="lcd-link" href="/">RETURN TO SYSTEM</Link>)}
    </div>
    {demo && !compact && <div className="menu-piece menu-bottom">001 — ORBITAL RUINS <span>EST. 03:00</span></div>}
  </div>;
}
function CrosshairMini() { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><path d="M6 1H1v5m9-5h5v5M1 10v5h5m9-5v5h-5M8 5v6M5 8h6"/></svg>; }
