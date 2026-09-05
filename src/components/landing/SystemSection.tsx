'use client';
import { ArrowUpRight, Crosshair, Radio, ScanLine } from 'lucide-react';
import { useAnimeScope } from '@/hooks/useAnimeScope';
import { sectionAnimation } from '@/lib/animations/scroll';
const STATS = [
  { id: '01', name: 'INSTANT RESPONSE', value: 'ZERO', unit: 'HESITATION.', detail: 'You move. The machine listens.', icon: Radio },
  { id: '02', name: 'PIXEL PRECISION', value: '384', unit: 'BY 216.', detail: 'Every pixel has a purpose.', icon: ScanLine },
  { id: '03', name: 'PURE SURVIVAL', value: 'ONE', unit: 'MORE RUN.', detail: 'Simple to start. Hard to leave.', icon: Crosshair },
];
export function SystemSection() {
  const root = useAnimeScope<HTMLElement>(sectionAnimation);
  return <section ref={root} className="system-section section-wrap" id="system"><div className="section-kicker"><span>01 / THE SYSTEM</span><span>LESS NOISE. MORE INSTINCT.</span></div><div className="system-intro"><h2>A MACHINE BUILT<br/>FOR THE <span>LAST PILOT.</span></h2><div className="system-copy"><ArrowUpRight size={26}/><p>Nothing between you and the void.<br/>Just instinct, a few pixels,<br/>and the need to go again.</p></div></div><div className="system-stats">{STATS.map(stat => <article className="system-stat" key={stat.id}><div className="stat-top"><span>{stat.id} / {stat.name}</span><stat.icon size={17}/></div><p className="stat-number">{stat.value}<span>{stat.unit}</span></p><p className="stat-detail">{stat.detail}</p><span className="grid-plus" aria-hidden="true">+</span></article>)}</div></section>;
}
