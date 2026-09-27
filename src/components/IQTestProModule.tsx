import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Question, UserProfile } from '../types';
import { VisualDiagram } from './VisualDiagram';
import { CertificateGenerator } from './CertificateGenerator';
import { soundManager } from '../utils/audio';
import {
  Timer,
  ArrowRight,
  RotateCcw,
  Award,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  Users,
  Share2,
  Swords,
  Mic,
  MicOff,
  Volume2,
  Zap,
  Flame,
  ShieldAlert,
  Sparkles,
  Trophy,
  Crown,
  Clock,
  Coins,
} from 'lucide-react';

interface IQTestProModuleProps {
  userProfile: UserProfile;
  onTestComplete: (finalScore: number, proBadgesEarned?: string[]) => void;
  onBackToMenu: () => void;
  onSwitchToStandard: () => void;
}

// 15 High-Caliber Pro Mode Questions with Strict 20s Pressure
const PRO_QUESTIONS: Question[] = [
  {
    id: 'pro-1',
    category: 'Mantiq',
    difficulty: 'Qiyin',
    question: "Kvant ketma-ketligini davom ettiring: 3, 5, 9, 17, 33, 65, ?",
    options: ['129', '131', '128', '133'],
    correctIndex: 0, // 129
    explanation: "Har bir son avvalgisini 2 ga ko'paytirib, 1 ayirishdan hosil bo'lmoqda: (65 * 2) - 1 = 129 (yoki farqlar: +2, +4, +8, +16, +32, +64).",
  },
  {
    id: 'pro-2',
    category: 'Visual',
    difficulty: 'Qiyin',
    svgType: 'matrix3x3',
    question: "3x3 Kiber Matritsa: Har bir satrda elementlar 90° soat strelkasi bo'ylab aylanmoqda va nuqtalar soni 1 taga ko'paymoqda. Pastki o'ng katakchada qaysi shakl bo'ladi?",
    options: [
      "90° ga burilgan va 3 ta neon nuqtali shakl",
      "180° ga burilgan va 2 ta nuqtali shakl",
      "O'zgarmagan holatdagi 4 ta nuqtali kvadrat",
      "270° ga burilgan va bitta nuqtali aylana"
    ],
    correctIndex: 0,
    explanation: "Satr bo'ylab harakatda 90 gradus burilish va nuqtalar soni ketma-ket 1 tadan 3 tagacha oshadi.",
  },
  {
    id: 'pro-3',
    category: 'Matematik',
    difficulty: 'Qiyin',
    question: "A va B serverlari birgalikda 12 soniyada faylni shifrlaydi. A serveri yolg'iz 20 soniyada bajarsa, B serverining yolg'iz ishlash tezligi qancha?",
    options: ['24 soniya', '28 soniya', '30 soniya', '32 soniya'],
    correctIndex: 2, // 30s: 1/12 - 1/20 = (5-3)/60 = 2/60 = 1/30
    explanation: "1/12 - 1/20 = 2/60 = 1/30. Demak, B serveriga yolg'iz o'zi uchun aynan 30 soniya kerak.",
  },
  {
    id: 'pro-4',
    category: 'Mantiq',
    difficulty: 'Qiyin',
    question: "Kriptografik analogiya: KIBER (5) : ALGORITM (8) :: KVANT (5) : ?",
    options: ['INTELLEKT (9)', 'Dastur (6)', 'Kod (3)', 'Baza (4)'],
    correctIndex: 0, // INTELLEKT (9)
    explanation: "So'zlarning harflar soni korrelyatsiyasi: Kiber(5) -> Algoritm(8), Kvant(5) -> Intellekt(9 harf).",
  },
  {
    id: 'pro-5',
    category: 'Visual',
    difficulty: 'Qiyin',
    svgType: 'cube',
    question: "Kubik fazoviy yoyilmasida: 'Qizil' yuzaning qarama-qarshi tomonida 'Moviy', 'Yashil'ning qarshisida 'Sariq' bo'lsa, 'Oq'ning ro'parasida qaysi yuza turadi?",
    options: ['Binafsha', 'Qora', 'Kulrang', 'Jigarrang'],
    correctIndex: 1, // Qora (standart 6-yuzli qarama-qarshi model)
    explanation: "Klassik 6 yuzli kubikda uchta juft qarama-qarshi rang bo'ladi: Oq qarshisida Qora yotadi.",
  },
  {
    id: 'pro-6',
    category: 'Matematik',
    difficulty: 'Qiyin',
    question: "Sonlar matritsasi: [4, 9, 25], [36, 49, 64], [81, 100, ?]. Oxirgi son qanday bo'ladi?",
    options: ['121', '144', '169', '111'],
    correctIndex: 0, // 121 (11 ning kvadrati)
    explanation: "Tub va ketma-ket butun sonlarning kvadratlari qatori: 2², 3², 5², 6², 7², 8², 9², 10², 11² = 121.",
  },
  {
    id: 'pro-7',
    category: 'Mantiq',
    difficulty: 'Qiyin',
    question: "Agar barcha Neyronlar Algoritmlar bo'lsa, va ba'zi Algoritmlar O'zi o'rganuvchi bo'lsa, quyidagilardan qaysi biri MUTLAQ TO'G'RI?",
    options: [
      "Barcha Neyronlar O'zi o'rganuvchidir",
      "Ba'zi Algoritmlar Neyronlardir",
      "Hech qanday Neyron O'zi o'rganuvchi emas",
      "Barcha O'zi o'rganuvchilar Neyrondir"
    ],
    correctIndex: 1,
    explanation: "Agar barcha A lar B bo'lsa, demak albatta ba'zi B lar ham A dir (Sillogizm qonuni).",
  },
  {
    id: 'pro-8',
    category: 'Visual',
    difficulty: 'Qiyin',
    svgType: 'shapes',
    question: "Ketma-ketlik: Ichki burchaklar yig'indisi: 180° (Uchburchak), 360° (To'rtburchak), 540° (Beshburchak). Keyingi figuraning ichki burchaklar yig'indisi qancha?",
    options: ['600°', '680°', '720°', '810°'],
    correctIndex: 2, // 720° (Oltiburchak)
    explanation: "(n - 2) * 180 formulasi bo'yicha: (6 - 2) * 180 = 720° (Oltiburchak).",
  },
  {
    id: 'pro-9',
    category: 'Matematik',
    difficulty: 'Qiyin',
    question: "Bir guruh dasturchilar bir-birlari bilan 45 marta qo'l berib ko'rishdilar. Guruhda jami necha nafar dasturchi bo'lgan?",
    options: ['8 nafar', '9 nafar', '10 nafar', '12 nafar'],
    correctIndex: 2, // 10 nafar: n*(n-1)/2 = 45 => 10*9/2 = 45
    explanation: "Kombinatorika formulasi: n*(n - 1) / 2 = 45 => n = 10 nafar dasturchi.",
  },
  {
    id: 'pro-10',
    category: 'Mantiq',
    difficulty: 'Qiyin',
    question: "Teskari kodlash: AGENT = 1-7-5-14-20 bo'lsa, BRAIN so'zining sonli shifri qanday?",
    options: [
      '2-18-1-9-14',
      '2-17-1-8-13',
      '3-19-2-10-15',
      '2-18-1-10-14'
    ],
    correctIndex: 0, // B(2) R(18) A(1) I(9) N(14)
    explanation: "Lotin alifbosidagi tartib raqamlari: B=2, R=18, A=1, I=9, N=14.",
  },
  {
    id: 'pro-11',
    category: 'Visual',
    difficulty: 'Qiyin',
    svgType: 'patternSeries',
    question: "Patternlar to'lqini: Sinusoida har qadamda amplitudasini 2 barobar qisqartirib, chastotasini 2 barobar oshirmoqda. Keyingi to'lqin qanday ko'rinishda bo'ladi?",
    options: [
      "O'ta zich va past amplitudali kiber tebranish",
      "Keng va baland amplitudali tekis to'lqin",
      "Doimiy to'g'ri chiziq",
      "Uchburchakli qirrali impuls"
    ],
    correctIndex: 0,
    explanation: "Chastota oshsa to'lqinlar zichlashadi, amplituda pasaysa to'lqin balandligi kichrayadi.",
  },
  {
    id: 'pro-12',
    category: 'Matematik',
    difficulty: 'Qiyin',
    question: "Agar x + 1/x = 5 bo'lsa, x² + 1/x² qiymati nechaga teng bo'ladi?",
    options: ['25', '23', '27', '21'],
    correctIndex: 1, // (x + 1/x)^2 - 2 = 25 - 2 = 23
    explanation: "(x + 1/x)² = x² + 2 + 1/x² = 25 => x² + 1/x² = 23.",
  },
  {
    id: 'pro-13',
    category: 'Mantiq',
    difficulty: 'Qiyin',
    question: "A, B, C, D poygada marraga kelishdi. A birinchi kelmadi. B oxirgi kelmadi. C D dan keyin keldi, lekin B dan oldin keldi. Birinchi o'rinni kim oldi?",
    options: ['A', 'B', 'C', 'D'],
    correctIndex: 3, // D > C > B > A tartibi
    explanation: "C D dan keyin, ammo B dan oldin (D > C > B). A birinchi emas va oxiri bo'sh, demak D birinchi o'rinda kelgan.",
  },
  {
    id: 'pro-14',
    category: 'Visual',
    difficulty: 'Qiyin',
    svgType: 'clockMath',
    question: "Soat siferblatida soat mili va daqiqa mili 03:00 dan to'liq 1 soat 15 daqiqa o'tgach qanday burchak hosil qiladi?",
    options: ['37.5°', '52.5°', '45°', '60°'],
    correctIndex: 1, // 04:15 da: daqiqa mili 90°, soat mili: 4*30 + 15*0.5 = 120 + 7.5 = 127.5°. Farqi: 127.5 - 90 = 37.5° yoki 52.5°
    explanation: "04:15 da soat mili 127.5° da, daqiqa mili esa 90° da bo'ladi. Oralaridagi burchak: |127.5° - 90°| = 37.5°.",
  },
  {
    id: 'pro-15',
    category: 'Mantiq',
    difficulty: 'Qiyin',
    question: "Kvant paradoksi: Hech bir daho dangasa emas. Ba'zi talabalar daho. Shuning uchun: ...",
    options: [
      "Ba'zi talabalar dangasa emas",
      "Barcha talabalar dangasa",
      "Hech bir talaba daho emas",
      "Barcha daholar talabadir"
    ],
    correctIndex: 0,
    explanation: "Daho bo'lgan talabalar daho xossasiga ko'ra dangasa bo'la olmaydi. Demak, ba'zi talabalar dangasa emas.",
  },
];

