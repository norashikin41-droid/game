import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, CheckCircle2, Clock, Share2, X, Volume2 } from 'lucide-react';
import { TeamProgress } from '../types/game';
import { soundManager } from '../utils/audio';

interface WinnerAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  winnerTeam: TeamProgress | null;
  passcode: string;
}

export const WinnerAlertModal: React.FC<WinnerAlertModalProps> = ({
  isOpen,
  onClose,
  winnerTeam,
  passcode,
}) => {
  useEffect(() => {
    if (isOpen && winnerTeam) {
      // Trigger Confetti cannon burst
      try {
        const count = 200;
        const defaults = {
          origin: { y: 0.7 },
        };

        const fire = (particleRatio: number, opts: confetti.Options) => {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
          });
        };

        fire(0.25, {
          spread: 26,
          startVelocity: 55,
        });
        fire(0.2, {
          spread: 60,
        });
        fire(0.35, {
          spread: 100,
          decay: 0.91,
          scalar: 0.8,
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 25,
          decay: 0.92,
          scalar: 1.2,
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 45,
        });
      } catch {
        // Ignore if confetti not supported
      }

      // Play Siren & Winner Fanfare
      soundManager.playSirenSound();
      setTimeout(() => {
        soundManager.playWinnerFanfare();
      }, 700);
    }
  }, [isOpen, winnerTeam]);

  if (!isOpen || !winnerTeam) return null;

  const formatSeconds = (sec: number = 0) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m} Minit ${s.toString().padStart(2, '0')} Saat`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg animate-in fade-in duration-300">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500 rounded-3xl w-full max-w-xl shadow-[0_0_60px_-15px_rgba(245,158,11,0.5)] overflow-hidden relative">
        {/* Animated Beacon Light */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 animate-pulse" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white transition z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Ribbon */}
        <div className="pt-8 pb-4 text-center px-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-widest mb-3 animate-bounce">
            <Sparkles className="w-4 h-4 text-amber-300" />
            PENGUMUMAN AUTOMATIK PENGADIL
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase font-display">
            KOD RAHSIA TELAH DITEMBUSI!
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Kumpulan pertama telah berjaya mengurai kata laluan misteri algebra!
          </p>
        </div>

        {/* Winner Hero Card */}
        <div className="px-6 py-4">
          <div className="bg-gradient-to-tr from-amber-500/20 via-slate-900 to-amber-500/10 border-2 border-amber-400/50 rounded-2xl p-6 text-center relative overflow-hidden shadow-inner">
            <div className="text-6xl mb-2 drop-shadow-md">{winnerTeam.avatar}</div>

            <div className="text-xs font-extrabold uppercase tracking-widest text-amber-400 mb-1 flex items-center justify-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              JUARA BILIK LEPAS DIRI ALGEBRA
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
              {winnerTeam.name}
            </h3>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-950/70 border border-slate-700 text-xs text-slate-300 font-mono mb-4">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Masa Penyelesaian: {formatSeconds(winnerTeam.completionTimeSeconds)}</span>
            </div>

            {/* The Decoded Passcode Display */}
            <div className="bg-slate-950 border border-amber-500/40 rounded-xl p-4 my-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Kata Laluan Rahsia Yang Disahkan:
              </div>
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-amber-400">
                {passcode}
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Status: SAHIH & TEPAT
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              soundManager.playWinnerFanfare();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>Ulang Bunyi Sorakan</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Kembali Ke Papan Pemuka</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
