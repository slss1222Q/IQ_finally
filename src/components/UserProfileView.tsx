import React from 'react';
import { UserProfile, IqRecord } from '../types';
import { soundManager } from '../utils/audio';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  User,
  Brain,
  Trophy,
  Swords,
  Ticket,
  Coins,
  Flame,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';

interface UserProfileViewProps {
  userProfile: UserProfile;
  onStartTest: () => void;
  onStartDuel: () => void;
  onOpenGames: () => void;
  onViewCertificate?: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  userProfile,
  onStartTest,
  onStartDuel,
  onOpenGames,
  onViewCertificate,
}) => {
  // Format real IQ test history for Recharts.
  // STRICT RULE: NO FAKE DATA & NO MOCK STATS.
  // Only actual completed tests or current test score are displayed.
  const chartData: { testLabel: string; score: number; date: string }[] = React.useMemo(() => {
    if (userProfile.iqHistory && userProfile.iqHistory.length > 0) {
      return userProfile.iqHistory.map((rec, index) => ({
        testLabel: `#${rec.testNumber || index + 1}-test`,
        score: rec.score,
        date: rec.date || 'Bugun',
      }));
    }
    // If user has a recorded score but no history array yet, display that single authentic point
    if (userProfile.iqScore > 0) {
      return [
        {
          testLabel: '1-test',
          score: userProfile.iqScore,
          date: 'Oxirgi test',
        },
      ];
    }
    return [];
  }, [userProfile.iqHistory, userProfile.iqScore]);

  // Weekly prize qualification criteria (6 minutes + 12 tickets)
  const totalMinutesSpent = Math.floor((userProfile.weeklyTimeSpentSeconds || 0) / 60);
  const isTimeQualified = (userProfile.weeklyTimeSpentSeconds || 0) >= 360; // 6 min = 360s
  const isTicketsQualified = (userProfile.energyTickets || 0) >= 12; // 12 tickets
  const isFullyQualified = isTimeQualified && isTicketsQualified;

  const timeProgressPercent = Math.min(100, Math.round(((userProfile.weeklyTimeSpentSeconds || 0) / 360) * 100));
  const ticketProgressPercent = Math.min(100, Math.round(((userProfile.energyTickets || 0) / 12) * 100));

  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-6 space-y-6 animate-fade-in">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-cyan-500/30 p-5 sm:p-7 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar with Glow */}
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-cyan-400 via-sky-500 to-indigo-600 p-1 shadow-lg shadow-cyan-500/30 flex items-center justify-center text-4xl sm:text-5xl select-none">
              <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center">
                {userProfile.avatar || '🧠'}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-black text-[10px] uppercase shadow">
              LVL {userProfile.level || 1}
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-display font-black text-white tracking-wide">
                {userProfile.name}
              </h1>
              <span className="inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-xs font-mono text-cyan-300 w-fit mx-auto sm:mx-0">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                {userProfile.levelTitle || 'Mantiq Izlovchi'}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              A'zo bo'lingan sana: <span className="font-mono text-slate-300">{userProfile.joinedAt || '2026-yil'}</span> · ID: <span className="font-mono text-cyan-400">{userProfile.id}</span>
            </p>

            {/* Micro stats pill badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold shadow-sm">
                <Ticket className="w-3.5 h-3.5 text-amber-400" />
                <span>{userProfile.energyTickets} ta chipta</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-bold shadow-sm">
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                <span>{userProfile.iqCoins} IQ Coin</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border border-orange-400/40 text-orange-300 text-xs font-mono font-bold shadow-sm">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>{userProfile.streakDays || 1} kun streak</span>
              </div>
            </div>
          </div>

          {/* Quick Action */}
          <div className="sm:self-center">
            {onViewCertificate && (userProfile.iqScore > 0 || (userProfile.bestIq || 0) > 0) && (
              <button
                onClick={() => {
                  soundManager.playCyberClick();
                  onViewCertificate();
                }}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                <Award className="w-4 h-4" />
                <span>PNG Sertifikat</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SOVG'A OLISH SHARTLARI (Majburiy 6 minut va 12 ta chipta) */}
      <div className="rounded-3xl bg-slate-900/90 border border-amber-400/40 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-display font-bold text-white">
                HAFTALIK STARS SOVG'ASI UCHUN SARALASH SHARTLARI
              </h2>
              <p className="text-xs text-amber-300/80 font-mono">
                Haftalik 15 Stars mukofotiga da'vogarlik qilish uchun quyidagi 2 ta shart majburiydir
              </p>
            </div>
          </div>

          <div>
            {isFullyQualified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Saralashdan o'tgan ✅
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-bold font-mono">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Shartlar bajarilmoqda ⏳
              </span>
            )}
          </div>
        </div>

        {/* 2 Critical Conditions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {/* Shart 1: Majburiy 6 minut faol bo'lish */}
          <div className={`p-4 rounded-2xl border transition-all ${isTimeQualified ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-slate-950/70 border-slate-800'}`}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 font-bold text-slate-200">
                <Clock className="w-4 h-4 text-cyan-400" />
                1-Shart: Kamida 6 minut faol vaqt
              </span>
              <span className="font-mono font-bold text-cyan-400">
                {totalMinutesSpent} / 6 daqiqa
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${isTimeQualified ? 'bg-emerald-400' : 'bg-cyan-400'}`}
                style={{ width: `${timeProgressPercent}%` }}
              />
            </div>
            <div className="text-[11px] mt-2 flex items-center justify-between text-slate-400">
              <span>{isTimeQualified ? '6 minut to\'liq o\'tkazildi ✅' : `Yana ${Math.max(0, 6 - totalMinutesSpent)} daqiqa faol bo'ling`}</span>
              <span className="font-mono text-xs">{timeProgressPercent}%</span>
            </div>
          </div>

          {/* Shart 2: Kamida 12 ta chipta (chip) to'plash */}
          <div className={`p-4 rounded-2xl border transition-all ${isTicketsQualified ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-slate-950/70 border-slate-800'}`}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 font-bold text-slate-200">
                <Ticket className="w-4 h-4 text-amber-400" />
                2-Shart: Kamida 12 ta chipta (chip)
              </span>
              <span className="font-mono font-bold text-amber-400">
                {userProfile.energyTickets} / 12 chipta
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${isTicketsQualified ? 'bg-emerald-400' : 'bg-amber-400'}`}
                style={{ width: `${ticketProgressPercent}%` }}
              />
            </div>
            <div className="text-[11px] mt-2 flex items-center justify-between text-slate-400">
              <span>{isTicketsQualified ? '12+ chipta mavjud ✅' : `Yana ${Math.max(0, 12 - userProfile.energyTickets)} ta chipta kerak`}</span>
              <span className="font-mono text-xs">{ticketProgressPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* RECHARTS CHIZIQLI GRAFIK: IQ BALLARI DINAMIKASI */}
      <div className="rounded-3xl bg-slate-900 border border-cyan-500/30 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,210,255,0.3)]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold text-white flex items-center gap-2">
                IQ BALLARI O'ZGARISH DINAMIKASI
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Recharts
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Topshirilgan testlar bo'yicha intellekt ko'rsatkichi rivoji
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="px-3 py-1 rounded-xl bg-slate-950 border border-cyan-500/40 text-cyan-300 font-mono">
              Eng yuqori: <span className="font-bold text-white">{userProfile.bestIq || userProfile.iqScore || 0}</span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono">
              Jami testlar: <span className="font-bold text-white">{userProfile.completedTestsCount || chartData.length}</span>
            </div>
          </div>
        </div>

        {/* The Recharts Line Chart (NO FAKE DATA) */}
        {chartData.length > 0 ? (
          <div className="w-full pt-4">
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 15, right: 20, left: -15, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.7} />
                  <XAxis
                    dataKey="testLabel"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    tick={{ fill: '#94a3b8' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    domain={[70, 160]}
                    tickLine={false}
                    tick={{ fill: '#94a3b8' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-xl bg-slate-950 border border-cyan-500/50 p-3 shadow-2xl backdrop-blur-md">
                            <div className="text-[11px] font-mono text-cyan-400 font-bold mb-1">
                              {data.testLabel} · {data.date}
                            </div>
                            <div className="text-xl font-black font-display text-white flex items-center gap-1.5">
                              <span>IQ: {data.score}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-200">
                                {data.score >= 135 ? 'Daho' : data.score >= 120 ? 'Yuqori' : 'O\'rtacha'}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#00d2ff"
                    strokeWidth={3}
                    dot={{ fill: '#0a0d14', stroke: '#00d2ff', strokeWidth: 3, r: 5 }}
                    activeDot={{ fill: '#f59e0b', stroke: '#fff', strokeWidth: 2, r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2">
              <span>Shkala: 70 (Minimal) — 160 (Maksimal Wechsler)</span>
              <span className="text-cyan-400">Har bir test natijasi avtomatik ravishda chiziladi</span>
            </div>
          </div>
        ) : (
          /* Empty state strictly adhering to NO FAKE DATA rule */
          <div className="p-8 text-center rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Brain className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">
              Hali IQ test topshirilmadi
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Hech qanday soxta ma'lumotlar qo'shilmagan. 20 ta rasmiy savoldan iborat IQ testni topshiring va intellekt ko'rsatkichingiz grafigi bu yerda real vaqtda aks etadi!
            </p>
            <button
              onClick={() => {
                soundManager.playCyberClick();
                onStartTest();
              }}
              className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <Brain className="w-4 h-4" />
              <span>IQ Testni Boshlash</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Dual Stats Row: 1v1 Duel & Intellekt Ko'rsatkichlari */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Duel Stats */}
        <div className="rounded-3xl bg-slate-900 border border-amber-400/30 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Swords className="w-4 h-4" />
              <span>1V1 JONLI DUEL REYT沢NGI</span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">
              {userProfile.duelRating} MMR
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400">G'alabalar</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                {userProfile.duelWins} ta
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400">Mag'lubiyatlar</div>
              <div className="text-xl font-bold font-mono text-rose-400 mt-0.5">
                {userProfile.duelLosses} ta
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playCyberClick();
              onStartDuel();
            }}
            className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Swords className="w-4 h-4" />
            <span>1v1 Duelga kirish</span>
          </button>
        </div>

        {/* Arcade & Mini Games */}
        <div className="rounded-3xl bg-slate-900 border border-purple-500/30 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>MINI-O'YINLAR VA CHIP YUTISH</span>
            </div>
            <span className="text-xs font-mono font-bold text-purple-300">
              {userProfile.energyTickets} ta chipta
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Qulf buzish, Kiber Labirint, Minalar, Anagramma va Subway Runner o'yinlarini o'ynab, qo'shimcha chiptalar yutib oling va haftalik sovg'alarga yo'l oling!
          </p>

          <button
            onClick={() => {
              soundManager.playCyberClick();
              onOpenGames();
            }}
            className="w-full py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Brain className="w-4 h-4" />
            <span>Mini-O'yinlar maydoniga o'tish</span>
          </button>
        </div>
      </div>
    </div>
  );
};
