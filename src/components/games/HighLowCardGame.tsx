import React, { useState, useEffect } from 'react';
import { soundManager } from '../../utils/audio';
import { ArrowLeft, RotateCcw, Trophy, ArrowUp, ArrowDown, Sparkles, Flame, Shield } from 'lucide-react';

interface HighLowCardGameProps {
  onWin: (ticketsWon: number) => void;
  onBack: () => void;
}

export const HighLowCardGame: React.FC<HighLowCardGameProps> = ({ onWin, onBack }) => {
  const [currentCard, setCurrentCard] = useState<number>(50);
  const [nextCard, setNextCard] = useState<number | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [hasWon, setHasWon] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const initGame = () => {
    setCurrentCard(Math.floor(Math.random() * 80) + 10);
    setNextCard(null);
    setStreak(0);
    setHasWon(false);
    setFeedback("Navbatdagi karta qiymatini taxmin qiling: Katta yoki Kichik?");
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleGuess = (guess: 'higher' | 'lower') => {
    if (hasWon) return;

    // Draw next card (1-100), different from current
    let drawn = Math.floor(Math.random() * 98) + 1;
    if (drawn === currentCard) drawn = drawn > 50 ? drawn - 1 : drawn + 1;

    setNextCard(drawn);

    const isCorrect = guess === 'higher' ? drawn > currentCard : drawn < currentCard;

    if (isCorrect) {
      soundManager.playSuccessChime();
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setBestStreak(prev => Math.max(prev, nextStreak));

      if (nextStreak >= 5) {
        soundManager.playVictoryFanfare();
        setHasWon(true);
        setFeedback("🎉 5 TA TO'G'RI TAXMIN! JACKPOT SOVRINI YUTILDI!");
        onWin(2);
      } else {
        setFeedback(`✅ To'g'ri! ${drawn} ${guess === 'higher' ? '>' : '<'} ${currentCard}. Ketma-ketlik: ${nextStreak}/5`);
      }
    } else {
      soundManager.playErrorBuzz();
      setStreak(0);
      setFeedback(`❌ Xato! Yangi karta ${drawn} edi (${currentCard} dan ${drawn > currentCard ? 'katta' : 'kichik'}).`);
    }

    // Set next card as current after delay
    setTimeout(() => {
      setCurrentCard(drawn);
      setNextCard(null);
    }, 900);
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between p-4 rounded-3xl bg-slate-900 border border-amber-400/40 shadow-xl">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">
              Tezkor Ehtimollar O'yini
            </div>
            <h2 className="text-base font-display font-bold text-white flex items-center gap-1.5">
              <span>BALAND-PAST KIBER KARTA</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-amber-300">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Streak: <strong>{streak}/5</strong></span>
          </div>
          <button
            onClick={initGame}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 flex items-center justify-center transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-slate-950 border border-amber-400/30 shadow-2xl space-y-6 text-center">
        {/* Card Display Area */}
        <div className="flex items-center justify-center gap-4">
          {/* Current Card */}
          <div className="w-36 h-48 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 border-2 border-amber-400 p-3 shadow-[0_0_20px_rgba(251,191,36,0.25)] flex flex-col justify-between">
            <div className="text-left font-mono text-xs text-amber-400 font-bold">
              KIBER #
            </div>
            <div className="text-5xl font-mono font-black text-amber-300 tracking-tight">
              {currentCard}
            </div>
            <div className="text-right font-mono text-[10px] text-slate-400">
              1 — 100
            </div>
          </div>

          {/* Next Card Indicator (flips on draw) */}
          <div className={`w-36 h-48 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
            nextCard !== null
              ? 'bg-slate-900 border-cyan-400 text-cyan-300 shadow-lg'
              : 'bg-slate-900/40 border-slate-800 text-slate-600'
          }`}>
            {nextCard !== null ? (
              <span className="text-5xl font-mono font-black animate-scale-up">
                {nextCard}
              </span>
            ) : (
              <span className="text-3xl font-mono">?</span>
            )}
            <span className="text-[10px] font-mono text-slate-500 mt-2">
              Keyingi karta
            </span>
          </div>
        </div>

        {/* Feedback info */}
        <div className="text-xs font-mono text-slate-300 bg-slate-900/70 p-3 rounded-2xl border border-slate-800">
          {feedback}
        </div>

        {/* Prediction Buttons: Higher or Lower */}
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
          <button
            onClick={() => handleGuess('higher')}
            disabled={nextCard !== null || hasWon}
            className="py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-display font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <ArrowUp className="w-5 h-5" />
            <span>BALAND (Katta)</span>
          </button>

          <button
            onClick={() => handleGuess('lower')}
            disabled={nextCard !== null || hasWon}
            className="py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-400 text-white font-display font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <ArrowDown className="w-5 h-5" />
            <span>PAST (Kichik)</span>
          </button>
        </div>

        {/* Win Banner */}
        {hasWon && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-400 text-center space-y-2 animate-bounce">
            <Trophy className="w-8 h-8 text-amber-400 mx-auto" />
            <h3 className="text-base font-bold text-white">5 TA KETMA-KET G'ALABA!</h3>
            <p className="text-xs text-emerald-300 font-mono">
              Intuitiv ehtimollar rekordini o'rnatdingiz! +2 Chipta berildi!
            </p>
            <button
              onClick={initGame}
              className="mt-2 px-5 py-2 rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs shadow"
            >
              Yana O'ynash
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
