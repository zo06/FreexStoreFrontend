'use client';

import { useEffect, useRef } from 'react';
import { useHrStore } from '../lib/stores/hr-store';

const HEARTBEAT_INTERVAL = 30_000; // 30 seconds

export function useWorkSession() {
  const store = useHrStore();
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const tickRef = useRef<NodeJS.Timeout | null>(null);
  const initialized = useRef(false);

  // Initialize tab ID and load existing session on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    store.initTabId();
    store.loadSession();
    store.loadStats();
  }, []);

  // Start heartbeat + tick when session is active/on_break
  useEffect(() => {
    const { phase, session } = store;

    if ((phase === 'active' || phase === 'on_break') && session) {
      // Heartbeat to server every 30s
      heartbeatRef.current = setInterval(() => {
        store.sendHeartbeat();
      }, HEARTBEAT_INTERVAL);

      // Local tick every 1s for UI timer
      tickRef.current = setInterval(() => {
        store.tick();
      }, 1000);
    }

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [store.phase, store.session?.id]);

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const hasUsedBreak = (store.session?.breaks?.length ?? 0) > 0;
  const canEndSession = store.elapsedSeconds >= 3600;
  const minutesRemaining = Math.max(0, Math.ceil((3600 - store.elapsedSeconds) / 60));

  return {
    ...store,
    formatTime,
    hasUsedBreak,
    canEndSession,
    minutesRemaining,
  };
}
