import { StorageAdapter } from '@/services/storage/StorageAdapter';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const authStorage = new StorageAdapter(
  'auth-storage',
  'flashfront-auth-session-2026',
);
const APP_REFRESH_TOKEN_KEY = 'app_refresh_token';

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
