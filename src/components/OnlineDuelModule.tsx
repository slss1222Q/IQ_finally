import React, { useState, useEffect } from 'react';
import { UserProfile, Question } from '../types';
import { OPPONENTS } from '../data/initialQuestions';
import { soundManager } from '../utils/audio';
import { Swords, Zap, Timer, Trophy, ShieldAlert, CheckCircle2, RotateCcw, ArrowLeft } from 'lucide-react';

interface OnlineDuelModuleProps {
  userProfile: UserProfile;
  questions: Question[];
  onDuelFinish: (
    won: boolean,
    ratingChange: number,
    matchDetails?: {
      playerScore: number;
      opponentScore: number;
      opponentName: string;
      opponentAvatar: string;
      opponentRating: number;
    }
  ) => void;
  onBack: () => void;
}

type DuelStage = 'matchmaking' | 'battle' | 'result';

export const OnlineDuelModule: React.FC<OnlineDuelModuleProps> = ({
  userProfile,
  questions,
  onDuelFinish,
  onBack,
}) => {
  const [stage, setStage] = useState<DuelStage>('matchmaking');
  const [opponent, setOpponent] = useState(OPPONENTS[0]);
  const [round, setRound] = useState(1);
  const totalRounds = 5;

  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [roundTimeLeft, setRoundTimeLeft] = useState(15);
  const [playerAnswered, setPlayerAnswered] = useState<number | null>(null);
  const [opponentAnswered, setOpponentAnswered] = useState<boolean>(false);
  const [opponentIsCorrect, setOpponentIsCorrect] = useState<boolean>(false);

  // Matchmaking simulation
  useEffect(() => {
    if (stage === 'matchmaking') {
      const randomOpp = OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)];
      setOpponent(randomOpp);

      const matchTimer = setTimeout(() => {
        soundManager.playVictoryFanfare();
        setStage('battle');
        setRound(1);
        setPlayerScore(0);
        setOpponentScore(0);
        setCurrentQIndex(Math.floor(Math.random() * (questions.length - 6)));
        setRoundTimeLeft(15);
      }, 2500);

      return () => clearTimeout(matchTimer);
    }
  }, [stage]);

  const currentDuelQ = questions[(currentQIndex + round - 1) % questions.length] || questions[0];

  // Round Timer & Opponent simulated response
  useEffect(() => {
    if (stage !== 'battle') return;

    // Reset round state
    setPlayerAnswered(null);
    setOpponentAnswered(false);
    setRoundTimeLeft(15);

    // Opponent will answer after simulated thinking delay (3 to 7 seconds)
    const oppDelay = Math.max(2500, opponent.speed - Math.random() * 1500);
    const oppTimer = setTimeout(() => {
      const willBeCorrect = Math.random() < 0.75; // 75% accuracy
      setOpponentAnswered(true);
      setOpponentIsCorrect(willBeCorrect);
      if (willBeCorrect) {
        soundManager.playDuelHit();
        setOpponentScore((prev) => prev + 100);
      }
    }, oppDelay);

    const clockTimer = setInterval(() => {
      setRoundTimeLeft((prev) => {
        if (prev <= 1) {
          handleRoundEnd();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(oppTimer);
      clearInterval(clockTimer);
    };
  }, [stage, round]);

  const handlePlayerAnswer = (idx: number) => {
    if (playerAnswered !== null) return; // already answered
    soundManager.playCyberClick();
    setPlayerAnswered(idx);

    const isCorrect = idx === currentDuelQ.correctIndex;
    if (isCorrect) {
      soundManager.playSuccessChime();
      const speedBonus = roundTimeLeft * 5;
      setPlayerScore((prev) => prev + 100 + speedBonus);
    } else {
      soundManager.playErrorBuzz();
    }

    // Advance round shortly
    setTimeout(() => {
      handleRoundEnd();
    }, 1200);
  };

  const handleRoundEnd = () => {
    if (round < totalRounds) {
      setRound((prev) => prev + 1);
    } else {
      // Duel finished!
      setStage('result');
      const won = playerScore >= opponentScore;
      const ratingChange = won ? +25 : -15;
      if (won) {
        soundManager.playVictoryFanfare();
      } else {
        soundManager.playErrorBuzz();
      }
      onDuelFinish(won, ratingChange, {
        playerScore,
        opponentScore,
        opponentName: opponent.name,
        opponentAvatar: opponent.avatar,
        opponentRating: opponent.rating,
      });
    }
  };

  const restartDuel = () => {
    soundManager.playCyberClick();
    setStage('matchmaking');
  };

  // 1. MATCHMAKING SCREEN
  if (stage === 'matchmaking') {
    return (
      <div className="w-full max-w-md mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="relative">
          <div className="w-28 h-28 rounded-full border-2 border-cyan-400/80 flex items-center justify-center animate-ping absolute inset-0 opacity-40"></div>
          <div className="w-28 h-28 rounded-full border border-cyan-400 bg-slate-900 flex items-center justify-center shadow-xl shadow-cyan-500/30">
            <Swords className="w-12 h-12 text-cyan-400 animate-pulse" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-wide">
            1V1 DUEL: RAQIB QIDIRILMOQDA...
          </h2>
          <p className="text-xs text-cyan-400 font-mono mt-1">
            UZBEKISTAN INTELEKT LIGASI TARMOG'I
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 max-w-xs space-y-1">
          <div>🎮 5 ta tezkor mantiqiy savol</div>
          <div>⚡ Kim tez va to'g'ri topsa g'olib bo'ladi</div>
          <div>🏆 Reyting: +25 Elo ochko</div>
        </div>

        <button
          onClick={onBack}
          className="text-xs text-slate-400 hover:text-white transition-colors"
        >
          Bekor qilish
        </button>
      </div>
    );
  }

  // 2. RESULT SCREEN
  if (stage === 'result') {
    const isWinner = playerScore >= opponentScore;
    return (
      <div className="w-full max-w-md mx-auto p-4 space-y-5 animate-fade-in text-center">
        <div className="p-6 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-400 mb-3 shadow-lg">
            <Trophy className="w-9 h-9" />
          </div>

          <h2 className="text-2xl font-display font-bold text-white">
            {isWinner ? "G'ALABA QOZONDINGIZ!" : "MAG'LUBIYAT"}
          </h2>
          <p className="text-xs text-cyan-400 font-mono mt-0.5">
            {isWinner ? "Sizning tezligingiz va mantigingiz ustun keldi!" : "Keyingi safar albatta yutasiz!"}
          </p>

          {/* Versus Summary Box */}
          <div className="my-5 p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-3 items-center">
            <div>
              <div className="text-2xl">{userProfile.avatar}</div>
              <div className="text-xs font-bold text-white mt-1">{userProfile.name}</div>
              <div className="text-lg font-bold font-mono text-cyan-400">{playerScore}</div>
            </div>

            <div className="text-slate-500 font-bold font-display text-sm">
              VS
            </div>

            <div>
              <div className="text-2xl">{opponent.avatar}</div>
              <div className="text-xs font-bold text-white mt-1">{opponent.name}</div>
              <div className="text-lg font-bold font-mono text-amber-400">{opponentScore}</div>
            </div>
          </div>

          {/* Rating Change */}
          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs font-mono font-bold flex items-center justify-between">
            <span className="text-slate-300">Yangi Duel Reytingi:</span>
            <span className={isWinner ? "text-emerald-400" : "text-rose-400"}>
              {userProfile.duelRating + (isWinner ? 25 : -15)} ({isWinner ? '+25' : '-15'})
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={restartDuel}
              className="h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Yangi Duel</span>
            </button>
            <button
              onClick={onBack}
              className="h-11 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Menyu</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. LIVE BATTLE ARENA
  return (
    <div className="w-full max-w-xl mx-auto p-3 sm:p-5 space-y-4 animate-fade-in">
      {/* Versus Scoreboard Header */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-xl">
        <div className="flex items-center justify-between">
          {/* Player */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-lg">
              {userProfile.avatar}
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                <span>{userProfile.name}</span>
                <span className="text-[10px] text-cyan-400">(Siz)</span>
              </div>
              <div className="text-xs font-mono font-bold text-cyan-300">
                {playerScore} ball
              </div>
            </div>
          </div>

          {/* Round Indicator & Timer */}
          <div className="text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase">
              Raund {round} / {totalRounds}
            </div>
            <div className="text-sm font-mono font-bold text-amber-400 flex items-center justify-center gap-1">
              <Timer className="w-3.5 h-3.5" />
              <span>{roundTimeLeft}s</span>
            </div>
          </div>

          {/* Opponent */}
          <div className="flex items-center gap-2 text-right">
            <div>
              <div className="text-xs font-bold text-white flex items-center justify-end gap-1">
                <span>{opponent.name}</span>
              </div>
              <div className="text-xs font-mono font-bold text-amber-300">
                {opponentScore} ball
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-lg">
              {opponent.avatar}
            </div>
          </div>
        </div>

        {/* Live Momentum Bars */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden flex justify-end">
            <div
              className="h-full bg-cyan-400 transition-all duration-300"
              style={{ width: `${Math.min(100, (playerScore / 600) * 100)}%` }}
            />
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all duration-300"
              style={{ width: `${Math.min(100, (opponentScore / 600) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Duel Question Card */}
      <div className="p-5 rounded-3xl bg-slate-900/95 border border-cyan-500/40 shadow-xl relative">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
          <span className="font-mono text-cyan-400">⚡ TEZKOR MANTIQ JANGI</span>
          {opponentAnswered ? (
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Raqib javob berdi!
            </span>
          ) : (
            <span className="text-slate-400 italic">Raqib o'ylamoqda...</span>
          )}
        </div>

        <h3 className="text-base font-semibold text-white leading-relaxed">
          {currentDuelQ.question}
        </h3>

        {/* Options */}
        <div className="mt-5 space-y-2">
          {currentDuelQ.options.map((option, idx) => {
            const isSelected = playerAnswered === idx;
            const isCorrect = idx === currentDuelQ.correctIndex;
            const showAnswerStatus = playerAnswered !== null;

            let borderClass = 'border-slate-800 hover:border-slate-700 bg-slate-950/80';
            if (showAnswerStatus) {
              if (isCorrect) {
                borderClass = 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold';
              } else if (isSelected && !isCorrect) {
                borderClass = 'border-rose-500 bg-rose-950/40 text-rose-300 font-bold';
              }
            }

            return (
              <button
                key={idx}
                disabled={playerAnswered !== null}
                onClick={() => handlePlayerAnswer(idx)}
                className={`w-full p-3.5 rounded-xl text-left text-xs sm:text-sm flex items-center justify-between transition-all border ${borderClass}`}
              >
                <span>{option}</span>
                {showAnswerStatus && isCorrect && (
                  <span className="text-emerald-400 font-bold text-xs">✓ To'g'ri</span>
                )}
                {showAnswerStatus && isSelected && !isCorrect && (
                  <span className="text-rose-400 font-bold text-xs">✗ Noto'g'ri</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
