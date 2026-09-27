import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  Edit2,
  Save,
  Radio,
  FileSpreadsheet,
  FileText,
  UserX,
  UserCheck,
  Send,
  Check,
  Layers,
  Link,
  Shield,
  X,
  CreditCard,
  KeyRound,
  Gift,
  Coins,
  Gamepad2,
  Target,
  Sparkles,
  ExternalLink,
  Megaphone,
  Image as ImageIcon,
  Upload,
  Star,
  Eye,
  Trophy,
} from 'lucide-react';
import {
  Question,
  ChannelSubscription,
  UserProfile,
  AdminSettings,
  GameLimitSettings,
  DailyMission,
  WeeklyWinnerRecord,
  SponsorChannelTask,
  PopupAnnouncement,
} from '../types';
import { soundManager } from '../utils/audio';

interface AdminPanelProps {
  questions: Question[];
  onUpdateQuestions: (qs: Question[]) => void;
  channels: ChannelSubscription[];
  onUpdateChannels: (chs: ChannelSubscription[]) => void;
  usersList: UserProfile[];
  onUpdateUsersList: (users: UserProfile[]) => void;
  adminSettings: AdminSettings;
  onUpdateAdminSettings: (settings: AdminSettings) => void;
  onSendBroadcast: (msg: string) => void;
  onClose: () => void;
}

