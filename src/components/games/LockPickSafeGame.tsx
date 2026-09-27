import React, { useState, useEffect, useRef, useCallback } from 'react';
import { soundManager } from '../../utils/audio';
import { UserProfile } from '../../types';
import {
  Lock,
  Unlock,
  Key,
  RotateCcw,
  ArrowLeft,
  Trophy,
  Sparkles,
  Clock,
  Ticket,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Info,
} from 'lucide-react';

interface LockPickSafeGameProps {
  onWin: (ticketsWon: number) => void;
  onBack: () => void;
  userProfile?: UserProfile;
  onUpdateTimeSpent?: (seconds: number) => void;
  difficulty?: 'easy' | 'normal' | 'hard';
}

interface TumblerConfig {
  id: number;
  name: string;
  speed: number;
  targetStart: number;
  targetWidth: number;
  color: string;
}

const GET_TUMBLERS = (diff: 'easy' | 'normal' | 'hard'): TumblerConfig[] => {
  if (diff === 'easy') {
    return [
      { id: 1, name: "1-Tashqi Tumbler (Oson)", speed: 45, targetStart: 60, targetWidth: 55, color: '#10b981' },
      { id: 2, name: "2-O'rta Tumbler (Oson)", speed: -65, targetStart: 180, targetWidth: 48, color: '#38bdf8' },
      { id: 3, name: "3-Kiber Yadro (Oson)", speed: 85, targetStart: 280, targetWidth: 40, color: '#fbbf24' },
    ];
  }
  if (diff === 'hard') {
    return [
      { id: 1, name: "1-Tashqi Tumbler (Qiyin)", speed: 110, targetStart: 45, targetWidth: 32, color: '#f43f5e' },
      { id: 2, name: "2-O'rta Tumbler (Qiyin)", speed: -145, targetStart: 190, targetWidth: 26, color: '#e11d48' },
      { id: 3, name: "3-Kiber Yadro (Qiyin)", speed: 185, targetStart: 310, targetWidth: 20, color: '#fbbf24' },
    ];
  }
  // normal
  return [
    { id: 1, name: "1-Tashqi Tumbler (O'rta)", speed: 75, targetStart: 60, targetWidth: 45, color: '#00d2ff' },
    { id: 2, name: "2-O'rta Tumbler (O'rta)", speed: -100, targetStart: 200, targetWidth: 38, color: '#a855f7' },
    { id: 3, name: "3-Markaziy Kiber Yadrosi (Tez)", speed: 130, targetStart: 300, targetWidth: 30, color: '#fbbf24' },
  ];
};

