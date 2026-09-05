'use client';
import { animate, createScope, onScroll } from 'animejs';
import { useEffect, useRef } from 'react';
import { LaunchButton } from '@/components/ui/LaunchButton';
import { readSettings } from '@/lib/storage';
export function ScoreSection() {
  const root = useRef<HTMLElement>(null), digits = useRef<HTMLOutputElement>(null);
  useEffect(() => {
    const scope = createScope({ root, mediaQueries: { reduceMotion: '(prefers-reduced-motion: reduce)' } });
    let counter: ReturnType<typeof animate> | null = null;
    scope.add(self => {
      const display = { score: 0 };
      self?.add('count', () => { counter?.cancel(); counter = animate(display, { score: readSettings().highScore, duration: self.matches.reduceMotion ? 1 : 1000, ease: 'outExpo', onUpdate: () => { if (digits.current) digits.current.textContent = String(Math.round(display.score)).padStart(6, '0'); } }); });
      onScroll({ target: root.current!, enter: 'bottom top', repeat: false, onEnter: () => self?.methods.count() });
    });
    const sync = () => scope.methods.count();
    window.addEventListener('impact-settings', sync); window.addEventListener('storage', sync);
    return () => { scope.revert(); window.removeEventListener('impact-settings', sync); window.removeEventListener('storage', sync); };
  }, []);
  return <section ref={root} className="score-section section-wrap" id="archive"><div className="section-kicker"><span>05 / PERSONAL ARCHIVE</span><span>STORED ON THIS DEVICE</span></div><div className="score-grid"><div><p className="eyebrow">YOUR HIGH SCORE</p><output ref={digits} className="high-score" aria-label="Your high score">000000</output><span className="score-note">THE ONLY RECORD THAT MATTERS IS YOURS.</span></div><div className="score-cta"><p>ONE MORE<br/><span>RUN?</span></p><LaunchButton>BEGIN AGAIN</LaunchButton></div></div></section>;
}
