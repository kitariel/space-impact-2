import { phaseAt } from '@/game/systems/LevelSystem';
import type { GameSnapshot } from '@/game/types';
export function GameHUD({ snapshot }: { snapshot: GameSnapshot }) {
  return <div className="external-hud">
    <span><i className="status-dot"/> {phaseAt(snapshot.elapsed)}</span>
    <span className="weapon-label">{['SINGLE','DOUBLE','SPREAD'][snapshot.upgrade]} PLASMA</span>
    <span className="emp-meter">EMP <i><b style={{ transform: `scaleX(${snapshot.special})` }}/></i>{snapshot.special >= 1 ? 'READY' : `${Math.ceil((1 - snapshot.special) * 18)}S`}</span>
    <span className="sr-only">Score {snapshot.score}. {snapshot.health} shields remaining.</span>
  </div>;
}
