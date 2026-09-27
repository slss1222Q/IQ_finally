/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  Question,
  ChannelSubscription,
  AdminSettings,
  NavigationTab,
  BroadcastNotification,
  DuelOutcome,
  DailyMission,
} from './types';
import { INITIAL_QUESTIONS } from './data/initialQuestions';
import { Navbar } from './components/Navbar';
import { BottomNavBar } from './components/BottomNavBar';
import { RegistrationModal } from './components/RegistrationModal';
import { SecretAdminModal } from './components/SecretAdminModal';
import { AdminPanel } from './components/AdminPanel';
import { HomeDashboard } from './components/HomeDashboard';
import { IQTestModule } from './components/IQTestModule';
import { OnlineDuelModule } from './components/OnlineDuelModule';
import { MiniGamesModule } from './components/MiniGamesModule';
import { LeaderboardModule } from './components/LeaderboardModule';
import { ReferralModule } from './components/ReferralModule';
import { TelegramBotSimulator } from './components/TelegramBotSimulator';
import { MandatorySubModal } from './components/MandatorySubModal';
import { WheelOfFortuneModal } from './components/WheelOfFortuneModal';
import { CertificateGenerator } from './components/CertificateGenerator';
import { UserProfileView } from './components/UserProfileView';
import { WeeklyWinnersHistory } from './components/WeeklyWinnersHistory';
import { PopupAnnouncementModal } from './components/PopupAnnouncementModal';
import { soundManager } from './utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import {
  subscribeToUsers,
  saveUserToCloud,
  subscribeToRecentDuels,
  addDuelToCloud,
  subscribeToAdminSettings,
  saveAdminSettingsToCloud,
  ensureAdminSettingsSeed,
} from './services/database';

const STORAGE_KEYS = {
  USER: 'iq_level_uz_user_v2',
  QUESTIONS: 'iq_level_uz_questions_v2',
  CHANNELS: 'iq_level_uz_channels_v2',
  ADMIN_SETTINGS: 'iq_level_uz_settings_v2',
  USERS_LIST: 'iq_level_uz_users_list_v2',
  RECENT_DUELS: 'iq_level_uz_recent_duels_v2',
};

const DEFAULT_CHANNELS: ChannelSubscription[] = [
  {
    id: 'chan-1',
    title: 'IQ Level Uz Rasmiy Kanal',
    handleOrLink: '@iqlevel_uz',
    type: 'open',
    isRequired: true,
  },
  {
    id: 'chan-2',
    title: 'Daholar Ligasi (Privat Klub)',
    handleOrLink: 'https://t.me/+iq_vip_private_club',
    type: 'private',
    channelId: '-1001987654321',
    isRequired: true,
  },
];

const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  secretCode: '20120517M',
  autoReminderText: 'Kanaldan uzoqlashmang, yangi testlar va duellar tez orada!',
  autoReminderEnabled: true,
  mandatorySubEnabled: false,
  testTimePerQuestion: 45,
  monetization: {
    isTestPaid: false,
    testPrice: 15,
    testPriceCurrency: 'STARS',
    paymentRecipient: '8600 0423 1122 3344 (Humo/Uzcard) yoki @wallet',
    premiumGamesPaid: false,
    premiumGamesPrice: 10,
  },
  weeklyPrizes: {
    top1Reward: '15 Telegram Stars / Gift',
    top2Reward: '10 Telegram Stars',
    top3Reward: '5 Telegram Stars',
    minPoints: 40,
    minTimeMinutes: 6,
  },
  customMissions: [
    {
      id: 'mission-tg-official',
      title: "Rasmiy Telegram kanalga obuna bo'ling",
      description: "@iqlevel_uz kanaliga a'zo bo'ling va eng so'nggi xabarlardan birinchi bo'lib boxabar bo'ling!",
      rewardCoins: 100,
      rewardXp: 200,
      icon: 'channel',
      targetCount: 1,
      linkUrl: 'https://t.me/iqlevel_uz',
      actionType: 'telegram_sub',
    },
  ],
  popupAnnouncement: {
    enabled: true,
    title: "IQ LEVEL UZ: HAFTALIK STARS YUTUQ O'YINI!",
    message: "Hurmatli intellekt sohiblari! Har hafta yakunida TOP-3 daho o'yinchilarga 15 Stars, 10 Stars va 5 Stars o'tkazib berilmoqda. Sovg'a olish uchun majburiy kamida 6 minut faol bo'ling va 12 ta chipta (chip) to'plang!",
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    buttonText: "Rasmiy Kanalga O'tish",
    buttonLink: 'https://t.me/iqlevel_uz',
  },
  sponsorTasks: [
    {
      id: 'sp-1',
      channelUsername: '@iqlevel_uz',
      channelTitle: "IQ Level Uz Rasmiy Kanal",
      channelUrl: 'https://t.me/iqlevel_uz',
      ticketReward: 1,
      isActive: true,
      createdAt: '2026-09-27',
    },
  ],
  weeklyWinnersHistory: [
    {
      id: 'winner-1',
      weekTitle: 'Hafta #38 (Sentabr 2026)',
      username: '@jasur_pro',
      fullName: 'Jasur Bek',
      rank: 1,
      starsReward: 15,
      paymentDate: '2026-09-26',
      receiptImageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
      transactionId: '#STARS-99214',
      status: 'paid',
      note: '15 Telegram Stars muvaffaqiyatli yuborildi',
    },
    {
      id: 'winner-2',
      weekTitle: 'Hafta #38 (Sentabr 2026)',
      username: '@malika_iq',
      fullName: 'Malika N.',
      rank: 2,
      starsReward: 10,
      paymentDate: '2026-09-26',
      receiptImageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
      transactionId: '#STARS-99215',
      status: 'paid',
      note: '10 Telegram Stars o\'tkazildi',
    },
    {
      id: 'winner-3',
      weekTitle: 'Hafta #38 (Sentabr 2026)',
      username: '@daho_sher',
      fullName: 'Sardor A.',
      rank: 3,
      starsReward: 5,
      paymentDate: '2026-09-26',
      receiptImageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
      transactionId: '#STARS-99216',
      status: 'paid',
      note: '5 Telegram Stars to\'lab berildi',
    },
  ],
};

