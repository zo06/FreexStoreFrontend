import { apiClient } from '../api';

export interface HrProfile {
  id: string;
  userId: string;
  hrRole: 'SUPER_HR' | 'ADMIN' | 'MEMBER';
  isActive: boolean;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface WorkSession {
  id: string;
  hrProfileId: string;
  startTime: string;
  endTime: string | null;
  lastActiveAt: string;
  status: 'ACTIVE' | 'ON_BREAK' | 'ENDED' | 'ABANDONED';
  activeSeconds: number;
  breakSeconds: number;
  delaySeconds: number;
  tabId: string | null;
  notes: string | null;
  breaks: BreakRecord[];
  delays: DelayRecord[];
  adjustments?: AdminAdjustment[];
}

export interface BreakRecord {
  id: string;
  sessionId: string;
  startTime: string;
  endTime: string | null;
  plannedSecs: number;
  actualSecs: number | null;
  overSecs: number;
}

export interface DelayRecord {
  id: string;
  sessionId: string;
  reason: 'DISCONNECTION' | 'BREAK_OVERFLOW' | 'IDLE';
  startTime: string;
  durationSecs: number;
}

export interface AdminAdjustment {
  id: string;
  targetId: string;
  byId: string;
  sessionId: string | null;
  type: 'BONUS' | 'DEDUCTION';
  seconds: number;
  reason: string;
  createdAt: string;
  by?: { user: { username: string } };
}

export interface SessionStats {
  today: {
    workedSeconds: number;
    breakSeconds: number;
    delaySeconds: number;
    sessionsCount: number;
    status: 'GOOD' | 'WARNING' | 'BAD';
  };
  week: {
    workedSeconds: number;
    adjustedSeconds: number;
    totalSeconds: number;
    avgDailySeconds: number;
    completedSessions: number;
    uniqueDays: number;
  };
  profile: HrProfile;
}

export const hrApi = {
  // Session
  startSession: (tabId: string) =>
    apiClient.post<{ session: WorkSession; message: string }>('/hr/session/start', { tabId }),

  resumeSession: (tabId: string) =>
    apiClient.post<{ session: WorkSession; delayAdded: number; message: string } | null>('/hr/session/resume', { tabId }),

  heartbeat: (sessionId: string, tabId: string) =>
    apiClient.post<{ status: string; lastActiveAt?: string; breakEnded?: boolean; breakRemainingSecs?: number; overSecs?: number }>('/hr/session/heartbeat', { sessionId, tabId }),

  takeBreak: (sessionId: string, durationMinutes: 5 | 10) =>
    apiClient.post<{ breakRecord: BreakRecord; endsAt: string }>('/hr/session/break/start', { sessionId, durationMinutes }),

  endBreak: (sessionId: string) =>
    apiClient.post<{ overSecs: number; message: string }>('/hr/session/break/end', { sessionId }),

  endSession: (sessionId: string, notes?: string) =>
    apiClient.post<{ session: WorkSession; message: string }>('/hr/session/end', { sessionId, notes }),

  getActiveSession: () =>
    apiClient.get<WorkSession | null>('/hr/session/active'),

  getStats: () =>
    apiClient.get<SessionStats>('/hr/stats'),

  getHistory: (page = 1, limit = 20) =>
    apiClient.get<{ sessions: WorkSession[]; total: number; page: number; totalPages: number }>(`/hr/history?page=${page}&limit=${limit}`),

  // Admin
  admin: {
    getAllProfiles: (page = 1) =>
      apiClient.get<{ profiles: any[]; total: number }>(`/hr/admin/profiles?page=${page}`),

    getProfileDetail: (id: string, from?: string, to?: string) =>
      apiClient.get<{ profile: HrProfile; sessions: WorkSession[]; adjustments: AdminAdjustment[]; summary: any }>(
        `/hr/admin/profiles/${id}?${from ? `from=${from}` : ''}${to ? `&to=${to}` : ''}`
      ),

    getActiveSessions: () =>
      apiClient.get<WorkSession[]>('/hr/admin/sessions/active'),

    createAdjustment: (data: { targetHrProfileId: string; type: 'BONUS' | 'DEDUCTION'; seconds: number; reason: string; sessionId?: string }) =>
      apiClient.post<AdminAdjustment>('/hr/admin/adjustments', data),

    deleteAdjustment: (id: string) =>
      apiClient.delete(`/hr/admin/adjustments/${id}`),

    forceEndSession: (sessionId: string) =>
      apiClient.post(`/hr/admin/sessions/${sessionId}/force-end`, {}),

    overrideSession: (sessionId: string, data: { activeSeconds?: number; delaySeconds?: number; notes?: string }) =>
      apiClient.patch(`/hr/admin/sessions/${sessionId}/override`, data),

    getDailyReport: (date: string) =>
      apiClient.get<any[]>(`/hr/admin/reports/daily?date=${date}`),

    createProfile: (userId: string, hrRole: string) =>
      apiClient.post('/hr/admin/profiles', { userId, hrRole }),

    bootstrapProfile: (userId: string, hrRole: string) =>
      apiClient.post('/hr/admin/bootstrap', { userId, hrRole }),
  },
};
