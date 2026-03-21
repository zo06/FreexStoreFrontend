import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { WorkSession, SessionStats, hrApi } from '../api/hr-api';

type SessionPhase = 'idle' | 'active' | 'on_break' | 'ended';

interface HrState {
  session: WorkSession | null;
  stats: SessionStats | null;
  phase: SessionPhase;
  tabId: string;
  breakEndsAt: Date | null;
  elapsedSeconds: number;
  breakRemainingSeconds: number;
  isLoading: boolean;
  error: string | null;

  // Internal: server-verified base for accurate elapsed calculation
  _serverBaseSeconds: number;   // confirmed active seconds at _serverBaseTimestamp
  _serverBaseTimestamp: number; // Date.now() when server last confirmed lastActiveAt

  // Actions
  initTabId: () => void;
  loadSession: () => Promise<void>;
  startSession: () => Promise<void>;
  sendHeartbeat: () => Promise<void>;
  takeBreak: (minutes: 5 | 10) => Promise<void>;
  endBreak: () => Promise<void>;
  endSession: (notes?: string) => Promise<void>;
  loadStats: () => Promise<void>;
  tick: () => void;
  setError: (error: string | null) => void;
}

function generateTabId(): string {
  return `tab_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getOrCreateTabId(): string {
  if (typeof window === 'undefined') return generateTabId();
  let id = sessionStorage.getItem('hr_tab_id');
  if (!id) {
    id = generateTabId();
    sessionStorage.setItem('hr_tab_id', id);
  }
  return id;
}

/**
 * Compute how many active seconds are confirmed by the server.
 * Uses lastActiveAt as the upper bound (not Date.now()) so we never
 * count disconnection/idle time as work.
 */
function computeServerBase(
  startTime: string,
  lastActiveAt: string,
  breakSeconds: number,
  delaySeconds: number,
): number {
  const start = new Date(startTime).getTime();
  const last  = new Date(lastActiveAt).getTime();
  const total = Math.floor((last - start) / 1000);
  return Math.max(0, total - breakSeconds - delaySeconds);
}

export const useHrStore = create<HrState>()(
  devtools(
    (set, get) => ({
      session: null,
      stats: null,
      phase: 'idle',
      tabId: '',
      breakEndsAt: null,
      elapsedSeconds: 0,
      breakRemainingSeconds: 0,
      isLoading: false,
      error: null,
      _serverBaseSeconds: 0,
      _serverBaseTimestamp: 0,

      initTabId: () => {
        set({ tabId: getOrCreateTabId() });
      },

      loadSession: async () => {
        const { tabId } = get();
        set({ isLoading: true, error: null });
        try {
          const result = await hrApi.resumeSession(tabId);
          if (result && result.session) {
            const s = result.session;
            const phase: SessionPhase = s.status === 'ON_BREAK' ? 'on_break' : 'active';
            const now = Date.now();

            // Base = server-confirmed active seconds up to lastActiveAt
            const base = computeServerBase(
              s.startTime,
              s.lastActiveAt,
              s.breakSeconds,
              s.delaySeconds,
            );

            // Optimistically add seconds since lastActiveAt (capped at 35s grace)
            const msSinceLast = now - new Date(s.lastActiveAt).getTime();
            const optimistic = s.status === 'ACTIVE'
              ? Math.min(35, Math.floor(msSinceLast / 1000))
              : 0;

            const elapsed = base + optimistic;

            set({
              session: s,
              phase,
              elapsedSeconds: elapsed,
              _serverBaseSeconds: base,
              _serverBaseTimestamp: new Date(s.lastActiveAt).getTime(),
              isLoading: false,
            });

            if (s.status === 'ON_BREAK') {
              const activeBreak = s.breaks.find(b => !b.endTime);
              if (activeBreak) {
                const breakStart = new Date(activeBreak.startTime).getTime();
                const remaining = activeBreak.plannedSecs - Math.floor((now - breakStart) / 1000);
                set({ breakRemainingSeconds: Math.max(0, remaining) });
              }
            }
          } else {
            set({ session: null, phase: 'idle', isLoading: false, elapsedSeconds: 0 });
          }
        } catch {
          set({ session: null, phase: 'idle', isLoading: false });
        }
      },

      startSession: async () => {
        const { tabId } = get();
        set({ isLoading: true, error: null });
        try {
          const res = await hrApi.startSession(tabId);
          const now = Date.now();
          set({
            session: res.session,
            phase: 'active',
            elapsedSeconds: 0,
            _serverBaseSeconds: 0,
            _serverBaseTimestamp: now,
            isLoading: false,
          });
        } catch (e: any) {
          set({ error: e.message || 'Failed to start session', isLoading: false });
        }
      },

      sendHeartbeat: async () => {
        const { session, tabId } = get();
        if (!session) return;
        try {
          const res = await hrApi.heartbeat(session.id, tabId);

          if (res.breakEnded) {
            // Break ended — re-fetch session to get updated breakSeconds/delaySeconds
            const updated = await hrApi.getActiveSession();
            if (updated) {
              const base = computeServerBase(
                updated.startTime,
                updated.lastActiveAt,
                updated.breakSeconds,
                updated.delaySeconds,
              );
              set({
                phase: 'active',
                session: updated,
                breakRemainingSeconds: 0,
                breakEndsAt: null,
                _serverBaseSeconds: base,
                _serverBaseTimestamp: new Date(updated.lastActiveAt).getTime(),
                elapsedSeconds: base,
              });
            }
            return;
          }

          if (res.breakRemainingSecs !== undefined) {
            set({ breakRemainingSeconds: res.breakRemainingSecs });
            return;
          }

          // Normal ACTIVE heartbeat — resync timer from server's lastActiveAt
          if (res.lastActiveAt && session) {
            const base = computeServerBase(
              session.startTime,
              res.lastActiveAt,
              session.breakSeconds,
              session.delaySeconds,
            );
            set({
              _serverBaseSeconds: base,
              _serverBaseTimestamp: new Date(res.lastActiveAt).getTime(),
              elapsedSeconds: base,
              session: { ...session, lastActiveAt: res.lastActiveAt },
            });
          }
        } catch (e: any) {
          if (e.message?.includes('SESSION_CONFLICT')) {
            set({
              error: 'Session is active in another tab. Please close other tabs.',
              phase: 'idle',
              session: null,
            });
          }
        }
      },

      takeBreak: async (minutes: 5 | 10) => {
        const { session } = get();
        if (!session) return;
        set({ isLoading: true, error: null });
        try {
          const res = await hrApi.takeBreak(session.id, minutes);
          const endsAt = new Date(res.endsAt);
          set(state => ({
            phase: 'on_break',
            session: state.session
              ? { ...state.session, status: 'ON_BREAK', breaks: [...state.session.breaks, res.breakRecord] }
              : null,
            breakEndsAt: endsAt,
            breakRemainingSeconds: minutes * 60,
            isLoading: false,
          }));
        } catch (e: any) {
          set({ error: e.message || 'Failed to take break', isLoading: false });
        }
      },

      endBreak: async () => {
        const { session } = get();
        if (!session) return;
        set({ isLoading: true, error: null });
        try {
          await hrApi.endBreak(session.id);
          // Re-fetch to get accurate breakSeconds after server update
          const updated = await hrApi.getActiveSession();
          if (updated) {
            const base = computeServerBase(
              updated.startTime,
              updated.lastActiveAt,
              updated.breakSeconds,
              updated.delaySeconds,
            );
            set({
              phase: 'active',
              session: updated,
              breakEndsAt: null,
              breakRemainingSeconds: 0,
              _serverBaseSeconds: base,
              _serverBaseTimestamp: new Date(updated.lastActiveAt).getTime(),
              elapsedSeconds: base,
              isLoading: false,
            });
          } else {
            set({ phase: 'active', breakEndsAt: null, breakRemainingSeconds: 0, isLoading: false });
          }
        } catch (e: any) {
          set({ error: e.message || 'Failed to end break', isLoading: false });
        }
      },

      endSession: async (notes?: string) => {
        const { session } = get();
        if (!session) return;
        set({ isLoading: true, error: null });
        try {
          const res = await hrApi.endSession(session.id, notes);
          set({ session: res.session, phase: 'ended', isLoading: false });
        } catch (e: any) {
          set({ error: e.message || 'Failed to end session', isLoading: false });
        }
      },

      loadStats: async () => {
        try {
          const stats = await hrApi.getStats();
          set({ stats });
        } catch {}
      },

      tick: () => {
        const { phase, breakRemainingSeconds, _serverBaseSeconds, _serverBaseTimestamp } = get();

        if (phase === 'active') {
          // Derive elapsed from real wall-clock delta since last server sync
          const secondsSinceSync = Math.floor((Date.now() - _serverBaseTimestamp) / 1000);
          set({ elapsedSeconds: _serverBaseSeconds + secondsSinceSync });

        } else if (phase === 'on_break' && breakRemainingSeconds > 0) {
          const next = breakRemainingSeconds - 1;
          set({ breakRemainingSeconds: next });
          if (next <= 0) {
            get().sendHeartbeat();
          }
        }
      },

      setError: (error) => set({ error }),
    }),
    { name: 'hr-store' }
  )
);
