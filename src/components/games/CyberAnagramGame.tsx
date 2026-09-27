import React, { useState, useEffect } from 'react';
import { soundManager } from '../../utils/audio';
import { ArrowLeft, RotateCcw, Trophy, Brain, Sparkles, Check, Delete } from 'lucide-react';

interface CyberAnagramGameProps {
  onWin: (ticketsWon: number) => void;
  onBack: () => void;
}

const PUZZLE_WORDS = [
  { word: 'MANTIQ', hint: "To'g'ri fikrlash va xulosa chiqarish ilmi" },
  { word: 'KIBER', hint: "Kompyuter va tarmoqlar olamiga oid tushuncha" },
  { word: 'SERVER', hint: "Ma'lumotlar bazasi va tarmoqni boshqaruvchi markaz" },
  { word: 'SHIFR', hint: "Maxfiy kod yoki kriptografik kalit" },
  { word: 'XOTIRA', hint: "Kognitiv bilimlarni saqlab qolish qobiliyati" },
  { word: 'DAHOLIK', hint: "Yuqori intellekt va ixtirochilik cho'qqisi" },
];

export const CyberAnagramGame: React.FC<CyberAnagramGameProps> = ({ onWin, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambledLetters, setScrambledLetters] = useState<{ id: string; char: string; used: boolean }[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<{ id: string; char: string }[]>([]);
  const [score, setScore] = useState(0);
  const [hasWon, setHasWon] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const currentPuzzle = PUZZLE_WORDS[currentIndex];

  const loadPuzzle = (index: number) => {
    const targetWord = PUZZLE_WORDS[index].word;
    const chars = targetWord.split('');
    // Scramble letters
    const shuffled = chars
      .map((char, i) => ({ id: `${char}-${i}-${Math.random()}`, char, used: false }))
      .sort(() => Math.random() - 0.5);

    // Make sure scrambled is not equal to target
    if (shuffled.map(s => s.char).join('') === targetWord) {
      shuffled.reverse();
    }

    setScrambledLetters(shuffled);
    setSelectedLetters([]);
    setFeedback(null);
  };

  useEffect(() => {
    loadPuzzle(currentIndex);
  }, [currentIndex]);

  const handleSelectLetter = (item: { id: string; char: string; used: boolean }) => {
    if (item.used || hasWon) return;
    soundManager.playCyberClick();

    const nextScrambled = scrambledLetters.map(s => s.id === item.id ? { ...s, used: true } : s);
    setScrambledLetters(nextScrambled);
    setSelectedLetters(prev => [...prev, { id: item.id, char: item.char }]);
  };

  const handleRemoveLetter = (index: number) => {
    soundManager.playCyberClick();
    const removed = selectedLetters[index];
    setSelectedLetters(prev => prev.filter((_, i) => i !== index));
    setScrambledLetters(prev => prev.map(s => s.id === removed.id ? { ...s, used: false } : s));
  };

  const handleCheckWord = () => {
    const assembled = selectedLetters.map(s => s.char).join('');
    if (assembled === currentPuzzle.word) {
      soundManager.playSuccessChime();
      const nextScore = score + 1;
      setScore(nextScore);

      if (nextScore >= 3 || currentIndex >= PUZZLE_WORDS.length - 1) {
        soundManager.playVictoryFanfare();
        setHasWon(true);
        onWin(2);
      } else {
        setFeedback("✅ Barakalla! To'g'ri topdingiz!");
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
        }, 800);
      }
    } else {
      soundManager.playErrorBuzz();
      setFeedback("❌ Noto'g'ri so'z, harflarni qaytadan terib ko'ring!");
    }
  };

  const handleResetCurrent = () => {
    soundManager.playCyberClick();
    loadPuzzle(currentIndex);
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between p-4 rounded-3xl bg-slate-900 border border-purple-500/40 shadow-xl">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">
              So'z & IQ Boshqotirmasi
            </div>
            <h2 className="text-base font-display font-bold text-white flex items-center gap-1.5">
              <span>ANAGRAMMA & SO'Z TOPISH</span>
              <Brain className="w-4 h-4 text-purple-400" />
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-purple-300">
            Natija: <span className="font-bold">{score}/3 so'z</span>
          </div>
          <button
            onClick={handleResetCurrent}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-400 flex items-center justify-center transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-slate-950 border border-purple-500/30 shadow-2xl space-y-6 text-center">
        {/* Hint */}
        <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200">
          💡 <strong className="text-purple-300">Izoh:</strong> {currentPuzzle.hint}
        </div>

        {/* Assembled Word Slot */}
        <div className="flex items-center justify-center gap-2 min-h-14 p-2 bg-slate-900 rounded-2xl border border-slate-800">
          {selectedLetters.length === 0 ? (
            <span className="text-xs font-mono text-slate-500">
              Quyidagi harflarni ketma-ket bosing...
            </span>
          ) : (
            selectedLetters.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleRemoveLetter(idx)}
                className="w-10 h-12 rounded-xl bg-purple-500 text-slate-950 font-display font-black text-lg flex items-center justify-center shadow-lg shadow-purple-500/30 active:scale-95 transition-all cursor-pointer"
              >
                {item.char}
              </button>
            ))
          )}
        </div>

        {/* Scrambled Letter Options */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {scrambledLetters.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectLetter(item)}
              disabled={item.used}
              className={`w-11 h-12 rounded-xl font-display font-black text-lg flex items-center justify-center transition-all ${
                item.used
                  ? 'bg-slate-900 text-slate-700 border border-slate-800 cursor-not-allowed opacity-30'
                  : 'bg-slate-800 hover:bg-slate-700 border border-purple-400/40 text-purple-200 shadow-md active:scale-95 cursor-pointer'
              }`}
            >
              {item.char}
            </button>
          ))}
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div className="text-xs font-mono text-purple-300 animate-pulse">
            {feedback}
          </div>
        )}

        {/* Action Button */}
        <div>
          <button
            onClick={handleCheckWord}
            disabled={selectedLetters.length !== currentPuzzle.word.length}
            className={`w-full py-3 rounded-2xl font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
              selectedLetters.length === currentPuzzle.word.length
                ? 'bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white shadow-purple-500/30 cursor-pointer active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>So'zni Tekshirish</span>
          </button>
        </div>

        {/* Win Banner */}
        {hasWon && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-400 text-center space-y-2 animate-bounce">
            <Trophy className="w-8 h-8 text-amber-400 mx-auto" />
            <h3 className="text-base font-bold text-white">ANAGRAMMALAR YECHILDI!</h3>
            <p className="text-xs text-emerald-300 font-mono">
              Barcha so'zlarni to'g'ri topdingiz! +2 Chipta taqdim etildi!
            </p>
            <button
              onClick={() => {
                setCurrentIndex(0);
                setScore(0);
                setHasWon(false);
              }}
              className="mt-2 px-5 py-2 rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs shadow"
            >
              Qaytadan O'ynash
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
