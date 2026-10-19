/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  DEFAULT_QUESTIONS,
  DEFAULT_CIPHER_TABLE,
  DEFAULT_TEAMS,
  DEFAULT_SETTINGS,
} from './data/defaultGame';
import {
  StationQuestion,
  CipherEntry,
  TeamProgress,
  GameSettings,
  GameState,
  HistoryLog,
} from './types/game';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { TeamStationView } from './components/TeamStationView';
import { PasscodeValidatorModal } from './components/PasscodeValidatorModal';
import { WinnerAlertModal } from './components/WinnerAlertModal';
import { HistoryLogModal } from './components/HistoryLogModal';
import { PrintWorksheetModal } from './components/PrintWorksheetModal';
import { GameSettingsModal } from './components/GameSettingsModal';
import { RefereeResetModal } from './components/RefereeResetModal';
import { soundManager } from './utils/audio';
import { realtimeSync, SyncPayload } from './utils/sync';

const STORAGE_KEY = 'pemecah_kod_algebra_v1';

export default function App() {
  // --- Persistent State Initialization ---
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [questions, setQuestions] = useState<StationQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_questions`);
      return saved ? JSON.parse(saved) : DEFAULT_QUESTIONS;
    } catch {
      return DEFAULT_QUESTIONS;
    }
  });

  const [cipherTable, setCipherTable] = useState<CipherEntry[]>(DEFAULT_CIPHER_TABLE);

  const [teams, setTeams] = useState<TeamProgress[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_teams`);
      return saved ? JSON.parse(saved) : DEFAULT_TEAMS;
    } catch {
      return DEFAULT_TEAMS;
    }
  });

  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_gamestate`);
      return saved
        ? JSON.parse(saved)
        : {
            status: 'IDLE',
            elapsedSeconds: 0,
            totalDurationSeconds: DEFAULT_SETTINGS.totalTimeMinutes * 60,
          };
    } catch {
      return {
        status: 'IDLE',
        elapsedSeconds: 0,
        totalDurationSeconds: DEFAULT_SETTINGS.totalTimeMinutes * 60,
      };
    }
  });

  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_logs`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI Navigation & Modals
  const [activeTab, setActiveTab] = useState<'dashboard' | 'station' | 'logs' | 'print' | 'settings'>('dashboard');
  const [selectedTeamId, setSelectedTeamId] = useState<string>(DEFAULT_TEAMS[0].id);
  const [validatorTargetTeamId, setValidatorTargetTeamId] = useState<string>(DEFAULT_TEAMS[0].id);
  const [isValidatorOpen, setIsValidatorOpen] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState<boolean>(false);
  const [winnerTeam, setWinnerTeam] = useState<TeamProgress | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Sync Audio Setting
  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
      localStorage.setItem(`${STORAGE_KEY}_questions`, JSON.stringify(questions));
      localStorage.setItem(`${STORAGE_KEY}_teams`, JSON.stringify(teams));
      localStorage.setItem(`${STORAGE_KEY}_gamestate`, JSON.stringify(gameState));
      localStorage.setItem(`${STORAGE_KEY}_logs`, JSON.stringify(historyLogs));
    } catch {
      // Storage quota or disabled
    }
  }, [settings, questions, teams, gameState, historyLogs]);

  // Cross-tab real-time sync listener
  useEffect(() => {
    const unsubscribe = realtimeSync.subscribe((payload: SyncPayload) => {
      if (payload.type === 'GAME_STATE_UPDATE') {
        const update = payload.data as { teams: TeamProgress[]; gameState: GameState };
        if (update.teams) setTeams(update.teams);
        if (update.gameState) setGameState(update.gameState);
      } else if (payload.type === 'NEW_LOG') {
        const newLog = payload.data as HistoryLog;
        setHistoryLogs((prev) => [newLog, ...prev]);
      } else if (payload.type === 'WINNER_ALERT') {
        const winData = payload.data as { team: TeamProgress; passcode: string };
        setWinnerTeam(winData.team);
        setIsWinnerModalOpen(true);
      }
    });
    return unsubscribe;
  }, []);

  // Timer interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (gameState.status === 'RUNNING') {
      interval = setInterval(() => {
        setGameState((prev) => {
          const nextElapsed = prev.elapsedSeconds + 1;
          const remaining = settings.totalTimeMinutes * 60 - nextElapsed;
          if (remaining > 0 && remaining <= 10) {
            soundManager.playTickSound();
          }
          return {
            ...prev,
            elapsedSeconds: nextElapsed,
          };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.status, settings.totalTimeMinutes]);

  // Helper to append log
  const addLog = useCallback(
    (
      teamId: string,
      teamName: string,
      actionType: HistoryLog['actionType'],
      resultStatus: HistoryLog['resultStatus'],
      message: string,
      stationNumber?: number
    ) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newLog: HistoryLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: timeStr,
        teamId,
        teamName,
        actionType,
        stationNumber,
        resultStatus,
        message,
        timeElapsedSeconds: gameState.elapsedSeconds,
      };

      setHistoryLogs((prev) => [newLog, ...prev]);
      realtimeSync.broadcast('NEW_LOG', newLog);
    },
    [gameState.elapsedSeconds]
  );

  // Timer control callbacks
  const handleStartPause = () => {
    setGameState((prev) => {
      const nextStatus: GameState['status'] = prev.status === 'RUNNING' ? 'PAUSED' : 'RUNNING';
      const updated: GameState = {
        ...prev,
        status: nextStatus,
        startTime: prev.startTime || Date.now(),
      };
      realtimeSync.broadcast('GAME_STATE_UPDATE', { teams, gameState: updated });
      return updated;
    });

    addLog(
      'system',
      'Pengadil',
      'GAME_START',
      'INFO',
      gameState.status === 'RUNNING' ? 'Permainan dihentikan seketika (PAUSE).' : 'Permainan dimulakan secara rasmi.'
    );
  };

  const handleReset = () => {
    setIsResetModalOpen(true);
  };

  const handleResetAllTeams = () => {
    const resetTeams: TeamProgress[] = teams.map((t) => ({
      ...t,
      solvedStationIds: [],
      currentStation: 1,
      unlockedCharacters: {},
      attemptCount: 0,
      penaltySeconds: 0,
      isCompleted: false,
      completionTimeSeconds: undefined,
      completedAt: undefined,
      score: 0,
    }));

    const resetState: GameState = {
      status: 'IDLE',
      elapsedSeconds: 0,
      totalDurationSeconds: settings.totalTimeMinutes * 60,
    };

    setTeams(resetTeams);
    setGameState(resetState);
    setWinnerTeam(null);
    setIsWinnerModalOpen(false);

    addLog('system', 'Pengadil', 'GAME_RESET', 'INFO', 'Pusingan permainan telah diset semula oleh pengadil.');
    realtimeSync.broadcast('GAME_STATE_UPDATE', { teams: resetTeams, gameState: resetState });
  };

  const handleResetSingleTeam = (teamId: string) => {
    const targetTeam = teams.find((t) => t.id === teamId);
    if (!targetTeam) return;

    const updatedTeams = teams.map((t) => {
      if (t.id === teamId) {
        return {
          ...t,
          solvedStationIds: [],
          currentStation: 1,
          unlockedCharacters: {},
          attemptCount: 0,
          penaltySeconds: 0,
          isCompleted: false,
          completionTimeSeconds: undefined,
          completedAt: undefined,
          score: 0,
        };
      }
      return t;
    });

    setTeams(updatedTeams);
    if (winnerTeam?.id === teamId) {
      setWinnerTeam(null);
      setIsWinnerModalOpen(false);
    }

    addLog(
      teamId,
      targetTeam.name,
      'GAME_RESET',
      'INFO',
      `Pengadil telah set semula kemajuan stesen dan markah bagi ${targetTeam.name}.`
    );
    realtimeSync.broadcast('GAME_STATE_UPDATE', { teams: updatedTeams, gameState });
  };

  const handleFullResetWithLogs = () => {
    const resetTeams: TeamProgress[] = teams.map((t) => ({
      ...t,
      solvedStationIds: [],
      currentStation: 1,
      unlockedCharacters: {},
      attemptCount: 0,
      penaltySeconds: 0,
      isCompleted: false,
      completionTimeSeconds: undefined,
      completedAt: undefined,
      score: 0,
    }));

    const resetState: GameState = {
      status: 'IDLE',
      elapsedSeconds: 0,
      totalDurationSeconds: settings.totalTimeMinutes * 60,
    };

    setTeams(resetTeams);
    setGameState(resetState);
    setWinnerTeam(null);
    setIsWinnerModalOpen(false);
    setHistoryLogs([]);

    const initialLog: HistoryLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      teamId: 'system',
      teamName: 'Pengadil',
      actionType: 'GAME_RESET',
      resultStatus: 'INFO',
      message: 'Set semula menyeluruh telah dilaksanakan bagi sesi kelas/pertandingan baharu.',
      timeElapsedSeconds: 0,
    };
    setHistoryLogs([initialLog]);

    realtimeSync.broadcast('GAME_STATE_UPDATE', { teams: resetTeams, gameState: resetState });
    realtimeSync.broadcast('NEW_LOG', initialLog);
  };

  const handleAddMinutes = (mins: number) => {
    setSettings((prev) => ({
      ...prev,
      totalTimeMinutes: prev.totalTimeMinutes + mins,
    }));
    soundManager.playUnlockSound();
    addLog('system', 'Pengadil', 'GAME_START', 'INFO', `Pengadil menambah +${mins} minit masa permainan.`);
  };

  // Normalization for algebra comparison
  const normalizeAlgebra = (str: string) => {
    return str
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/\^2/g, '²')
      .replace(/\*+/g, '')
      .replace(/\+-\|-+/g, '-')
      .trim();
  };

  // Station Answer Checking
  const handleSolveStation = (teamId: string, stationNumber: number, answerText: string): boolean => {
    const question = questions.find((q) => q.stationNumber === stationNumber);
    const targetTeam = teams.find((t) => t.id === teamId);
    if (!question || !targetTeam) return false;

    const normUser = normalizeAlgebra(answerText);
    const normCorrect = normalizeAlgebra(question.correctAnswer);

    // Accept exact match or common commutative order e.g. (x+3)(x+4) vs (x+4)(x+3)
    let isCorrect = normUser === normCorrect;
    if (!isCorrect && question.type === 'pemfaktoran' && normCorrect.includes(')(')) {
      // Check flipped parentheses e.g. (x+4)(x+3)
      const parts = normCorrect.split(')(');
      if (parts.length === 2) {
        const flipped = parts[1].replace(')', '') + ')(' + parts[0].replace('(', '') + ')';
        if (normUser === `(${flipped}`) isCorrect = true;
      }
    }

    if (isCorrect) {
      if (!targetTeam.solvedStationIds.includes(question.id)) {
        const updatedTeams = teams.map((t) => {
          if (t.id === teamId) {
            const nextSolved = [...t.solvedStationIds, question.id];
            const nextUnlocked = { ...t.unlockedCharacters, [stationNumber]: question.codeSymbol };
            return {
              ...t,
              solvedStationIds: nextSolved,
              unlockedCharacters: nextUnlocked,
              score: t.score + question.points,
            };
          }
          return t;
        });

        setTeams(updatedTeams);
        realtimeSync.broadcast('GAME_STATE_UPDATE', { teams: updatedTeams, gameState });
        addLog(
          teamId,
          targetTeam.name,
          'STATION_SOLVED',
          'CORRECT',
          `Berjaya menyelesaikan Stesen ${stationNumber} (${question.problem}). Huruf [ ${question.codeSymbol} ] diperoleh! (+${question.points} mata)`,
          stationNumber
        );
      }
      return true;
    } else {
      addLog(
        teamId,
        targetTeam.name,
        'STATION_FAILED',
        'WRONG',
        `Percubaan kurang tepat di Stesen ${stationNumber} (Jawapan dihantar: "${answerText}").`,
        stationNumber
      );
      return false;
    }
  };

  // Automated Passcode Validator (The core feature requested by user)
  const handleValidatePasscode = (
    teamId: string,
    passcodeInput: string
  ): { success: boolean; message: string } => {
    const targetTeam = teams.find((t) => t.id === teamId);
    if (!targetTeam) return { success: false, message: 'Kumpulan tidak ditemui.' };

    const cleanInput = passcodeInput.trim().toUpperCase().replace(/\s+/g, '');
    const cleanTarget = settings.secretPasscode.trim().toUpperCase().replace(/\s+/g, '');

    const isMatch = cleanInput === cleanTarget;

    if (isMatch) {
      const finalTime = gameState.elapsedSeconds + targetTeam.penaltySeconds;
      const completedTimeFormatted = new Date().toLocaleTimeString('ms-MY', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const updatedTeams = teams.map((t) => {
        if (t.id === teamId) {
          return {
            ...t,
            isCompleted: true,
            completionTimeSeconds: finalTime,
            completedAt: completedTimeFormatted,
            score: t.score + 100, // Winner escape bonus
          };
        }
        return t;
      });

      setTeams(updatedTeams);
      const winner = updatedTeams.find((t) => t.id === teamId) || targetTeam;
      setWinnerTeam(winner);
      setIsWinnerModalOpen(true);

      addLog(
        teamId,
        targetTeam.name,
        'PASSCODE_VERIFIED',
        'CORRECT',
        `🏆 KATA LALUAN RAHSIA DIVERIFIKASI! Kod "${cleanInput}" adalah TEPAT! Kumpulan dinobatkan sebagai JUARA Bilik Lepas Diri!`
      );

      realtimeSync.broadcast('GAME_STATE_UPDATE', { teams: updatedTeams, gameState });
      realtimeSync.broadcast('WINNER_ALERT', { team: winner, passcode: cleanTarget });

      return {
        success: true,
        message: `Kata laluan [ ${cleanInput} ] TEPAT & SAHIH! Tahniah kepada ${targetTeam.name}!`,
      };
    } else {
      // Apply penalty
      const penalty = settings.penaltyPerWrongPasscodeSeconds;
      const updatedTeams = teams.map((t) => {
        if (t.id === teamId) {
          return {
            ...t,
            attemptCount: t.attemptCount + 1,
            penaltySeconds: t.penaltySeconds + penalty,
          };
        }
        return t;
      });

      setTeams(updatedTeams);
      soundManager.playBuzzerSound();

      addLog(
        teamId,
        targetTeam.name,
        'PASSCODE_FAILED',
        'WRONG',
        `Percubaan kata laluan tidak tepat: "${cleanInput}". Penalti +${penalty} saat dikenakan.`
      );

      realtimeSync.broadcast('GAME_STATE_UPDATE', { teams: updatedTeams, gameState });

      return {
        success: false,
        message: `Kata laluan salah! Penalti +${penalty} saat ditambah ke masa kumpulan.`,
      };
    }
  };

  const handleOpenValidatorForTeam = (teamId: string) => {
    setValidatorTargetTeamId(teamId);
    setIsValidatorOpen(true);
  };

  const handleSaveSettings = (
    newSettings: GameSettings,
    newQuestions: StationQuestion[],
    newTeams: TeamProgress[]
  ) => {
    setSettings(newSettings);
    setQuestions(newQuestions);
    setTeams(newTeams);
    addLog('system', 'Pengadil', 'INFO', 'INFO', 'Tetapan permainan & bank soalan telah dikemaskini.');
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Kembalikan semua soalan, jadual kod, dan kumpulan kepada tetapan asal?')) {
      setSettings(DEFAULT_SETTINGS);
      setQuestions(DEFAULT_QUESTIONS);
      setTeams(DEFAULT_TEAMS);
      setCipherTable(DEFAULT_CIPHER_TABLE);
      addLog('system', 'Pengadil', 'INFO', 'INFO', 'Semua tetapan dikembalikan ke nilai piawai.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header & Sticky Navigation */}
      <Header
        gameState={gameState}
        settings={settings}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onStartPause={handleStartPause}
        onReset={handleReset}
        onAddMinutes={handleAddMinutes}
        onOpenValidator={() => setIsValidatorOpen(true)}
        toggleSound={() => setSoundEnabled((prev) => !prev)}
        soundEnabled={soundEnabled}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            teams={teams}
            questions={questions}
            gameState={gameState}
            historyLogs={historyLogs}
            targetPasscode={settings.secretPasscode}
            onOpenValidatorForTeam={handleOpenValidatorForTeam}
            onSelectTeamForView={(teamId) => {
              setSelectedTeamId(teamId);
              setActiveTab('station');
            }}
            onOpenResetModal={() => setIsResetModalOpen(true)}
            onResetSingleTeam={handleResetSingleTeam}
          />
        )}

        {activeTab === 'station' && (
          <TeamStationView
            teams={teams}
            questions={questions}
            cipherTable={cipherTable}
            selectedTeamId={selectedTeamId}
            onSelectTeamId={setSelectedTeamId}
            onSolveStation={handleSolveStation}
            onOpenPasscodeValidator={handleOpenValidatorForTeam}
            onResetTeam={handleResetSingleTeam}
          />
        )}

        {activeTab === 'logs' && (
          <HistoryLogModal
            logs={historyLogs}
            teams={teams}
            onClearLogs={() => {
              setHistoryLogs([]);
              addLog('system', 'Pengadil', 'INFO', 'INFO', 'Pengadil telah mengosongkan senarai rekod aktiviti.');
            }}
          />
        )}

        {activeTab === 'print' && (
          <PrintWorksheetModal
            questions={questions}
            cipherTable={cipherTable}
            passcode={settings.secretPasscode}
          />
        )}

        {activeTab === 'settings' && (
          <GameSettingsModal
            settings={settings}
            questions={questions}
            teams={teams}
            onSaveSettings={handleSaveSettings}
            onResetToDefaults={handleResetToDefaults}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Pemecah Kod Rahsia: Bilik Lepas Diri Matematik (Kembangan & Pemfaktoran Algebra)
          </div>
          <div className="font-mono text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Status Kod: SULIT & DILINDUNGI 🔒</span>
          </div>
        </div>
      </footer>

      {/* Referee Reset Control Center Modal */}
      <RefereeResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        teams={teams}
        onResetAllTeams={handleResetAllTeams}
        onResetSingleTeam={handleResetSingleTeam}
        onFullResetWithLogs={handleFullResetWithLogs}
      />

      {/* Automated Passcode Validator Modal */}
      <PasscodeValidatorModal
        isOpen={isValidatorOpen}
        onClose={() => setIsValidatorOpen(false)}
        teams={teams}
        initialTeamId={validatorTargetTeamId}
        onValidatePasscode={handleValidatePasscode}
      />

      {/* Automated Winner Announcement Alert Modal */}
      <WinnerAlertModal
        isOpen={isWinnerModalOpen}
        onClose={() => setIsWinnerModalOpen(false)}
        winnerTeam={winnerTeam}
        passcode={settings.secretPasscode}
      />
    </div>
  );
}
