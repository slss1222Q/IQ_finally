export type NavigationTab = 'home' | 'test' | 'duel' | 'games' | 'leaderboard' | 'referrals' | 'admin' | 'profile' | 'history';

export interface IqRecord {
  id: string;
  date: string;
  score: number;
  testNumber: number;
  timeSpentSeconds?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface GameLimitSettings {
  runnerDailyLimit: number; // 0 = cheksiz
  matrixDailyLimit: number;
  stroopDailyLimit: number;
  mathDailyLimit: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  iqScore: number;
  bestIq: number;
  iqHistory?: IqRecord[];
  duelRating: number;
  energyTickets: number;
  iqCoins: number;
  completedTestsCount: number;
  duelWins: number;
  duelLosses: number;
  isBanned: boolean;
  joinedAt: string;
  referralsCount: number;
  hasReceivedAutoReminder: boolean;
  // Gamification additions
  streakDays: number;
  lastLoginDate: string;
  streakClaimedToday: boolean;
  lastWheelSpinDate?: string;
  xp: number; // 0 to 10000+
  level: number; // 1 to 10
  levelTitle: string;
  weeklyTimeSpentSeconds: number; // weekly active time in seconds (minimum 360s = 6m)
  badges: string[]; // badge IDs unlocked
  dailyGamePlays?: {
    date: string;
    runner3d: number;
    memory4x4: number;
    stroop: number;
    speedmath: number;
    cipherCode?: number;
    laserReflex?: number;
    colorReflex?: number;
    patternMatch?: number;
    lockPick?: number;
    cyberMaze?: number;
    minesweeper?: number;
    anagramWord?: number;
    highLowCard?: number;
  };
  dailyMissions?: {
    [missionId: string]: {
      currentCount: number;
      isClaimed: boolean;
    };
  };
}

export interface DuelOutcome {
  id: string;
  player1: {
    name: string;
    avatar: string;
    score: number;
    rating: number;
    isWinner?: boolean;
  };
  player2: {
    name: string;
    avatar: string;
    score: number;
    rating: number;
    isWinner?: boolean;
  };
  winnerId: 'player1' | 'player2' | 'draw';
  timestamp: string;
  createdAt?: number; // Unix ms timestamp (Firebase) - haqiqiy vaqtni hisoblash uchun
  category?: string;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  rewardXp: number;
  icon: 'game' | 'duel' | 'app' | 'channel' | 'test' | 'custom';
  targetCount: number;
  currentCount?: number;
  isCompleted?: boolean;
  isClaimed?: boolean;
  linkUrl?: string; // For telegram subscription or external links
  actionType: 'complete_games' | 'play_duel' | 'visit_app' | 'pass_test' | 'telegram_sub' | 'custom_link';
}

export type QuestionCategory = 'Mantiq' | 'Visual' | 'Matematik' | 'Fazoviy';

export interface Question {
  id: string;
  question: string;
  svgType?: 'matrix3x3' | 'patternSeries' | 'shapes' | 'clockMath' | 'cube';
  options: string[];
  correctIndex: number;
  explanation: string;
  category: QuestionCategory;
  difficulty?: 'Oson' | "O'rta" | 'Qiyin';
}

export interface DuelOpponent {
  id: string;
  name: string;
  city: string;
  avatar: string;
  rating: number;
  speed: number;
  accuracy: number;
}

export interface ChannelSubscription {
  id: string;
  title: string;
  handleOrLink: string;
  type: 'open' | 'private';
  channelId?: string;
  subscribersCount?: string;
  isRequired: boolean;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  city: string;
  iqScore: number;
  duelRating: number;
  rank: number;
  weeklyMinutes: number;
  weeklyPoints: number;
  isCurrentUser?: boolean;
}

export interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'announcement' | 'reminder' | 'system';
}

export interface MonetizationSettings {
  isTestPaid: boolean;
  testPrice: number;
  testPriceCurrency: 'STARS' | 'UZS' | 'TON';
  paymentRecipient: string; // e.g. "8600 0423 1122 3344" or "@wallet"
  premiumGamesPaid: boolean;
  premiumGamesPrice: number;
}

export interface WeeklyPrizeSettings {
  top1Reward: string; // e.g. "15 Telegram Stars / Gift"
  top2Reward: string; // e.g. "10 Telegram Stars"
  top3Reward: string; // e.g. "5 Telegram Stars"
  minPoints: number; // e.g. 40+
  minTimeMinutes: number; // e.g. 5 minut
}

export interface WeeklyWinnerRecord {
  id: string;
  weekTitle: string; // e.g. "Hafta #38 (20-27 Sentabr)"
  username: string; // e.g. "@jasur_pro"
  fullName?: string;
  rank: number; // 1, 2, 3
  starsReward: number; // 15, 10, 5 Stars
  paymentDate: string; // "2026-09-27"
  receiptImageUrl?: string; // Chek rasmi (base64 yoki URL)
  transactionId?: string; // Stars / Ton TX ID
  status: 'paid' | 'pending';
  note?: string;
}

export interface SponsorChannelTask {
  id: string;
  channelUsername: string; // e.g. "@iqlevel_news"
  channelTitle: string; // e.g. "Kiber Yangiliklar"
  channelUrl: string; // e.g. "https://t.me/iqlevel_news"
  ticketReward: number; // e.g. 1
  isActive: boolean;
  createdAt: string;
}

export interface PopupAnnouncement {
  enabled: boolean;
  title: string;
  message: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  updatedAt?: string;
}

export interface AdminSettings {
  secretCode: string; // default "20120517M"
  autoReminderText: string;
  autoReminderEnabled: boolean;
  mandatorySubEnabled: boolean;
  testTimePerQuestion: number;
  monetization: MonetizationSettings;
  weeklyPrizes: WeeklyPrizeSettings;
  gameLimits?: GameLimitSettings;
  customMissions?: DailyMission[];
  popupAnnouncement?: PopupAnnouncement;
  sponsorTasks?: SponsorChannelTask[];
  weeklyWinnersHistory?: WeeklyWinnerRecord[];
}
