import type { AppSession } from '@/services/auth/types';
import { StorageAdapter } from '@/services/storage/StorageAdapter';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const authStorage = new StorageAdapter(
  'auth-storage',
  'flashfront-auth-session-2026',
);
const APP_REFRESH_TOKEN_KEY = 'app_refresh_token';
const APP_SESSION_KEY = 'app_session';

export const getStoredRefreshToken = (): Promise<string | null> =>
  Platform.OS === 'web'
    ? authStorage.getString(APP_REFRESH_TOKEN_KEY)
    : SecureStore.getItemAsync(APP_REFRESH_TOKEN_KEY);

export const saveRefreshToken = (refreshToken: string): Promise<void> =>
  Platform.OS === 'web'
    ? authStorage.setString(APP_REFRESH_TOKEN_KEY, refreshToken)
    : SecureStore.setItemAsync(APP_REFRESH_TOKEN_KEY, refreshToken);

export const clearStoredRefreshToken = (): Promise<void> =>
  Platform.OS === 'web'
    ? authStorage.removeString(APP_REFRESH_TOKEN_KEY)
    : SecureStore.deleteItemAsync(APP_REFRESH_TOKEN_KEY);

const parseStoredSession = (stored: string): AppSession | null => {
  try {
    const parsed = JSON.parse(stored) as Partial<AppSession> | null;
    if (
      typeof parsed?.accessToken !== 'string' ||
      typeof parsed.user?.id !== 'string'
    ) {
      return null;
    }

    return {
      accessToken: parsed.accessToken,
      expiresAt: typeof parsed.expiresAt === 'string' ? parsed.expiresAt : '',
      user: {
        id: parsed.user.id,
        email: typeof parsed.user.email === 'string' ? parsed.user.email : '',
      },
    };
  } catch {
    return null;
  }
};

// The last known session (short-lived access token and identity) lets the app
// open instantly and offline; the long-lived refresh token stays in SecureStore.
export const getStoredSession = async (): Promise<AppSession | null> => {
  const stored = await authStorage.getString(APP_SESSION_KEY);
  return stored ? parseStoredSession(stored) : null;
};

export const saveStoredSession = (session: AppSession): Promise<void> =>
  authStorage.setString(APP_SESSION_KEY, JSON.stringify(session));

export const clearStoredSession = (): Promise<void> =>
  authStorage.removeString(APP_SESSION_KEY);
