'use client';
import { ArrowUpRight } from 'lucide-react';
import { useLaunch } from './LaunchProvider';
export function LaunchButton({ children = 'START MISSION', className = '', small = false }: { children?: React.ReactNode; className?: string; small?: boolean }) {
  const launch = useLaunch();
  return <button type="button" onClick={launch} className={`launch-button ${small ? 'is-small' : ''} ${className}`}><span className="button-bracket bracket-one"/><span className="button-bracket bracket-two"/><span>{children}</span><ArrowUpRight size={small ? 15 : 19}/></button>;
}
