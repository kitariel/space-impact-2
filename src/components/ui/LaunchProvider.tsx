'use client';
import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from 'react';
import { createScope, createTimeline } from 'animejs';
import { usePathname, useRouter } from 'next/navigation';
const LaunchContext = createContext<() => void>(() => {});
export const useLaunch = () => useContext(LaunchContext);

export function LaunchProvider({ children }: { children: ReactNode }) {
  const router = useRouter(), pathname = usePathname();
  const overlay = useRef<HTMLDivElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);
  const busy = useRef(false);
  useEffect(() => {
    scope.current = createScope({ root: overlay, mediaQueries: { reduceMotion: '(prefers-reduced-motion: reduce)' } }).add(self => {
      self?.add('enter', () => {
        const target = document.querySelector('[data-live-screen]');
        const rect = target?.getBoundingClientRect();
        const visible = rect && rect.bottom > 0 && rect.top < window.innerHeight;
        const inset = visible ? `${Math.max(0, rect.top)}px ${Math.max(0, window.innerWidth - rect.right)}px ${Math.max(0, window.innerHeight - rect.bottom)}px ${Math.max(0, rect.left)}px` : '44% 40% 44% 40%';
        if (self.matches.reduceMotion) { router.push('/play'); return; }
        createTimeline({ defaults: { ease: 'inOutExpo' }, onComplete: () => router.push('/play') })
          .add(overlay.current!, { opacity: [0, 1], clipPath: [`inset(${inset} round 5px)`, 'inset(0% round 0px)'], duration: 650 }, 0)
          .add('.transition-label', { opacity: [0, 1], y: [5, 0], duration: 200 }, 350)
          .add(overlay.current!, { backgroundColor: ['#84B18E', '#080A09'], color: ['#17281D', '#A8CFA4'], duration: 250 }, 470);
      });
    });
    router.prefetch('/play');
    return () => scope.current?.revert();
  }, [router]);
  useEffect(() => {
    busy.current = false;
    if (overlay.current) { overlay.current.style.opacity = '0'; overlay.current.style.pointerEvents = 'none'; }
  }, [pathname]);
  const launch = useCallback(() => {
    if (busy.current) return;
    if (pathname === '/play') { document.querySelector<HTMLButtonElement>('.lcd-button')?.focus(); return; }
    busy.current = true;
    if (overlay.current) overlay.current.style.pointerEvents = 'auto';
    if (scope.current) scope.current.methods.enter(); else router.push('/play');
  }, [pathname, router]);
  return <LaunchContext.Provider value={launch}>{children}<div ref={overlay} className="page-transition" aria-hidden="true"><span className="transition-label">IMPACT_01<br/><small>ESTABLISHING UPLINK</small></span></div></LaunchContext.Provider>;
}
