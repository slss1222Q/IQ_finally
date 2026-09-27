import React, { useState } from 'react';
import {
  UserProfile,
  NavigationTab,
  BroadcastNotification,
  DuelOutcome,
  DailyMission,
  SponsorChannelTask,
} from '../types';
import { soundManager } from '../utils/audio';
import {
  Brain,
  Swords,
  Grid,
  Trophy,
  Sparkles,
  ArrowRight,
  Bell,
  Zap,
  Gift,
  Bot,
  Crown,
  Award,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  Clock,
  Ticket,
  ExternalLink,
  History,
  TrendingUp,
  User,
} from 'lucide-react';
import { BadgesAndStreakCard } from './BadgesAndStreakCard';
import { DailyLoginRewards } from './DailyLoginRewards';
import { DailyMissionsCard } from './DailyMissionsCard';
import { RecentDuelFeed } from './RecentDuelFeed';
import { HelpFaqSection } from './HelpFaqSection';
import logoImg from '../assets/images/iq_level_logo_1790108461494.jpg';

interface HomeDashboardProps {
  userProfile: UserProfile;
  onNavigate: (tab: NavigationTab) => void;
  activeBroadcast: BroadcastNotification | null;
  onDismissBroadcast: () => void;
  onStartTest: () => void;
  onStartDuel: () => void;
  onClaimDailyStreak: (reward?: { coins: number; tickets: number; day: number }) => void;
  onOpenWheel: () => void;
  onViewCertificate?: () => void;
  recentDuels?: DuelOutcome[];
  customMissions?: DailyMission[];
  sponsorTasks?: SponsorChannelTask[];
  onClaimMissionReward?: (missionId: string, coins: number, xp: number) => void;
  onClaimSponsorReward?: (taskId: string, tickets: number) => void;
  onOpenLinkMission?: (mission: DailyMission) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  userProfile,
  onNavigate,
  activeBroadcast,
  onDismissBroadcast,
  onStartTest,
  onStartDuel,
  onClaimDailyStreak,
  onOpenWheel,
  onViewCertificate,
  recentDuels = [],
  customMissions = [],
  sponsorTasks = [],
  onClaimMissionReward = () => {},
  onClaimSponsorReward = () => {},
  onOpenLinkMission,
}) => {
  const [showFaq, setShowFaq] = useState(false);
  const [completedSponsors, setCompletedSponsors] = useState<{ [id: string]: boolean }>({});

  const isTimeQualified = (userProfile.weeklyTimeSpentSeconds || 0) >= 360; // 6 minut
  const isTicketsQualified = (userProfile.energyTickets || 0) >= 12; // 12 chip
  const activeMinutes = Math.floor((userProfile.weeklyTimeSpentSeconds || 0) / 60);

  const handleSponsorCheck = (task: SponsorChannelTask) => {
    soundManager.playSuccessChime();
    setCompletedSponsors(prev => ({ ...prev, [task.id]: true }));
    onClaimSponsorReward(task.id, task.ticketReward || 1);
  };
  return (
    <div className="relative w-full max-w-4xl mx-auto p-3 sm:p-6 space-y-6 animate-fade-in overflow-hidden">
      {/* Background Animated Cyber Glows & Ambient Rays */}
      <div className="absolute -top-24 -left-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 -right-24 w-96 h-96 bg-purple-600/15 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-amber-400/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Live Broadcast Notice if active */}
      {activeBroadcast && (
        <div className="relative z-10 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/10 border border-amber-400/50 shadow-lg flex items-center justify-between gap-3 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400 flex items-center justify-center text-amber-400 shrink-0">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-amber-300">ADMIN BILDIRISHNOMASI</div>
              <p className="text-xs text-slate-200 truncate">{activeBroadcast.message}</p>
            </div>
          </div>
          <button
            onClick={onDismissBroadcast}
            className="text-xs text-slate-400 hover:text-white px-2 py-1"
          >
            Yopish
          </button>
        </div>
      )}

      {/* Hero Showcase Section with Animated Glowing Cyber Bot Mascot */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/98 border border-cyan-500/40 p-6 sm:p-8 shadow-[0_0_35px_rgba(0,210,255,0.15)] overflow-hidden">
        {/* Subtle Cyber Grid Lines inside hero */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00d2ff08_1px,transparent_1px),linear-gradient(to_bottom,#00d2ff08_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

        {/* Dynamic Light Rays */}
        <div className="absolute -top-10 right-1/4 w-60 h-60 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
          {/* Left Column: Heading + Bot Logo side by side */}
          <div className="text-center lg:text-left space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-400/50 text-[11px] font-mono text-cyan-300 shadow-[0_0_12px_rgba(0,210,255,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span>O'ZBEKISTONNING RASMIY INTELEKT PORTALI</span>
            </div>

            {/* Sarlavha va uning yonidagi Asosiy Kiber Logotip */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {/* Rasmiy Asosiy Logotip Neon Halo va Crown bilan */}
              <div className="relative shrink-0 group">
                {/* Rotating Glowing Neon Ring */}
                <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-amber-400 opacity-80 blur-sm group-hover:opacity-100 transition-opacity animate-pulse" />
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-950 border-2 border-cyan-400 flex flex-col items-center justify-center shadow-2xl p-1.5 overflow-hidden">
                  {/* Golden Crown on top of Logo */}
                  <div className="absolute -top-3.5 z-20 flex justify-center">
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center gap-0.5 shadow-[0_0_10px_#fbbf24]">
                      <Crown className="w-3 h-3 fill-current text-slate-950" />
                      RASMIY
                    </span>
                  </div>

                  {/* Asosiy IQ Level Uz Logotipi */}
                  <img
                    src={logoImg}
                    alt="IQ Level Uz Rasmiy Logotipi"
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform"
                  />

                  {/* UZ badge */}
                  <div className="absolute bottom-1 right-1 z-10 px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 font-black text-[9px] shadow border border-slate-950">
                    UZ
                  </div>
                </div>
              </div>

              {/* Title & Description & Slogan Pills */}
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-white tracking-tight leading-snug">
                  MANTIQ VA IQ DARAJANGIZNI{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300 filter drop-shadow(0 0 16px rgba(0,210,255,0.4))">
                    ANIQLANG
                  </span>
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  20 ta rasmiy test savollari, real vaqt rejimidagi 1v1 onlayn duellar, tasdiqlangan PNG Sertifikat, Subway 3D Runner va haftalik 15 Stars sovg'alari!
                </p>

                {/* Slogan & Usability Mini Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
                    🧠 Mantiqiy IQ darajangizni aniqlang
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-950/70 border border-amber-500/40 text-[10px] font-mono text-amber-300">
                    ⚡ 1v1 Onlayn Duellar
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-950/70 border border-purple-500/40 text-[10px] font-mono text-purple-300">
                    📜 Rasmiy Sertifikat
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                onClick={() => {
                  soundManager.playCyberClick();
                  onStartTest();
                }}
                className="h-12 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.4)] active:scale-95 transition-all"
              >
                <Brain className="w-4 h-4" />
                <span>IQ Testni Boshlash (20 Savol)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  soundManager.playCyberClick();
                  onStartDuel();
                }}
                className="h-12 px-5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 font-semibold text-xs sm:text-sm border border-amber-400/50 flex items-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.2)] active:scale-95 transition-all"
              >
                <Swords className="w-4 h-4 text-amber-400" />
                <span>1v1 Duel Qidirish</span>
              </button>

              {(userProfile.iqScore > 0 || (userProfile.bestIq || 0) > 0) && onViewCertificate && (
                <button
                  onClick={() => {
                    soundManager.playCyberClick();
                    onViewCertificate();
                  }}
                  className="h-12 px-5 rounded-2xl bg-slate-950/90 hover:bg-slate-900 text-cyan-300 font-semibold text-xs sm:text-sm border border-cyan-400/50 flex items-center gap-2 shadow-[0_0_15px_rgba(0,210,255,0.25)] active:scale-95 transition-all"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>IQ Sertifikatim</span>
                </button>
              )}

              <button
                onClick={() => {
                  soundManager.playCyberClick();
                  setShowFaq((prev) => !prev);
                }}
                className={`h-12 px-4 rounded-2xl flex items-center gap-1.5 text-xs sm:text-sm font-semibold border transition-all active:scale-95 cursor-pointer ${
                  showFaq
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-[0_0_15px_rgba(0,210,255,0.4)]'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border-cyan-500/40 hover:border-cyan-400'
                }`}
                title="Ko'p beriladigan savollar va baholash mezonlari"
              >
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>{showFaq ? 'FAQ Yopish' : 'FAQ & Yordam'}</span>
              </button>
            </div>
          </div>

          {/* Weekly Stars Prize Showcase Badge */}
          <div
            onClick={() => onNavigate('leaderboard')}
            className="p-5 rounded-3xl bg-slate-950/90 border border-amber-400/60 shadow-[0_0_25px_rgba(251,191,36,0.15)] text-center cursor-pointer hover:border-amber-300 transition-all hover:scale-105 shrink-0 max-w-xs"
          >
            <div className="relative w-14 h-14 mx-auto rounded-2xl bg-amber-400/20 border border-amber-400 flex items-center justify-center text-amber-400 mb-2 shadow-[0_0_15px_#fbbf24]">
              <Gift className="w-7 h-7 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            </div>
            <div className="text-xs font-bold text-amber-300 font-mono tracking-wider">HAFTALIK TOP 3</div>
            <div className="text-base font-bold text-white mt-1">🎁 15 Stars / Sovg'a</div>
            <div className="text-[11px] text-slate-400 mt-1">Min. 40+ ball & 5 min faol bo'lish</div>
            <div className="mt-3 py-1 px-2 rounded-lg bg-amber-400/10 border border-amber-400/30 text-[10px] text-amber-300 font-mono">
              Reytingni ko'rish ➜
            </div>
          </div>
        </div>
      </div>

      {/* Daily Login Rewards System with Visual Streak Counter & Gold Neon Glow */}
      <DailyLoginRewards
        userProfile={userProfile}
        onClaimReward={(reward) => onClaimDailyStreak(reward)}
      />

      {/* Daily Missions System (Kunlik Missiyalar) */}
      <DailyMissionsCard
        userProfile={userProfile}
        customMissions={customMissions}
        onClaimMissionReward={onClaimMissionReward}
        onNavigate={onNavigate}
        onOpenLinkMission={onOpenLinkMission}
      />

      {/* Gamification: 10 Badges, Level XP & Daily Streak */}
      <BadgesAndStreakCard
        userProfile={userProfile}
        onClaimDailyStreak={() => onClaimDailyStreak()}
        onOpenWheel={onOpenWheel}
      />

      {/* Recent Duel Results Feed (So'nggi 1v1 Jonli Duel Natijalari) */}
      <RecentDuelFeed
        recentDuels={recentDuels}
        onStartDuel={onStartDuel}
      />

      {/* HAFTALIK SOVG'A OLISH SHARTLARI (6 minut + 12 chip) & G'OLIBLAR TARIXI */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-cyan-950/40 border border-amber-400/40 p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
              <Trophy className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-display font-bold text-white">
                  HAFTALIK 15 STARS SOVG'ASI SARALASH TIZIMI
                </h3>
              </div>
              <p className="text-xs text-amber-300 font-mono">
                Sovg'aga da'vogarlik uchun: kamida 6 minut faol bo'lish va 12 ta chip (chipta) to'plash shart!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playCyberClick();
                onNavigate('history');
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span>G'oliblar & Cheklar Tarixi</span>
            </button>

            <button
              onClick={() => {
                soundManager.playCyberClick();
                onNavigate('profile');
              }}
              className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>IQ Grafik Dinamikasi</span>
            </button>
          </div>
        </div>

        {/* 2 Critical Progress Requirements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                1. Kamida 6 minut o'tkazish:
              </span>
              <span className="font-mono font-bold text-cyan-400">{activeMinutes} / 6 daqiqa</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full ${isTimeQualified ? 'bg-emerald-400' : 'bg-cyan-400'} transition-all`}
                style={{ width: `${Math.min(100, Math.round((activeMinutes / 6) * 100))}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {isTimeQualified ? "Vaqt sharti bajarildi ✅" : `Yana ${Math.max(0, 6 - activeMinutes)} daqiqa faol o'yin kerak ⏳`}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Ticket className="w-3.5 h-3.5 text-amber-400" />
                2. Kamida 12 ta chipta (chip) to'plash:
              </span>
              <span className="font-mono font-bold text-amber-400">{userProfile.energyTickets} / 12 ta</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full ${isTicketsQualified ? 'bg-emerald-400' : 'bg-amber-400'} transition-all`}
                style={{ width: `${Math.min(100, Math.round(((userProfile.energyTickets || 0) / 12) * 100))}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {isTicketsQualified ? "Chiptalar sharti bajarildi ✅" : `Yana ${Math.max(0, 12 - userProfile.energyTickets)} ta chipta kerak 🎫`}
            </div>
          </div>
        </div>
      </div>

      {/* SHARTLAR / HOMIYLIK KANALLARI (+1 CHIPTA) */}
      {sponsorTasks && sponsorTasks.length > 0 && (
        <div className="rounded-3xl bg-slate-900 border border-cyan-500/30 p-4 sm:p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>KANALGA OBUNA BO'LING VA +1 CHIPTA YUTIB OLING!</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              Tezkor Chiptalar
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sponsorTasks.map((task) => {
              const isClaimed = completedSponsors[task.id];
              return (
                <div
                  key={task.id}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate font-mono">
                      👉 {task.channelUsername} kanaliga a'zo bo'ling
                    </div>
                    <div className="text-[11px] text-amber-300 font-mono mt-0.5">
                      Mukofot: +{task.ticketReward || 1} ta Chipta
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={task.channelUrl || `https://t.me/${task.channelUsername.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs flex items-center gap-1 border border-slate-700"
                    >
                      <span>Obuna bo'lish</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      onClick={() => handleSponsorCheck(task)}
                      disabled={isClaimed}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                        isClaimed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                          : 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 text-slate-950 shadow-md active:scale-95 cursor-pointer'
                      }`}
                    >
                      {isClaimed ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Berildi ✅</span>
                        </>
                      ) : (
                        <span>Tekshirish (+1)</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* User Stats Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-cyan-500/20 flex flex-col justify-between">
          <div className="text-xs text-slate-400">Eng Yaxshi IQ</div>
          <div className="text-2xl font-bold font-display text-cyan-400 mt-1">
            {userProfile.bestIq || userProfile.iqScore || '—'}
          </div>
          <div className="text-[11px] text-slate-400">
            {userProfile.bestIq >= 140
              ? "Mutlaq Daho"
              : userProfile.bestIq >= 120
              ? "Yuqori intellekt"
              : "Sinovdan o'ting"}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-400/20 flex flex-col justify-between">
          <div className="text-xs text-slate-400">1v1 Duel Reytingi</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {userProfile.duelRating}
          </div>
          <div className="text-[11px] text-emerald-400">
            {userProfile.duelWins} G'alaba · {userProfile.duelLosses} Mag'lubiyat
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/20 flex flex-col justify-between">
          <div className="text-xs text-slate-400">Energiya Biletlari</div>
          <div className="text-2xl font-bold font-mono text-purple-300 mt-1">
            {userProfile.energyTickets} ta
          </div>
          <div className="text-[11px] text-slate-400">O'yinlar va duellar uchun</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/20 flex flex-col justify-between">
          <div className="text-xs text-slate-400">Faol Vaqtingiz</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {Math.floor((userProfile.weeklyTimeSpentSeconds || 320) / 60)} min
          </div>
          <div className="text-[11px] text-slate-400">Haftalik hisobda</div>
        </div>
      </div>

      {/* Help & FAQ (Ko'p Beriladigan Savollar) Toggle Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/95 to-slate-950/90 border border-cyan-500/30 p-4 shadow-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_12px_rgba(0,210,255,0.2)]">
            <HelpCircle className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-display font-bold text-white truncate">
                YORDAM & KO'P BERILADIGAN SAVOLLAR (FAQ)
              </h4>
              <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 shrink-0">
                Mensa & Wechsler
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              IQ balli qanday hisoblanadi, 1v1 duellar, biletlar va haftalik sovg'alar qoidalari
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playCyberClick();
            setShowFaq((prev) => !prev);
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            showFaq
              ? 'bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(0,210,255,0.4)]'
              : 'bg-slate-800/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400'
          }`}
        >
          <span>{showFaq ? 'Yashirish' : "Ko'rish"}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${showFaq ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Expandable Help & FAQ Section */}
      {showFaq && (
        <HelpFaqSection onClose={() => setShowFaq(false)} />
      )}

      {/* Main Feature Navigation Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: 20 IQ Test */}
        <div
          onClick={() => {
            soundManager.playCyberClick();
            onNavigate('test');
          }}
          className="relative p-5 rounded-3xl bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 cursor-pointer group transition-all shadow-xl hover:scale-[1.01] overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(0,210,255,0.2)]">
              <Brain className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              45s TAYMER
            </span>
          </div>
          <h3 className="text-base font-display font-bold text-white group-hover:text-cyan-300">
            20 ta Kompleks IQ Test
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Mantiqiy matritsalar, fazoviy shakllar va matematik ketma-ketliklarni yeching va rasmiy sertifikat oling.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
            <span>Testni boshlash</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: 1v1 Online Duel */}
        <div
          onClick={() => {
            soundManager.playCyberClick();
            onNavigate('duel');
          }}
          className="relative p-5 rounded-3xl bg-slate-900 border border-amber-400/30 hover:border-amber-400 cursor-pointer group transition-all shadow-xl hover:scale-[1.01] overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(251,191,36,0.2)]">
              <Swords className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              JONLI 1V1
            </span>
          </div>
          <h3 className="text-base font-display font-bold text-white group-hover:text-amber-300">
            Online Duel Rejimi
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Haqiqiy o'yinchilar bilan tezlik va mantiq bo'yicha kuch sinashing. Har bir g'alaba reytingingizni oshiradi!
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-amber-400">
            <span>Raqib qidirish</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Mini Games & Subway 3D Runner */}
        <div
          onClick={() => {
            soundManager.playCyberClick();
            onNavigate('games');
          }}
          className="relative p-5 rounded-3xl bg-slate-900 border border-purple-500/30 hover:border-purple-400 cursor-pointer group transition-all shadow-xl hover:scale-[1.01] overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-400 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(168,85,247,0.2)]">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              SUBWAY 3D RUNNER
            </span>
          </div>
          <h3 className="text-base font-display font-bold text-white group-hover:text-purple-300">
            Subway Runner & O'yinlar
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Subway Surfers kabi 4D Kiber Runner, 4x4 Memory Matrix, Stroop va Speed Math 1v1 trenajyorlari!
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-purple-400">
            <span>O'yinlarni o'ynash</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
