import React, { useState } from 'react';
import { StationQuestion, TeamProgress, CipherEntry } from '../types/game';
import { soundManager } from '../utils/audio';
import { CheckCircle2, ChevronRight, HelpCircle, Lock, Unlock, KeyRound, Sparkles, Send, ShieldAlert, RotateCcw } from 'lucide-react';

interface TeamStationViewProps {
  teams: TeamProgress[];
  questions: StationQuestion[];
  cipherTable: CipherEntry[];
  selectedTeamId: string;
  onSelectTeamId: (id: string) => void;
  onSolveStation: (teamId: string, stationNumber: number, answerText: string) => boolean;
  onOpenPasscodeValidator: (teamId: string) => void;
  onResetTeam?: (teamId: string) => void;
}

export const TeamStationView: React.FC<TeamStationViewProps> = ({
  teams,
  questions,
  cipherTable,
  selectedTeamId,
  onSelectTeamId,
  onSolveStation,
  onOpenPasscodeValidator,
  onResetTeam,
}) => {
  const [activeStationIndex, setActiveStationIndex] = useState<number>(0);
  const [userAnswerInput, setUserAnswerInput] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });

  const currentTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];
  const activeQuestion = questions[activeStationIndex] || questions[0];
  const isCurrentStationSolved = currentTeam?.solvedStationIds.includes(activeQuestion.id);

  // Normalize string for checking against answer
  const handleSubmitAnswer = (answerToTest: string) => {
    if (!answerToTest.trim()) return;
    const isCorrect = onSolveStation(currentTeam.id, activeQuestion.stationNumber, answerToTest.trim());

    if (isCorrect) {
      soundManager.playSuccessSound();
      setSubmissionFeedback({
        status: 'success',
        message: `Tepat sekali! Huruf kod untuk Stesen ${activeQuestion.stationNumber} ialah [ ${activeQuestion.codeSymbol} ].`,
      });
      setUserAnswerInput('');
    } else {
      soundManager.playBuzzerSound();
      setSubmissionFeedback({
        status: 'error',
        message: 'Jawapan kurang tepat. Sila semak semula langkah kerja algebra anda atau semak jadual kod!',
      });
    }

    setTimeout(() => {
      setSubmissionFeedback({ status: 'idle', message: '' });
    }, 4500);
  };

  return (
    <div className="space-y-6">
      {/* Team Switcher Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-1">
              Mod Paparan Stesen Kumpulan
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentTeam.avatar}</span>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {currentTeam.name}
                  {currentTeam.isCompleted && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      LEPAS DIRI
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-xs text-slate-400">
                    {currentTeam.solvedStationIds.length} daripada 8 stesen diselesaikan • Skor: {currentTeam.score} Mata
                  </p>
                  {onResetTeam && (
                    <button
                      onClick={() => onResetTeam(currentTeam.id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700/80 hover:border-rose-800/60 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                      title="Set semula semua jawapan stesen bagi kumpulan ini"
                    >
                      <RotateCcw className="w-3 h-3 text-rose-400" />
                      <span>Reset Pasukan Ini</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Team Selector Dropdown / Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-slate-400 font-semibold mr-1 shrink-0">Tukar Pasukan:</span>
            {teams.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelectTeamId(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  t.id === selectedTeamId
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{t.avatar}</span>
                <span>{t.name.replace('Kumpulan ', '')}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 8 Stations Tabs */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {questions.map((q, idx) => {
          const isSolved = currentTeam.solvedStationIds.includes(q.id);
          const isActive = idx === activeStationIndex;

          return (
            <button
              key={q.id}
              onClick={() => {
                setActiveStationIndex(idx);
                setShowHint(false);
                setSubmissionFeedback({ status: 'idle', message: '' });
              }}
              className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-b from-amber-500/20 to-amber-600/10 border-amber-500/60 ring-2 ring-amber-400/30'
                  : isSolved
                  ? 'bg-emerald-950/20 border-emerald-500/40 hover:bg-emerald-950/30'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  STESEN {q.stationNumber}
                </span>
                {isSolved ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                )}
              </div>

              <div className="mt-2 text-center py-1">
                <div className="text-xs uppercase font-extrabold tracking-tight text-slate-300">
                  {q.type === 'kembangan' ? 'Kembangan' : 'Pemfaktoran'}
                </div>
                <div
                  className={`text-lg font-black font-mono mt-0.5 ${
                    isSolved ? 'text-amber-400' : 'text-slate-600'
                  }`}
                >
                  {isSolved ? q.codeSymbol : '?'}
                </div>
              </div>

              {isActive && (
                <div className="w-full h-1 bg-amber-400 rounded-full mt-1 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Station Problem & Solver Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Problem & Answer Input */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            {/* Type badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    activeQuestion.type === 'kembangan'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}
                >
                  {activeQuestion.type === 'kembangan' ? '⚡ Kembangan Algebra' : '🧩 Pemfaktoran Algebra'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Mata: +{activeQuestion.points}
                </span>
              </div>

              {isCurrentStationSolved ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                  <Unlock className="w-3.5 h-3.5" />
                  Stesen Selesai
                </span>
              ) : (
                <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5" />
                  Cari Huruf Kod
                </span>
              )}
            </div>

            {/* Question Title */}
            <h3 className="text-xl font-bold text-white mb-2">{activeQuestion.title}</h3>
            <p className="text-sm text-slate-400 mb-6">
              {activeQuestion.type === 'kembangan'
                ? 'Kembangkan ungkapan algebra berikut sehingga bentuk termudah:'
                : 'Faktorkan ungkapan algebra berikut selengkapnya:'}
            </p>

            {/* The Big Math Expression Banner */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center my-4 relative shadow-inner">
              <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
                Soalan Stesen {activeQuestion.stationNumber}
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-300 font-mono tracking-wide">
                {activeQuestion.problem}
              </div>
            </div>

            {/* If Already Solved vs Not Solved */}
            {isCurrentStationSolved ? (
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 mt-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-black text-2xl border border-emerald-500/30">
                    {activeQuestion.codeSymbol}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Huruf Kod Berjaya Diurai!</div>
                    <div className="text-xs text-emerald-300">
                      Jawapan: <span className="font-mono font-bold">{activeQuestion.correctAnswer}</span> = Huruf{' '}
                      <span className="font-mono font-black text-amber-300 text-sm">[{activeQuestion.codeSymbol}]</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400">
                  Kedudukan #{activeQuestion.stationNumber} dalam kata laluan
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Masukkan Jawapan Algebra / Pilih dari Jadual Kod:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userAnswerInput}
                      onChange={(e) => setUserAnswerInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer(userAnswerInput)}
                      placeholder={`cth: ${activeQuestion.correctAnswer}`}
                      className="flex-1 px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-base focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 placeholder:text-slate-600"
                    />
                    <button
                      onClick={() => handleSubmitAnswer(userAnswerInput)}
                      className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/20"
                    >
                      <span>Sahkan</span>
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Tip: Anda juga boleh menekan mana-mana jawapan terus pada Jadual Kod di sebelah kanan.
                  </p>
                </div>

                {/* Feedback Message */}
                {submissionFeedback.status !== 'idle' && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                      submissionFeedback.status === 'success'
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                    }`}
                  >
                    <span>{submissionFeedback.status === 'success' ? '🎉' : '⚠️'}</span>
                    <span>{submissionFeedback.message}</span>
                  </div>
                )}
              </div>
            )}

            {/* Hint Accordion */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span>{showHint ? 'Sembunyikan Petunjuk' : 'Bantuan / Petunjuk Langkah Kerja Guru'}</span>
              </button>

              {showHint && (
                <div className="mt-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed">
                  <span className="font-bold text-amber-300">Panduan: </span>
                  {activeQuestion.hint}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Cipher Table (Jadual Kod Rahsia) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  Jadual Kod Rahsia (Cipher Key)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Padankan jawapan akhir algebra anda untuk mendapatkan huruf/nombor kod rahsia
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
              {cipherTable.map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (!isCurrentStationSolved) {
                      setUserAnswerInput(item.answer);
                      handleSubmitAnswer(item.answer);
                    }
                  }}
                  disabled={isCurrentStationSolved}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                    isCurrentStationSolved && item.answer === activeQuestion.correctAnswer
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <div className="truncate pr-1">
                    <span className="font-mono text-xs font-semibold text-slate-200 block truncate">
                      {item.answer}
                    </span>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-black text-amber-400 text-xs shrink-0 shadow">
                    {item.code}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Termasuk pengganggu (distractors)</span>
              <span>20 Entri Kod</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Vault Bar: Current Unlocked Passcode and Direct Whisper Button */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/30 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Jujukan Kata Laluan Rahsia Kumpulan
            </div>
            <p className="text-xs text-slate-400">
              Kumpulkan semua 8 aksara kod dari Stesen 1 hingga Stesen 8 untuk membentuk kata laluan pemenang.
            </p>

            {/* Letter Slots Display */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {questions.map((q) => {
                const isSolved = currentTeam.solvedStationIds.includes(q.id);
                return (
                  <div
                    key={q.id}
                    className={`w-11 h-13 rounded-xl border flex flex-col items-center justify-center font-mono transition-all ${
                      isSolved
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/40'
                        : 'bg-slate-950 border-slate-800 text-slate-600'
                    }`}
                  >
                    <span className="text-[9px] text-slate-500 font-bold">S{q.stationNumber}</span>
                    <span className="text-lg font-black">{isSolved ? q.codeSymbol : '•'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action to submit passcode */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => onOpenPasscodeValidator(currentTeam.id)}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-3 transition cursor-pointer transform hover:-translate-y-0.5"
            >
              <ShieldAlert className="w-5 h-5 text-slate-950" />
              <span>BISIK / SAHKAN KATA LALUAN KUMPULAN</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
