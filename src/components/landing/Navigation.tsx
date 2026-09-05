'use client';
import { useEffect, useRef } from 'react';
import { Brand } from '@/components/ui/Brand';
import { LaunchButton } from '@/components/ui/LaunchButton';
export function Navigation() {
  const nav = useRef<HTMLElement>(null);
  useEffect(() => {
    const update = () => nav.current?.classList.toggle('is-scrolled', window.scrollY > 35);
    window.addEventListener('scroll', update, { passive: true }); update();
    return () => window.removeEventListener('scroll', update);
  }, []);
  return <header ref={nav} className="site-nav"><a href="#main" className="skip-link">Skip to main content</a><div className="nav-inner"><Brand/><nav aria-label="Main navigation"><a href="#game">GAME</a><a href="#system">SYSTEM</a><a href="#missions">MISSIONS</a><a href="#about">ABOUT</a></nav><LaunchButton small>PLAY NOW</LaunchButton></div></header>;
}
