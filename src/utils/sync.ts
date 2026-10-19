/**
 * Cross-tab Realtime Syncer using BroadcastChannel and localStorage events
 */

const CHANNEL_NAME = 'pemecah_kod_algebra_sync';

export interface SyncPayload {
  type: 'GAME_STATE_UPDATE' | 'NEW_LOG' | 'WINNER_ALERT' | 'PING';
  data: unknown;
  senderId: string;
  timestamp: number;
}

const myTabId = Math.random().toString(36).substring(2, 9);

class RealtimeSyncManager {
  private channel: BroadcastChannel | null = null;
  private listeners: ((payload: SyncPayload) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          if (event.data && event.data.senderId !== myTabId) {
            this.notifyListeners(event.data);
          }
        };
      } catch {
        // Fallback to storage event
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'pemecah_kod_broadcast_msg' && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (parsed && parsed.senderId !== myTabId) {
              this.notifyListeners(parsed);
            }
          } catch {
            // Ignore
          }
        }
      });
    }
  }

  public subscribe(cb: (payload: SyncPayload) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notifyListeners(payload: SyncPayload) {
    this.listeners.forEach((cb) => {
      try {
        cb(payload);
      } catch {
        // Ignore
      }
    });
  }

  public broadcast(type: SyncPayload['type'], data: unknown) {
    const payload: SyncPayload = {
      type,
      data,
      senderId: myTabId,
      timestamp: Date.now(),
    };

    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch {
        // Ignore
      }
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('pemecah_kod_broadcast_msg', JSON.stringify(payload));
      } catch {
        // Ignore
      }
    }
  }
}

export const realtimeSync = new RealtimeSyncManager();
