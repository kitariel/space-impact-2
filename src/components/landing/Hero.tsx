'use client';
import { ArrowDown, ArrowDownRight } from 'lucide-react';
import { useAnimeScope } from '@/hooks/useAnimeScope';
import { heroAnimation } from '@/lib/animations/hero';
import { LaunchButton } from '@/components/ui/LaunchButton';
import { HeroDevice } from './HeroDevice';

export function Hero() {
  const root = useAnimeScope<HTMLElement>(heroAnimation);
  return <section ref={root} className="hero" id="game" aria-labelledby="hero-heading">
    <div className="boot-overlay" aria-hidden="true"><span>IMPACT SYSTEMS</span><div className="boot-matrix">{Array.from({ length: 16 }, (_, i) => <i className="boot-cell" key={i}/>)}</div><small>INITIALIZING CORE</small><div className="boot-track"><i className="boot-progress"/></div></div>
    <div className="hero-stars" aria-hidden="true">{Array.from({ length: 29 }, (_, i) => <i className="hero-star" key={i} style={{ left: `${(i * 31.31) % 100}%`, top: `${(i * 47.83) % 100}%`, width: i % 6 === 0 ? 3 : 1, height: i % 6 === 0 ? 3 : 1 }}/>)}</div>
    <div className="hero-orbit" aria-hidden="true"><svg className="orbit-path" viewBox="0 0 1000 700"><ellipse className="hero-orbit-line" cx="500" cy="350" rx="480" ry="235" transform="rotate(-24 500 350)"/><ellipse cx="500" cy="350" rx="470" ry="330" transform="rotate(-24 500 350)" strokeDasharray="1 12"/><circle cx="85" cy="420" r="4"/><path d="M490 350h20m-10-10v20"/></svg></div>
    <div className="hero-inner">
      <div className="hero-meta"><span><i className="status-dot"/> SYSTEM ONLINE</span><span>INDEPENDENT ARCADE / EST. 2026</span></div>
      <div className="hero-title-block"><p className="eyebrow hero-meta">NO MAP. NO BACKUP. JUST YOU.</p><h1 id="hero-heading"><span className="headline-line"><span>SURVIVE</span></span><span className="headline-line"><span>THE <em>VOID.</em></span></span></h1></div>
      <HeroDevice/>
      <div className="hero-bottom-copy"><p>An old-school heartbeat.<br/>A whole new machine.</p><LaunchButton/><span className="hero-cta-note">FREE TO PLAY. BUILT TO FEEL.</span></div>
      <div className="hero-annotation annotation-top"><span>FLIGHT TERMINAL</span><b>MODEL I—01</b><i/></div>
      <div className="hero-annotation annotation-right"><span>384 × 216 PX</span><span>PURE MONOCHROME</span><ArrowDownRight size={17}/></div>
      <div className="hero-annotation annotation-bottom"><span className="crosshair-mark">+</span><span>LAT 41.003<br/>LON 00.421</span></div>
      <div className="hero-footer"><a href="#system"><span className="scroll-icon"><ArrowDown size={14}/></span>SCROLL TO EXPLORE</a><span className="hero-footer-center">THE FUTURE HAS A FAMILIAR FEELING.</span><span>001 — 006</span></div>
    </div>
  </section>;
}
