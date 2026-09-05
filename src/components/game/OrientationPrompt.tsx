'use client';

import { ArrowRight, RotateCw, Smartphone } from 'lucide-react';
import { useId } from 'react';

export function OrientationPrompt({ paused, onContinue }: { paused: boolean; onContinue: () => void }) {
  const titleId = useId();

  return (
    <section className="orientation-prompt" aria-labelledby={titleId}>
      <div className="orientation-illustration" aria-hidden="true">
        <Smartphone className="orientation-phone" size={62} strokeWidth={1.2} />
        <RotateCw className="orientation-arrow" size={24} strokeWidth={1.2} />
      </div>
      <span className="eyebrow">{paused ? 'FLIGHT PAUSED · YOUR RUN IS SAFE' : 'PREPARE FOR FLIGHT'}</span>
      <h2 id={titleId}>A WIDER VIEW.<br /><span>A BETTER FLIGHT.</span></h2>
      <p>Rotate your device to landscape for the best experience.</p>
      <span className="orientation-detail">More room to fly. Controls at your fingertips.</span>
      <button type="button" className="orientation-continue" onClick={onContinue}>
        {paused ? 'KEEP PLAYING IN PORTRAIT' : 'PLAY IN PORTRAIT'} <ArrowRight size={16} />
      </button>
      <small>If the screen stays upright, turn off rotation lock.</small>
    </section>
  );
}
