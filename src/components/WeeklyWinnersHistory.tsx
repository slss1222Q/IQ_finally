import React, { useState } from 'react';
import { WeeklyWinnerRecord } from '../types';
import { soundManager } from '../utils/audio';
import { Trophy, Award, CheckCircle2, FileText, ExternalLink, X, Calendar, Star, ShieldCheck, Sparkles, Copy, Check } from 'lucide-react';

interface WeeklyWinnersHistoryProps {
  winners: WeeklyWinnerRecord[];
  onClose?: () => void;
}

export const WeeklyWinnersHistory: React.FC<WeeklyWinnersHistoryProps> = ({ winners, onClose }) => {
  const [selectedReceipt, setSelectedReceipt] = useState<WeeklyWinnerRecord | null>(null);
  const [copiedTx, setCopiedTx] = useState(false);

  // Group winners by weekTitle
  const groupedWeeks = React.useMemo(() => {
    const groups: { [weekTitle: string]: WeeklyWinnerRecord[] } = {};
    winners.forEach((record) => {
      const title = record.weekTitle || "Haftalik G'oliblar";
      if (!groups[title]) groups[title] = [];
      groups[title].push(record);
    });
    return groups;
  }, [winners]);

  const handleCopyTx = (txId: string) => {
    soundManager.playCyberClick();
    navigator.clipboard.writeText(txId);
    setCopiedTx(true);
    setTimeout(() => setCopiedTx(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-400/40 p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">
                Rasmiy To'lovlar & Tarix
              </div>
              <h1 className="text-xl font-display font-bold text-white flex items-center gap-2">
                <span>HAFTALIK STARS G'OLIBLARI VA CHEKLAR</span>
              </h1>
              <p className="text-xs text-slate-300">
                O'tkazilgan barcha Telegram Stars to'lovlari va tasdiqlangan to'lov cheklari arxivi
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="self-start sm:self-center px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Yopish ✕
            </button>
          )}
        </div>
      </div>

      {/* Winners List by Week */}
      {Object.keys(groupedWeeks).length > 0 ? (
        Object.entries(groupedWeeks).map(([weekTitle, weekWinners]) => (
          <div
            key={weekTitle}
            className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm sm:text-base font-display font-bold text-white">
                  {weekTitle}
                </h3>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
                To'lab berilgan ✅
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {weekWinners
                .sort((a, b) => a.rank - b.rank)
                .map((winner) => (
                  <div
                    key={winner.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      winner.rank === 1
                        ? 'bg-amber-950/20 border-amber-400/50 shadow-md shadow-amber-500/10'
                        : winner.rank === 2
                        ? 'bg-slate-950/80 border-slate-700'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {winner.rank === 1 ? '🥇' : winner.rank === 2 ? '🥈' : '🥉'}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white font-mono">
                            {winner.username}
                          </div>
                          {winner.fullName && (
                            <div className="text-[10px] text-slate-400">
                              {winner.fullName}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/30">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{winner.starsReward} Stars</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span>Sana:</span>
                        <span className="font-mono text-slate-300">{winner.paymentDate}</span>
                      </div>
                      {winner.transactionId && (
                        <div className="flex justify-between truncate">
                          <span>TX ID:</span>
                          <span className="font-mono text-cyan-400 text-[10px] truncate max-w-[120px]">
                            {winner.transactionId}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Receipt Button */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                      {winner.receiptImageUrl ? (
                        <button
                          onClick={() => {
                            soundManager.playCyberClick();
                            setSelectedReceipt(winner);
                          }}
                          className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>To'lov Chekini Ko'rish 🧾</span>
                        </button>
                      ) : (
                        <div className="text-[11px] text-center text-slate-500 font-mono py-1">
                          Chek admin tomonidan tasdiqlangan
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))
      ) : (
        <div className="p-8 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-2">
          <Trophy className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-white">Yutuqlar tarixi yangilanmoqda</h4>
          <p className="text-xs text-slate-400">
            Hafta yakunlangach, g'oliblar va o'tkazilgan to'lov cheklari admin tomonidan shu yerda e'lon qilinadi.
          </p>
        </div>
      )}

      {/* Official Receipt Image Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-amber-400/50 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400 flex items-center justify-center text-amber-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-white">
                  RASMIY TO'LOV CHEKI (RECEIPT)
                </h3>
                <p className="text-xs text-amber-300 font-mono">
                  G'olib: {selectedReceipt.username} ({selectedReceipt.starsReward} Telegram Stars)
                </p>
              </div>
            </div>

            {/* Receipt Image */}
            <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center max-h-80">
              <img
                src={selectedReceipt.receiptImageUrl}
                alt="To'lov cheki"
                className="w-full h-auto object-contain max-h-80"
              />
            </div>

            {/* Payment Details */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Hafta:</span>
                <span className="text-white font-bold">{selectedReceipt.weekTitle}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>O'rin:</span>
                <span className="text-amber-400 font-bold">{selectedReceipt.rank}-o'rin</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>To'lov miqdori:</span>
                <span className="text-emerald-400 font-bold">{selectedReceipt.starsReward} Stars</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Sana:</span>
                <span className="text-slate-200">{selectedReceipt.paymentDate}</span>
              </div>
              {selectedReceipt.transactionId && (
                <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800">
                  <span>Tranzaksiya ID:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-cyan-400 text-[11px]">{selectedReceipt.transactionId}</span>
                    <button
                      onClick={() => handleCopyTx(selectedReceipt.transactionId!)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      {copiedTx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              )}
              {selectedReceipt.note && (
                <div className="pt-1 text-[11px] text-slate-400 border-t border-slate-800">
                  Izoh: <span className="text-slate-300">{selectedReceipt.note}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedReceipt(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
            >
              Yopish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
