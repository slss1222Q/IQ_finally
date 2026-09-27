import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  Brain,
  Swords,
  Coins,
  Gift,
  Zap,
  Search,
  CheckCircle2,
  X,
  Award
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface FaqItem {
  id: string;
  category: 'scoring' | 'duel' | 'economy' | 'weekly' | 'games';
  question: string;
  answer: string;
  badge?: string;
}

const FAQ_DATA: FaqItem[] = [
  // 1. IQ Test & Scoring System
  {
    id: 'score-1',
    category: 'scoring',
    question: "IQ balli qanday hisoblanadi va baholash mezonlari nimalardan iborat?",
    answer: "IQ test 20 ta mantiqiy matritsalar, matematik ketma-ketliklar va fazoviy shakllardan tashkil topgan. Har bir to'g'ri javob savol murakkabligi (Oson: 4 ball, O'rta: 6 ball, Qiyin: 8 ball) va unga sarflangan vaqt tezligiga qarab baholanadi. Yakuniy IQ balli xalqaro Mensa va Wechsler standartlariga mos ravishda 70 dan 160 ballgacha hisoblanadi (130+ Yuqori Intellekt, 140+ Mutlaq Daho).",
    badge: "Mensa Shkalasi",
  },
  {
    id: 'score-2',
    category: 'scoring',
    question: "Rasmiy Sertifikatni qanday olish va yuklab olish mumkin?",
    answer: "20 ta savoldan iborat testni to'liq yakunlagach, natijalar ekranda ko'rsatiladi va rasmiy sertifikat generatsiya qilinadi. Shuningdek, Bosh sahifadagi 'IQ Sertifikatim' tugmasini bosib, ism-sharifingiz, erishgan IQ ballingiz va verifikatsiya muhri tushirilgan yuqori sifatli PNG sertifikatni istalgan vaqtda bepul yuklab olishingiz mumkin.",
    badge: "PNG Sertifikat",
  },
  {
    id: 'score-3',
    category: 'scoring',
    question: "Har bir savolga qancha vaqt ajratiladi?",
    answer: "Har bir savol uchun standart 45 soniya taymer belgilanadi. Taymer tugagach, avtomatik keyingi savolga o'tiladi. Savolga qanchalik tez va aniq javob bersangiz, shuncha ko'proq tezkorlik bonusi va daraja tajribasi (XP) hisobingizga qo'shiladi.",
    badge: "45s Taymer",
  },

  // 2. 1v1 Online Duels
  {
    id: 'duel-1',
    category: 'duel',
    question: "1v1 Jonli Duel nima va u qanday o'ynaladi?",
    answer: "1v1 Duel — real vaqt rejimida boshqa intellektual foydalanuvchilar bilan 5 raund davomida kuch sinashish rejimidir. Ikkala ishtirokchiga bir vaqtda bir xil mantiqiy savollar beriladi. Raundda kim birinchi bo'lib to'g'ri javob bersa, unga ball beriladi.",
    badge: "Real-time 1v1",
  },
  {
    id: 'duel-2',
    category: 'duel',
    question: "Duel reytingi va kuboklar qanday oshiriladi?",
    answer: "Har bir duel g'alabasi uchun sizga +25 reyting ochkosi, +50 XP va 2 ta Energiya bileti beriladi. Mag'lubiyatda esa -15 reyting ochkosi kamayadi. Reytingingiz 800 balldan kamayib ketmaydi. Reytingingiz qanchalik yuqori bo'lsa, peshqadamlar jadvalida shunchalik yuqori o'ringa ko'tarilasiz.",
    badge: "+25 Ball G'alaba",
  },
  {
    id: 'duel-3',
    category: 'duel',
    question: "Bosh sahifadagi 'So'nggi Duel Natijalari' lentasi nimani ko'rsatadi?",
    answer: "Bu lenta platformada o'tkazilgan so'nggi 5 ta duelning rasmiy hisobi, g'olib ishtirokchi, uning reytingi va o'yin vaqtini jonli tarzda aks ettiradi. O'zingiz duel o'ynab g'alaba qozonsangiz, natijangiz zudlik bilan ushbu lentaning eng yuqori qismida paydo bo'ladi.",
    badge: "Jonli Natijalar",
  },

  // 3. Economy: Coins, Tickets & Streak
  {
    id: 'eco-1',
    category: 'economy',
    question: "IQ Tangalar (IQ Coins) nima va ularni qanday olish mumkin?",
    answer: "IQ Tangalari — platformaning asosiy faollik mukofotidir. Ularni har kungi kirish streakini davom ettirish, kunlik missiyalarni bajarish (o'yin o'ynash, duelda qatnashish, rasmiy kanalga obuna bo'lish) hamda Omadli Charxpalakni aylantirish orqali to'plashingiz mumkin.",
    badge: "Tangalar",
  },
  {
    id: 'eco-2',
    category: 'economy',
    question: "Energiya biletlari (⚡ Tickets) nima uchun sarflanadi?",
    answer: "Energiya biletlari 1v1 duellarda ishtirok etish va kognitiv mini-o'yinlarni ishga tushirish uchun kerak bo'ladi. Biletlarni do'stlarni taklif qilish (referral tizimi), omadli g'ildirak yoki kunlik streak orqali osonlik bilan to'ldirib olishingiz mumkin.",
    badge: "Energiya",
  },
  {
    id: 'eco-3',
    category: 'economy',
    question: "Kunlik Kirish Mukofoti (Daily Streak) qanday ishlaydi?",
    answer: "Har kuni ilovaga kirib streak tugmasini bosganingizda, davomiylik hisoblanadi (1-kundan 7-kungacha). Har kuni tangalar va biletlar ko'payib boradi. 7-kuni esa maxsus katta Oltin Kiber Sovg'a taqdim etiladi.",
    badge: "7 Kunlik Streak",
  },

  // 4. Weekly TOP-3 Rewards & Telegram Stars
  {
    id: 'week-1',
    category: 'weekly',
    question: "Haftalik TOP-3 sovrinlari qanday taqsimlanadi va qanday talablar bor?",
    answer: "Har hafta yakunida peshqadamlar jadvalining eng yuqori 3 nafar g'olibi aniqlanadi: 1-o'rin uchun 15 Telegram Stars/Gift, 2-o'rin uchun 10 Telegram Stars, 3-o'rin uchun 5 Telegram Stars topshiriladi. Sovringa da'vogarlik qilish uchun haftada kamida 40 ball to'plash va ilovada kamida 5 daqiqa faol bo'lish zarur.",
    badge: "15 Telegram Stars",
  },

  // 5. Mini-Games Cognitive Gym
  {
    id: 'games-1',
    category: 'games',
    question: "Mini-o'yinlar (Subway 4D Runner, Matrix, Stroop) qanday kognitiv ko'nikmalarni rivojlantiradi?",
    answer: "Har bir o'yin miyaning aniq sohasini charxlashga mo'ljallangan: Subway 4D Runner — fazoviy tezkorlik va reflekslarni, 4x4 Memory Matrix — qisqa muddatli ko'rish xotirasini, Stroop va Color Reflex — semantik to'qnashuvda e'tibor barqarorligini, Speed Math esa matematik tezkor tahlilni kuchaytiradi.",
    badge: "Neyro-mashg'ulot",
  },
];

