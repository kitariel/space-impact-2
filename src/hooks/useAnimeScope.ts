'use client';
import { createScope, type Scope } from 'animejs';
import { useEffect, useRef } from 'react';

/** Setup functions are stable module functions; every animation is reverted on unmount. */
export function useAnimeScope<T extends HTMLElement>(setup: (scope: Scope, root: T) => void) {
  const root = useRef<T>(null);
  useEffect(() => {
    if (!root.current) return;
    const element = root.current;
    const scope = createScope({ root: element, mediaQueries: { reduceMotion: '(prefers-reduced-motion: reduce)' } });
    scope.add(self => { if (self) setup(self, element); });
    return () => scope.revert();
  }, [setup]);
  return root;
}
