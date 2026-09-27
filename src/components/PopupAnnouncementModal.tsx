import React from 'react';
import { PopupAnnouncement } from '../types';
import { soundManager } from '../utils/audio';
import { Megaphone, ExternalLink, X, ArrowRight, Sparkles } from 'lucide-react';

interface PopupAnnouncementModalProps {
  announcement: PopupAnnouncement;
  onDismiss: () => void;
}

export const PopupAnnouncementModal: React.FC<PopupAnnouncementModalProps> = ({
  announcement,
  onDismiss,
}) => {
  if (!announcement || !announcement.enabled) return null;

  const handleSkip = () => {
    soundManager.playCyberClick();
    onDismiss();
  };

  const handleAction = () => {
    soundManager.playCyberClick();
    if (announcement.buttonLink) {
      window.open(announcement.buttonLink, '_blank');
    }
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-cyan-500/50 p-6 sm:p-7 shadow-[0_0_50px_rgba(0,210,255,0.25)] space-y-5 overflow-hidden">
        {/* Glowing cyber accents */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header with prominent Skip / Close button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
              <Megaphone className="w-3 h-3 text-cyan-400" />
              MUHIM E'LON & REKLAMA
            </span>
          </div>

          {/* Quick Skip button in top corner */}
          <button
            onClick={handleSkip}
            className="px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer border border-slate-700 active:scale-95"
          >
            <span>Skip (O'tkazib yuborish)</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Optional Image */}
        {announcement.imageUrl && (
          <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-slate-950 max-h-60 flex items-center justify-center shadow-lg">
            <img
              src={announcement.imageUrl}
              alt="E'lon / Reklama"
              className="w-full h-auto object-cover max-h-60"
            />
          </div>
        )}

        {/* Title and Message */}
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-display font-black text-white tracking-wide leading-snug">
            {announcement.title || "DIQQAT, YANGI E'LON!"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {announcement.message}
          </p>
        </div>

        {/* Bottom CTA buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          {announcement.buttonLink && (
            <button
              onClick={handleAction}
              className="w-full sm:flex-1 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.4)] active:scale-95 transition-all cursor-pointer"
            >
              <span>{announcement.buttonText || "Batafsil Ko'rish"}</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          )}

          {/* Prominent Skip Button */}
          <button
            onClick={handleSkip}
            className={`w-full ${announcement.buttonLink ? 'sm:w-auto' : 'sm:flex-1'} h-12 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-700 active:scale-95`}
          >
            <span>O'tkazib yuborish (Skip)</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
