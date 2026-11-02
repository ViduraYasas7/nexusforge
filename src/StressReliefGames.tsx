import React, { useState, useEffect, useRef } from 'react';
import {
  Gamepad2,
  Crosshair,
  Car,
  Trophy,
  Play,
  RotateCcw,
  Zap,
  Sparkles,
  Volume2,
  VolumeX
} from 'lucide-react';

interface StressReliefGamesProps {
  isLight: boolean;
}

export const StressReliefGamesView: React.FC<StressReliefGamesProps> = ({ isLight }) => {
  const [activeGame, setActiveGame] = useState<'shooter' | 'racer'>('shooter');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const cardSurface = isLight
    ? 'bg-white border-slate-200 text-slate-900 shadow-sm'
    : 'bg-[#181b22] border-[#2a2f3d] text-white';

  return (
    <div className="space-y-5">
      {/* Top Arcade Header Banner */}
      <div
        className={`p-5 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
          isLight
            ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border-emerald-200 text-slate-900'
            : 'bg-gradient-to-r from-[#132226] via-[#181b26] to-[#1f192e] border-emerald-500/30 text-white'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-600 text-white flex items-center justify-center shadow-lg">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold tracking-tight">
                Developer Stress-Relief Break Arcade
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Novelty Wellness Hub
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              Take a 2-minute mental reset between coding sprints — blast production bugs or race on the neon highway.
            </p>
          </div>
        </div>

        {/* Game Switcher Pills */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveGame('shooter')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeGame === 'shooter'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : isLight
                ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                : 'bg-[#222631] border border-[#323846] text-zinc-300 hover:text-white'
            }`}
          >
            <Crosshair className="w-4 h-4" />
            <span>1. Cyber Bug Blaster (Shooter)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveGame('racer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeGame === 'racer'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : isLight
                ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                : 'bg-[#222631] border border-[#323846] text-zinc-300 hover:text-white'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>2. Nitro Sprint Racer (Car Racing)</span>
          </button>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title="Toggle Arcade Audio Effects"
            className={`p-2 rounded-xl border ${
              isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-[#222631] border-[#323846] text-zinc-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Active Game Container */}
      <div className={`p-5 rounded-2xl border ${cardSurface}`}>
        {activeGame === 'shooter' ? <CyberBugShooterGame /> : <NitroCarRacerGame />}
      </div>
    </div>
  );
};

// =========================================================
// GAME 1: CYBER BUG BLASTER (60FPS SPACE / BUG SHOOTER)
// =========================================================
const BUG_LABELS = ['404 Bug', 'NullPtr', 'RaceCond', 'MemLeak', 'CORS Err', 'Deadlock', 'TypeErr'];

const CyberBugShooterGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('nexusforge_shooter_high') || 1250);
  });
  const [wave, setWave] = useState(1);

  const stateRef = useRef({
    shipX: 360,
    keys: { left: false, right: false, shoot: false },
    bullets: [] as { x: number; y: number }[],
    enemies: [] as { x: number; y: number; speed: number; label: string; color: string; hp: number }[],
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
    lastShot: 0,
    lastSpawn: 0,
    score: 0,
    wave: 1,
    lives: 3
  });

  const startNewGame = () => {
    stateRef.current = {
      shipX: 360,
      keys: { left: false, right: false, shoot: false },
      bullets: [],
      enemies: [
        { x: 140, y: 60, speed: 1.1, label: '404 Bug', color: '#f43f5e', hp: 1 },
        { x: 340, y: 90, speed: 1.3, label: 'NullPtr', color: '#f59e0b', hp: 1 },
        { x: 540, y: 50, speed: 1.2, label: 'CORS Err', color: '#a855f7', hp: 1 }
      ],
      particles: [],
      lastShot: 0,
      lastSpawn: Date.now(),
      score: 0,
      wave: 1,
      lives: 3
    };
    setScore(0);
    setWave(1);
    setGameOver(false);
    setIsPlaying(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') stateRef.current.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') stateRef.current.keys.right = true;
      if (e.key === ' ') {
        if (isPlaying) e.preventDefault();
        stateRef.current.keys.shoot = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') stateRef.current.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') stateRef.current.keys.right = false;
      if (e.key === ' ') stateRef.current.keys.shoot = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const renderLoop = () => {
      const s = stateRef.current;
      ctx.fillStyle = '#0b0e14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle starfield grid
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.07)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < canvas.width; gx += 45) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, canvas.height);
        ctx.stroke();
      }
      for (let gy = 0; gy < canvas.height; gy += 45) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(canvas.width, gy);
        ctx.stroke();
      }

      if (isPlaying) {
        // Move Ship
        if (s.keys.left) s.shipX = Math.max(35, s.shipX - 6);
        if (s.keys.right) s.shipX = Math.min(canvas.width - 35, s.shipX + 6);

        // Auto-fire or Spacebar fire
        const now = Date.now();
        if ((s.keys.shoot || true) && now - s.lastShot > 220) {
          s.bullets.push({ x: s.shipX, y: canvas.height - 52 });
          s.lastShot = now;
        }

        // Spawn bugs
        if (now - s.lastSpawn > Math.max(550, 1400 - s.wave * 90)) {
          const colors = ['#f43f5e', '#f59e0b', '#a855f7', '#06b6d4', '#ec4899'];
          s.enemies.push({
            x: 50 + Math.random() * (canvas.width - 100),
            y: -20,
            speed: 1.2 + Math.random() * 1.1 + s.wave * 0.18,
            label: BUG_LABELS[Math.floor(Math.random() * BUG_LABELS.length)],
            color: colors[Math.floor(Math.random() * colors.length)],
            hp: 1
          });
          s.lastSpawn = now;
        }

        // Update bullets
        s.bullets.forEach((b) => {
          b.y -= 8.5;
        });
        s.bullets = s.bullets.filter((b) => b.y > -10);

        // Update enemies & collisions
        for (let i = s.enemies.length - 1; i >= 0; i--) {
          const en = s.enemies[i];
          en.y += en.speed;

          // Check bullet hit
          for (let j = s.bullets.length - 1; j >= 0; j--) {
            const b = s.bullets[j];
            if (Math.abs(b.x - en.x) < 34 && Math.abs(b.y - en.y) < 20) {
              s.bullets.splice(j, 1);
              s.enemies.splice(i, 1);
              s.score += 50;
              setScore(s.score);
              const nextWave = Math.floor(s.score / 400) + 1;
              if (nextWave !== s.wave) {
                s.wave = nextWave;
                setWave(nextWave);
              }
              // Explosion particles
              for (let p = 0; p < 10; p++) {
                s.particles.push({
                  x: en.x,
                  y: en.y,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  life: 18,
                  color: en.color
                });
              }
              break;
            }
          }

          // Check bottom breach
          if (en && en.y > canvas.height - 30) {
            s.enemies.splice(i, 1);
            s.lives -= 1;
            if (s.lives <= 0) {
              setIsPlaying(false);
              setGameOver(true);
              if (s.score > highScore) {
                setHighScore(s.score);
                localStorage.setItem('nexusforge_shooter_high', String(s.score));
              }
            }
          }
        }
      }

      // Draw Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 1;
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x, pt.y, 3, 3);
        if (pt.life <= 0) s.particles.splice(i, 1);
      }

      // Draw Bullets
      ctx.fillStyle = '#10b981';
      s.bullets.forEach((b) => {
        ctx.beginPath();
        ctx.roundRect(b.x - 2.5, b.y - 10, 5, 14, 3);
        ctx.fill();
      });

      // Draw Enemy Bug Capsules
      s.enemies.forEach((en) => {
        ctx.fillStyle = en.color;
        ctx.beginPath();
        ctx.roundRect(en.x - 32, en.y - 13, 64, 26, 6);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(en.label, en.x, en.y + 4);
      });

      // Draw Player Cyber Ship
      const sx = s.shipX;
      const sy = canvas.height - 32;
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(sx, sy - 22);
      ctx.lineTo(sx - 22, sy + 12);
      ctx.lineTo(sx + 22, sy + 12);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.arc(sx, sy - 2, 6, 0, Math.PI * 2);
      ctx.fill();

      // HUD Hearts / Shield
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`SHIELDS: ${'⚡'.repeat(Math.max(0, s.lives))}`, 16, 26);

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, highScore]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-emerald-400" />
            Cyber Bug Blaster — Shoot Falling Production Bugs!
          </h4>
          <p className="text-xs text-zinc-400">
            Move with <strong>Mouse</strong>, <strong>Left/Right Arrows</strong>, or <strong>A / D</strong> keys. Lasers fire automatically!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400">
            Score: {score}
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs font-bold text-indigo-400">
            Wave {wave}
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-400 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> Best: {highScore}
          </div>
          <button
            type="button"
            onClick={startNewGame}
            className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 shadow"
          >
            {isPlaying ? <RotateCcw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Restart' : 'Start Shooting Game'}
          </button>
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-[#2a2f3d] bg-[#0b0e14] flex justify-center">
        <canvas
          ref={canvasRef}
          width={720}
          height={400}
          onMouseMove={(e) => {
            if (!isPlaying) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / rect.width) * 720;
            stateRef.current.shipX = Math.max(35, Math.min(685, relX));
          }}
          className="w-full max-w-[720px] h-[380px] cursor-crosshair"
        />

        {!isPlaying && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Crosshair className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {gameOver ? `Sprint Over! Final Score: ${score}` : 'Ready to Blast Some Bugs?'}
            </h3>
            <p className="text-xs text-zinc-300 max-w-sm">
              Slide your mouse or use Arrow keys to dodge and destroy incoming `404 Bug`, `NullPtr`, and `RaceCond` blocks.
            </p>
            <button
              type="button"
              onClick={startNewGame}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-xs flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
            >
              <Play className="w-4 h-4 fill-current" />
              {gameOver ? 'Play Again' : 'Launch Cyber Bug Blaster'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// =========================================================
// GAME 2: NITRO SPRINT RACER (3-LANE RETRO CAR RACING GAME)
// =========================================================
const LANE_CENTERS = [230, 360, 490];

const NitroCarRacerGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [distance, setDistance] = useState(0);
  const [speedKmh, setSpeedKmh] = useState(180);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('nexusforge_racer_high') || 2400);
  });

  const racerRef = useRef({
    lane: 1,
    carX: LANE_CENTERS[1],
    roadOffset: 0,
    speed: 6.5,
    nitro: false,
    score: 0,
    traffic: [] as { lane: number; y: number; color: string; speed: number }[],
    coins: [] as { lane: number; y: number }[],
    lastSpawn: 0
  });

  const startRace = () => {
    racerRef.current = {
      lane: 1,
      carX: LANE_CENTERS[1],
      roadOffset: 0,
      speed: 7,
      nitro: false,
      score: 0,
      traffic: [{ lane: 0, y: -60, color: '#f43f5e', speed: 3.5 }],
      coins: [{ lane: 2, y: -120 }],
      lastSpawn: Date.now()
    };
    setDistance(0);
    setSpeedKmh(185);
    setGameOver(false);
    setIsPlaying(true);
  };

  const moveLane = (dir: -1 | 1) => {
    const r = racerRef.current;
    r.lane = Math.max(0, Math.min(2, r.lane + dir));
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') moveLane(-1);
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') moveLane(1);
      if (e.key === 'ArrowUp' || e.key === 'Shift') {
        racerRef.current.nitro = true;
        setSpeedKmh(295);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'Shift') {
        racerRef.current.nitro = false;
        setSpeedKmh(185);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const loop = () => {
      const r = racerRef.current;
      // Grass / Neon roadside
      ctx.fillStyle = '#0c1017';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Highway Asphalt
      ctx.fillStyle = '#181c26';
      ctx.fillRect(165, 0, 390, canvas.height);

      // Road Neon Borders
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(160, 0, 6, canvas.height);
      ctx.fillRect(554, 0, 6, canvas.height);

      const curSpeed = r.nitro ? 11.5 : r.speed;
      if (isPlaying) {
        r.roadOffset = (r.roadOffset + curSpeed) % 60;
        r.score += Math.round(curSpeed * 0.4);
        setDistance(r.score);
      }

      // Dashed Lane Dividers
      ctx.fillStyle = '#e2e8f0';
      for (let y = -60 + r.roadOffset; y < canvas.height; y += 60) {
        ctx.fillRect(292, y, 6, 32);
        ctx.fillRect(422, y, 6, 32);
      }

      if (isPlaying) {
        // Smoothly interpolate carX toward target lane center
        const targetX = LANE_CENTERS[r.lane];
        r.carX += (targetX - r.carX) * 0.24;

        // Spawn Traffic & Coins
        const now = Date.now();
        if (now - r.lastSpawn > 850) {
          const lane = Math.floor(Math.random() * 3);
          const colors = ['#f43f5e', '#f59e0b', '#06b6d4', '#a855f7'];
          r.traffic.push({
            lane,
            y: -70,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: 2.8 + Math.random() * 1.5
          });
          if (Math.random() > 0.4) {
            r.coins.push({
              lane: (lane + 1) % 3,
              y: -90
            });
          }
          r.lastSpawn = now;
        }

        // Update Traffic
        for (let i = r.traffic.length - 1; i >= 0; i--) {
          const t = r.traffic[i];
          t.y += curSpeed - t.speed + 2.5;
          const tx = LANE_CENTERS[t.lane];

          // Collision check with player car
          if (Math.abs(r.carX - tx) < 34 && Math.abs(canvas.height - 78 - t.y) < 54) {
            setIsPlaying(false);
            setGameOver(true);
            if (r.score > highScore) {
              setHighScore(r.score);
              localStorage.setItem('nexusforge_racer_high', String(r.score));
            }
          }

          if (t.y > canvas.height + 80) r.traffic.splice(i, 1);
        }

        // Update Turbo Coins
        for (let i = r.coins.length - 1; i >= 0; i--) {
          const c = r.coins[i];
          c.y += curSpeed;
          const cx = LANE_CENTERS[c.lane];
          if (Math.abs(r.carX - cx) < 34 && Math.abs(canvas.height - 78 - c.y) < 42) {
            r.score += 200;
            setDistance(r.score);
            r.coins.splice(i, 1);
            continue;
          }
          if (c.y > canvas.height + 50) r.coins.splice(i, 1);
        }
      }

      // Draw Turbo Coins
      r.coins.forEach((c) => {
        const cx = LANE_CENTERS[c.lane];
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(cx, c.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚡', cx, c.y + 4);
      });

      // Draw Traffic Cars
      r.traffic.forEach((t) => {
        const tx = LANE_CENTERS[t.lane];
        ctx.fillStyle = t.color;
        ctx.beginPath();
        ctx.roundRect(tx - 20, t.y - 32, 40, 64, 8);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(tx - 15, t.y - 14, 30, 18);
      });

      // Draw Player Sports Car
      const px = r.carX;
      const py = canvas.height - 78;
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.roundRect(px - 21, py - 34, 42, 68, 9);
      ctx.fill();

      // Windshield & Racing Stripes
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(px - 15, py - 18, 30, 20);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px - 3, py - 34, 6, 68);

      // Nitro Flame
      if (r.nitro && isPlaying) {
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(px - 10, py + 34);
        ctx.lineTo(px, py + 56);
        ctx.lineTo(px + 10, py + 34);
        ctx.fill();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold flex items-center gap-2">
            <Car className="w-4 h-4 text-indigo-400" />
            Nitro Sprint Racer — 3-Lane Highway Turbo Racing!
          </h4>
          <p className="text-xs text-zinc-400">
            Steer with <strong>Left / Right Arrows</strong> (or <strong>A / D</strong>) or the buttons below. Hold <strong>Up Arrow / Shift</strong> for Nitro!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs font-bold text-indigo-400">
            Distance: {distance}m
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> {speedKmh} km/h
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-400 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> Best: {highScore}m
          </div>
          <button
            type="button"
            onClick={startRace}
            className="px-4 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            {isPlaying ? <RotateCcw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Restart Race' : 'Start Car Race'}
          </button>
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-[#2a2f3d] bg-[#0c1017] flex justify-center">
        <canvas
          ref={canvasRef}
          width={720}
          height={400}
          className="w-full max-w-[720px] h-[380px]"
        />

        {!isPlaying && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {gameOver ? `Crash! Distance Driven: ${distance}m` : 'Ready for a Turbo Highway Run?'}
            </h3>
            <p className="text-xs text-zinc-300 max-w-sm">
              Switch lanes to dodge traffic, grab golden ⚡ Turbo tokens, and hold Up Arrow for Nitro boost.
            </p>
            <button
              type="button"
              onClick={startRace}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
            >
              <Play className="w-4 h-4 fill-current" />
              {gameOver ? 'Race Again' : 'Start Nitro Sprint Racer'}
            </button>
          </div>
        )}
      </div>

      {/* Touch / Mouse Controls for Easy Clicking */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => moveLane(-1)}
          className="px-5 py-2 rounded-xl bg-[#222631] hover:bg-[#2e3342] border border-[#323846] text-xs font-bold text-white"
        >
          ← Steer Left
        </button>
        <button
          type="button"
          onMouseDown={() => {
            racerRef.current.nitro = true;
            setSpeedKmh(295);
          }}
          onMouseUp={() => {
            racerRef.current.nitro = false;
            setSpeedKmh(185);
          }}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" /> Hold Nitro Boost
        </button>
        <button
          type="button"
          onClick={() => moveLane(1)}
          className="px-5 py-2 rounded-xl bg-[#222631] hover:bg-[#2e3342] border border-[#323846] text-xs font-bold text-white"
        >
          Steer Right →
        </button>
      </div>
    </div>
  );
};