export const IQTestProModule: React.FC<IQTestProModuleProps> = ({
  userProfile,
  onTestComplete,
  onBackToMenu,
  onSwitchToStandard,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answeredState, setAnsweredState] = useState<{ [qId: string]: number }>({});
  const [timeLeft, setTimeLeft] = useState(20); // Strict 20s time pressure!
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [calculatedIq, setCalculatedIq] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);
  const [totalTimeTaken, setTotalTimeTaken] = useState(0);
  const [chronoBonus, setChronoBonus] = useState(0);
  const [unlockedProBadges, setUnlockedProBadges] = useState<string[]>([]);

  // Voice Recognition
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const currentQ = PRO_QUESTIONS[currentIndex] || PRO_QUESTIONS[0];

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'uz-UZ';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        const text = currentTranscript.trim().toLowerCase();
        processVoiceAnswer(text);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [currentIndex, currentQ]);

  const processVoiceAnswer = (spokenText: string) => {
    if (!currentQ || !currentQ.options) return;
    let matchedIndex: number | null = null;
    const lower = spokenText.toLowerCase();

    if (lower.includes('variant a') || lower.includes('a')) matchedIndex = 0;
    else if (lower.includes('variant b') || lower.includes('b')) matchedIndex = 1;
    else if (lower.includes('variant c') || lower.includes('c')) matchedIndex = 2;
    else if (lower.includes('variant d') || lower.includes('d')) matchedIndex = 3;

    if (matchedIndex !== null) {
      soundManager.playCyberClick();
      setSelectedOption(matchedIndex);
      setAnsweredState((prev) => ({ ...prev, [currentQ.id]: matchedIndex! }));
      setVoiceFeedback(`⚡ Ovoz: [${['A', 'B', 'C', 'D'][matchedIndex]}] tanlandi!`);
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    } else {
      soundManager.playCyberClick();
      setVoiceFeedback("🎤 Eshitilmoqda... Variantni ayting (A, B, C, D)...");
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  // High-tension 20s Countdown Timer with Heartbeat Ticks
  useEffect(() => {
    if (isTestFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAutoNext();
          return 20;
        }
        // Heartbeat sound during urgent 5s
        if (prev <= 5) {
          soundManager.playCyberClick();
        }
        return prev - 1;
      });
      setTotalTimeTaken((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, isTestFinished]);

  const handleAutoNext = () => {
    soundManager.playErrorBuzz();
    if (currentIndex < PRO_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setTimeLeft(20);
    } else {
      finishProTest();
    }
  };

  const handleSelectOption = (idx: number) => {
    soundManager.playCyberClick();
    setSelectedOption(idx);
    setAnsweredState((prev) => ({
      ...prev,
      [currentQ.id]: idx,
    }));

    // Time-pressure speed bonus: answering in first 8 seconds gives bonus points!
    if (timeLeft > 12) {
      setChronoBonus((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    soundManager.playCyberClick();
    if (currentIndex < PRO_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(answeredState[PRO_QUESTIONS[currentIndex + 1]?.id] ?? null);
      setTimeLeft(20);
    } else {
      finishProTest();
    }
  };

  const finishProTest = () => {
    let correctCount = 0;
    PRO_QUESTIONS.forEach((q) => {
      if (answeredState[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const accuracy = correctCount / PRO_QUESTIONS.length;
    // Pro scaling: Base 100 up to 160
    let score = Math.round(100 + accuracy * 55);

    // Rapid Chrono bonus (up to +5 IQ points)
    if (chronoBonus >= 8 && correctCount >= 10) {
      score += 5;
    }

    score = Math.min(160, Math.max(95, score));
    setCalculatedIq(score);

    // Evaluate exclusive Pro Badge unlocks
    const earnedBadges: string[] = [];
    if (score >= 145) {
      earnedBadges.push('badge-pro-titan'); // Kiber Pro Titan (145+)
    }
    if (score >= 135) {
      earnedBadges.push('badge-pro-chrono'); // Vaqt Snayperi (Chrono)
    }
    if (accuracy >= 0.9) {
      earnedBadges.push('badge-pro-elite'); // Kiber IQ Kvant Elitasi
    }

    setUnlockedProBadges(earnedBadges);
    setIsTestFinished(true);
    soundManager.playVictoryFanfare();
    onTestComplete(score, earnedBadges);
  };

  const restartProTest = () => {
    soundManager.playCyberClick();
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnsweredState({});
    setTimeLeft(20);
    setIsTestFinished(false);
    setTotalTimeTaken(0);
    setChronoBonus(0);
    setUnlockedProBadges([]);
  };

  // Test Finished View
  if (isTestFinished) {
    const correctCount = PRO_QUESTIONS.filter(
      (q) => answeredState[q.id] === q.correctIndex
    ).length;

    return (
      <div className="w-full max-w-xl mx-auto p-4 sm:p-6 space-y-6 animate-fade-in select-none">
        <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-amber-400/80 shadow-[0_0_40px_rgba(251,191,36,0.3)] text-center relative overflow-hidden">
          {/* Animated Gold Sparks */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500/30 to-yellow-400/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 mb-4 shadow-[0_0_25px_rgba(251,191,36,0.5)]">
            <Crown className="w-10 h-10 animate-bounce" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-400/50 text-[11px] font-mono text-amber-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            <span>PRO REJIM NATIJASI (20s BOSIM OSTIDA)</span>
          </div>

          <h2 className="text-2xl font-display font-extrabold text-white tracking-wide">
            PRO IQ TEST YAKUNLANDI!
          </h2>

          <div className="my-6 p-5 rounded-3xl bg-slate-950/90 border border-amber-400/40 shadow-inner flex flex-col items-center">
            <span className="text-xs text-amber-300 font-mono tracking-widest uppercase">
              PRO IQ KOEFFITSIYENTINGIZ
            </span>
            <div className="text-6xl sm:text-7xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 my-2 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">
              {calculatedIq}
            </div>

            {/* Score Tier Badge */}
            <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400 text-amber-300 font-bold text-xs flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>
                {calculatedIq >= 145
                  ? "TITAN DAHO (TOP 0.1%)"
                  : calculatedIq >= 135
                  ? "KIBER ELITA (TOP 1%)"
                  : calculatedIq >= 120
                  ? "YUQORI INTELEKT"
                  : "STANDART PRO"}
              </span>
            </div>

            <div className="w-full mt-4 pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-xs text-slate-300">
              <div>
                To'g'ri: <strong className="text-emerald-400">{correctCount}/{PRO_QUESTIONS.length}</strong>
              </div>
              <div>
                Aniqlik: <strong className="text-cyan-400">{Math.round((correctCount / PRO_QUESTIONS.length) * 100)}%</strong>
              </div>
              <div>
                Tezlik bonusi: <strong className="text-amber-400">+{chronoBonus}</strong>
              </div>
            </div>
          </div>

          {/* Unlocked Exclusive Pro Badges Section */}
          {unlockedProBadges.length > 0 && (
            <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-purple-950/70 border-2 border-amber-400/60 text-left space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>YANGI EKSKLYUZIV PRO NISHONLAR OCHILDI!</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {unlockedProBadges.map((badgeId) => (
                  <div
                    key={badgeId}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-400/40 flex items-center gap-2 text-xs"
                  >
                    <span className="text-xl">
                      {badgeId === 'badge-pro-titan'
                        ? '🔱'
                        : badgeId === 'badge-pro-chrono'
                        ? '⏳'
                        : '💠'}
                    </span>
                    <div>
                      <div className="font-bold text-white">
                        {badgeId === 'badge-pro-titan'
                          ? 'Kiber Pro Titan (145+)'
                          : badgeId === 'badge-pro-chrono'
                          ? 'Vaqt Snayperi (Chrono)'
                          : 'Kiber IQ Kvant Elitasi'}
                      </div>
                      <div className="text-[10px] text-amber-300">
                        Profilingizga biriktirildi!
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => {
                soundManager.playCyberClick();
                setShowCertificate(true);
              }}
              className="h-12 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.4)] active:scale-95 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Pro Sertifikatni Yuklash</span>
            </button>

            <button
              onClick={restartProTest}
              className="h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-semibold text-xs sm:text-sm border border-amber-400/50 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Qayta Pro Sinov</span>
            </button>
          </div>

          <button
            onClick={onBackToMenu}
            className="w-full mt-4 py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Asosiy Menyuga Qaytish
          </button>
        </div>

        {showCertificate && (
          <CertificateGenerator
            userName={userProfile.name}
            iqScore={calculatedIq}
            date={new Date().toISOString().split('T')[0]}
            onClose={() => setShowCertificate(false)}
          />
        )}
      </div>
    );
  }

  // Active Pro Test View
  const progressPercent = ((currentIndex + 1) / PRO_QUESTIONS.length) * 100;
  const isUrgent = timeLeft <= 6;

  return (
    <div className="w-full max-w-xl mx-auto p-3 sm:p-5 space-y-4 select-none animate-fade-in">
      {/* Top Pro Header & Mode Switcher */}
      <div className="p-3.5 rounded-3xl bg-slate-900 border-2 border-amber-400/60 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)]">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-amber-400 tracking-wider flex items-center gap-1 font-bold">
                <Flame className="w-3 h-3 text-rose-500 animate-pulse" />
                <span>PREMIUM PRO IQ TEST REJIMI</span>
              </div>
              <div className="text-sm font-display font-bold text-white">
                Savol {currentIndex + 1} / {PRO_QUESTIONS.length}
              </div>
            </div>
          </div>

          {/* Pro / Standard Switcher Button */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onSwitchToStandard}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[11px] font-mono border border-slate-700 transition-colors cursor-pointer"
              title="Standart rejimga o'tish (45s)"
            >
              Standartga
            </button>
            <div className="px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 font-bold font-mono text-[11px] flex items-center gap-1 shadow-sm">
              <Zap className="w-3 h-3" />
              <span>PRO 20s</span>
            </div>
          </div>
        </div>

        {/* Status Bar with Live Speed Timer */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleVoiceInput}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold font-mono flex items-center gap-1 transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/40'
              }`}
            >
              <Mic className="w-3 h-3" />
              <span>{isListening ? 'Eshitilmoqda...' : 'Ovozli Javob'}</span>
            </button>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
              {currentQ.category}
            </span>
          </div>

          {/* High-Tension 20s Countdown */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-xs font-black border transition-all ${
              isUrgent
                ? 'bg-rose-500/30 border-rose-500 text-rose-300 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.6)] scale-105'
                : 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
            }`}
          >
            <Timer className={`w-3.5 h-3.5 ${isUrgent ? 'animate-spin' : ''}`} />
            <span>{timeLeft} soniya</span>
          </div>
        </div>
      </div>

      {/* Progress Bar with Pulsing Glow */}
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full transition-all duration-300 shadow-md ${
            isUrgent
              ? 'bg-gradient-to-r from-rose-500 to-red-600'
              : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 shadow-[0_0_10px_#fbbf24]'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Question Card with Cyber Border */}
      <div
        className={`p-5 rounded-3xl bg-slate-900 border-2 transition-all shadow-2xl relative overflow-hidden ${
          isUrgent
            ? 'border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.3)]'
            : 'border-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.2)]'
        }`}
      >
        {/* Voice Feedback Banner */}
        {voiceFeedback && (
          <div className="mb-4 p-2.5 rounded-2xl bg-amber-950/80 border border-amber-400 text-xs text-amber-200 flex items-center justify-between shadow-lg animate-pulse">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{voiceFeedback}</span>
            </div>
            <button
              onClick={() => setVoiceFeedback(null)}
              className="text-amber-400 hover:text-white px-1 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex items-start justify-between gap-3 mb-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40">
            PRO SAVOL #{currentIndex + 1}
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Vaqt: 20s
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
          {currentQ.question}
        </h3>

        {/* Visual Diagram */}
        {currentQ.svgType && (
          <div className="my-3">
            <VisualDiagram svgType={currentQ.svgType} />
          </div>
        )}

        {/* Options Grid */}
        <div className="mt-5 space-y-2.5">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const letter = ['A', 'B', 'C', 'D'][idx];

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`w-full p-3.5 rounded-2xl text-left text-xs sm:text-sm flex items-center gap-3 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400/20 border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] text-white font-bold scale-[1.01]'
                    : 'bg-slate-950/80 border border-slate-800 hover:border-amber-400/50 text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {letter}
                </div>
                <span className="flex-1 font-medium">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={onBackToMenu}
            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Chiqish
          </button>

          <button
            onClick={handleNext}
            disabled={selectedOption === null}
            className={`h-11 px-5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              selectedOption !== null
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 text-slate-950 shadow-lg shadow-amber-400/30 active:scale-95 font-black'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>
              {currentIndex === PRO_QUESTIONS.length - 1
                ? 'Pro Natijani Hisoblash'
                : 'Keyingi Savol'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
