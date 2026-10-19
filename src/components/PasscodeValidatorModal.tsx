import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, KeyRound, AlertTriangle, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import { TeamProgress } from '../types/game';
import { soundManager } from '../utils/audio';

interface PasscodeValidatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: TeamProgress[];
  initialTeamId?: string;
  onValidatePasscode: (teamId: string, passcode: string) => { success: boolean; message: string };
}

export const PasscodeValidatorModal: React.FC<PasscodeValidatorModalProps> = ({
  isOpen,
  onClose,
  teams,
  initialTeamId,
  onValidatePasscode,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [result, setResult] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });

  useEffect(() => {
    if (isOpen) {
      setSelectedTeamId(initialTeamId || teams[0]?.id || '');
      setInputCode('');
      setResult({ status: 'idle', message: '' });
      setIsVerifying(false);
    }
  }, [isOpen, initialTeamId, teams]);

  if (!isOpen) return null;

  const currentTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];

  const handleVerify = () => {
    if (!inputCode.trim()) return;

    soundManager.playUnlockSound();
    setIsVerifying(true);
    setResult({ status: 'idle', message: '' });

    // Brief realistic verification delay for suspense & vault unlocking effect
    setTimeout(() => {
      setIsVerifying(false);
      const res = onValidatePasscode(selectedTeamId, inputCode.trim());

      if (res.success) {
        setResult({
          status: 'success',
          message: res.message,
        });
        setTimeout(() => {
          onClose();
        }, 1600);
      } else {
        setResult({
          status: 'error',
          message: res.message,
        });
      }
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative">
        {/* Glow accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400" />

        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Pengesahan Kata Laluan Rahsia
              </h3>
              <p className="text-xs text-slate-400">
                Pintu Keselamatan Bilik Lepas Diri (Vault Verification)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Team selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Pilih Kumpulan Yang Membisikkan Kata Laluan:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {teams.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTeamId(t.id)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                    t.id === selectedTeamId
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className="text-base">{t.avatar}</span>
                  <span className="truncate">{t.name.replace('Kumpulan ', '')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Current team status snapshot */}
          {currentTeam && (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <span>{currentTeam.avatar}</span>
                <span className="font-bold">{currentTeam.name}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <span>{currentTeam.solvedStationIds.length}/8 Stesen Selesai</span>
                {currentTeam.penaltySeconds > 0 && (
                  <span className="text-rose-400 font-mono">+{currentTeam.penaltySeconds}s penalti</span>
                )}
              </div>
            </div>
          )}

          {/* Code Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Kata Laluan Rahsia Yang Dibisikkan:</span>
              <span className="text-slate-400 text-[11px] font-normal">Huruf besar automatik</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                <KeyRound className="w-5 h-5 text-amber-400" />
              </div>
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                onKeyDown={handleKeyPress}
                placeholder="MASUKKAN KOD RAHSIA..."
                autoFocus
                disabled={isVerifying}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border-2 border-slate-700 rounded-2xl text-amber-300 font-mono font-extrabold text-xl tracking-widest uppercase focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 placeholder:text-slate-700"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Kombinasi 8 huruf/nombor dari Stesen 1 hingga Stesen 8.
            </p>
          </div>

          {/* Verification Feedback Banner */}
          {result.status === 'success' && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500 text-emerald-300 flex items-center gap-3 animate-in zoom-in-95">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">PENGESAHAN BERJAYA!</div>
                <div className="text-xs">{result.message}</div>
              </div>
            </div>
          )}

          {result.status === 'error' && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500 text-rose-300 flex items-center gap-3 animate-in shake">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">KATA LALUAN TIDAK TEPAT!</div>
                <div className="text-xs">{result.message}</div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleVerify}
            disabled={!inputCode.trim() || isVerifying}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isVerifying ? (
              <>
                <Lock className="w-4 h-4 animate-spin" />
                <span>Mengesahkan Kod...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Sahkan & Buka Peti Kod</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
