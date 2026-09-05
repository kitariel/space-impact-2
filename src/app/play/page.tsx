import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpLeft } from 'lucide-react';
import { Brand } from '@/components/ui/Brand';
import { GameConsole } from '@/components/game/GameConsole';
export const metadata: Metadata = { title: 'Flight terminal — IMPACT_01' };
export default function PlayPage() {
  return <main className="play-page" id="main"><header className="play-header"><Brand/><span className="play-header-status"><i className="status-dot"/> SECURE FLIGHT CONNECTION</span><Link href="/" className="exit-link"><ArrowUpLeft size={16}/> EXIT</Link></header><div className="play-container"><div className="play-title"><span>MISSION 001</span><h1>ORBITAL RUINS</h1><span>SIGNAL / STABLE</span></div><GameConsole/><div className="keyboard-legend"><span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><i>/</i><span>ARROWS</span> MOVE</span><span><kbd className="wide-key">SPACE</kbd> FIRE</span><span><kbd>X</kbd><i>/</i><kbd>SHIFT</kbd> EMP</span><span><kbd>ESC</kbd> PAUSE</span></div><p className="touch-hint">Touch controls appear when your mission begins. Landscape gives you more room to fly.</p></div><footer className="play-footer"><span>INTERSTELLAR DEFENSE SYSTEM</span><span>NO MAP. NO BACKUP. JUST YOU.</span><span>REV. 01 / 2026</span></footer></main>;
}
