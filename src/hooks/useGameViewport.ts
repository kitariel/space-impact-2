'use client';

import { useSyncExternalStore } from 'react';

type GameViewport = 'desktop' | 'touch-portrait' | 'touch-landscape';

const TOUCH_QUERY = '(any-pointer: coarse)';
const PORTRAIT_QUERY = '(orientation: portrait)';

function subscribe(onChange: () => void) {
  const queries = [window.matchMedia(TOUCH_QUERY), window.matchMedia(PORTRAIT_QUERY)];
  queries.forEach(query => query.addEventListener('change', onChange));
  return () => queries.forEach(query => query.removeEventListener('change', onChange));
}

function getSnapshot(): GameViewport {
  if (!window.matchMedia(TOUCH_QUERY).matches) return 'desktop';
  return window.matchMedia(PORTRAIT_QUERY).matches ? 'touch-portrait' : 'touch-landscape';
}

// A stable server snapshot avoids reading browser APIs during prerendering.
const getServerSnapshot = (): GameViewport => 'desktop';

export function useGameViewport() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
