'use client';
import { animate, onScroll, type Scope } from 'animejs';
import { ArrowUpRight } from 'lucide-react';
import { PLAYER_SPRITE } from '@/game/sprites/player';
import { ENEMY_SPRITES } from '@/game/sprites/enemies';
import { useAnimeScope } from '@/hooks/useAnimeScope';
import { useLaunch } from '@/components/ui/LaunchProvider';
function stripAnimation(scope: Scope, root: HTMLElement) {
  if (scope.matches.reduceMotion) return;
  animate('.strip-player', { x: [-40, 190], ease: 'linear', autoplay: onScroll({ target: root, enter: 'bottom top', leave: 'top bottom', sync: 0.4 }) });
  animate('.strip-enemy', { x: [45, -130], ease: 'linear', autoplay: onScroll({ target: root, enter: 'bottom top', leave: 'top bottom', sync: 0.4 }) });
}
function PixelShip({ sprite, className }: { sprite: readonly string[]; className: string }) {
  return <svg className={className} viewBox={`0 0 ${sprite[0].length} ${sprite.length}`} fill="currentColor" shapeRendering="crispEdges" aria-hidden="true">{sprite.flatMap((row, y) => [...row].map((pixel, x) => pixel === '1' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1"/> : null))}</svg>;
}
export function LiveStrip() {
  const root = useAnimeScope<HTMLElement>(stripAnimation), launch = useLaunch();
  return <section ref={root} className="live-strip" aria-label="Mission transmission"><div className="strip-top"><span>04 / LIVE TRANSMISSION</span><span>SECTOR 01 — ORBITAL RUINS</span><span>● RECEIVING</span></div><div className="strip-world"><span className="strip-planet"/><PixelShip sprite={PLAYER_SPRITE} className="strip-player"/><span className="strip-bullet bullet-1"/><span className="strip-bullet bullet-2"/><PixelShip sprite={ENEMY_SPRITES.scout} className="strip-enemy strip-enemy-one"/><PixelShip sprite={ENEMY_SPRITES.sine} className="strip-enemy strip-enemy-two"/><PixelShip sprite={ENEMY_SPRITES.heavy} className="strip-enemy strip-enemy-three"/><span className="strip-terrain"/><button onClick={launch}>THIS IS YOUR SIGNAL. <ArrowUpRight size={21}/></button></div></section>;
}