type AdminTab =
  | 'monetization'
  | 'security'
  | 'weekly'
  | 'winners'
  | 'announcement'
  | 'sponsors'
  | 'gamelimits'
  | 'missions'
  | 'broadcast'
  | 'questions'
  | 'channels'
  | 'analytics'
  | 'users';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  questions,
  onUpdateQuestions,
  channels,
  onUpdateChannels,
  usersList,
  onUpdateUsersList,
  adminSettings,
  onUpdateAdminSettings,
  onSendBroadcast,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('monetization');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Security code state
  const [newAdminCode, setNewAdminCode] = useState(adminSettings.secretCode || '20120517M');

  // Game Limits state
  const [gameLimits, setGameLimits] = useState<GameLimitSettings>(
    adminSettings.gameLimits || {
      runnerDailyLimit: 0,
      matrixDailyLimit: 0,
      stroopDailyLimit: 0,
      mathDailyLimit: 0,
    }
  );

  // Monetization local state
  const [monetization, setMonetization] = useState(
    adminSettings.monetization || {
      isTestPaid: false,
      testPrice: 15,
      testPriceCurrency: 'STARS',
      paymentRecipient: '8600 0423 1122 3344 (Humo/Uzcard)',
      premiumGamesPaid: false,
      premiumGamesPrice: 10,
    }
  );

  // Weekly prize settings
  const [weeklyPrizes, setWeeklyPrizes] = useState(
    adminSettings.weeklyPrizes || {
      top1Reward: '15 Telegram Stars / Gift',
      top2Reward: '10 Telegram Stars',
      top3Reward: '5 Telegram Stars',
      minPoints: 40,
      minTimeMinutes: 5,
    }
  );

  // Broadcast state
  const [broadcastMessage, setBroadcastMessage] = useState(
    'Kanaldan uzoqlashmang, yangi testlar va duellar tez orada!'
  );
  const [autoReminderText, setAutoReminderText] = useState(
    adminSettings.autoReminderText
  );

  // Question editing state
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAddingNewQuestion, setIsAddingNewQuestion] = useState(false);
  const [newQData, setNewQData] = useState<Partial<Question>>({
    category: 'Mantiq',
    difficulty: "O'rta",
    options: ['', '', '', ''],
    correctIndex: 0,
    question: '',
    explanation: '',
  });

  // Channel state
  const [newChannelTitle, setNewChannelTitle] = useState('');
  const [newChannelLink, setNewChannelLink] = useState('');
  const [newChannelType, setNewChannelType] = useState<'open' | 'private'>('open');
  const [newChannelId, setNewChannelId] = useState('');

  // User management / DM state
  const [selectedUserForDm, setSelectedUserForDm] = useState<UserProfile | null>(null);
  const [dmText, setDmText] = useState('');

  // Daily Missions Management State
  const [customMissions, setCustomMissions] = useState<DailyMission[]>(
    adminSettings.customMissions || [
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
    ]
  );
  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [newMissionDesc, setNewMissionDesc] = useState('');
  const [newMissionLink, setNewMissionLink] = useState('');
  const [newMissionCoins, setNewMissionCoins] = useState(100);
  const [newMissionXp, setNewMissionXp] = useState(200);
  const [newMissionType, setNewMissionType] = useState<'telegram_sub' | 'custom_link' | 'complete_games' | 'play_duel'>('telegram_sub');
  const [newMissionTarget, setNewMissionTarget] = useState(1);

  // 1. Ekran Reklama / E'lon (Popup Announcement) State
  const [popupAnnouncement, setPopupAnnouncement] = useState<PopupAnnouncement>(
    adminSettings.popupAnnouncement || {
      enabled: false,
      title: "IQ LEVEL UZ: HAFTALIK STARS YUTUQ O'YINI!",
      message: "Hurmatli foydalanuvchilar! Har hafta TOP-3 o'yinchilarga 15, 10 va 5 Telegram Stars sovg'alari to'lab berilmoqda. Faol bo'ling va sovrinlarga ega bo'ling!",
      imageUrl: '',
      buttonText: "Kanalga o'tish",
      buttonLink: 'https://t.me/iqlevel_uz',
    }
  );
  const [showAdPreview, setShowAdPreview] = useState(false);

  // 2. Haftalik G'oliblar va To'lov Cheklari State
  const [weeklyWinners, setWeeklyWinners] = useState<WeeklyWinnerRecord[]>(
    adminSettings.weeklyWinnersHistory || [
      {
        id: 'w-1',
        weekTitle: 'Hafta #38 (Sentabr 2026)',
        username: '@jasur_pro',
        fullName: 'Jasur Bek',
        rank: 1,
        starsReward: 15,
        paymentDate: '2026-09-26',
        receiptImageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
        transactionId: '#STARS-99214',
        status: 'paid',
        note: '15 Telegram Stars to\'liq yuborildi',
      },
      {
        id: 'w-2',
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
    ]
  );
  const [newWinnerWeek, setNewWinnerWeek] = useState('Hafta #39 (Sentabr 2026)');
  const [newWinnerUsername, setNewWinnerUsername] = useState('');
  const [newWinnerFullName, setNewWinnerFullName] = useState('');
  const [newWinnerRank, setNewWinnerRank] = useState(1);
  const [newWinnerStars, setNewWinnerStars] = useState(15);
  const [newWinnerDate, setNewWinnerDate] = useState(new Date().toISOString().slice(0, 10));
  const [newWinnerReceiptImg, setNewWinnerReceiptImg] = useState('');
  const [newWinnerTx, setNewWinnerTx] = useState('');
  const [newWinnerNote, setNewWinnerNote] = useState('');

  // 3. Shartlar / Homiylik Kanallari (+1 Chipta) State
  const [sponsorTasks, setSponsorTasks] = useState<SponsorChannelTask[]>(
    adminSettings.sponsorTasks || [
      {
        id: 'sp-1',
        channelUsername: '@iqlevel_uz',
        channelTitle: "IQ Level Uz Rasmiy Kanal",
        channelUrl: 'https://t.me/iqlevel_uz',
        ticketReward: 1,
        isActive: true,
        createdAt: '2026-09-27',
      },
    ]
  );
  const [newSponsorUsername, setNewSponsorUsername] = useState('');
  const [newSponsorTitle, setNewSponsorTitle] = useState('');
  const [newSponsorReward, setNewSponsorReward] = useState(1);

  // File to base64 helper
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (base64: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        callback(reader.result as string);
        showNotification("Rasm muvaffaqiyatli yuklandi!");
      }
    };
    reader.readAsDataURL(file);
  };

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    soundManager.playSuccessChime();
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // 1. Save Monetization & Pricing
  const handleSaveMonetization = () => {
    onUpdateAdminSettings({
      ...adminSettings,
      monetization,
    });
    showNotification("Monetizatsiya va to'lov sozlamalari saqlandi!");
  };

  // 2. Save Security Passcode
  const handleSavePasscode = () => {
    if (!newAdminCode.trim()) {
      alert("Parol bo'sh bo'lishi mumkin emas!");
      return;
    }
    onUpdateAdminSettings({
      ...adminSettings,
      secretCode: newAdminCode.trim(),
    });
    showNotification(`Yangi maxfiy admin paroli o'rnatildi: ${newAdminCode.trim()}`);
  };

  // 3. Save Weekly Prizes
  const handleSaveWeeklyPrizes = () => {
    onUpdateAdminSettings({
      ...adminSettings,
      weeklyPrizes,
    });
    showNotification("Haftalik sovrinlar va shartlar muvaffaqiyatli saqlandi!");
  };

  // 3.1 Save Game Limits
  const handleSaveGameLimits = () => {
    onUpdateAdminSettings({
      ...adminSettings,
      gameLimits,
    });
    showNotification("O'yinlarning kunlik limitlari muvaffaqiyatli saqlandi!");
  };

  // 3.2 Daily Missions Management
  const handleAddMission = () => {
    if (!newMissionTitle.trim()) {
      alert("Missiya nomini kiriting!");
      return;
    }
    const newM: DailyMission = {
      id: `mission-custom-${Date.now()}`,
      title: newMissionTitle.trim(),
      description: newMissionDesc.trim() || "Vazifani bajaring va sovrinlarga ega bo'ling",
      rewardCoins: Number(newMissionCoins) || 50,
      rewardXp: Number(newMissionXp) || 100,
      icon: newMissionType === 'telegram_sub' ? 'channel' : newMissionType === 'play_duel' ? 'duel' : newMissionType === 'complete_games' ? 'game' : 'custom',
      targetCount: Number(newMissionTarget) || 1,
      linkUrl: newMissionLink.trim() || undefined,
      actionType: newMissionType,
    };
    const updated = [...customMissions, newM];
    setCustomMissions(updated);
    onUpdateAdminSettings({
      ...adminSettings,
      customMissions: updated,
    });
    setNewMissionTitle('');
    setNewMissionDesc('');
    setNewMissionLink('');
    setNewMissionCoins(100);
    setNewMissionXp(200);
    showNotification("Yangi missiya qo'shildi!");
  };

  const handleDeleteMission = (id: string) => {
    const updated = customMissions.filter((m) => m.id !== id);
    setCustomMissions(updated);
    onUpdateAdminSettings({
      ...adminSettings,
      customMissions: updated,
    });
    showNotification("Missiya o'chirildi!");
  };

  // 4. Save Broadcast & Reminder
  const handleSaveAutoReminder = () => {
    onUpdateAdminSettings({
      ...adminSettings,
      autoReminderText,
      autoReminderEnabled: true,
    });
    showNotification("Avto-eslatma matni saqlandi!");
  };

  const handleInstantBroadcast = () => {
    if (!broadcastMessage.trim()) return;
    onSendBroadcast(broadcastMessage);
    showNotification(`Xabar barcha ${usersList.length} ta foydalanuvchiga yuborildi!`);
  };

  // 5. Question Builder
  const handleSaveQuestion = (q: Question) => {
    const updated = questions.map((item) => (item.id === q.id ? q : item));
    onUpdateQuestions(updated);
    setEditingQuestion(null);
    showNotification("Savol muvaffaqiyatli yangilandi!");
  };

  const handleDeleteQuestion = (id: string) => {
    if (questions.length <= 1) {
      alert("Kamida bitta savol qolishi kerak!");
      return;
    }
    const filtered = questions.filter((q) => q.id !== id);
    onUpdateQuestions(filtered);
    showNotification("Savol o'chirildi!");
  };

  const handleCreateNewQuestion = () => {
    if (!newQData.question?.trim()) {
      alert("Savol matnini kiriting!");
      return;
    }
    if (newQData.options?.some((opt) => !opt.trim())) {
      alert("Barcha 4 ta variantni to'ldiring!");
      return;
    }

    const created: Question = {
      id: `q-${Date.now()}`,
      question: newQData.question || '',
      category: newQData.category || 'Mantiq',
      difficulty: newQData.difficulty || "O'rta",
      options: newQData.options as string[],
      correctIndex: newQData.correctIndex ?? 0,
      explanation: newQData.explanation || "Mantiqiy to'g'ri yechim.",
    };

    onUpdateQuestions([...questions, created]);
    setIsAddingNewQuestion(false);
    setNewQData({
      category: 'Mantiq',
      difficulty: "O'rta",
      options: ['', '', '', ''],
      correctIndex: 0,
      question: '',
      explanation: '',
    });
    showNotification("Yangi savol qo'shildi!");
  };

  // 6. Channels
  const handleAddChannel = () => {
    if (!newChannelTitle.trim() || !newChannelLink.trim()) {
      alert("Kanal nomi va havolasini kiriting!");
      return;
    }
    const newChan: ChannelSubscription = {
      id: `chan-${Date.now()}`,
      title: newChannelTitle.trim(),
      handleOrLink: newChannelLink.trim(),
      type: newChannelType,
      channelId: newChannelType === 'private' ? newChannelId.trim() : undefined,
      isRequired: true,
      subscribersCount: '24.5K',
    };
    onUpdateChannels([...channels, newChan]);
    setNewChannelTitle('');
    setNewChannelLink('');
    setNewChannelId('');
    showNotification("Kanal qo'shildi!");
  };

  const handleDeleteChannel = (id: string) => {
    onUpdateChannels(channels.filter((c) => c.id !== id));
    showNotification("Kanal o'chirildi!");
  };

  // 7. Backup Download
  const handleDownloadCsv = () => {
    soundManager.playCyberClick();
    const headers = "ID,Ism,IQ_Ball,Eng_Yaxshi_IQ,Duel_Reyting,Yutilgan,Yutqazilgan,Qora_Royxat,Azo_Bolgan\n";
    const rows = usersList
      .map(
        (u) =>
          `"${u.id}","${u.name}",${u.iqScore},${u.bestIq},${u.duelRating},${u.duelWins},${u.duelLosses},${u.isBanned},"${u.joinedAt}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `iq_level_uz_backup_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showNotification("CSV baza yuklab olindi!");
  };

  // 8. Ekran Reklama / E'lon Handlers
  const handleSaveAnnouncement = () => {
    onUpdateAdminSettings({
      ...adminSettings,
      popupAnnouncement,
    });
    showNotification("Ekran reklama va e'lon sozlamalari saqlandi!");
  };

  // 9. Haftalik G'oliblar va Cheklar Handlers
  const handleAddWinner = () => {
    if (!newWinnerUsername.trim()) {
      alert("G'olib Telegram usernamesini kiriting (masalan: @jasur_pro)!");
      return;
    }
    const cleanUsername = newWinnerUsername.startsWith('@') ? newWinnerUsername : `@${newWinnerUsername}`;
    const newRecord: WeeklyWinnerRecord = {
      id: `winner-${Date.now()}`,
      weekTitle: newWinnerWeek.trim() || "Haftalik G'olib",
      username: cleanUsername.trim(),
      fullName: newWinnerFullName.trim() || undefined,
      rank: Number(newWinnerRank) || 1,
      starsReward: Number(newWinnerStars) || 15,
      paymentDate: newWinnerDate || new Date().toISOString().slice(0, 10),
      receiptImageUrl: newWinnerReceiptImg || undefined,
      transactionId: newWinnerTx.trim() || undefined,
      status: 'paid',
      note: newWinnerNote.trim() || undefined,
    };
    const updated = [newRecord, ...weeklyWinners];
    setWeeklyWinners(updated);
    onUpdateAdminSettings({
      ...adminSettings,
      weeklyWinnersHistory: updated,
    });
    setNewWinnerUsername('');
    setNewWinnerFullName('');
    setNewWinnerReceiptImg('');
    setNewWinnerTx('');
    setNewWinnerNote('');
    showNotification("G'olib va to'lov cheki muvaffaqiyatli qo'shildi!");
  };

  const handleDeleteWinner = (id: string) => {
    const updated = weeklyWinners.filter((w) => w.id !== id);
    setWeeklyWinners(updated);
    onUpdateAdminSettings({
      ...adminSettings,
      weeklyWinnersHistory: updated,
    });
    showNotification("G'olib yozuvi o'chirildi!");
  };

  // 10. Shartlar / Homiylik Kanallari Handlers (+1 Chipta)
  const handleAddSponsorTask = () => {
    if (!newSponsorUsername.trim()) {
      alert("Kanal usernamesini kiriting (masalan: @kanal_nomi)!");
      return;
    }
    const cleanUser = newSponsorUsername.startsWith('@') ? newSponsorUsername : `@${newSponsorUsername}`;
    const newTask: SponsorChannelTask = {
      id: `sp-${Date.now()}`,
      channelUsername: cleanUser,
      channelTitle: newSponsorTitle.trim() || `${cleanUser} kanaliga obuna bo'ling`,
      channelUrl: `https://t.me/${cleanUser.replace('@', '')}`,
      ticketReward: Number(newSponsorReward) || 1,
      isActive: true,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const updated = [...sponsorTasks, newTask];
    setSponsorTasks(updated);
    onUpdateAdminSettings({
      ...adminSettings,
      sponsorTasks: updated,
    });
    setNewSponsorUsername('');
    setNewSponsorTitle('');
    setNewSponsorReward(1);
    showNotification("Yangi kanal obuna sharti (+1 chipta) qo'shildi!");
  };

  const handleDeleteSponsorTask = (id: string) => {
    const updated = sponsorTasks.filter((t) => t.id !== id);
    setSponsorTasks(updated);
    onUpdateAdminSettings({
      ...adminSettings,
      sponsorTasks: updated,
    });
    showNotification("Kanal sharti o'chirildi!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-amber-400/50 rounded-2xl shadow-2xl shadow-amber-400/10 flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Toast Notification */}
        {successToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-full shadow-lg flex items-center gap-1.5">
            <Check className="w-4 h-4" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="px-4 sm:px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-display font-bold text-white">
                  MAXFIY BOSHQARUV KONSOLI
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  ROOT PAROL: {adminSettings.secretCode || '20120517M'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                To'lovlar, narxlar, yangi admin paroli, haftalik sovg'alar va testlar
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playCyberClick();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 pb-2 bg-slate-950/60 border-b border-slate-800 overflow-x-auto">
          {[
            { id: 'announcement', label: '📢 Ekran Reklama', icon: Megaphone },
            { id: 'winners', label: '🧾 G\'oliblar & Cheklar', icon: Trophy },
            { id: 'sponsors', label: '⭐ Kanal Obuna (+1 Chip)', icon: Link },
            { id: 'monetization', label: '💳 Narx & To\'lov', icon: CreditCard },
            { id: 'security', label: '🔑 Admin Paroli', icon: KeyRound },
            { id: 'gamelimits', label: '🎮 O\'yin Limitlari', icon: Gamepad2 },
            { id: 'missions', label: '🎯 Kunlik Missiyalar', icon: Target },
            { id: 'weekly', label: '🎁 Haftalik TOP-3', icon: Gift },
            { id: 'questions', label: '🧠 Savollar', icon: Layers },
            { id: 'broadcast', label: '🔔 Bildirishnoma', icon: Bell },
            { id: 'channels', label: '🔒 Majburiy Obuna', icon: Link },
            { id: 'analytics', label: '📊 Analitika', icon: FileSpreadsheet },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playCyberClick();
                  setActiveTab(tab.id as AdminTab);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  activeTab === tab.id
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB: EKRAN REKLAMA & E'LON BOSHQARUVI */}
          {activeTab === 'announcement' && (
            <div className="space-y-5">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Megaphone className="w-4 h-4 text-cyan-400" />
                      <span>Ekran Reklama va Muhim E'lon Boshqaruvi</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Ilovaga har bir odam kirganda ekranda to'liq chiqadigan rasm, xabar va havolani sozlang (Skip tugmasi bilan)
                    </p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      {popupAnnouncement.enabled ? "Holat: YOQILGAN ✅" : "Holat: O'CHIRILGAN ❌"}
                    </span>
                    <input
                      type="checkbox"
                      checked={popupAnnouncement.enabled}
                      onChange={(e) =>
                        setPopupAnnouncement({ ...popupAnnouncement, enabled: e.target.checked })
                      }
                      className="w-5 h-5 accent-cyan-400 rounded cursor-pointer"
                    />
                  </label>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-300">E'lon / Reklama Sarlavhasi:</label>
                    <input
                      type="text"
                      value={popupAnnouncement.title}
                      onChange={(e) =>
                        setPopupAnnouncement({ ...popupAnnouncement, title: e.target.value })
                      }
                      placeholder="Masalan: DIQQAT, HAFTALIK STARS SOVRINLARI!"
                      className="w-full h-10 px-3 mt-1 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300">Xabar Matni:</label>
                    <textarea
                      rows={3}
                      value={popupAnnouncement.message}
                      onChange={(e) =>
                        setPopupAnnouncement({ ...popupAnnouncement, message: e.target.value })
                      }
                      placeholder="Xabarni yozing..."
                      className="w-full p-3 mt-1 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-medium focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  {/* Image Upload and URL */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div>
                      <label className="text-[11px] font-bold text-cyan-300 flex items-center gap-1 mb-1">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Fayldan Rasm Yuklash:</span>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageUpload(e, (base64) =>
                            setPopupAnnouncement((prev) => ({ ...prev, imageUrl: base64 }))
                          )
                        }
                        className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-500 file:text-slate-950 hover:file:bg-cyan-400 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1 mb-1">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Yoki Rasm Havolasi (URL):</span>
                      </label>
                      <input
                        type="text"
                        value={popupAnnouncement.imageUrl || ''}
                        onChange={(e) =>
                          setPopupAnnouncement({ ...popupAnnouncement, imageUrl: e.target.value })
                        }
                        placeholder="https://... yoki base64"
                        className="w-full h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                      />
                    </div>

                    {popupAnnouncement.imageUrl && (
                      <div className="sm:col-span-2 flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-cyan-500/30">
                        <div className="flex items-center gap-3">
                          <img
                            src={popupAnnouncement.imageUrl}
                            alt="Prevyu"
                            className="w-14 h-14 object-cover rounded-lg border border-slate-700"
                          />
                          <span className="text-xs text-cyan-300 font-mono">Rasm yuklandi ✅</span>
                        </div>
                        <button
                          onClick={() => setPopupAnnouncement({ ...popupAnnouncement, imageUrl: '' })}
                          className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 text-xs hover:bg-rose-500/30 transition-colors"
                        >
                          O'chirish ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Optional Button Link */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-300 font-bold">Tugma Matni (Ixtiyoriy):</label>
                      <input
                        type="text"
                        value={popupAnnouncement.buttonText || ''}
                        onChange={(e) =>
                          setPopupAnnouncement({ ...popupAnnouncement, buttonText: e.target.value })
                        }
                        placeholder="Masalan: Kanalga o'tish"
                        className="w-full h-9 px-3 mt-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-300 font-bold">Tugma Havolasi (URL):</label>
                      <input
                        type="text"
                        value={popupAnnouncement.buttonLink || ''}
                        onChange={(e) =>
                          setPopupAnnouncement({ ...popupAnnouncement, buttonLink: e.target.value })
                        }
                        placeholder="https://t.me/kanal_nomi"
                        className="w-full h-9 px-3 mt-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={handleSaveAnnouncement}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Reklama Sozlamalarini Saqlash</span>
                    </button>

                    <button
                      onClick={() => setShowAdPreview(!showAdPreview)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{showAdPreview ? "Prevyuni Yopish" : "Jonli Ko'rinishni Sinash"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* In-tab Live Preview */}
              {showAdPreview && (
                <div className="p-4 rounded-2xl bg-slate-900 border-2 border-cyan-400 space-y-3 text-center">
                  <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
                    --- FOYDALANUVCHIGA CHIQADIGAN EKRAN REKLAMASI PREVYUSI ---
                  </div>
                  {popupAnnouncement.imageUrl && (
                    <img
                      src={popupAnnouncement.imageUrl}
                      alt="Reklama"
                      className="max-h-48 mx-auto rounded-xl object-contain"
                    />
                  )}
                  <h4 className="text-base font-bold text-white">{popupAnnouncement.title}</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto whitespace-pre-line">{popupAnnouncement.message}</p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    {popupAnnouncement.buttonLink && (
                      <span className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 text-xs font-bold">
                        {popupAnnouncement.buttonText || "Batafsil"}
                      </span>
                    )}
                    <span className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold border border-slate-700">
                      O'tkazib yuborish (Skip) ✕
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: HAFTALIK STARS G'OLIBLARI VA CHEKLAR YUKLASH */}
          {activeTab === 'winners' && (
            <div className="space-y-5">
              {/* Form to add winner & check */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-amber-400/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span>Haftalik Stars G'olibi va To'lov Chekini Yuklash</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Haftalik Stars yutgan foydalanuvchilar ro'yxati va o'tkazilgan to'lov cheki skrinshotini yuklang
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300">Hafta Sarlavhasi:</label>
                    <input
                      type="text"
                      value={newWinnerWeek}
                      onChange={(e) => setNewWinnerWeek(e.target.value)}
                      placeholder="Hafta #38 (Sentabr 2026)"
                      className="w-full h-9 px-3 mt-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-amber-300">G'olib Telegram Username *:</label>
                    <input
                      type="text"
                      value={newWinnerUsername}
                      onChange={(e) => setNewWinnerUsername(e.target.value)}
                      placeholder="@jasur_pro"
                      className="w-full h-9 px-3 mt-1 rounded-lg bg-slate-900 border border-amber-400/50 text-amber-300 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300">Ism Sharifi (Ixtiyoriy):</label>
                    <input
                      type="text"
                      value={newWinnerFullName}
                      onChange={(e) => setNewWinnerFullName(e.target.value)}
                      placeholder="Jasur Bek"
                      className="w-full h-9 px-3 mt-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300">O'rin (Rank):</label>
                    <select
                      value={newWinnerRank}
                      onChange={(e) => {
                        const rank = Number(e.target.value);
                        setNewWinnerRank(rank);
                        setNewWinnerStars(rank === 1 ? 15 : rank === 2 ? 10 : 5);
                      }}
                      className="w-full h-9 px-3 mt-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    >
                      <option value={1}>1-o'rin (15 Stars)</option>
                      <option value={2}>2-o'rin (10 Stars)</option>
                      <option value={3}>3-o'rin (5 Stars)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300">Mukofot (Stars):</label>
                    <input
                      type="number"
                      value={newWinnerStars}
                      onChange={(e) => setNewWinnerStars(Number(e.target.value))}
                      className="w-full h-9 px-3 mt-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300">To'lov Sanasi:</label>
                    <input
                      type="date"
                      value={newWinnerDate}
                      onChange={(e) => setNewWinnerDate(e.target.value)}
                      className="w-full h-9 px-3 mt-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300">Tranzaksiya ID (Ixtiyoriy):</label>
                    <input
                      type="text"
                      value={newWinnerTx}
                      onChange={(e) => setNewWinnerTx(e.target.value)}
                      placeholder="#STARS-99214"
                      className="w-full h-9 px-3 mt-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-300">Izoh (Ixtiyoriy):</label>
                    <input
                      type="text"
                      value={newWinnerNote}
                      onChange={(e) => setNewWinnerNote(e.target.value)}
                      placeholder="Telegram Stars to'liq o'tkazib berildi"
                      className="w-full h-9 px-3 mt-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>

                {/* Receipt Image File / URL Upload */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    <span>To'lov Chekini Yuklash (Skrinshot yoki Fayl):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Fayldan Skrinshotni Tanlash:</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageUpload(e, (base64) => setNewWinnerReceiptImg(base64))
                        }
                        className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-400 file:text-slate-950 hover:file:bg-amber-300 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Yoki Rasm Havolasini Kiritish:</label>
                      <input
                        type="text"
                        value={newWinnerReceiptImg}
                        onChange={(e) => setNewWinnerReceiptImg(e.target.value)}
                        placeholder="https://... yoki base64"
                        className="w-full h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  {newWinnerReceiptImg && (
                    <div className="flex items-center gap-3 pt-2">
                      <img
                        src={newWinnerReceiptImg}
                        alt="Chek prevyusi"
                        className="w-16 h-16 object-cover rounded-lg border border-amber-400"
                      />
                      <div className="text-xs text-emerald-400 font-mono">
                        To'lov cheki rasm sifatida tayyorlandi ✅
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleAddWinner}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>G'olib va To'lov Chekini Qo'shish</span>
                </button>
              </div>

              {/* Existing Winners Table */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Mavjud G'oliblar Tarixi ({weeklyWinners.length} ta)
                </h4>
                <div className="space-y-2">
                  {weeklyWinners.map((winner) => (
                    <div
                      key={winner.id}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-base">{winner.rank === 1 ? '🥇' : winner.rank === 2 ? '🥈' : '🥉'}</span>
                        <div className="min-w-0">
                          <div className="font-bold text-white font-mono flex items-center gap-2">
                            <span>{winner.username}</span>
                            <span className="text-amber-400 font-bold font-mono">+{winner.starsReward} Stars</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {winner.weekTitle} · {winner.paymentDate}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {winner.receiptImageUrl ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                            Chek bor 🧾
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-500 text-[10px]">
                            Chek yo'q
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteWinner(winner.id)}
                          className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: SHARTLAR / HOMIYLIK KANALLARI (+1 CHIPTA) */}
          {activeTab === 'sponsors' && (
            <div className="space-y-5">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Link className="w-4 h-4 text-cyan-400" />
                    <span>Kanalga Obuna Bo'lish Shartlari (+1 Chipta Yutish)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Foydalanuvchilarga @kanalga obuna bo'lish evaziga +1 chipta (chip) beruvchi homiylik vazifalarini qo'shing
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-cyan-300">Kanal Usernamesi *:</label>
                    <input
                      type="text"
                      value={newSponsorUsername}
                      onChange={(e) => setNewSponsorUsername(e.target.value)}
                      placeholder="@kanal_nomi"
                      className="w-full h-9 px-3 mt-1 rounded-lg bg-slate-900 border border-cyan-400/40 text-cyan-300 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300">Vazifa Sarlavhasi:</label>
                    <input
                      type="text"
                      value={newSponsorTitle}
                      onChange={(e) => setNewSponsorTitle(e.target.value)}
                      placeholder="@kanal_nomi ga obuna bo'ling"
                      className="w-full h-9 px-3 mt-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300">Mukofot (Chipta):</label>
                    <input
                      type="number"
                      value={newSponsorReward}
                      onChange={(e) => setNewSponsorReward(Number(e.target.value))}
                      className="w-full h-9 px-3 mt-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddSponsorTask}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Kanal Shartini (+1 Chipta) Qo'shish</span>
                </button>
              </div>

              {/* Existing Sponsor Tasks */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Mavjud Homiylik Shartlari ({sponsorTasks.length} ta)
                </h4>
                <div className="space-y-2">
                  {sponsorTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span className="font-mono text-cyan-400">{task.channelUsername}</span>
                          <span className="text-amber-400 font-mono">+{task.ticketReward} Chipta</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {task.channelTitle} · {task.channelUrl}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteSponsorTask(task.id)}
                        className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: MONETIZATION & PRICING */}
          {activeTab === 'monetization' && (
            <div className="space-y-5">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-amber-400/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      <span>IQ Test va O'yinlar Narxini Belgilash</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      IQ test topshirishni pullik qilish, mini-o'yinlar obunasini boshqarish va to'lov rekvizitlari
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Test Pricing Toggle */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">IQ Test Pullik Bo'lsinmi?</span>
                      <input
                        type="checkbox"
                        checked={monetization.isTestPaid}
                        onChange={(e) =>
                          setMonetization({ ...monetization, isTestPaid: e.target.checked })
                        }
                        className="w-4 h-4 text-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400">Test Narxi</label>
                      <input
                        type="number"
                        value={monetization.testPrice}
                        onChange={(e) =>
                          setMonetization({ ...monetization, testPrice: Number(e.target.value) })
                        }
                        className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400">To'lov Valyutasi</label>
                      <select
                        value={monetization.testPriceCurrency}
                        onChange={(e) =>
                          setMonetization({ ...monetization, testPriceCurrency: e.target.value as any })
                        }
                        className="w-full h-9 px-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                      >
                        <option value="STARS">Telegram Stars (⭐)</option>
                        <option value="UZS">So'm (UZS / Karta)</option>
                        <option value="TON">TON (Kriptovalyuta)</option>
                      </select>
                    </div>
                  </div>

                  {/* Payment Destination */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <div>
                      <label className="text-xs font-bold text-white">Pul Qayerga Tushadi? (Karta / Hamyon)</label>
                      <p className="text-[10px] text-slate-400 mb-1">
                        Foydalanuvchilar to'lov qilganda mablag' tushadigan karta raqami yoki Telegram hamyon
                      </p>
                      <input
                        type="text"
                        value={monetization.paymentRecipient}
                        onChange={(e) =>
                          setMonetization({ ...monetization, paymentRecipient: e.target.value })
                        }
                        placeholder="8600 0423 1122 3344 yoki @wallet..."
                        className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                      <span className="text-xs font-bold text-white">Premium O'yinlar Obunasi</span>
                      <input
                        type="checkbox"
                        checked={monetization.premiumGamesPaid}
                        onChange={(e) =>
                          setMonetization({ ...monetization, premiumGamesPaid: e.target.checked })
                        }
                        className="w-4 h-4 text-amber-400"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveMonetization}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Narx va To'lov Sozlamalarini Saqlash</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SECURITY PASSCODE MANAGEMENT */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-amber-400/40 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>Yangi Admin Paroli O'rnatish</span>
                </div>
                <p className="text-xs text-slate-400">
                  Botda yoki Mini Appda admin panelni ochadigan xavfsizlik kodini istalgan vaqtda yangilang.
                </p>

                <div className="max-w-sm space-y-2">
                  <label className="text-[11px] text-slate-300">Yangi Maxfiy Parol:</label>
                  <input
                    type="text"
                    value={newAdminCode}
                    onChange={(e) => setNewAdminCode(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-amber-400/50 text-amber-300 font-mono text-sm tracking-widest"
                  />
                  <div className="text-[10px] text-slate-500">
                    Standart master kod: <code className="text-slate-400 font-mono">20120517M</code>
                  </div>
                </div>

                <button
                  onClick={handleSavePasscode}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Yangi Parolni Saqlash</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: WEEKLY TOP-3 PRIZES */}
          {activeTab === 'weekly' && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-amber-400/40 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Gift className="w-4 h-4 text-amber-400" />
                  <span>Haftalik TOP-3 Sovg'alari va Shartlari</span>
                </div>
                <p className="text-xs text-slate-400">
                  Top 1: 15 Stars/Gift, Top 2: 10 Stars, Top 3: 5 Stars. Shuningdek minimal ball va ilovada o'tkazilgan vaqt shartini sozlang.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-amber-300 font-bold">🥇 1-O'rin Sovg'asi</label>
                    <input
                      type="text"
                      value={weeklyPrizes.top1Reward}
                      onChange={(e) =>
                        setWeeklyPrizes({ ...weeklyPrizes, top1Reward: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-cyan-300 font-bold">🥈 2-O'rin Sovg'asi</label>
                    <input
                      type="text"
                      value={weeklyPrizes.top2Reward}
                      onChange={(e) =>
                        setWeeklyPrizes({ ...weeklyPrizes, top2Reward: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-purple-300 font-bold">🥉 3-O'rin Sovg'asi</label>
                    <input
                      type="text"
                      value={weeklyPrizes.top3Reward}
                      onChange={(e) =>
                        setWeeklyPrizes({ ...weeklyPrizes, top3Reward: e.target.value })
                      }
                      className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] text-slate-400">Minimal Talab Qilingan Ochko</label>
                    <input
                      type="number"
                      value={weeklyPrizes.minPoints}
                      onChange={(e) =>
                        setWeeklyPrizes({ ...weeklyPrizes, minPoints: Number(e.target.value) })
                      }
                      className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400">Haftada Sarflanishi Kerak Bo'lgan Vaqt (Minut)</label>
                    <input
                      type="number"
                      value={weeklyPrizes.minTimeMinutes}
                      onChange={(e) =>
                        setWeeklyPrizes({ ...weeklyPrizes, minTimeMinutes: Number(e.target.value) })
                      }
                      className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveWeeklyPrizes}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Sovrin Sozlamalarini Saqlash</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: GAME LIMITS MANAGEMENT */}
          {activeTab === 'gamelimits' && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-amber-400/40 space-y-4">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Gamepad2 className="w-4 h-4 text-amber-400" />
                  <span>O'yinlarning Kunlik Limitlarini Boshqarish</span>
                </div>
                <p className="text-xs text-slate-400">
                  Foydalanuvchilar kun davomida har bir mini-o'yinni necha marta o'ynashi mumkinligini cheklang.
                  <strong className="text-amber-300 ml-1">0 kiritilsa — o'yin cheksiz (limitsiz) bo'ladi.</strong>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Game 1: Subway 4D Runner */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                        <span>🛹 Subway 4D Runner</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                        {gameLimits.runnerDailyLimit === 0 ? 'Cheksiz' : `${gameLimits.runnerDailyLimit} marta/kun`}
                      </span>
                    </div>
                    <label className="text-[11px] text-slate-400 block">Kunlik limit (0 = cheksiz):</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={gameLimits.runnerDailyLimit}
                      onChange={(e) =>
                        setGameLimits({ ...gameLimits, runnerDailyLimit: Math.max(0, parseInt(e.target.value) || 0) })
                      }
                      className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                    />
                  </div>

                  {/* Game 2: 4x4 Memory Matrix */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <span>🧩 4x4 Xotira Matritsasi</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                        {gameLimits.matrixDailyLimit === 0 ? 'Cheksiz' : `${gameLimits.matrixDailyLimit} marta/kun`}
                      </span>
                    </div>
                    <label className="text-[11px] text-slate-400 block">Kunlik limit (0 = cheksiz):</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={gameLimits.matrixDailyLimit}
                      onChange={(e) =>
                        setGameLimits({ ...gameLimits, matrixDailyLimit: Math.max(0, parseInt(e.target.value) || 0) })
                      }
                      className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                    />
                  </div>

                  {/* Game 3: Stroop Test */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                        <span>⚡ Stroop Diqqat Testi</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
                        {gameLimits.stroopDailyLimit === 0 ? 'Cheksiz' : `${gameLimits.stroopDailyLimit} marta/kun`}
                      </span>
                    </div>
                    <label className="text-[11px] text-slate-400 block">Kunlik limit (0 = cheksiz):</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={gameLimits.stroopDailyLimit}
                      onChange={(e) =>
                        setGameLimits({ ...gameLimits, stroopDailyLimit: Math.max(0, parseInt(e.target.value) || 0) })
                      }
                      className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                    />
                  </div>

                  {/* Game 4: Speed Math 1v1 */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <span>🎯 Tezkor Matematika 1v1</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">
                        {gameLimits.mathDailyLimit === 0 ? 'Cheksiz' : `${gameLimits.mathDailyLimit} marta/kun`}
                      </span>
                    </div>
                    <label className="text-[11px] text-slate-400 block">Kunlik limit (0 = cheksiz):</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={gameLimits.mathDailyLimit}
                      onChange={(e) =>
                        setGameLimits({ ...gameLimits, mathDailyLimit: Math.max(0, parseInt(e.target.value) || 0) })
                      }
                      className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveGameLimits}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>O'yin Limitlarini Saqlash</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: DAILY MISSIONS MANAGEMENT */}
          {activeTab === 'missions' && (
            <div className="space-y-5">
              {/* Add New Mission Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-4">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Target className="w-5 h-5 text-cyan-400" />
                  <span>Yangi Kunlik Missiya Qo'shish</span>
                </div>
                <p className="text-xs text-slate-400">
                  Foydalanuvchilarga yangi vazifalar bering (masalan: rasmiy kanalga obuna bo'lish, botga kirish, do'stlarni taklif qilish).
                  Vazifani bajargan foydalanuvchiga IQ tangalari va daraja XP beriladi.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-cyan-300 font-bold block mb-1">
                      Missiya Sarlavhasi
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: Telegram kanalga obuna bo'ling"
                      value={newMissionTitle}
                      onChange={(e) => setNewMissionTitle(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Vazifa Turi
                    </label>
                    <select
                      value={newMissionType}
                      onChange={(e) => setNewMissionType(e.target.value as any)}
                      className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    >
                      <option value="telegram_sub">📢 Telegram Kanalga Obuna Bo'lish</option>
                      <option value="custom_link">🔗 Maxsus Havola / Saytga Tashrif</option>
                      <option value="complete_games">🎮 Mini-O'yinlar O'ynash</option>
                      <option value="play_duel">⚔️ 1v1 Duelda Qatnashish</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Batafsil Tavsifi
                  </label>
                  <input
                    type="text"
                    placeholder="Masalan: @iqlevel_uz kanaliga ulaning va eng so'nggi turnirlar haqida xabardor bo'ling!"
                    value={newMissionDesc}
                    onChange={(e) => setNewMissionDesc(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Havola (Link URL - ixtiyoriy)
                    </label>
                    <input
                      type="text"
                      placeholder="https://t.me/iqlevel_uz"
                      value={newMissionLink}
                      onChange={(e) => setNewMissionLink(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-amber-300 font-bold block mb-1">
                      Mukofot (IQ Tangalar)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="5000"
                      value={newMissionCoins}
                      onChange={(e) => setNewMissionCoins(Number(e.target.value))}
                      className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-purple-300 font-bold block mb-1">
                      Mukofot (Daraja XP)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="5000"
                      value={newMissionXp}
                      onChange={(e) => setNewMissionXp(Number(e.target.value))}
                      className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddMission}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-display font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,210,255,0.3)] transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yangi Missiyani Qo'shish & Saqlash</span>
                </button>
              </div>

              {/* List of Custom Missions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 font-mono">
                    ADMIN TOMONIDAN QO'SHILGAN MISSIYALAR ({customMissions.length} TA)
                  </h4>
                </div>

                {customMissions.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-500">
                    Hozircha qo'shimcha maxsus missiyalar yo'q. Yuqoridagi forma orqali birinchi missiyani qo'shing.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {customMissions.map((mission) => (
                      <div
                        key={mission.id}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{mission.title}</span>
                              {mission.linkUrl && (
                                <ExternalLink className="w-3 h-3 text-cyan-400" />
                              )}
                            </span>
                            <button
                              onClick={() => handleDeleteMission(mission.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-900 transition-colors"
                              title="O'chirish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">
                            {mission.description}
                          </p>
                          {mission.linkUrl && (
                            <div className="text-[10px] font-mono text-cyan-400 truncate pt-1">
                              {mission.linkUrl}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[10px] font-mono">
                          <span className="text-amber-400 font-bold">+{mission.rewardCoins} Tangalar</span>
                          <span className="text-purple-400 font-bold">+{mission.rewardXp} XP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">IQ Test Savollari ({questions.length} ta)</h3>
                  <p className="text-xs text-slate-400">Savollar qo'shish, to'g'ri javob va izohni belgilash</p>
                </div>
                <button
                  onClick={() => setIsAddingNewQuestion(!isAddingNewQuestion)}
                  className="px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yangi Savol</span>
                </button>
              </div>

              {/* Add New Question Form */}
              {isAddingNewQuestion && (
                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-400/40 space-y-3">
                  <div className="font-semibold text-cyan-300 text-xs">Yangi IQ Savoli Yaratish</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400">Kategoriya</label>
                      <select
                        value={newQData.category}
                        onChange={(e) => setNewQData({ ...newQData, category: e.target.value as any })}
                        className="w-full h-9 px-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                      >
                        <option value="Mantiq">Mantiq</option>
                        <option value="Visual">Visual</option>
                        <option value="Matematik">Matematik</option>
                        <option value="Fazoviy">Fazoviy</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">Qiyinlik</label>
                      <select
                        value={newQData.difficulty}
                        onChange={(e) => setNewQData({ ...newQData, difficulty: e.target.value as any })}
                        className="w-full h-9 px-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                      >
                        <option value="Oson">Oson</option>
                        <option value="O'rta">O'rta</option>
                        <option value="Qiyin">Qiyin</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400">Savol Matni</label>
                    <input
                      type="text"
                      placeholder="Savolni kiriting..."
                      value={newQData.question || ''}
                      onChange={(e) => setNewQData({ ...newQData, question: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {['A', 'B', 'C', 'D'].map((label, idx) => (
                      <div key={label} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={newQData.correctIndex === idx}
                          onChange={() => setNewQData({ ...newQData, correctIndex: idx })}
                          className="text-cyan-500"
                        />
                        <input
                          type="text"
                          placeholder={`Variant ${label}`}
                          value={newQData.options?.[idx] || ''}
                          onChange={(e) => {
                            const opts = [...(newQData.options || ['', '', '', ''])];
                            opts[idx] = e.target.value;
                            setNewQData({ ...newQData, options: opts });
                          }}
                          className="flex-1 h-8 px-2 rounded bg-slate-900 border border-slate-700 text-white text-xs"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400">To'g'ri Javob Izohi</label>
                    <input
                      type="text"
                      placeholder="Nima uchun shu javob to'g'ri ekanligini yozing..."
                      value={newQData.explanation || ''}
                      onChange={(e) => setNewQData({ ...newQData, explanation: e.target.value })}
                      className="w-full h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsAddingNewQuestion(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                    >
                      Bekor qilish
                    </button>
                    <button
                      onClick={handleCreateNewQuestion}
                      className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs"
                    >
                      Saqlash
                    </button>
                  </div>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                          #{idx + 1} {q.category}
                        </span>
                        <span className="text-[10px] text-amber-400">{q.difficulty || "O'rta"}</span>
                      </div>
                      <p className="text-xs text-white font-medium truncate">{q.question}</p>
                      <div className="text-[11px] text-slate-400 mt-1">
                        To'g'ri: <strong className="text-emerald-400">{q.options[q.correctIndex]}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: BROADCAST */}
          {activeTab === 'broadcast' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-3">
                <div className="text-sm font-bold text-cyan-300">Doimiy Avto-Eslatma</div>
                <textarea
                  rows={2}
                  value={autoReminderText}
                  onChange={(e) => setAutoReminderText(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
                <button
                  onClick={handleSaveAutoReminder}
                  className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Saqlash</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-amber-400/30 space-y-3">
                <div className="text-sm font-bold text-amber-300">Hamma Foydalanuvchilarga Broadcast</div>
                <textarea
                  rows={3}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
                <button
                  onClick={handleInstantBroadcast}
                  className="px-4 py-2 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Hozir Yuborish</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: CHANNELS */}
          {activeTab === 'channels' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-white">Yangi Kanal Ulash (Ochiq yoki Privat)</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Kanal nomi"
                    value={newChannelTitle}
                    onChange={(e) => setNewChannelTitle(e.target.value)}
                    className="h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                  <select
                    value={newChannelType}
                    onChange={(e) => setNewChannelType(e.target.value as any)}
                    className="h-9 px-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                  >
                    <option value="open">Ochiq (@username)</option>
                    <option value="private">Yopiq (Privat https://t.me/+...)</option>
                  </select>
                  <input
                    type="text"
                    placeholder={newChannelType === 'open' ? '@kanal' : 'https://t.me/+...'}
                    value={newChannelLink}
                    onChange={(e) => setNewChannelLink(e.target.value)}
                    className="h-9 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                </div>
                <button
                  onClick={handleAddChannel}
                  className="px-4 py-2 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Kanalni Qo'shish</span>
                </button>
              </div>

              <div className="space-y-2">
                {channels.map((chan) => (
                  <div
                    key={chan.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{chan.title}</div>
                      <div className="text-[11px] text-cyan-400 font-mono">{chan.handleOrLink}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteChannel(chan.id)}
                      className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: ANALYTICS & BACKUP */}
          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30">
                  <div className="text-xs text-slate-400">Jami Foydalanuvchilar</div>
                  <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">{usersList.length}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-amber-400/30">
                  <div className="text-xs text-slate-400">IQ Savollari</div>
                  <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{questions.length}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30">
                  <div className="text-xs text-slate-400">Topshirilgan Testlar</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                    {usersList.reduce((acc, u) => acc + (u.completedTestsCount || 0), 18)}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30">
                  <div className="text-xs text-slate-400">Haftalik Da'vogarlar</div>
                  <div className="text-2xl font-bold font-mono text-purple-300 mt-1">8 kishi</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-white">Bazani Eksport Qilish (.CSV)</div>
                <p className="text-[11px] text-slate-400">
                  Barcha foydalanuvchilar, ularning natijalari va faolligini yuklab oling.
                </p>
                <button
                  onClick={handleDownloadCsv}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>CSV Bazani Yuklash</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
