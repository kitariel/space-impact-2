'use client';
import { useRef } from 'react';
import { GameConsole } from '@/components/game/GameConsole';
export function HeroDevice() {
  const tilt = useRef<HTMLDivElement>(null);
  return <div className="device-entrance"><div className="device-float"><div ref={tilt} className="device-tilt" onPointerMove={event => {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5, y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.setProperty('--tilt-x', `${-y * 4}deg`); event.currentTarget.style.setProperty('--tilt-y', `${x * 4}deg`);
    event.currentTarget.style.setProperty('--light-x', `${(x + 0.5) * 100}%`);
  }} onPointerLeave={() => { tilt.current?.style.setProperty('--tilt-x', '0deg'); tilt.current?.style.setProperty('--tilt-y', '0deg'); }}>
    <div className="hero-device"><span className="screw screw-tl"/><span className="screw screw-tr"/><span className="screw screw-bl"/><span className="screw screw-br"/>
      <div className="device-top"><span className="device-wordmark">IMPACT <b>SYSTEMS</b></span><div className="device-top-right"><i className="status-dot"/><span>ONLINE</span><span className="device-model">I—01</span></div></div>
      <div className="device-display"><GameConsole compact/></div>
      <div className="device-bottom"><span className="device-designation">INTERSTELLAR DEFENSE SYSTEM<br/><small>PORTABLE FLIGHT TERMINAL / REV. 01</small></span><div className="speaker" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <i key={i}/>)}</div><div className="device-seal">01<span>ISSUE</span></div></div>
      <div className="device-edge"/>
    </div>
  </div></div></div>;
}
