import React, { useState } from 'react';
import { HistoryLog, TeamProgress } from '../types/game';
import { Clock, Search, Download, Trash2, CheckCircle2, AlertTriangle, Info, RefreshCw } from 'lucide-react';

interface HistoryLogModalProps {
  logs: HistoryLog[];
  teams: TeamProgress[];
  onClearLogs?: () => void;
}

export const HistoryLogModal: React.FC<HistoryLogModalProps> = ({
  logs,
  teams,
  onClearLogs,
}) => {
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CORRECT' | 'WRONG' | 'INFO'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = logs.filter((log) => {
    if (selectedTeamFilter !== 'ALL' && log.teamId !== selectedTeamFilter) {
      return false;
    }
    if (statusFilter !== 'ALL' && log.resultStatus !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTeam = log.teamName.toLowerCase().includes(q);
      const matchMessage = log.message.toLowerCase().includes(q);
      const matchAction = log.actionType.toLowerCase().includes(q);
      if (!matchTeam && !matchMessage && !matchAction) return false;
    }
    return true;
  });

  const exportToCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Masa', 'Masa Berlalu (s)', 'Nama Kumpulan', 'Jenis Tindakan', 'Status', 'Mesej / Butiran'];
    const rows = logs.map((l) => [
      `"${l.timestamp}"`,
      l.timeElapsedSeconds,
      `"${l.teamName}"`,
      `"${l.actionType}"`,
      `"${l.resultStatus}"`,
      `"${l.message.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekod_sejarah_pengadil_algebra_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📜</span>
              <span>Sistem Rekod Sejarah Pengadil (Audit Trail)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Catatan automatik setiap percubaan stesen, pengesahan kata laluan, penalti, dan masa tepat bagi rujukan pengadil.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              disabled={logs.length === 0}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Eksport Fail CSV</span>
            </button>

            {onClearLogs && (
              <button
                onClick={onClearLogs}
                disabled={logs.length === 0}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                title="Kosongkan Log"
              >
                <Trash2 className="w-4 h-4" />
                <span>Kosongkan</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-800">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari dalam log..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
            />
          </div>

          {/* Filter by Team */}
          <div>
            <select
              value={selectedTeamFilter}
              onChange={(e) => setSelectedTeamFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">Semua Kumpulan ({teams.length})</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'CORRECT' | 'WRONG' | 'INFO')}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">Semua Status Log</option>
              <option value="CORRECT">✅ Berjaya / Tepat Sahaja</option>
              <option value="WRONG">❌ Percubaan Gagal / Penalti Sahaja</option>
              <option value="INFO">ℹ️ Maklumat Permainan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-950/50">
          <span className="font-semibold">
            Menunjukkan {filteredLogs.length} daripada {logs.length} rekod aktiviti
          </span>
          <span className="font-mono text-[11px]">Disusun mengikut aktiviti terkini</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            Tiada log yang sepadan dengan tapisan semasa.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 max-h-[550px] overflow-y-auto">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 hover:bg-slate-800/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                      log.resultStatus === 'CORRECT'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : log.resultStatus === 'WRONG'
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {log.resultStatus === 'CORRECT' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : log.resultStatus === 'WRONG' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Info className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{log.teamName}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          log.actionType === 'PASSCODE_VERIFIED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : log.actionType === 'PASSCODE_FAILED'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {log.actionType.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-slate-300 mt-1">{log.message}</p>
                  </div>
                </div>

                {/* Right: Timestamps */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between text-[11px] text-slate-400 font-mono shrink-0 pl-11 sm:pl-0">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{log.timestamp}</span>
                  </div>
                  <div className="text-slate-500 text-[10px]">
                    +{formatSeconds(log.timeElapsedSeconds)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
