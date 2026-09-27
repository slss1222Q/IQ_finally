import React, { useState, useEffect, useRef, useCallback } from 'react';
import { soundManager } from '../../utils/audio';
import { UserProfile } from '../../types';
import {
  ArrowLeft,
  RotateCcw,
  Trophy,
  Zap,
  Compass,
  ArrowUp,
  ArrowDown,
  ArrowLeft as LeftIcon,
  ArrowRight as RightIcon,
  Clock,
  Ticket,
  Info,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';

interface CyberMazeGameProps {
  onWin: (ticketsWon: number) => void;
  onBack: () => void;
  userProfile?: UserProfile;
  onUpdateTimeSpent?: (seconds: number) => void;
  difficulty?: 'easy' | 'normal' | 'hard';
}

// 0: Path, 1: Wall, 2: Chip, 3: Exit Portal
interface MazeLevel {
  id: number;
  name: string;
  gridSize: number;
  requiredChips: number;
  grid: number[][];
  startPos: [number, number];
  exitPos: [number, number];
}

const MAZE_LEVELS: MazeLevel[] = [
  {
    id: 1,
    name: "1-Bosqich: Kiber Zanjir (Boshlang'ich)",
    gridSize: 7,
    requiredChips: 3,
    startPos: [0, 0],
    exitPos: [6, 6],
    grid: [
      [0, 0, 1, 0, 2, 0, 0],
      [1, 0, 1, 0, 1, 1, 0],
      [0, 0, 0, 0, 0, 1, 0],
      [0, 1, 1, 1, 0, 0, 2],
      [0, 2, 0, 1, 0, 1, 0],
      [1, 1, 0, 0, 0, 1, 0],
      [0, 0, 0, 1, 0, 0, 3],
    ],
  },
  {
    id: 2,
    name: "2-Bosqich: Xaker Tarmoq (O'rta)",
    gridSize: 7,
    requiredChips: 4,
    startPos: [0, 0],
    exitPos: [6, 6],
    grid: [
      [0, 2, 0, 1, 0, 2, 0],
      [0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 0, 0, 1, 0],
      [2, 1, 1, 1, 0, 1, 2],
      [0, 0, 0, 1, 0, 0, 0],
      [1, 1, 0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 3],
    ],
  },
  {
    id: 3,
    name: "3-Bosqich: Kvant Matritsasi (Kiber Daho)",
    gridSize: 8,
    requiredChips: 4,
    startPos: [0, 0],
    exitPos: [7, 7],
    grid: [
      [0, 0, 1, 2, 0, 0, 1, 0],
      [1, 0, 1, 1, 1, 0, 1, 0],
      [0, 0, 0, 0, 1, 0, 0, 2],
      [0, 1, 1, 0, 0, 0, 1, 0],
      [2, 1, 0, 0, 1, 1, 1, 0],
      [0, 1, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 2, 0, 1, 0],
      [1, 1, 1, 0, 1, 0, 0, 3],
    ],
  },
];

export const CyberMazeGame: React.FC<CyberMazeGameProps> = ({
  onWin,
  onBack,
  userProfile,
  onUpdateTimeSpent,
  difficulty = 'normal',
}) => {
  const winTicketCount = difficulty === 'hard' ? 4 : difficulty === 'normal' ? 2 : 1;
  const initialLevel = difficulty === 'hard' ? 1 : 0;
  const [levelIndex, setLevelIndex] = useState(initialLevel);
  const currentLevel = MAZE_LEVELS[levelIndex] || MAZE_LEVELS[0];

  const [grid, setGrid] = useState<number[][]>(() =>
    currentLevel.grid.map((row) => [...row])
  );
  const [playerPos, setPlayerPos] = useState<[number, number]>(currentLevel.startPos);
  const [visitedCells, setVisitedCells] = useState<Set<string>>(
    () => new Set([`${currentLevel.startPos[0]},${currentLevel.startPos[1]}`])
  );
  const [collectedChips, setCollectedChips] = useState(0);
  const [movesCount, setMovesCount] = useState(0);
  const [hasWon, setHasWon] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  // Touch swipe refs
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Time tracking effect contributing to 6-minute weekly active time quota
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((prev) => {
        const next = prev + 1;
        if (onUpdateTimeSpent) {
          onUpdateTimeSpent(1);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onUpdateTimeSpent]);

  // Load level
  const loadLevel = useCallback((lvlIdx: number) => {
    const lvl = MAZE_LEVELS[lvlIdx] || MAZE_LEVELS[0];
    setLevelIndex(lvlIdx);
    setGrid(lvl.grid.map((row) => [...row]));
    setPlayerPos(lvl.startPos);
    setVisitedCells(new Set([`${lvl.startPos[0]},${lvl.startPos[1]}`]));
    setCollectedChips(0);
    setMovesCount(0);
    setHasWon(false);
  }, []);

  // Movement logic
  const movePlayer = useCallback(
    (dr: number, dc: number) => {
      if (hasWon) return;

      const [r, c] = playerPos;
      const nr = r + dr;
      const nc = c + dc;
      const size = currentLevel.gridSize;

      // Check bounds
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) return;

      // Check wall
      if (grid[nr][nc] === 1) {
        soundManager.playErrorBuzz();
        return;
      }

      soundManager.playCyberClick();
      const nextGrid = grid.map((row) => [...row]);
      let nextChips = collectedChips;

      // Chip pickup
      if (nextGrid[nr][nc] === 2) {
        soundManager.playSuccessChime();
        nextChips += 1;
        setCollectedChips(nextChips);
        nextGrid[nr][nc] = 0; // consumed
      }

      // Exit node check
      if (nextGrid[nr][nc] === 3) {
        if (nextChips >= currentLevel.requiredChips) {
          // Success! Won stage
          soundManager.playVictoryFanfare();
          setHasWon(true);
          onWin(winTicketCount);
        } else {
          // Not enough chips yet
          soundManager.playErrorBuzz();
        }
      }

      setGrid(nextGrid);
      setPlayerPos([nr, nc]);
      setMovesCount((m) => m + 1);
      setVisitedCells((prev) => {
        const next = new Set(prev);
        next.add(`${nr},${nc}`);
        return next;
      });
    },
    [grid, playerPos, collectedChips, currentLevel, hasWon, onWin, winTicketCount]
  );

  // Keyboard controls listener (Arrow keys & WASD)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (e.key === 'ArrowUp' || key === 'w') {
        e.preventDefault();
        movePlayer(-1, 0);
      } else if (e.key === 'ArrowDown' || key === 's') {
        e.preventDefault();
        movePlayer(1, 0);
      } else if (e.key === 'ArrowLeft' || key === 'a') {
        e.preventDefault();
        movePlayer(0, -1);
      } else if (e.key === 'ArrowRight' || key === 'd') {
        e.preventDefault();
        movePlayer(0, 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Minimum swipe threshold (20px)
    if (Math.max(absDx, absDy) > 20) {
      if (absDx > absDy) {
        if (dx > 0) movePlayer(0, 1); // Right
        else movePlayer(0, -1); // Left
      } else {
        if (dy > 0) movePlayer(1, 0); // Down
        else movePlayer(-1, 0); // Up
      }
    }
  };

  // Direct tap on neighboring cell
  const handleCellClick = (r: number, c: number) => {
    const [pr, pc] = playerPos;
    const dr = r - pr;
    const dc = c - pc;

    if (Math.abs(dr) + Math.abs(dc) === 1) {
      movePlayer(dr, dc);
    }
  };

  // Weekly prize quota metrics
  const totalWeeklySeconds = (userProfile?.weeklyTimeSpentSeconds || 0) + sessionSeconds;
  const weeklyMinutes = Math.floor(totalWeeklySeconds / 60);
  const isTimeQualified = totalWeeklySeconds >= 360; // 6 minutes
  const totalTickets = userProfile?.energyTickets || 0;
  const isTicketsQualified = totalTickets >= 12; // 12 tickets
  const isExitUnlocked = collectedChips >= currentLevel.requiredChips;

  return (
    <div className="w-full max-w-xl mx-auto p-3 sm:p-4 space-y-4 animate-fade-in select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-3xl bg-slate-900 border border-cyan-500/50 shadow-xl">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            title="Orqaga"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-1">
              <Compass className="w-3 h-3 text-cyan-400" />
              <span>STRATEGIYA & LABIRINT PRO</span>
            </div>
            <h2 className="text-sm sm:text-base font-display font-bold text-white flex items-center gap-1.5">
              <span>KIBER LABIRINT</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-mono">
                {levelIndex + 1}/{MAZE_LEVELS.length}
              </span>
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                  difficulty === 'hard'
                    ? 'border-rose-500 bg-rose-950/70 text-rose-300 font-bold animate-pulse'
                    : difficulty === 'easy'
                    ? 'border-emerald-500 bg-emerald-950/70 text-emerald-300'
                    : 'border-cyan-400/50 bg-cyan-950/70 text-cyan-300'
                }`}
              >
                {difficulty === 'hard'
                  ? '🔴 QIYIN (2.5x Mukofot)'
                  : difficulty === 'easy'
                  ? '🟢 OSON (1x)'
                  : "🟡 O'RTA (1.5x)"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => loadLevel(levelIndex)}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center justify-center transition-colors cursor-pointer"
            title="Qayta boshlash"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* HAFTALIK SOVRIN SHARTI (6 MINUT + 12 TICKET) STATISTIKA PANELI */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-amber-950/40 border border-cyan-500/40 shadow-lg space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Haftalik 15 Stars Sovg'asi Talabi</span>
          </div>
          <div className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-cyan-400/40 text-cyan-300">
            {isTimeQualified && isTicketsQualified ? '✅ Qabul qilindi' : '⏳ Jarayonda'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Time Progress */}
          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="w-3 h-3 text-cyan-400" />
                Faol Vaqt:
              </span>
              <span className="font-mono font-bold text-cyan-400">
                {weeklyMinutes} / 6 daq
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full ${isTimeQualified ? 'bg-emerald-400' : 'bg-cyan-400'} transition-all`}
                style={{ width: `${Math.min(100, Math.round((totalWeeklySeconds / 360) * 100))}%` }}
              />
            </div>
          </div>

          {/* Tickets Progress */}
          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 text-slate-300">
                <Ticket className="w-3 h-3 text-amber-400" />
                Chiptalar:
              </span>
              <span className="font-mono font-bold text-amber-400">
                {totalTickets} / 12 ta
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full ${isTicketsQualified ? 'bg-emerald-400' : 'bg-amber-400'} transition-all`}
                style={{ width: `${Math.min(100, Math.round((totalTickets / 12) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 flex items-center justify-between">
          <span>O'yindagi har bir soniya 6-minutlik normaga qo'shib boriladi.</span>
          <span className="font-mono text-cyan-400">
            Sessiya: {Math.floor(sessionSeconds / 60)}m {sessionSeconds % 60}s
          </span>
        </div>
      </div>

      {/* Clear Rules & Legend */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-white">Qoida:</span>{' '}
            <span className="text-cyan-300 font-bold">🤖 Robotni</span> klaviatura (
            <span className="px-1 bg-slate-800 text-cyan-300 font-mono rounded">W,A,S,D</span> yoki{' '}
            <span className="px-1 bg-slate-800 text-cyan-300 font-mono rounded">Strelkalar</span>
            ) yoki quyidagi <span className="text-amber-300 font-bold">sensor tugmalar</span> / surish (swipe) orqali boshqaring.
          </div>
        </div>

        {/* Legend Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
          <span className="px-2 py-0.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 flex items-center gap-1">
            <span>🤖</span> Siz (Agent)
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-amber-950 border border-amber-400/40 text-amber-300 flex items-center gap-1">
            <span>💾</span> Chip ({collectedChips}/{currentLevel.requiredChips})
          </span>
          <span
            className={`px-2 py-0.5 rounded-lg border flex items-center gap-1 transition-colors ${
              isExitUnlocked
                ? 'bg-emerald-950 border-emerald-400 text-emerald-300 animate-pulse'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
          >
            <span>🚪</span> Chiqish Portali {isExitUnlocked ? '(OCHIQ!)' : '(Qulflangan)'}
          </span>
        </div>
      </div>

      {/* Maze Grid Box */}
      <div
        className="p-4 sm:p-5 rounded-3xl bg-slate-950 border-2 border-cyan-500/40 shadow-2xl space-y-4 touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`grid gap-1.5 max-w-sm mx-auto aspect-square p-2.5 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner`}
          style={{
            gridTemplateColumns: `repeat(${currentLevel.gridSize}, minmax(0, 1fr))`,
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const isPlayer = playerPos[0] === r && playerPos[1] === c;
              const isWall = cell === 1;
              const isChip = cell === 2;
              const isExit = cell === 3;
              const isVisited = visitedCells.has(`${r},${c}`);

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`rounded-xl flex items-center justify-center text-xs sm:text-base font-bold transition-all select-none cursor-pointer ${
                    isPlayer
                      ? 'bg-gradient-to-tr from-cyan-500 to-sky-400 text-slate-950 shadow-[0_0_15px_rgba(0,210,255,0.9)] scale-110 z-10'
                      : isWall
                      ? 'bg-slate-800/90 border border-slate-700/60 shadow-inner'
                      : isChip
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-[0_0_8px_rgba(251,191,36,0.3)] animate-pulse'
                      : isExit
                      ? isExitUnlocked
                        ? 'bg-emerald-500/40 text-emerald-300 border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.7)] animate-bounce'
                        : 'bg-slate-800/40 text-slate-600 border border-slate-700'
                      : isVisited
                      ? 'bg-cyan-950/40 border border-cyan-500/10 text-cyan-600 text-[10px]'
                      : 'bg-slate-950/70 border border-slate-900'
                  }`}
                >
                  {isPlayer ? (
                    '🤖'
                  ) : isChip ? (
                    '💾'
                  ) : isExit ? (
                    '🚪'
                  ) : isVisited ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/40" />
                  ) : (
                    ''
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Dynamic Status Strip */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-2">
          <span>Qadamlar soni: <strong className="text-white">{movesCount}</strong></span>
          <span
            className={`font-bold ${
              isExitUnlocked ? 'text-emerald-400 animate-pulse' : 'text-amber-400'
            }`}
          >
            {isExitUnlocked
              ? "✅ Chiqish eshigi ochildi! 🚪 ga boring!"
              : `Yana ${currentLevel.requiredChips - collectedChips} ta chip kerak`}
          </span>
        </div>

        {/* Ergonomic Touch Virtual Joypad / D-Pad */}
        <div className="max-w-xs mx-auto space-y-1.5 pt-2">
          <div className="text-[10px] text-center font-mono text-cyan-400 uppercase tracking-widest">
            Sensor Boshqaruv D-Pad
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => movePlayer(-1, 0)}
              className="w-16 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 border-2 border-cyan-500/40 text-cyan-300 flex items-center justify-center active:scale-95 active:bg-cyan-500 active:text-slate-950 transition-all shadow-lg cursor-pointer"
            >
              <ArrowUp className="w-6 h-6" />
            </button>
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => movePlayer(0, -1)}
              className="w-16 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 border-2 border-cyan-500/40 text-cyan-300 flex items-center justify-center active:scale-95 active:bg-cyan-500 active:text-slate-950 transition-all shadow-lg cursor-pointer"
            >
              <LeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => movePlayer(1, 0)}
              className="w-16 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 border-2 border-cyan-500/40 text-cyan-300 flex items-center justify-center active:scale-95 active:bg-cyan-500 active:text-slate-950 transition-all shadow-lg cursor-pointer"
            >
              <ArrowDown className="w-6 h-6" />
            </button>
            <button
              onClick={() => movePlayer(0, 1)}
              className="w-16 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 border-2 border-cyan-500/40 text-cyan-300 flex items-center justify-center active:scale-95 active:bg-cyan-500 active:text-slate-950 transition-all shadow-lg cursor-pointer"
            >
              <RightIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="text-[10px] text-center text-slate-500 font-mono">
            Klaviatura: [W, A, S, D] yoki [←, ↑, →, ↓]
          </div>
        </div>

        {/* Victory Outcome Modal */}
        {hasWon && (
          <div className="p-5 rounded-3xl bg-gradient-to-b from-emerald-950/90 to-slate-950 border-2 border-emerald-400 text-center space-y-3 animate-fade-in shadow-2xl">
            <Trophy className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
            <h3 className="text-base sm:text-lg font-display font-black text-white">
              LABIRINTDAN CHIQILDI! G'ALABA!
            </h3>
            <p className="text-xs text-emerald-300 font-mono">
              Barcha chiplar to'plandi va portal muvaffaqiyatli ochildi! +2 Chipta taqdim etildi!
            </p>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs text-cyan-300">
              O'yindagi faollik vaqtingiz haftalik 6-minutlik sovrin talabiga qo'shildi.
            </div>
            <div className="flex gap-2 justify-center pt-1">
              {levelIndex < MAZE_LEVELS.length - 1 ? (
                <button
                  onClick={() => loadLevel(levelIndex + 1)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  Keyingi Bosqich ({levelIndex + 2}-bosqich)
                </button>
              ) : (
                <button
                  onClick={() => loadLevel(0)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  Boshidan O'ynash
                </button>
              )}
              <button
                onClick={onBack}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer"
              >
                Bosh Menyuga
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
