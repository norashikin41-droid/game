import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, Users, History, CheckCircle2, X, ShieldAlert } from 'lucide-react';
import { TeamProgress } from '../types/game';
import { soundManager } from '../utils/audio';

interface RefereeResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: TeamProgress[];
  onResetAllTeams: () => void;
  onResetSingleTeam: (teamId: string) => void;
  onFullResetWithLogs: () => void;
}

export const RefereeResetModal: React.FC<RefereeResetModalProps> = ({
  isOpen,
  onClose,
  teams,
  onResetAllTeams,
  onResetSingleTeam,
  onFullResetWithLogs,
}) => {
  const [selectedResetMode, setSelectedResetMode] = useState<'round' | 'single' | 'full'>('round');
  const [targetTeamId, setTargetTeamId] = useState<string>(teams[0]?.id || '');
  const [isSuccessFeedback, setIsSuccessFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExecuteReset = () => {
    soundManager.playUnlockSound();

    if (selectedResetMode === 'round') {
      onResetAllTeams();
      setIsSuccessFeedback('Pusingan permainan telah berjaya diset semula! Semua stesen & pemasa dikosongkan.');
    } else if (selectedResetMode === 'single') {
      const team = teams.find((t) => t.id === targetTeamId);
      onResetSingleTeam(targetTeamId);
      setIsSuccessFeedback(`Kemajuan ${team?.name || 'kumpulan'} telah diset semula kepada 0 stesen.`);
    } else if (selectedResetMode === 'full') {
      onFullResetWithLogs();
      setIsSuccessFeedback('Set semula menyeluruh berjaya! Semua data permainan dan log sejarah telah dibersihkan.');
    }

    setTimeout(() => {
      setIsSuccessFeedback(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative">
        {/* Top Danger/Warning Bar */}
        <div className="h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />

        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Pusat Set Semula Pengadil (Referee Reset)
              </h3>
              <p className="text-xs text-slate-400">
                Pilih jenis set semula bagi permainan bilik lepas diri algebra
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

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {isSuccessFeedback ? (
            <div className="p-6 rounded-2xl bg-emerald-950/50 border border-emerald-500/60 text-emerald-200 text-center animate-in zoom-in-95">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
              <h4 className="font-bold text-white text-base">Berjaya Diset Semula!</h4>
              <p className="text-xs mt-1 text-emerald-300">{isSuccessFeedback}</p>
            </div>
          ) : (
            <>
              {/* Reset Type Options */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Pilih Pilihan Tindakan:
                </label>

                {/* Option 1: Reset Round */}
                <div
                  onClick={() => setSelectedResetMode('round')}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 ${
                    selectedResetMode === 'round'
                      ? 'bg-amber-500/15 border-amber-500 text-white ring-1 ring-amber-400/40'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <span>Set Semula Pusingan Permainan (Pilihan Utama)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                        Disyorkan
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Mengosongkan jawapan semua 8 stesen, huruf kod, skor, dan pemasa kembali ke awal. Rekod sejarah (log) tetap disimpan.
                    </p>
                  </div>
                </div>

                {/* Option 2: Reset Single Team */}
                <div
                  onClick={() => setSelectedResetMode('single')}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 ${
                    selectedResetMode === 'single'
                      ? 'bg-blue-500/15 border-blue-500 text-white ring-1 ring-blue-400/40'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-white">
                      Set Semula Satu Kumpulan Tertentu Sahaja
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Hanya padam kemajuan kumpulan yang dipilih jika berlaku kesilapan atau memerlukan percubaan baru tanpa mengganggu kumpulan lain.
                    </p>

                    {selectedResetMode === 'single' && (
                      <div className="mt-3 pt-3 border-t border-slate-800">
                        <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase">
                          Pilih Kumpulan Untuk Diset Semula:
                        </label>
                        <select
                          value={targetTeamId}
                          onChange={(e) => setTargetTeamId(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-400"
                        >
                          {teams.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.avatar} {t.name} ({t.solvedStationIds.length}/8 Stesen, {t.score} Mata)
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Option 3: Full Reset Including History */}
                <div
                  onClick={() => setSelectedResetMode('full')}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 ${
                    selectedResetMode === 'full'
                      ? 'bg-rose-500/15 border-rose-500 text-white ring-1 ring-rose-400/40'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    <History className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-white flex items-center gap-1.5">
                      <span>Set Semula Menyeluruh & Bersihkan Log (Kelas Baru)</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Sesuai apabila memulakan sesi kelas atau pertandingan baharu. Memadamkan semua stesen, markah kumpulan dan rekod sejarah pengadil.
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning Notice */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-2.5 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Hanya pengadil atau guru yang dibenarkan menekan butang ini. Tindakan ini diselaraskan ke semua peranti/skrin serta-merta.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Modal Actions */}
        {!isSuccessFeedback && (
          <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition cursor-pointer"
            >
              Batal
            </button>

            <button
              onClick={handleExecuteReset}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/30 flex items-center gap-2 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Sahkan Set Semula</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
