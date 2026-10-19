import React from 'react';
import { Play, Pause, RotateCcw, Plus, Volume2, VolumeX, ShieldAlert, Award, Clock } from 'lucide-react';
import { GameState, GameSettings } from '../types/game';
import { soundManager } from '../utils/audio';

interface HeaderProps {
  gameState: GameState;
  settings: GameSettings;
  activeTab: 'dashboard' | 'station' | 'logs' | 'print' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'station' | 'logs' | 'print' | 'settings') => void;
  onStartPause: () => void;
  onReset: () => void;
  onAddMinutes: (mins: number) => void;
  onOpenValidator: () => void;
  toggleSound: () => void;
  soundEnabled: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  gameState,
  settings,
  activeTab,
  setActiveTab,
  onStartPause,
  onReset,
  onAddMinutes,
  onOpenValidator,
  toggleSound,
  soundEnabled,
}) => {
  const remainingSeconds = Math.max(0, settings.totalTimeMinutes * 60 - gameState.elapsedSeconds);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const isTimeCritical = remainingSeconds <= 300 && gameState.status === 'RUNNING'; // < 5 mins
  const isOvertime = gameState.elapsedSeconds > settings.totalTimeMinutes * 60;

  const formatTime = (m: number, s: number) => {
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-3 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xl tracking-tighter">
              π
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2 font-display">
                  PEMECAH KOD RAHSIA
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Algebra Escape Room
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                8 Stesen Kembangan & Pemfaktoran • Pengesahan Automatik & Rekod Pengadil
              </p>
            </div>
          </div>

          {/* Central Timer & Status */}
          <div className="flex items-center justify-between lg:justify-center gap-3 bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800 shadow-inner">
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center p-2 rounded-xl ${
                  isTimeCritical
                    ? 'bg-red-500/20 text-red-400 animate-pulse'
                    : gameState.status === 'RUNNING'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      gameState.status === 'RUNNING'
                        ? 'bg-emerald-400 animate-ping'
                        : gameState.status === 'PAUSED'
                        ? 'bg-amber-400'
                        : 'bg-slate-500'
                    }`}
                  />
                  {gameState.status === 'RUNNING'
                    ? 'MISI AKTIF'
                    : gameState.status === 'PAUSED'
                    ? 'DIJEDA'
                    : gameState.status === 'FINISHED'
                    ? 'MISI SELESAI'
                    : 'SEDIA BERMULA'}
                </div>
                <div
                  className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
                    isTimeCritical ? 'text-red-400' : isOvertime ? 'text-rose-500' : 'text-amber-400'
                  }`}
                >
                  {formatTime(minutes, seconds)}
                </div>
              </div>
            </div>

            {/* Quick Timer Controls */}
            <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
              <button
                onClick={() => {
                  soundManager.playUnlockSound();
                  onStartPause();
                }}
                className={`p-2 rounded-lg font-semibold text-xs transition-all flex items-center gap-1 cursor-pointer ${
                  gameState.status === 'RUNNING'
                    ? 'bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-500/40'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                }`}
                title={gameState.status === 'RUNNING' ? 'Jeda Pemasa' : 'Mula Pemasa'}
              >
                {gameState.status === 'RUNNING' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              <button
                onClick={() => onAddMinutes(2)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer flex items-center"
                title="Tambah 2 Minit"
              >
                <Plus className="w-3.5 h-3.5 mr-0.5" />
                <span className="font-mono text-[11px] font-bold">2m</span>
              </button>

              <button
                onClick={onReset}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-700/60 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                title="Pusat Kawalan Set Semula Pengadil"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline text-[11px]">Set Semula</span>
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="hidden xl:flex px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-700/50 text-xs font-semibold items-center gap-1.5 transition cursor-pointer"
              title="Set Semula Pusingan / Kumpulan"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Reset Pengadil</span>
            </button>

            <button
              onClick={() => {
                soundManager.playUnlockSound();
                onOpenValidator();
              }}
              className="flex-1 lg:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Sahkan Kod Rahsia</span>
            </button>

            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                soundEnabled
                  ? 'bg-slate-800/80 border-slate-700 text-amber-400'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title={soundEnabled ? 'Matikan Bunyi' : 'Hidupkan Bunyi'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-800/70 scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Papan Pemuka Masa Nyata</span>
          </button>

          <button
            onClick={() => setActiveTab('station')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'station'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>🧩</span>
            <span>Stesen Soalan & Kod Kumpulan</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>📜</span>
            <span>Rekod Sejarah Pengadil</span>
          </button>

          <button
            onClick={() => setActiveTab('print')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'print'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>🖨️</span>
            <span>Cetak Helaian Kerja & Jadual Kod</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>⚙️</span>
            <span>Tetapan & Bank Soalan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
