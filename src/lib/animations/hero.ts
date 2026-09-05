import { animate, createTimeline, stagger, svg, type Scope } from 'animejs';
import { readSettings, saveSettings } from '@/lib/storage';
export function heroAnimation(scope: Scope, root: HTMLElement) {
  const reduced = scope.matches.reduceMotion;
  const intro = root.querySelector<HTMLElement>('.boot-overlay');
  const seen = readSettings().hasSeenIntro;
  if (intro) {
    if (seen || reduced) intro.style.display = 'none';
    else {
      createTimeline().add('.boot-cell', { opacity: [0.15, 1], delay: stagger(32), duration: 120 }, 0)
        .add('.boot-progress', { scaleX: [0, 1], duration: 650, ease: 'inOutQuad' }, 0)
        .add(intro, { opacity: [1, 0], duration: 220, onComplete: () => { intro.style.display = 'none'; } }, 720);
      saveSettings({ hasSeenIntro: true });
    }
  }
  if (reduced) return;
  const delay = seen ? 0 : 300;
  createTimeline({ defaults: { ease: 'outExpo' } })
    .add('.hero-star', { opacity: [0, 1], scale: [0.3, 1], delay: stagger(16), duration: 500 }, delay)
    .add('.hero-meta', { opacity: [0, 1], y: [8, 0], duration: 650 }, delay + 80)
    .add('.headline-line span', { y: ['108%', '0%'], rotate: [3, 0], duration: 950, delay: stagger(95) }, delay + 150)
    .add('.device-entrance', { opacity: [0, 1], scale: [0.88, 1], y: [95, 0], duration: 1100 }, delay + 260)
    .add('.hero-bottom-copy', { opacity: [0, 1], y: [12, 0], duration: 600 }, delay + 510)
    .add('.hero-annotation', { opacity: [0, 1], delay: stagger(70), duration: 700 }, delay + 700);
  animate('.device-float', { y: [-5, 5], duration: 6400, alternate: true, loop: true, ease: 'inOutSine' });
  animate('.orbit-path', { rotate: [0, 360], duration: 180000, loop: true, ease: 'linear' });
  animate('.hero-star', { y: [-4, 6], opacity: [0.2, 0.75], duration: 5800, delay: stagger(190), alternate: true, loop: true, ease: 'inOutSine' });
  animate(svg.createDrawable('.hero-orbit-line'), { draw: ['0 0', '0 1'], duration: 2200, ease: 'inOutQuad', delay: 200 });
}
