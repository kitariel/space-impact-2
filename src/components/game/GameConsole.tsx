'use client';
import { useEffect, useRef, useState } from 'react';
import { Maximize2, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { GameEngine } from '@/game/engine/GameEngine';
import { HEIGHT, WIDTH } from '@/game/constants';
import type { DisplayMode, GameSnapshot } from '@/game/types';
import { DEFAULT_SETTINGS, readSettings, saveHighScore, saveSettings } from '@/lib/storage';
import { GameMenu } from './GameMenu';
import { GameHUD } from './GameHUD';
import { MobileControls } from './MobileControls';
import { ModeSelector } from './ModeSelector';
import { useLaunch } from '@/components/ui/LaunchProvider';
import { useGameViewport } from '@/hooks/useGameViewport';
import { OrientationPrompt } from './OrientationPrompt';

const INITIAL: GameSnapshot = { status: 'demo', score: 0, health: 3, elapsed: 37, special: 1, upgrade: 0, combo: 0, bossHealth: null, fps: 60 };
export function GameConsole({ compact = false }: { compact?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<GameEngine | null>(null);
  const [snapshot, setSnapshot] = useState(INITIAL);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [error, setError] = useState('');
  const [portraitAllowed, setPortraitAllowed] = useState(false);
  const viewport = useGameViewport();
  const needsRotation = !compact && viewport === 'touch-portrait' && !portraitAllowed;
  const launch = useLaunch();
  useEffect(() => {
    if (!canvas.current) return;
    const sync = () => { const next = readSettings(); setSettings(next); engine.current?.setDisplay(next.displayMode); if (engine.current) engine.current.audio.enabled = next.audioEnabled; };
    try {
      engine.current = new GameEngine(canvas.current, setSnapshot, score => { saveHighScore(score); });
      sync();
    } catch (cause) { queueMicrotask(() => setError(cause instanceof Error ? cause.message : 'Display unavailable.')); }
    window.addEventListener('impact-settings', sync); window.addEventListener('storage', sync);
    return () => { engine.current?.destroy(); engine.current = null; window.removeEventListener('impact-settings', sync); window.removeEventListener('storage', sync); };
  }, []);
  useEffect(() => {
    // Keep the current run and release held controls whenever orientation changes.
    // The player resumes explicitly once the screen is comfortable again.
    engine.current?.pause();
  }, [viewport]);
  useEffect(() => { engine.current?.setOrientationBlocked(needsRotation); }, [needsRotation]);
  const active = ['playing','dying','winning'].includes(snapshot.status);
  const menu = ['demo','paused','gameover','victory'].includes(snapshot.status);
  const setMode = (mode: DisplayMode) => { saveSettings({ displayMode: mode }); };
  const toggleAudio = () => { const enabled = !settings.audioEnabled; saveSettings({ audioEnabled: enabled }); engine.current?.setAudio(enabled); };
  const requestFullscreen = () => {
    if (!compact && !document.fullscreenElement) {
      const request = document.documentElement.requestFullscreen?.();
      if (request) void request.catch(() => undefined);
    }
  };
  const start = () => {
    requestFullscreen();
    if (compact && viewport !== 'desktop') { launch(); return; }
    engine.current?.start();
  };
  return <div className={`game-console ${compact ? 'is-compact' : 'is-full'} display-${settings.displayMode}`} data-game-status={snapshot.status}>
    {needsRotation && <OrientationPrompt paused={snapshot.status === 'paused'} onContinue={() => setPortraitAllowed(true)} />}
    <div className="console-stage" hidden={needsRotation}>
    {!compact && <div className="flight-topbar"><span className="flight-model">I—01 <span>FLIGHT TERMINAL</span></span><div className="flight-actions"><button onClick={toggleAudio} aria-label={settings.audioEnabled ? 'Mute audio' : 'Enable audio'} aria-pressed={settings.audioEnabled}>{settings.audioEnabled ? <Volume2 size={15}/> : <VolumeX size={15}/>}<span>AUDIO {settings.audioEnabled ? 'ON' : 'OFF'}</span></button><button onClick={() => engine.current?.togglePause()} disabled={!['playing','paused'].includes(snapshot.status)} aria-label={snapshot.status === 'paused' ? 'Resume game' : 'Pause game'}>{snapshot.status === 'paused' ? <Play size={15}/> : <Pause size={15}/>}<span>{snapshot.status === 'paused' ? 'RESUME' : 'PAUSE'}</span></button></div></div>}
    <div className="lcd-bezel">
      <div className="lcd-screen" data-live-screen>
        <canvas ref={canvas} width={WIDTH} height={HEIGHT} tabIndex={0} aria-label="IMPACT 01 game. Arrow keys or W A S D to move, hold Space to fire, X or Shift for EMP, Escape to pause." onPointerDown={() => { if (active) canvas.current?.focus({ preventScroll: true }); }}>Your browser needs Canvas support to play IMPACT_01.</canvas>
        <span className="lcd-surface" aria-hidden="true"/>
        {error ? <div className="game-menu"><h2>DISPLAY OFFLINE</h2><p>{error}</p></div> : menu && !needsRotation && <GameMenu key={snapshot.status} compact={compact} snapshot={snapshot} best={settings.highScore} onStart={start} onResume={() => engine.current?.resume()} onExit={() => engine.current?.attract()}/>}
      </div>
    </div>
    {compact ? <div className="preview-toolbar"><span><i className="status-dot"/>{snapshot.status === 'demo' ? 'AUTOPILOT ENGAGED' : snapshot.status === 'paused' ? 'FLIGHT PAUSED' : 'MANUAL CONTROL'}</span><div><button aria-label={settings.audioEnabled ? 'Mute audio' : 'Enable audio'} onClick={toggleAudio}>{settings.audioEnabled ? <Volume2 size={13}/> : <VolumeX size={13}/>}</button>{snapshot.status !== 'demo' && <button aria-label={snapshot.status === 'paused' ? 'Resume preview' : 'Pause preview'} onClick={() => engine.current?.togglePause()}>{snapshot.status === 'paused' ? <Play size={13}/> : <Pause size={13}/>}</button>}<button aria-label="Enter full-screen mission" onClick={launch}><Maximize2 size={13}/></button></div></div> : <GameHUD snapshot={snapshot}/>}
    {!compact && <MobileControls enabled={snapshot.status === 'playing'} ready={snapshot.special >= 1} onInput={(action, pressed) => engine.current?.input.setTouch(action, pressed)}/>}
    {!compact && <div className="flight-bottom"><ModeSelector mode={settings.displayMode} onChange={setMode}/><span className="frame-status"><i className="status-dot"/>{snapshot.status === 'demo' ? 'STANDBY' : snapshot.status.toUpperCase()}<span>FRAME {snapshot.fps}</span></span></div>}
    {compact && active && <p className="preview-help">WASD / ARROWS · SPACE TO FIRE · X FOR EMP · ESC TO PAUSE</p>}
    </div>
  </div>;
}
