'use client';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Crosshair, Zap } from 'lucide-react';
import type { ReactNode } from 'react';

export function MobileControls({ onInput, ready }: { onInput: (action: string, pressed: boolean) => void; ready: boolean }) {
  const control = (action: string, label: string, icon: ReactNode, className: string) => (
    <button type="button" className={className} aria-label={label}
      onPointerDown={event => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); onInput(action, true); }}
      onPointerUp={() => onInput(action, false)} onPointerCancel={() => onInput(action, false)} onLostPointerCapture={() => onInput(action, false)}
      onKeyDown={event => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); onInput(action, true); } }}
      onKeyUp={() => onInput(action, false)} onBlur={() => onInput(action, false)}>{icon}</button>
  );
  return <div className="touch-controls" aria-label="Touch flight controls">
    <div className="dpad">
      {control('up', 'Move up', <ArrowUp size={18}/>, 'dpad-up')}
      {control('left', 'Move left', <ArrowLeft size={18}/>, 'dpad-left')}
      <span className="dpad-center" aria-hidden="true">+</span>
      {control('right', 'Move right', <ArrowRight size={18}/>, 'dpad-right')}
      {control('down', 'Move down', <ArrowDown size={18}/>, 'dpad-down')}
    </div>
    <div className="touch-actions">
      {control('special', ready ? 'Activate EMP' : 'EMP recharging', <><Zap size={18}/><span>{ready ? 'EMP' : 'CHARGING'}</span></>, 'touch-special')}
      {control('fire', 'Fire plasma', <><Crosshair size={23}/><span>FIRE</span></>, 'touch-fire')}
    </div>
  </div>;
}