export const LockPickSafeGame: React.FC<LockPickSafeGameProps> = ({
  onWin,
  onBack,
  userProfile,
  onUpdateTimeSpent,
  difficulty = 'normal',
}) => {
  const TUMBLERS = GET_TUMBLERS(difficulty);
  const maxAttempts = difficulty === 'easy' ? 8 : difficulty === 'hard' ? 4 : 6;
  const winTicketCount = difficulty === 'hard' ? 4 : difficulty === 'normal' ? 2 : 1;

  const [currentTumblerIndex, setCurrentTumblerIndex] = useState(0);
  const [angle, setAngle] = useState(0);
  const [unlockedPins, setUnlockedPins] = useState<boolean[]>([false, false, false]);
  const [attemptsLeft, setAttemptsLeft] = useState(maxAttempts);
  const [isCracked, setIsCracked] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  }>({
    text: "Aylanayotgan igna yashil zonaga kelganda 'QULFNI USHLASH' tugmasini bosing!",
    type: 'info',
  });

  // Track gameplay duration to contribute towards 6-minute weekly active time quota
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const angleRef = useRef<number>(0);

  // Time tracking effect
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

  // Current active tumbler configuration
  const currentTumbler = TUMBLERS[currentTumblerIndex] || TUMBLERS[0];
  const targetEnd = (currentTumbler.targetStart + currentTumbler.targetWidth) % 360;

  // Check if current angle is inside sweet spot zone
  const isAngleInTarget = useCallback((testAngle: number, start: number, width: number) => {
    const normalized = (testAngle % 360 + 360) % 360;
    const end = (start + width) % 360;
    if (start < end) {
      return normalized >= start && normalized <= end;
    } else {
      // Wraps around 360
      return normalized >= start || normalized <= end;
    }
  }, []);

  const isCurrentlyInTargetZone = isAngleInTarget(
    angle,
    currentTumbler.targetStart,
    currentTumbler.targetWidth
  );

  // Smooth continuous rotation animation
  useEffect(() => {
    if (isCracked || isFailed) return;

    lastTimeRef.current = performance.now();

    const animate = (now: number) => {
      const deltaSec = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      const speed = currentTumbler.speed;
      let newAngle = angleRef.current + speed * deltaSec;
      newAngle = (newAngle % 360 + 360) % 360;

      angleRef.current = newAngle;
      setAngle(newAngle);

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [currentTumblerIndex, isCracked, isFailed, currentTumbler.speed]);

  // Handle user timing click (Spacebar or Button click)
  const handleLockPickClick = useCallback(() => {
    if (isCracked || isFailed) return;

    const hit = isAngleInTarget(
      angleRef.current,
      currentTumbler.targetStart,
      currentTumbler.targetWidth
    );

    if (hit) {
      // Success! Lock pin aligns
      soundManager.playSuccessChime();
      const nextUnlocked = [...unlockedPins];
      nextUnlocked[currentTumblerIndex] = true;
      setUnlockedPins(nextUnlocked);

      if (currentTumblerIndex < TUMBLERS.length - 1) {
        const nextIdx = currentTumblerIndex + 1;
        setCurrentTumblerIndex(nextIdx);
        setLastFeedback({
          text: `✅ ${currentTumblerIndex + 1}-Tumbler to'g'ri ulandi! Endi ${nextIdx + 1}-tumblerni tekislang!`,
          type: 'success',
        });
      } else {
        // All 3 tumblers unlocked! Safe cracked!
        setIsCracked(true);
        soundManager.playVictoryFanfare();
        setLastFeedback({
          text: `🎉 BARCHA 3 TA TUMBLER MOS KELDI! SEYF TO'LIQ OCHILDI! +${winTicketCount} CHIPTA QO'SHILDI!`,
          type: 'success',
        });
        onWin(winTicketCount);
      }
    } else {
      // Missed timing
      soundManager.playErrorBuzz();
      const nextAttempts = attemptsLeft - 1;
      setAttemptsLeft(nextAttempts);

      if (nextAttempts <= 0) {
        setIsFailed(true);
        setLastFeedback({
          text: "❌ O'g'ri simi (lock pick) sindi! Seyf xavfsizlik tizimi bloklandi.",
          type: 'error',
        });
      } else {
        setLastFeedback({
          text: `⚠️ Mo'ljaldan adashdingiz! Yashil sektor ustiga kelganda bosing (Qolgan urinish: ${nextAttempts})`,
          type: 'error',
        });
      }
    }
  }, [isCracked, isFailed, isAngleInTarget, currentTumbler, currentTumblerIndex, unlockedPins, attemptsLeft, onWin, winTicketCount]);

  // Keyboard Spacebar listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        handleLockPickClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleLockPickClick]);

  // Restart game
  const handleRestart = () => {
    soundManager.playCyberClick();
    setCurrentTumblerIndex(0);
    setUnlockedPins([false, false, false]);
    setAttemptsLeft(maxAttempts);
    setIsCracked(false);
    setIsFailed(false);
    angleRef.current = 0;
    setAngle(0);
    setLastFeedback({
      text: "Aylanayotgan igna yashil zonaga kelganda 'QULFNI USHLASH' tugmasini bosing!",
      type: 'info',
    });
  };

  // 6-minute weekly active time and 12-ticket quota calculation
  const totalWeeklySeconds = (userProfile?.weeklyTimeSpentSeconds || 0) + sessionSeconds;
  const weeklyMinutes = Math.floor(totalWeeklySeconds / 60);
  const isTimeQualified = totalWeeklySeconds >= 360; // 6 minutes
  const totalTickets = userProfile?.energyTickets || 0;
  const isTicketsQualified = totalTickets >= 12; // 12 tickets

  // Render SVG arc helper for sweet spot target zone
  const renderTargetArc = (startAngle: number, arcWidth: number, radius: number, strokeWidth: number) => {
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = (((startAngle + arcWidth) - 90) * Math.PI) / 180;
    const x1 = 150 + radius * Math.cos(startRad);
    const y1 = 150 + radius * Math.sin(startRad);
    const x2 = 150 + radius * Math.cos(endRad);
    const y2 = 150 + radius * Math.sin(endRad);
    const largeArc = arcWidth > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  return (
    <div className="w-full max-w-xl mx-auto p-3 sm:p-4 space-y-4 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-3xl bg-slate-900 border border-amber-400/50 shadow-xl">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            title="Orqaga"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>TIMING & MAHORAT O'YINI</span>
            </div>
            <h2 className="text-sm sm:text-base font-display font-bold text-white flex items-center gap-1.5">
              <span>KIBER QULF BUZISH (LOCK PICK)</span>
              <Key className="w-4 h-4 text-amber-400" />
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                  difficulty === 'hard'
                    ? 'border-rose-500 bg-rose-950/70 text-rose-300 font-bold animate-pulse'
                    : difficulty === 'easy'
                    ? 'border-emerald-500 bg-emerald-950/70 text-emerald-300'
                    : 'border-amber-400/50 bg-amber-950/70 text-amber-300'
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

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
            Urinishlar:{' '}
            <span
              className={`font-bold ${
                attemptsLeft <= 2 ? 'text-rose-400 animate-pulse' : 'text-amber-400'
              }`}
            >
              {attemptsLeft}/{maxAttempts}
            </span>
          </div>
          <button
            onClick={handleRestart}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
            title="Qayta boshlash"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* HAFTALIK SOVRIN SHARTI (6 MINUT + 12 TICKET) STATISTIKA PANELI */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-cyan-950/40 border border-amber-400/40 shadow-lg space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Haftalik 15 Stars Sovg'asi Talabi</span>
          </div>
          <div className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-amber-400/40 text-amber-300">
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
          <span>O'yindagi daqiqalar haftalik normaga to'g'ridan-to'g'ri qo'shiladi.</span>
          <span className="font-mono text-cyan-400">Sessiya: {Math.floor(sessionSeconds / 60)}m {sessionSeconds % 60}s</span>
        </div>
      </div>

      {/* 3 Tumbler Cylinders Status Bar */}
      <div className="grid grid-cols-3 gap-2">
        {TUMBLERS.map((t, idx) => {
          const isOpen = unlockedPins[idx];
          const isCurrent = currentTumblerIndex === idx && !isCracked && !isFailed;
          return (
            <div
              key={t.id}
              className={`p-2.5 rounded-2xl border text-center transition-all ${
                isOpen
                  ? 'bg-emerald-950/50 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : isCurrent
                  ? 'bg-amber-950/50 border-amber-400 text-amber-300 ring-2 ring-amber-400/40 animate-pulse'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold mb-0.5">
                {isOpen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                <span>{idx + 1}-Tumbler</span>
              </div>
              <div className="text-[10px] font-mono">
                {isOpen ? '✅ OCHILDI' : isCurrent ? '⚡ FAOL' : '🔒 QULFLI'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Safe Tumbler Dial Area */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-amber-400/60 p-5 shadow-2xl text-center space-y-4 overflow-hidden">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#fbbf2405_1px,transparent_1px),linear-gradient(to_bottom,#fbbf2405_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

        {/* Clear Instructions Banner */}
        <div className="relative z-10 flex items-start gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-left text-xs text-slate-300">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">Qoidasi juda oddiy:</span> Aylanayotgan sariq igna{' '}
            <span className="text-emerald-400 font-bold">yashil sektor (mo'ljal)</span> ustidan o'tayotganda{' '}
            <span className="text-amber-300 font-bold">'QULFNI USHLASH'</span> tugmasini bosing yoki klaviaturadagi{' '}
            <span className="px-1 py-0.5 bg-slate-800 text-amber-300 font-mono rounded">SPACE</span> tugmasini bosing!
          </div>
        </div>

        {/* Rotating SVG Lockpick Tumbler Dial */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 300 300">
            {/* Outer Metallic Ring */}
            <circle
              cx="150"
              cy="150"
              r="135"
              fill="none"
              stroke="#1e293b"
              strokeWidth="12"
            />
            <circle
              cx="150"
              cy="150"
              r="128"
              fill="none"
              stroke="#334155"
              strokeWidth="2"
              strokeDasharray="4 6"
            />

            {/* Target Sweet Spot Arc on the current tumbler ring */}
            <path
              d={renderTargetArc(currentTumbler.targetStart, currentTumbler.targetWidth, 115, 14)}
              fill="none"
              stroke="#10b981"
              strokeWidth="16"
              strokeLinecap="round"
              className="drop-shadow-[0_0_12px_#10b981]"
            />

            {/* Target Area Start/End Markers */}
            <circle
              cx={150 + 115 * Math.cos(((currentTumbler.targetStart - 90) * Math.PI) / 180)}
              cy={150 + 115 * Math.sin(((currentTumbler.targetStart - 90) * Math.PI) / 180)}
              r="4"
              fill="#34d399"
            />
            <circle
              cx={150 + 115 * Math.cos(((currentTumbler.targetStart + currentTumbler.targetWidth - 90) * Math.PI) / 180)}
              cy={150 + 115 * Math.sin(((currentTumbler.targetStart + currentTumbler.targetWidth - 90) * Math.PI) / 180)}
              r="4"
              fill="#34d399"
            />

            {/* Intermediate Static Rings */}
            <circle cx="150" cy="150" r="95" fill="none" stroke="#1e293b" strokeWidth="6" />
            <circle cx="150" cy="150" r="70" fill="none" stroke="#0f172a" strokeWidth="8" />

            {/* Rotating Pin / Needle Indicator */}
            <g transform={`rotate(${angle}, 150, 150)`}>
              {/* Needle Line */}
              <line
                x1="150"
                y1="150"
                x2="150"
                y2="28"
                stroke={isCurrentlyInTargetZone ? '#34d399' : '#fbbf24'}
                strokeWidth="4"
                strokeLinecap="round"
                className="transition-colors drop-shadow-[0_0_8px_#fbbf24]"
              />
              {/* Needle Tip Arrow */}
              <polygon
                points="150,20 143,34 157,34"
                fill={isCurrentlyInTargetZone ? '#34d399' : '#fbbf24'}
                className="transition-colors"
              />
              {/* Needle Counter-weight */}
              <circle cx="150" cy="180" r="6" fill="#fbbf24" opacity="0.6" />
            </g>

            {/* Center Dial Hub */}
            <circle cx="150" cy="150" r="42" fill="#090d16" stroke="#fbbf24" strokeWidth="3" />
            <circle cx="150" cy="150" r="32" fill="#0f172a" />
          </svg>

          {/* Center Info inside Dial */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span
              className={`text-xs font-mono font-bold uppercase transition-colors ${
                isCurrentlyInTargetZone ? 'text-emerald-400 scale-110' : 'text-slate-400'
              }`}
            >
              {isCurrentlyInTargetZone ? '🔥 USHLANG!' : `${currentTumblerIndex + 1}-Tumbler`}
            </span>
            <span className="text-[10px] font-mono text-amber-300 font-bold">
              {Math.round(angle)}°
            </span>
          </div>
        </div>

        {/* Real-time Target Zone Alignment Alert */}
        <div
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
            isCurrentlyInTargetZone
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pulse'
              : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          {isCurrentlyInTargetZone ? (
            <span className="flex items-center justify-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-400 animate-bounce" />
              <span>MO'LJAL USTIDASIZ! HOZIROQ BOSING! (ALIGN HIT!)</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1">
              <span>Igna yashil zonaga yetib kelishini kuting...</span>
            </span>
          )}
        </div>

        {/* Big Action Button (QULFNI USHLASH / LOCK PICK CLICK) */}
        <div>
          <button
            onClick={handleLockPickClick}
            disabled={isCracked || isFailed}
            className={`w-full py-4 px-6 rounded-2xl font-display font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-2xl active:scale-95 transition-all cursor-pointer ${
              isCurrentlyInTargetZone
                ? 'bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-400 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.6)] scale-[1.02]'
                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-400 hover:from-amber-400 text-slate-950 shadow-amber-400/30'
            }`}
          >
            <Key className="w-5 h-5" />
            <span>QULFNI USHLASH (CLICK / BO'SH JOY)</span>
          </button>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            Maslahat: Klaviaturadagi [SPACE] tugmasini bosish juda qulay!
          </div>
        </div>

        {/* Feedback message banner */}
        <div
          className={`p-3 rounded-2xl text-xs font-semibold border transition-all ${
            lastFeedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200'
              : lastFeedback.type === 'error'
              ? 'bg-rose-950/60 border-rose-500 text-rose-200'
              : 'bg-slate-950/60 border-slate-800 text-slate-300'
          }`}
        >
          {lastFeedback.text}
        </div>

        {/* Safe Cracked Win Modal */}
        {isCracked && (
          <div className="p-5 rounded-3xl bg-gradient-to-b from-emerald-950/90 to-slate-950 border-2 border-emerald-400 text-center space-y-3 animate-fade-in shadow-2xl">
            <Trophy className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
            <h3 className="text-lg font-display font-black text-white">
              G'ALABA! SEYF TO'LIQ OCHILDI!
            </h3>
            <p className="text-xs text-emerald-300 font-mono">
              Barcha 3 ta tumbler aylanmalari mos tushdi! Sizga +2 Ta Chipta berildi!
            </p>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-400/30 text-xs text-amber-300">
              Ushbu o'yindagi faoliyatingiz haftalik 6-minutlik sovrin normasiga muvaffaqiyatli qo'shildi.
            </div>
            <div className="flex gap-2 justify-center pt-1">
              <button
                onClick={handleRestart}
                className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                Yana O'ynash
              </button>
              <button
                onClick={onBack}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer"
              >
                Bosh Menyuga Qaytish
              </button>
            </div>
          </div>
        )}

        {/* Safe Blocked Failure Modal */}
        {isFailed && (
          <div className="p-5 rounded-3xl bg-gradient-to-b from-rose-950/90 to-slate-950 border-2 border-rose-500 text-center space-y-3 animate-fade-in shadow-2xl">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto animate-pulse" />
            <h3 className="text-base font-bold text-white">SEYF BLOKLANDI!</h3>
            <p className="text-xs text-rose-300">
              Barcha urinishlar tugadi. Keyingi safar igna aynan yashil maydon ustiga kelganda bosing.
            </p>
            <div className="flex gap-2 justify-center pt-1">
              <button
                onClick={handleRestart}
                className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                Qayta Urinish (Yangi Sim)
              </button>
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
