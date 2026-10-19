import React, { useState } from 'react';
import { Trophy, Clock, CheckCircle2, AlertTriangle, KeyRound, ArrowRight, ShieldCheck, Zap, Sparkles, RotateCcw, Eye, EyeOff, Lock } from 'lucide-react';
import { TeamProgress, StationQuestion, GameState, HistoryLog } from '../types/game';

interface DashboardProps {
  teams: TeamProgress[];
  questions: StationQuestion[];
  gameState: GameState;
  historyLogs: HistoryLog[];
  targetPasscode?: string;
  onOpenValidatorForTeam: (teamId: string) => void;
  onSelectTeamForView: (teamId: string) => void;
  onOpenResetModal: () => void;
  onResetSingleTeam: (teamId: string) => void;
  onQuickSimulateStation?: (teamId: string, stationNumber: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  teams,
  questions,
  gameState,
  historyLogs,
  targetPasscode = 'ALGEBRA24',
  onOpenValidatorForTeam,
  onSelectTeamForView,
  onOpenResetModal,
  onResetSingleTeam,
}) => {
  const [showPasscodeReferee, setShowPasscodeReferee] = useState<boolean>(false);
  // Sort teams: completed teams first (by completion time), then by number of solved stations, then score
  const sortedTeams = [...teams].sort((a, b) => {
    if (a.isCompleted && !b.isCompleted) return -1;
    if (!a.isCompleted && b.isCompleted) return 1;
    if (a.isCompleted && b.isCompleted) {
      return (a.completionTimeSeconds || 0) - (b.completionTimeSeconds || 0);
    }
    if (b.solvedStationIds.length !== a.solvedStationIds.length) {
      return b.solvedStationIds.length - a.solvedStationIds.length;
    }
    return b.score - a.score;
  });

  const completedCount = teams.filter((t) => t.isCompleted).length;
  const totalSolvedAcross = teams.reduce((acc, t) => acc + t.solvedStationIds.length, 0);
  const avgStations = teams.length ? (totalSolvedAcross / teams.length).toFixed(1) : '0';

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Pasukan Terlibat</span>
            <span className="text-amber-400">👥</span>
          </div>
          <div className="text-3xl font-black text-white font-mono">{teams.length}</div>
          <div className="text-xs text-slate-400 mt-1">Bersaing secara serentak</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Berjaya Lepas Diri</span>
            <span className="text-emerald-400">🔓</span>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            {completedCount} <span className="text-xs font-normal text-slate-400">/ {teams.length}</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Kod rahsia telah diurai</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Purata Stesen Selesai</span>
            <span className="text-cyan-400">📊</span>
          </div>
          <div className="text-3xl font-black text-cyan-300 font-mono">
            {avgStations} <span className="text-xs font-normal text-slate-400">/ 8 stesen</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Kadar penyelesaian semasa</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Status Permainan</span>
            <span className="text-purple-400">⚡</span>
          </div>
          <div className="text-xl font-black text-white font-mono flex items-center gap-1.5 mt-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                gameState.status === 'RUNNING'
                  ? 'bg-emerald-400 animate-pulse'
                  : gameState.status === 'PAUSED'
                  ? 'bg-amber-400'
                  : 'bg-slate-500'
              }`}
            />
            {gameState.status === 'RUNNING'
              ? 'MASA BERJALAN'
              : gameState.status === 'PAUSED'
              ? 'BERHENTI SEBENTAR'
              : gameState.status === 'FINISHED'
              ? 'TAMAT'
              : 'BELUM MULA'}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Masa Berlalu: {formatSeconds(gameState.elapsedSeconds)}
          </div>
        </div>
      </div>

      {/* Main Leaderboard Table / Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="px-6 py-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Papan Pemuka Kedudukan Semasa (Masa Nyata)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pemantauan huruf terungkai, kemajuan stesen algebra, dan masa pengesahan kod
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500/40 border border-emerald-500 inline-block" />
                Huruf Terungkai
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-slate-800 border border-slate-700 inline-block" />
                Belum Diurai
              </span>
            </div>

            <button
              onClick={onOpenResetModal}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/70 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-700/60 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              title="Pusat Kawalan Set Semula Pengadil"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Set Semula Misi</span>
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-800/80">
          {sortedTeams.map((team, index) => {
            const isWinner = team.isCompleted && index === 0;
            const progressPercent = Math.round((team.solvedStationIds.length / questions.length) * 100);

            return (
              <div
                key={team.id}
                className={`p-5 transition-all hover:bg-slate-800/40 ${
                  team.isCompleted
                    ? 'bg-emerald-950/20 border-l-4 border-l-emerald-500'
                    : index === 0 && team.solvedStationIds.length > 0
                    ? 'bg-amber-950/10 border-l-4 border-l-amber-500'
                    : 'border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left: Rank & Team Profile */}
                  <div className="flex items-center space-x-3.5 min-w-[240px]">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black font-mono text-sm shrink-0 shadow-md ${
                        isWinner
                          ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                          : index === 0
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : index === 1
                          ? 'bg-slate-300/20 text-slate-200 border border-slate-400/30'
                          : index === 2
                          ? 'bg-amber-700/20 text-amber-500 border border-amber-700/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isWinner ? '👑' : `#${index + 1}`}
                    </div>

                    <div className="text-2xl shrink-0">{team.avatar}</div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base tracking-tight hover:text-amber-400 transition cursor-pointer"
                            onClick={() => onSelectTeamForView(team.id)}>
                          {team.name}
                        </h3>
                        {team.isCompleted && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-300" />
                            KOD DITERIMA!
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span className="font-mono text-slate-300 font-semibold">{team.score} Mata</span>
                        <span>•</span>
                        <span>{team.solvedStationIds.length} / 8 Stesen</span>
                        {team.penaltySeconds > 0 && (
                          <span className="text-rose-400 flex items-center gap-0.5 font-mono">
                            <AlertTriangle className="w-3 h-3" />
                            +{team.penaltySeconds}s penalti
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Center: Unlocked Code Decipher Slots */}
                  <div className="flex-1 max-w-xl">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                        Jujukan Kod Huruf / Angka Terkumpul:
                      </span>
                      <span className="font-mono text-slate-300">{progressPercent}%</span>
                    </div>

                    {/* The 8 Station Letter Slots */}
                    <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
                      {questions.map((q) => {
                        const isSolved = team.solvedStationIds.includes(q.id);
                        const char = isSolved ? q.codeSymbol : null;

                        return (
                          <div
                            key={q.id}
                            className={`h-11 rounded-lg flex flex-col items-center justify-center border font-mono transition-all duration-300 ${
                              isSolved
                                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10'
                                : 'bg-slate-950/70 border-slate-800 text-slate-600'
                            }`}
                            title={`Stesen ${q.stationNumber}: ${q.problem} (${isSolved ? 'Selesai: ' + q.codeSymbol : 'Belum Selesai'})`}
                          >
                            <span className="text-[9px] text-slate-500 leading-none">S{q.stationNumber}</span>
                            <span className="text-sm font-extrabold mt-0.5">
                              {char || '•'}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-500 ${
                          team.isCompleted
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Right: Actions & Referee Whisper Button */}
                  <div className="flex items-center gap-2 lg:flex-col lg:items-end shrink-0 pt-2 lg:pt-0">
                    {team.isCompleted ? (
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Masa Tamat:</div>
                        <div className="text-base font-extrabold font-mono text-emerald-400 flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-4 h-4" />
                          {team.completionTimeSeconds ? formatSeconds(team.completionTimeSeconds) : 'Selesai'}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => onOpenValidatorForTeam(team.id)}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-slate-700 hover:border-amber-400 font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Sahkan Bisikan Kata Laluan</span>
                      </button>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onResetSingleTeam(team.id)}
                        className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 rounded-lg transition flex items-center gap-1 cursor-pointer"
                        title={`Set semula kemajuan bagi ${team.name}`}
                      >
                        <RotateCcw className="w-3 h-3 text-rose-400" />
                        <span>Reset Pasukan</span>
                      </button>

                      <button
                        onClick={() => onSelectTeamForView(team.id)}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition flex items-center gap-1 cursor-pointer"
                      >
                        <span>Buka Stesen</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lower Section: Live Game Log Ticker & How to Play Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent History Stream */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Suapan Aktiviti Langsung (Pengadil)
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              {historyLogs.length} rekod aktiviti
            </span>
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {historyLogs.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Belum ada rekod jawapan atau percubaan kata laluan. Misi sedia untuk dimulakan!
              </div>
            ) : (
              historyLogs.slice(0, 6).map((log) => (
                <div
                  key={log.id}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                    log.resultStatus === 'CORRECT'
                      ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200'
                      : log.resultStatus === 'WRONG'
                      ? 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                      : 'bg-slate-800/40 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="text-sm">
                      {log.resultStatus === 'CORRECT' ? '✅' : log.resultStatus === 'WRONG' ? '❌' : 'ℹ️'}
                    </span>
                    <div className="truncate">
                      <span className="font-bold text-white mr-1.5">{log.teamName}</span>
                      <span className="text-slate-300">{log.message}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 font-mono text-[10px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Rules for Teacher/Referee */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-3">
              <span>🎯</span>
              <span>Prosedur Pengadil & Kemenangan</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-2.5">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">1.</span>
                <span>Setiap stesen memberikan 1 jawapan algebra yang dipadankan dengan huruf dalam jadual kod.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">2.</span>
                <span>Semua 8 huruf/nombor disusun mengikut urutan Stesen 1 hingga 8 untuk membentuk kata laluan rahsia.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">3.</span>
                <span>Kumpulan yang pertama membisikkan kata laluan yang tepat kepada anda dinobatkan sebagai <strong>Pemenang Misi</strong>!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">4.</span>
                <span>Sistem akan mengesahkan kata laluan serta-merta dan membunyikan siren kemenangan secara automatik.</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Kata Laluan Rahsia (Sulit):</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 tracking-wider">
                {showPasscodeReferee ? targetPasscode : '••••••••'}
              </span>
              <button
                type="button"
                onClick={() => setShowPasscodeReferee(!showPasscodeReferee)}
                className="p-1 text-slate-500 hover:text-amber-400 transition cursor-pointer"
                title={showPasscodeReferee ? 'Sembunyikan Kod (Mod Projektor)' : 'Papar Kod (Pengadil Sahaja)'}
              >
                {showPasscodeReferee ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
