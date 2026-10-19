import React, { useState } from 'react';
import { StationQuestion, TeamProgress, GameSettings, CipherEntry } from '../types/game';
import { Save, Plus, Trash2, RotateCcw, ShieldAlert, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { DEFAULT_QUESTIONS, DEFAULT_CIPHER_TABLE, DEFAULT_TEAMS, DEFAULT_SETTINGS } from '../data/defaultGame';

interface GameSettingsModalProps {
  settings: GameSettings;
  questions: StationQuestion[];
  teams: TeamProgress[];
  onSaveSettings: (
    newSettings: GameSettings,
    newQuestions: StationQuestion[],
    newTeams: TeamProgress[]
  ) => void;
  onResetToDefaults: () => void;
}

export const GameSettingsModal: React.FC<GameSettingsModalProps> = ({
  settings,
  questions,
  teams,
  onSaveSettings,
  onResetToDefaults,
}) => {
  const [formSettings, setFormSettings] = useState<GameSettings>({ ...settings });
  const [formQuestions, setFormQuestions] = useState<StationQuestion[]>(
    JSON.parse(JSON.stringify(questions))
  );
  const [formTeams, setFormTeams] = useState<TeamProgress[]>(
    JSON.parse(JSON.stringify(teams))
  );
  const [savedNotice, setSavedNotice] = useState<boolean>(false);
  const [showSecretPasscode, setShowSecretPasscode] = useState<boolean>(false);

  const handleQuestionChange = (index: number, field: keyof StationQuestion, val: string | number) => {
    const updated = [...formQuestions];
    updated[index] = { ...updated[index], [field]: val };
    setFormQuestions(updated);
  };

  const handleTeamNameChange = (index: number, name: string) => {
    const updated = [...formTeams];
    updated[index].name = name;
    setFormTeams(updated);
  };

  const handleAddTeam = () => {
    const avatars = ['🚀', '🧠', '🦉', '🔥', '💎', '🎯'];
    const nextNum = formTeams.length + 1;
    const newTeam: TeamProgress = {
      id: `team-${Date.now()}`,
      name: `Kumpulan Baharu ${nextNum}`,
      color: 'from-blue-500 to-indigo-600',
      avatar: avatars[nextNum % avatars.length],
      solvedStationIds: [],
      currentStation: 1,
      unlockedCharacters: {},
      attemptCount: 0,
      penaltySeconds: 0,
      isCompleted: false,
      score: 0,
    };
    setFormTeams([...formTeams, newTeam]);
  };

  const handleRemoveTeam = (id: string) => {
    if (formTeams.length <= 2) {
      alert('Permainan memerlukan sekurang-kurangnya 2 kumpulan.');
      return;
    }
    setFormTeams(formTeams.filter((t) => t.id !== id));
  };

  const handleSave = () => {
    onSaveSettings(formSettings, formQuestions, formTeams);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>⚙️</span>
            <span>Tetapan Permainan & Bank Soalan Algebra</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Ubah suai masa misi, kata laluan rahsia sasaran, soalan 8 stesen, dan senarai kumpulan murid.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetToDefaults}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Pulih Piawai (Default)</span>
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Semua Tetapan</span>
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500 text-emerald-300 flex items-center gap-3 animate-in zoom-in-95">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">Tetapan berjaya disimpan dan dikemaskini!</span>
        </div>
      )}

      {/* General Settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span>⏱️</span>
          <span>Tetapan Masa & Kata Laluan Rahsia</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1.5 uppercase">
              Tempoh Misi (Minit):
            </label>
            <input
              type="number"
              min={5}
              max={120}
              value={formSettings.totalTimeMinutes}
              onChange={(e) =>
                setFormSettings({ ...formSettings, totalTimeMinutes: Number(e.target.value) })
              }
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1.5 uppercase">
              Penalti Percubaan Salah (Saat):
            </label>
            <input
              type="number"
              min={0}
              max={300}
              value={formSettings.penaltyPerWrongPasscodeSeconds}
              onChange={(e) =>
                setFormSettings({
                  ...formSettings,
                  penaltyPerWrongPasscodeSeconds: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1.5 uppercase flex items-center justify-between">
              <span>Kata Laluan Rahsia:</span>
              <button
                type="button"
                onClick={() => setShowSecretPasscode(!showSecretPasscode)}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-mono flex items-center gap-1 cursor-pointer"
              >
                {showSecretPasscode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showSecretPasscode ? 'Sembunyi' : 'Papar'}</span>
              </button>
            </label>
            <div className="relative">
              <input
                type={showSecretPasscode ? 'text' : 'password'}
                value={formSettings.secretPasscode}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    secretPasscode: e.target.value.toUpperCase(),
                  })
                }
                className="w-full px-3 py-2.5 bg-slate-950 border border-amber-500/40 rounded-xl text-amber-300 font-mono font-bold text-sm tracking-wider uppercase focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Teams Manager */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>👥</span>
            <span>Pengurusan Kumpulan Murid ({formTeams.length})</span>
          </h3>
          <button
            onClick={handleAddTeam}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Tambah Kumpulan</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {formTeams.map((team, idx) => (
            <div
              key={team.id}
              className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5 flex-1">
                <span className="text-2xl">{team.avatar}</span>
                <input
                  type="text"
                  value={team.name}
                  onChange={(e) => handleTeamNameChange(idx, e.target.value)}
                  className="bg-transparent border-b border-slate-700 text-white font-semibold text-xs px-1 py-0.5 focus:outline-none focus:border-amber-400 w-full"
                />
              </div>

              <button
                onClick={() => handleRemoveTeam(team.id)}
                className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition cursor-pointer"
                title="Padam Kumpulan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 8 Questions Customizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span>📝</span>
          <span>Bank 8 Soalan Algebra (4 Kembangan & 4 Pemfaktoran)</span>
        </h3>

        <div className="space-y-4">
          {formQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-amber-400">
                  STESEN {q.stationNumber}: {q.type === 'kembangan' ? '⚡ Kembangan' : '🧩 Pemfaktoran'}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">ID: {q.id}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">
                    Soalan Algebra:
                  </label>
                  <input
                    type="text"
                    value={q.problem}
                    onChange={(e) => handleQuestionChange(idx, 'problem', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">
                    Jawapan Betul:
                  </label>
                  <input
                    type="text"
                    value={q.correctAnswer}
                    onChange={(e) => handleQuestionChange(idx, 'correctAnswer', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">
                    Huruf / Simbol Kod Rahsia:
                  </label>
                  <input
                    type="text"
                    value={q.codeSymbol}
                    onChange={(e) =>
                      handleQuestionChange(idx, 'codeSymbol', e.target.value.toUpperCase())
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-amber-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold text-xs mb-1">
                  Petunjuk Langkah Kerja (Hint):
                </label>
                <input
                  type="text"
                  value={q.hint}
                  onChange={(e) => handleQuestionChange(idx, 'hint', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
