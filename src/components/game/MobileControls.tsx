'use client';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Crosshair, Zap } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';

export function MobileControls({ onInput, ready, enabled }: { onInput: (action: string, pressed: boolean) => void; ready: boolean; enabled: boolean }) {
  const heldPointers = useRef(new Map<string, Set<number>>());
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!enabled) {
      heldPointers.current.clear();
      root.current?.querySelectorAll<HTMLElement>('[data-held]').forEach(button => { delete button.dataset.held; });
    }
  }, [enabled]);
  const release = (action: string, pointerId: number, button: HTMLButtonElement) => {
    const pointers = heldPointers.current.get(action);
    pointers?.delete(pointerId);
    if (!pointers?.size) { onInput(action, false); delete button.dataset.held; }
  };
  const control = (action: string, label: string, icon: ReactNode, className: string) => (
    <button type="button" className={className} aria-label={label} disabled={!enabled}
      onPointerDown={event => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        const pointers = heldPointers.current.get(action) ?? new Set<number>();
        pointers.add(event.pointerId); heldPointers.current.set(action, pointers);
        event.currentTarget.dataset.held = 'true'; onInput(action, true);
      }}
      onPointerUp={event => release(action, event.pointerId, event.currentTarget)}
      onPointerCancel={event => release(action, event.pointerId, event.currentTarget)}
      onLostPointerCapture={event => release(action, event.pointerId, event.currentTarget)}
      onKeyDown={event => { if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); onInput(action, true); } }}
      onKeyUp={() => onInput(action, false)} onBlur={() => onInput(action, false)}>{icon}</button>
  );
  return <div ref={root} className="touch-controls" role="group" aria-label="Touch flight controls" data-enabled={enabled}>
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
