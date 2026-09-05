import type { AppSession } from '@/services/auth/types';

let activeSession: AppSession | null = null;
let refreshHandler: (() => Promise<string | null>) | null = null;
let inFlightRefresh: Promise<string | null> | null = null;

export const setActiveSession = (session: AppSession | null) => {
  activeSession = session;
};

export const getAccessToken = () => activeSession?.accessToken ?? null;

export const registerSessionRefreshHandler = (
  handler: (() => Promise<string | null>) | null,
) => {
  refreshHandler = handler;
};

export const refreshAccessToken = async () => {
  if (!refreshHandler) {
    return null;
  }

  if (!inFlightRefresh) {
    inFlightRefresh = Promise.resolve(refreshHandler()).finally(() => {
      inFlightRefresh = null;
    });
  }

  return inFlightRefresh;
};