interface HelpFaqSectionProps {
  onClose?: () => void;
}

export const HelpFaqSection: React.FC<HelpFaqSectionProps> = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('score-1');

  const categories = [
    { id: 'all', label: 'Barchasi', icon: HelpCircle },
    { id: 'scoring', label: '🧠 IQ Baholash', icon: Brain },
    { id: 'duel', label: '⚔️ 1v1 Duellar', icon: Swords },
    { id: 'economy', label: '🪙 Tangalar & Biletlar', icon: Coins },
    { id: 'weekly', label: '🎁 Haftalik Sovrinlar', icon: Gift },
    { id: 'games', label: '🎮 Mini-O\'yinlar', icon: Zap },
  ];

  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleAccordion = (id: string) => {
    soundManager.playCyberClick();
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="relative rounded-3xl bg-slate-950/95 border border-cyan-500/40 p-5 sm:p-6 shadow-[0_0_30px_rgba(0,210,255,0.15)] space-y-5 animate-fade-in backdrop-blur-md">
      {/* Glow Effects */}
      <div className="absolute top-0 right-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,210,255,0.25)] shrink-0">
            <HelpCircle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-display font-bold text-white">
                YORDAM VA KO'P BERILADIGAN SAVOLLAR (FAQ)
              </h2>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono">
                RASMIY QO'LLANMA
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              IQ baholash tizimi, 1v1 duellar, biletlar va haftalik mukofotlar haqida aniq ma'lumotlar
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={() => {
              soundManager.playCyberClick();
              onClose();
            }}
            className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Yopish"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Savollardan qidiring (masalan: sertifikat, baholash, duel, tangalar)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-cyan-400 text-white text-xs placeholder:text-slate-500 outline-none transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
          >
            Tozalash
          </button>
        )}
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                soundManager.playCyberClick();
                setSelectedCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(0,210,255,0.4)]'
                  : 'bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-2.5 pt-1">
        {filteredFaqs.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
            Qidiruvingiz bo'yicha hech qanday savol topilmadi. Boshqa so'z bilan qidirib ko'ring.
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl transition-all border overflow-hidden ${
                  isExpanded
                    ? 'bg-slate-900/90 border-cyan-500/50 shadow-[0_0_15px_rgba(0,210,255,0.1)]'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Accordion Question Header */}
                <button
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-white">
                      {faq.question}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {faq.badge && (
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                        {faq.badge}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 text-cyan-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Accordion Answer Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 animate-fade-in">
                    <p className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Quick Summary Highlights Footer */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Barcha savollar Mensa standartlari va haqiqiy qoidalar asosida</span>
        </div>
        <div className="text-cyan-400">IQ Level Uz rasmiy qo'llab-quvvatlashi</div>
      </div>
    </div>
  );
};
