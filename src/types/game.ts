export type QuestionType = 'kembangan' | 'pemfaktoran';

export interface StationQuestion {
  id: number;
  stationNumber: number;
  type: QuestionType;
  title: string;
  problem: string; // e.g. "3(2x + 5)"
  formattedProblem: string; // HTML or display-friendly
  correctAnswer: string; // e.g. "6x + 15"
  codeSymbol: string; // e.g. "A"
  hint: string; // guidance for teacher / student hint
  points: number;
}

export interface CipherEntry {
  answer: string;
  code: string;
  isDistractor?: boolean;
}

export interface TeamProgress {
  id: string;
  name: string;
  color: string;
  avatar: string;
  solvedStationIds: number[]; // e.g. [1, 2, 4]
  currentStation: number;
  unlockedCharacters: Record<number, string>; // stationNumber -> character
  attemptCount: number;
  penaltySeconds: number;
  submittedPasscode?: string;
  isCompleted: boolean;
  completionTimeSeconds?: number;
  completedAt?: string;
  score: number;
}

export interface HistoryLog {
  id: string;
  timestamp: string;
  teamId: string;
  teamName: string;
  actionType: 'STATION_SOLVED' | 'STATION_FAILED' | 'PASSCODE_ATTEMPT' | 'PASSCODE_VERIFIED' | 'PASSCODE_FAILED' | 'GAME_START' | 'GAME_RESET' | 'HINT_USED' | 'INFO';
  stationNumber?: number;
  inputContent?: string;
  resultStatus: 'CORRECT' | 'WRONG' | 'INFO';
  message: string;
  timeElapsedSeconds: number;
}

export interface GameSettings {
  title: string;
  totalTimeMinutes: number;
  secretPasscode: string;
  penaltyPerWrongPasscodeSeconds: number;
  allowStationDirectSolving: boolean;
  soundEnabled: boolean;
}

export interface GameState {
  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'FINISHED';
  startTime?: number; // timestamp
  elapsedSeconds: number;
  totalDurationSeconds: number;
  winnerTeamId?: string;
}