export default function App() {
  // 1. User state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      // Ensure gamification and real IQ history exist
      return {
        streakDays: 1,
        lastLoginDate: new Date().toISOString().slice(0, 10),
        streakClaimedToday: false,
        xp: 150,
        level: 1,
        levelTitle: 'Boshlovchi',
        weeklyTimeSpentSeconds: 380, // > 6 min qualified
        badges: ['badge-4'],
        iqCoins: 50,
        energyTickets: 14, // > 12 tickets qualified
        iqHistory: parsed.iqHistory || (parsed.iqScore > 0 ? [{ id: 'iq-init', date: 'Boshlang\'ich', score: parsed.iqScore, testNumber: 1 }] : []),
        ...parsed,
      };
    } catch {
      return null;
    }
  });

  // 2. Questions state
  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    return saved ? JSON.parse(saved) : INITIAL_QUESTIONS;
  });

  // 3. Channels state
  const [channels, setChannels] = useState<ChannelSubscription[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHANNELS);
    return saved ? JSON.parse(saved) : DEFAULT_CHANNELS;
  });

  // 4. Admin settings state
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_SETTINGS);
    if (!saved) return DEFAULT_ADMIN_SETTINGS;
    try {
      return { ...DEFAULT_ADMIN_SETTINGS, ...JSON.parse(saved) };
    } catch {
      return DEFAULT_ADMIN_SETTINGS;
    }
  });

  // 5. Users directory list — Firebase Realtime Database'dan REAL VAQTDA keladi
  // (barcha foydalanuvchilarga umumiy). Ilova ochilishi bilanoq mahalliy keshni
  // ko'rsatish uchun localStorage'dan boshlang'ich qiymat olinadi, so'ng bulutdan sinxronlanadi.
  const [usersList, setUsersList] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
    return saved ? JSON.parse(saved) : [];
  });

  // 6. Recent public duels feed — Firebase'dan real vaqtda keladi (barcha foydalanuvchilarga umumiy)
  const [recentDuels, setRecentDuels] = useState<DuelOutcome[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECENT_DUELS);
    return saved ? JSON.parse(saved) : [];
  });

  // Navigation & View Mode
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [isBotMode, setIsBotMode] = useState(false);

  // Modals
  const [isSecretAdminModalOpen, setIsSecretAdminModalOpen] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [showMandatoryModal, setShowMandatoryModal] = useState(false);
  const [hasSubscribed, setHasSubscribed] = useState(false);
  const [isWheelModalOpen, setIsWheelModalOpen] = useState(false);
  const [showPopupAd, setShowPopupAd] = useState(() => adminSettings.popupAnnouncement?.enabled ?? true);
  const [certificateModalData, setCertificateModalData] = useState<{
    userName: string;
    iqScore: number;
    date: string;
  } | null>(null);

  // Broadcast banner
  const [activeBroadcast, setActiveBroadcast] = useState<BroadcastNotification | null>({
    id: 'init-reminder',
    title: 'Eslatma',
    message: adminSettings.autoReminderText,
    timestamp: new Date().toLocaleTimeString(),
    type: 'reminder',
  });

  // Track weekly app active time
  useEffect(() => {
    const timer = setInterval(() => {
      setUserProfile((prev) => {
        if (!prev) return prev;
        const nextTime = (prev.weeklyTimeSpentSeconds || 0) + 5;
        return { ...prev, weeklyTimeSpentSeconds: nextTime };
      });
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // Persist states
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userProfile));
    }
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
  }, [channels]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_SETTINGS, JSON.stringify(adminSettings));
  }, [adminSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECENT_DUELS, JSON.stringify(recentDuels));
  }, [recentDuels]);

  // ============================================================
  // FIREBASE REALTIME DATABASE — barcha foydalanuvchilarga umumiy sinxronizatsiya
  // ============================================================

  // Ilova birinchi marta ishga tushganda, agar bulutda hali adminSettings umuman
  // bo'lmasa — standart sozlamalar bilan urug'lantiriladi (faqat bir marta, bo'sh bo'lsa).
  useEffect(() => {
    ensureAdminSettingsSeed(DEFAULT_ADMIN_SETTINGS);
  }, []);

  // Barcha ro'yxatdan o'tgan foydalanuvchilarni real vaqtda kuzatish (umumiy reyting/statistika uchun)
  useEffect(() => {
    const unsubscribe = subscribeToUsers((cloudUsers) => {
      setUsersList(cloudUsers);
    });
    return unsubscribe;
  }, []);

  // So'nggi duel natijalari lentasini real vaqtda kuzatish (barcha foydalanuvchilarga umumiy)
  useEffect(() => {
    const unsubscribe = subscribeToRecentDuels((cloudDuels) => {
      if (cloudDuels.length > 0) {
        setRecentDuels(cloudDuels);
      }
    }, 5);
    return unsubscribe;
  }, []);

  // Admin sozlamalarini real vaqtda kuzatish — admin panelidan kiritilgan har qanday
  // o'zgarish barcha foydalanuvchilarga bir zumda yetib boradi
  useEffect(() => {
    const unsubscribe = subscribeToAdminSettings((cloudSettings) => {
      if (cloudSettings) {
        setAdminSettings((prev) => ({ ...DEFAULT_ADMIN_SETTINGS, ...prev, ...cloudSettings }));
      }
    });
    return unsubscribe;
  }, []);

  // Joriy foydalanuvchi profili birinchi marta yuklanganda (registratsiyadan keyin sahifa
  // qayta ochilganda) uni ham bulutga sinxronlaydi, shunda u boshqa foydalanuvchilarga
  // reyting/duel ro'yxatlarida to'g'ri ko'rinadi.
  useEffect(() => {
    if (userProfile?.id) {
      saveUserToCloud(userProfile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Admin sozlamalarini o'zgartirib, natijasini bulutga ham yozadigan wrapper.
  // AdminPanel shu funksiyani chaqiradi — natijada o'zgarish barcha foydalanuvchilarga tarqaladi.
  const handleUpdateAdminSettings = (settings: AdminSettings) => {
    setAdminSettings(settings);
    saveAdminSettingsToCloud(settings);
  };

  // Handle user registration
  const handleRegister = (newProfile: UserProfile) => {
    const profileWithGamification: UserProfile = {
      ...newProfile,
      streakDays: 1,
      lastLoginDate: new Date().toISOString().slice(0, 10),
      streakClaimedToday: false,
      xp: 150,
      level: 1,
      levelTitle: 'Boshlovchi',
      weeklyTimeSpentSeconds: 320,
      badges: ['badge-4'],
      iqCoins: 50,
    };

    setUserProfile(profileWithGamification);
    setUsersList((prev) => {
      const exists = prev.some((u) => u.id === profileWithGamification.id);
      return exists ? prev : [profileWithGamification, ...prev];
    });
    // Yangi ro'yxatdan o'tgan foydalanuvchini darhol Firebase'ga (umumiy bazaga) yozamiz
    saveUserToCloud(profileWithGamification);
  };

  // Check mandatory subscription before starting protected activities
  const checkAccessAndRun = (action: () => void) => {
    if (adminSettings.mandatorySubEnabled && !hasSubscribed) {
      setShowMandatoryModal(true);
      return;
    }
    action();
  };

  // Test complete handler
  const handleTestComplete = (score: number, proBadges?: string[]) => {
    if (!userProfile) return;
    const addedXp = score * 3;
    const newXp = (userProfile.xp || 0) + addedXp;
    const newLevel = Math.min(10, Math.floor(newXp / 250) + 1);
    const titles = [
      'Boshlovchi', 'Sinovchi', 'Mantiq Izlovchi', 'Intellekt Ustasi',
      'Kiber Strateg', 'Fikr Magnati', 'Daho Konstruktor', 'Kognitiv Elita',
      'Super Intelekt', 'Mutlaq Kiber Daho'
    ];

    const updatedBadges = [...(userProfile.badges || [])];
    if (score >= 135 && !updatedBadges.includes('badge-1')) {
      updatedBadges.push('badge-1'); // Mantiq Qiroli
    }
    if (score >= 140 && !updatedBadges.includes('badge-6')) {
      updatedBadges.push('badge-6'); // IQ Darajasi Full (140+)
    }
    if (newLevel >= 10 && !updatedBadges.includes('badge-10')) {
      updatedBadges.push('badge-10'); // Kiber Afsona
    }
    if (proBadges && proBadges.length > 0) {
      proBadges.forEach((b) => {
        if (!updatedBadges.includes(b)) {
          updatedBadges.push(b);
        }
      });
    }

    const currentMissions = userProfile.dailyMissions || {};
    const testMission = currentMissions['mission-test'] || { currentCount: 0, isClaimed: false };

    // Record authentic IQ test history for Recharts Line Chart
    const nextIqHistory = [
      ...(userProfile.iqHistory || []),
      {
        id: `iq-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        score,
        testNumber: (userProfile.iqHistory?.length || 0) + 1,
      },
    ];

    const updated: UserProfile = {
      ...userProfile,
      iqScore: score,
      bestIq: Math.max(userProfile.bestIq || 0, score),
      completedTestsCount: userProfile.completedTestsCount + 1,
      iqHistory: nextIqHistory,
      xp: newXp,
      level: newLevel,
      levelTitle: titles[newLevel - 1] || 'Mutlaq Kiber Daho',
      badges: updatedBadges,
      dailyMissions: {
        ...currentMissions,
        'mission-test': {
          ...testMission,
          currentCount: testMission.currentCount + 1,
        },
      },
    };

    setUserProfile(updated);
    updateUserInList(updated);

    // Auto-integrate CertificateGenerator into test completion flow
    setCertificateModalData({
      userName: userProfile.name,
      iqScore: score,
      date: new Date().toISOString().split('T')[0],
    });
  };

  // Sponsor Task Reward Handler (+1 ticket per subscribed channel)
  const handleClaimSponsorReward = (taskId: string, tickets: number) => {
    if (!userProfile) return;
    soundManager.playVictoryFanfare();
    const updated: UserProfile = {
      ...userProfile,
      energyTickets: (userProfile.energyTickets || 0) + tickets,
      xp: (userProfile.xp || 0) + 50,
    };
    setUserProfile(updated);
    updateUserInList(updated);
  };

  // Update weekly active game play time in seconds
  const handleUpdateTimeSpent = (seconds: number) => {
    setUserProfile((prev) => {
      if (!prev) return prev;
      const nextTime = (prev.weeklyTimeSpentSeconds || 0) + seconds;
      return { ...prev, weeklyTimeSpentSeconds: nextTime };
    });
  };

  // Record game play and check badges
  const handleRecordGamePlay = (
    gameKey:
      | 'runner3d'
      | 'memory4x4'
      | 'stroop'
      | 'speedmath'
      | 'cipherCode'
      | 'laserReflex'
      | 'colorReflex'
      | 'patternMatch'
      | 'lockPick'
      | 'cyberMaze'
      | 'minesweeper'
      | 'anagramWord'
      | 'highLowCard'
  ) => {
    if (!userProfile) return;
    const today = new Date().toISOString().slice(0, 10);
    const existingDaily = userProfile.dailyGamePlays?.date === today
      ? userProfile.dailyGamePlays
      : {
          date: today,
          runner3d: 0,
          memory4x4: 0,
          stroop: 0,
          speedmath: 0,
          cipherCode: 0,
          laserReflex: 0,
          colorReflex: 0,
          patternMatch: 0,
          lockPick: 0,
          cyberMaze: 0,
          minesweeper: 0,
          anagramWord: 0,
          highLowCard: 0,
        };

    const nextDaily = {
      ...existingDaily,
      [gameKey]: ((existingDaily as Record<string, any>)[gameKey] || 0) + 1,
    };

    const updatedBadges = [...(userProfile.badges || [])];
    if (gameKey === 'runner3d' && !updatedBadges.includes('badge-7')) {
      updatedBadges.push('badge-7'); // Subway Kiber Runner
    }
    if (gameKey === 'memory4x4' && !updatedBadges.includes('badge-8')) {
      updatedBadges.push('badge-8'); // Matritsa Xotirasi
    }
    if (gameKey === 'stroop' && !updatedBadges.includes('badge-2')) {
      updatedBadges.push('badge-2'); // Tezkor Reaksiya
    }
    if (gameKey === 'speedmath' && !updatedBadges.includes('badge-9')) {
      updatedBadges.push('badge-9'); // Boshqotirma Donosi
    }
    if (gameKey === 'cipherCode' && !updatedBadges.includes('badge-4')) {
      updatedBadges.push('badge-4'); // Strategik Daho
    }
    if (gameKey === 'lockPick' && !updatedBadges.includes('badge-1')) {
      updatedBadges.push('badge-1'); // Mantiq Qiroli
    }
    if (gameKey === 'laserReflex' && !updatedBadges.includes('badge-5')) {
      updatedBadges.push('badge-5'); // Diqqat Snayperi
    }
    if (gameKey === 'colorReflex' && !updatedBadges.includes('badge-2')) {
      updatedBadges.push('badge-2');
    }
    if (gameKey === 'patternMatch' && !updatedBadges.includes('badge-8')) {
      updatedBadges.push('badge-8');
    }

    const currentMissions = userProfile.dailyMissions || {};
    const gameMission = currentMissions['mission-games'] || { currentCount: 0, isClaimed: false };

    const updated: UserProfile = {
      ...userProfile,
      dailyGamePlays: nextDaily,
      badges: updatedBadges,
      xp: (userProfile.xp || 0) + 10,
      dailyMissions: {
        ...currentMissions,
        'mission-games': {
          ...gameMission,
          currentCount: gameMission.currentCount + 1,
        },
      },
    };

    setUserProfile(updated);
    updateUserInList(updated);
  };

  // Duel finish handler
  const handleDuelFinish = (
    won: boolean,
    ratingChange: number,
    matchDetails?: {
      playerScore: number;
      opponentScore: number;
      opponentName: string;
      opponentAvatar: string;
      opponentRating: number;
    }
  ) => {
    if (!userProfile) return;
    const nextWins = won ? userProfile.duelWins + 1 : userProfile.duelWins;
    const updatedBadges = [...(userProfile.badges || [])];
    if (nextWins >= 5 && !updatedBadges.includes('badge-3')) {
      updatedBadges.push('badge-3'); // Duel Ustasi
    }

    const currentMissions = userProfile.dailyMissions || {};
    const duelMission = currentMissions['mission-duel'] || { currentCount: 0, isClaimed: false };

    const updated: UserProfile = {
      ...userProfile,
      duelRating: Math.max(800, userProfile.duelRating + ratingChange),
      duelWins: nextWins,
      duelLosses: !won ? userProfile.duelLosses + 1 : userProfile.duelLosses,
      energyTickets: won ? userProfile.energyTickets + 2 : Math.max(0, userProfile.energyTickets - 1),
      xp: (userProfile.xp || 0) + (won ? 50 : 15),
      badges: updatedBadges,
      dailyMissions: {
        ...currentMissions,
        'mission-duel': {
          ...duelMission,
          currentCount: duelMission.currentCount + 1,
        },
      },
    };
    setUserProfile(updated);
    updateUserInList(updated);

    // Prepend new live outcome to Recent Duels Feed
    const newOutcome: DuelOutcome = {
      id: `duel-${Date.now()}`,
      player1: {
        name: userProfile.name,
        avatar: userProfile.avatar,
        score: matchDetails?.playerScore ?? (won ? 5 : 2),
        rating: Math.max(800, userProfile.duelRating + ratingChange),
        isWinner: won,
      },
      player2: {
        name: matchDetails?.opponentName ?? "Kiber Raqib",
        avatar: matchDetails?.opponentAvatar ?? "⚡",
        score: matchDetails?.opponentScore ?? (won ? 2 : 5),
        rating: matchDetails?.opponentRating ?? 1350,
        isWinner: !won,
      },
      winnerId: won ? 'player1' : 'player2',
      timestamp: "Hozirgina",
      createdAt: Date.now(),
    };
    // Mahalliy holatni optimistik yangilaymiz VA umumiy Firebase lentasiga yozamiz,
    // shunda natija barcha foydalanuvchilarga real vaqtda "jonli" ko'rinadi.
    setRecentDuels((prev) => [newOutcome, ...prev.slice(0, 4)]);
    addDuelToCloud(newOutcome);
  };

  // Claim Daily Mission Reward
  const handleClaimMissionReward = (missionId: string, coins: number, xp: number) => {
    if (!userProfile) return;
    soundManager.playSuccessChime();
    const currentMissions = userProfile.dailyMissions || {};
    const existing = currentMissions[missionId] || { currentCount: 1, isClaimed: false };

    const newXp = (userProfile.xp || 0) + xp;
    const newLevel = Math.min(10, Math.floor(newXp / 250) + 1);
    const titles = [
      'Boshlovchi', 'Sinovchi', 'Mantiq Izlovchi', 'Intellekt Ustasi',
      'Kiber Strateg', 'Fikr Magnati', 'Daho Konstruktor', 'Kognitiv Elita',
      'Super Intelekt', 'Mantiq Geniyi'
    ];

    const updated: UserProfile = {
      ...userProfile,
      iqCoins: (userProfile.iqCoins || 0) + coins,
      xp: newXp,
      level: newLevel,
      levelTitle: titles[newLevel - 1] || 'Mutlaq Kiber Daho',
      dailyMissions: {
        ...currentMissions,
        [missionId]: {
          ...existing,
          isClaimed: true,
        },
      },
    };
    setUserProfile(updated);
    updateUserInList(updated);
  };

  // Open Link-based Mission (e.g. Subscribe to Telegram Channel)
  const handleOpenLinkMission = (mission: DailyMission) => {
    if (mission.linkUrl) {
      soundManager.playCyberClick();
      window.open(mission.linkUrl, '_blank');
      // Mark progress as completed so user can immediately claim
      if (userProfile) {
        const currentMissions = userProfile.dailyMissions || {};
        const existing = currentMissions[mission.id] || { currentCount: 0, isClaimed: false };
        const updated: UserProfile = {
          ...userProfile,
          dailyMissions: {
            ...currentMissions,
            [mission.id]: {
              ...existing,
              currentCount: mission.targetCount,
            },
          },
        };
        setUserProfile(updated);
        updateUserInList(updated);
      }
    }
  };

  // Earn tickets handler with optional bonus coins and xp
  const handleEarnTickets = (count: number, bonusCoins?: number, bonusXp?: number) => {
    if (!userProfile) return;
    const addedCoins = bonusCoins || 0;
    const addedXp = bonusXp !== undefined ? bonusXp : count * 10;
    const updated = {
      ...userProfile,
      energyTickets: userProfile.energyTickets + count,
      iqCoins: (userProfile.iqCoins || 0) + addedCoins,
      xp: (userProfile.xp || 0) + addedXp,
    };
    setUserProfile(updated);
    updateUserInList(updated);
  };

  // Claim Daily Streak
  const handleClaimDailyStreak = (customReward?: { coins: number; tickets: number; day: number }) => {
    if (!userProfile || userProfile.streakClaimedToday) return;
    soundManager.playVictoryFanfare();
    const nextStreak = (userProfile.streakDays || 0) + 1;
    const addedCoins = customReward?.coins || 50;
    const addedTickets = customReward?.tickets || 1;
    const updated: UserProfile = {
      ...userProfile,
      streakDays: nextStreak,
      streakClaimedToday: true,
      energyTickets: userProfile.energyTickets + addedTickets,
      iqCoins: (userProfile.iqCoins || 0) + addedCoins,
      xp: (userProfile.xp || 0) + addedCoins + 15,
    };
    setUserProfile(updated);
    updateUserInList(updated);
  };

  // Wheel of Fortune Reward
  const handleWheelRewardWon = (reward: { type: 'tickets' | 'coins' | 'rating' | 'badge'; amount?: number; label: string }) => {
    if (!userProfile) return;
    const today = new Date().toISOString().slice(0, 10);
    const updatedBadges = [...(userProfile.badges || [])];
    if (reward.type === 'badge' && !updatedBadges.includes('badge-5')) {
      updatedBadges.push('badge-5');
    }

    const updated: UserProfile = {
      ...userProfile,
      lastWheelSpinDate: today,
      energyTickets: reward.type === 'tickets' ? userProfile.energyTickets + (reward.amount || 3) : userProfile.energyTickets,
      iqCoins: reward.type === 'coins' ? (userProfile.iqCoins || 0) + (reward.amount || 50) : userProfile.iqCoins,
      duelRating: reward.type === 'rating' ? userProfile.duelRating + (reward.amount || 25) : userProfile.duelRating,
      badges: updatedBadges,
      xp: (userProfile.xp || 0) + 25,
    };
    setUserProfile(updated);
    updateUserInList(updated);
  };

  // Helper to sync list — optimistik ravishda mahalliy holatni yangilaydi VA
  // bir vaqtning o'zida foydalanuvchi profilini Firebase'ga (bulutga) yozadi,
  // shunda o'zgarish barcha foydalanuvchilarga real vaqtda tarqaladi.
  const updateUserInList = (u: UserProfile) => {
    setUsersList((prev) => {
      const idx = prev.findIndex((item) => item.id === u.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = u;
        return copy;
      }
      return [u, ...prev];
    });
    saveUserToCloud(u);
  };

  // Broadcast sender from admin
  const handleSendBroadcast = (msg: string) => {
    setActiveBroadcast({
      id: `bc-${Date.now()}`,
      title: 'Umumiy Xabarnoma',
      message: msg,
      timestamp: new Date().toLocaleTimeString(),
      type: 'announcement',
    });
  };

  // If user hasn't registered yet, show registration screen
  if (!userProfile) {
    return <RegistrationModal onRegister={handleRegister} />;
  }

  // Check if banned
  if (userProfile.isBanned) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center p-4 text-center">
        <div className="max-w-md p-6 rounded-3xl bg-slate-900 border border-rose-500/50 shadow-2xl">
          <div className="text-4xl mb-2">🚫</div>
          <h2 className="text-xl font-display font-bold text-white">
            AKKAUNTINGIZ BLOKLANGAN
          </h2>
          <p className="text-xs text-rose-300 mt-2">
            Qoidabuzarlik sababli sizning profilingiz administrator tomonidan qora ro'yxatga kiritilgan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-master-bg text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black relative overflow-x-hidden">
      {/* Shaffof moviy, to'q sariq va oq rangli ambient glow yoritgichlari */}
      <div className="fixed top-0 left-0 w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0" />
      <div className="fixed top-12 right-0 w-[500px] h-[500px] bg-amber-500/12 rounded-full blur-[140px] pointer-events-none translate-x-1/3 z-0" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-white/[0.035] rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="fixed bottom-10 left-10 w-[420px] h-[420px] bg-cyan-400/[0.09] rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-10 w-[480px] h-[480px] bg-amber-400/[0.1] rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userProfile={userProfile}
        isAdmin={isAdminUnlocked}
        onOpenSecretAdminModal={() => setIsSecretAdminModalOpen(true)}
        isBotMode={isBotMode}
        onToggleBotMode={() => setIsBotMode(!isBotMode)}
      />

      {/* Main App Container */}
      <main className="flex-1 pb-20 md:pb-8 pt-2">
        {/* If in Telegram Bot Simulator view */}
        {isBotMode ? (
          <div className="p-2 sm:p-4">
            <TelegramBotSimulator
              userProfile={userProfile}
              adminSettings={adminSettings}
              channels={channels}
              onOpenMiniAppTab={(tab) => {
                setIsBotMode(false);
                setCurrentTab(tab);
              }}
              onAdminUnlock={() => {
                setIsAdminUnlocked(true);
                setCurrentTab('admin');
                setIsBotMode(false);
              }}
            />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* View 1: Home Dashboard */}
            {currentTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 10, filter: 'drop-shadow(0 0 15px rgba(0,210,255,0.4))' }}
                animate={{ opacity: 1, y: 0, filter: 'drop-shadow(0 0 0px rgba(0,210,255,0))' }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <HomeDashboard
                  userProfile={userProfile}
                  onNavigate={setCurrentTab}
                  activeBroadcast={activeBroadcast}
                  onDismissBroadcast={() => setActiveBroadcast(null)}
                  onStartTest={() => checkAccessAndRun(() => setCurrentTab('test'))}
                  onStartDuel={() => checkAccessAndRun(() => setCurrentTab('duel'))}
                  onClaimDailyStreak={handleClaimDailyStreak}
                  onOpenWheel={() => setIsWheelModalOpen(true)}
                  recentDuels={recentDuels}
                  customMissions={adminSettings.customMissions}
                  sponsorTasks={adminSettings.sponsorTasks}
                  onClaimMissionReward={handleClaimMissionReward}
                  onClaimSponsorReward={handleClaimSponsorReward}
                  onOpenLinkMission={handleOpenLinkMission}
                  onViewCertificate={() => {
                    if (userProfile && (userProfile.iqScore > 0 || (userProfile.bestIq || 0) > 0)) {
                      setCertificateModalData({
                        userName: userProfile.name,
                        iqScore: userProfile.bestIq || userProfile.iqScore || 110,
                        date: new Date().toISOString().split('T')[0],
                      });
                    }
                  }}
                />
              </motion.div>
            )}

            {/* View 2: 20-Question IQ Test */}
            {currentTab === 'test' && (
              <motion.div
                key="test"
                initial={{ opacity: 0, scale: 0.98, filter: 'drop-shadow(0 0 20px rgba(251,191,36,0.4))' }}
                animate={{ opacity: 1, scale: 1, filter: 'drop-shadow(0 0 0px rgba(251,191,36,0))' }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <IQTestModule
                  questions={questions}
                  userProfile={userProfile}
                  onTestComplete={handleTestComplete}
                  onBackToMenu={() => setCurrentTab('home')}
                />
              </motion.div>
            )}

            {/* View 3: 1v1 Online Duel */}
            {currentTab === 'duel' && (
              <motion.div
                key="duel"
                initial={{ opacity: 0, y: 12, filter: 'drop-shadow(0 0 20px rgba(244,63,94,0.4))' }}
                animate={{ opacity: 1, y: 0, filter: 'drop-shadow(0 0 0px rgba(244,63,94,0))' }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <OnlineDuelModule
                  userProfile={userProfile}
                  questions={questions}
                  onDuelFinish={handleDuelFinish}
                  onBack={() => setCurrentTab('home')}
                />
              </motion.div>
            )}

            {/* View 4: Mini Games Break */}
            {currentTab === 'games' && (
              <motion.div
                key="games"
                initial={{ opacity: 0, y: 10, filter: 'drop-shadow(0 0 20px rgba(168,85,247,0.4))' }}
                animate={{ opacity: 1, y: 0, filter: 'drop-shadow(0 0 0px rgba(168,85,247,0))' }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <MiniGamesModule
                  onEarnTickets={handleEarnTickets}
                  onBack={() => setCurrentTab('home')}
                  adminSettings={adminSettings}
                  userProfile={userProfile}
                  onUpdateTimeSpent={handleUpdateTimeSpent}
                  onRecordGamePlay={handleRecordGamePlay}
                />
              </motion.div>
            )}

            {/* View 5: Leaderboard TOP-10 & TOP-50 */}
            {currentTab === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, y: 10, filter: 'drop-shadow(0 0 20px rgba(234,179,8,0.4))' }}
                animate={{ opacity: 1, y: 0, filter: 'drop-shadow(0 0 0px rgba(234,179,8,0))' }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <LeaderboardModule currentUser={userProfile} usersList={usersList} />
              </motion.div>
            )}

            {/* View 6: Referrals & Bonuses */}
            {currentTab === 'referrals' && (
              <motion.div
                key="referrals"
                initial={{ opacity: 0, y: 10, filter: 'drop-shadow(0 0 20px rgba(6,182,212,0.4))' }}
                animate={{ opacity: 1, y: 0, filter: 'drop-shadow(0 0 0px rgba(6,182,212,0))' }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <ReferralModule
                  currentUser={userProfile}
                  onClaimBonus={handleEarnTickets}
                />
              </motion.div>
            )}

            {/* View 7: Admin Panel (Only accessible if unlocked) */}
            {currentTab === 'admin' && isAdminUnlocked && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <AdminPanel
                  questions={questions}
                  onUpdateQuestions={setQuestions}
                  channels={channels}
                  onUpdateChannels={setChannels}
                  usersList={usersList}
                  onUpdateUsersList={setUsersList}
                  adminSettings={adminSettings}
                  onUpdateAdminSettings={handleUpdateAdminSettings}
                  onSendBroadcast={handleSendBroadcast}
                  onClose={() => setCurrentTab('home')}
                />
              </motion.div>
            )}

            {/* View 8: User Profile & Recharts Line Chart */}
            {currentTab === 'profile' && userProfile && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10, filter: 'drop-shadow(0 0 20px rgba(0,210,255,0.4))' }}
                animate={{ opacity: 1, y: 0, filter: 'drop-shadow(0 0 0px rgba(0,210,255,0))' }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <UserProfileView
                  userProfile={userProfile}
                  onStartTest={() => checkAccessAndRun(() => setCurrentTab('test'))}
                  onStartDuel={() => checkAccessAndRun(() => setCurrentTab('duel'))}
                  onOpenGames={() => setCurrentTab('games')}
                  onViewCertificate={() => {
                    if (userProfile && (userProfile.iqScore > 0 || (userProfile.bestIq || 0) > 0)) {
                      setCertificateModalData({
                        userName: userProfile.name,
                        iqScore: userProfile.bestIq || userProfile.iqScore || 110,
                        date: new Date().toISOString().split('T')[0],
                      });
                    }
                  }}
                />
              </motion.div>
            )}

            {/* View 9: Weekly Winners & Receipts History */}
            {currentTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10, filter: 'drop-shadow(0 0 20px rgba(251,191,36,0.4))' }}
                animate={{ opacity: 1, y: 0, filter: 'drop-shadow(0 0 0px rgba(251,191,36,0))' }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <WeeklyWinnersHistory
                  winners={adminSettings.weeklyWinnersHistory || []}
                  onClose={() => setCurrentTab('home')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Mobile Bottom Bar (hidden in bot mode) */}
      {!isBotMode && (
        <BottomNavBar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
        />
      )}

      {/* Secret Admin Passcode Modal (Master / Dynamic Code: 20120517M or 20120517m) */}
      <SecretAdminModal
        isOpen={isSecretAdminModalOpen}
        currentAdminCode={adminSettings.secretCode || '20120517M'}
        onClose={() => setIsSecretAdminModalOpen(false)}
        onSuccess={() => {
          setIsAdminUnlocked(true);
          setIsSecretAdminModalOpen(false);
          setCurrentTab('admin');
        }}
      />

      {/* Mandatory Subscription Check Modal */}
      {showMandatoryModal && (
        <MandatorySubModal
          channels={channels}
          onVerified={() => {
            setHasSubscribed(true);
            setShowMandatoryModal(false);
          }}
        />
      )}

      {/* Fullscreen Popup Announcement / Ad Screen */}
      {showPopupAd && adminSettings.popupAnnouncement?.enabled && (
        <PopupAnnouncementModal
          announcement={adminSettings.popupAnnouncement}
          onDismiss={() => setShowPopupAd(false)}
        />
      )}

      {/* Wheel of Fortune Modal */}
      <WheelOfFortuneModal
        isOpen={isWheelModalOpen}
        onClose={() => setIsWheelModalOpen(false)}
        canSpin={userProfile.lastWheelSpinDate !== new Date().toISOString().slice(0, 10)}
        onRewardWon={handleWheelRewardWon}
      />

      {/* Test Completion CertificateGenerator Modal */}
      {certificateModalData && (
        <CertificateGenerator
          userName={certificateModalData.userName}
          iqScore={certificateModalData.iqScore}
          date={certificateModalData.date}
          onClose={() => setCertificateModalData(null)}
          isModal={true}
        />
      )}
    </div>
  );
}
