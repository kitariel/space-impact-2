import { animate, onScroll, svg, type Scope } from 'animejs';
export function sectionAnimation(scope: Scope, root: HTMLElement) {
  if (scope.matches.reduceMotion) return;
  root.querySelectorAll<HTMLElement>('.system-stat').forEach((element, index) => {
    animate(element.querySelector('.stat-number')!, { y: [28, 0], opacity: [0.3, 1], duration: 600, delay: index * 70, autoplay: onScroll({ target: element, enter: 'bottom-=50 top', repeat: false }) });
  });
  const assembly = root.querySelector('.assembly-stage');
  if (assembly) {
    root.querySelectorAll('.assembly-layer').forEach((layer, index) => {
      animate(layer, { y: [0, (index - 2) * 32], ease: 'linear', autoplay: onScroll({ target: assembly, enter: 'bottom top', leave: 'top bottom', sync: 0.5 }) });
    });
    animate(svg.createDrawable('.assembly-line'), { draw: ['0 0', '0 1'], duration: 1000, autoplay: onScroll({ target: assembly, enter: 'bottom-=100 top', repeat: false }) });
  }
  const orbit = root.querySelector('.mission-orbits');
  if (orbit) animate(orbit, { rotate: [-10, 9], ease: 'linear', autoplay: onScroll({ target: orbit, enter: 'bottom top', leave: 'top bottom', sync: 0.4 }) });
}
