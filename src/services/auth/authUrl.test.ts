import { beforeEach, describe, expect, it, vi } from 'vitest';

const { constants } = vi.hoisted(() => ({
  constants: {
    executionEnvironment: 'standalone',
    expoConfig: {
      scheme: 'flashfront',
      hostUri: undefined as string | undefined,
    },
    expoGoConfig: { developer: false },
  },
}));

vi.mock('expo-constants', () => ({
  default: constants,
  ExecutionEnvironment: {
    Bare: 'bare',
    Standalone: 'standalone',
    StoreClient: 'storeClient',
  },
}));
vi.mock('expo-modules-core', () => ({
  Platform: { select: (options: { ios: unknown }) => options.ios },
}));
// Exercise Expo's real native URL builder, including its slash handling.
vi.mock(
  'expo-linking',
  async () => import('../../../node_modules/expo-linking/build/createURL.js'),
);

import { mapAuthError } from '@/services/auth/authErrors';
import { getAuthRedirectUrl } from '@/services/auth/authRedirect';
import { getAuthUrlParams } from '@/services/auth/authUrl';

describe('authentication email links', () => {
  beforeEach(() => {
    constants.executionEnvironment = 'standalone';
    constants.expoConfig.hostUri = undefined;
    constants.expoGoConfig.developer = false;
  });

  it.each([
    'auth/recovery',
    '/auth/recovery',
    'auth/callback',
    '/auth/callback',
  ])('matches the registered app redirect for %s', (path) => {
    expect(getAuthRedirectUrl(path)).toBe(
      `flashfront://${path.replace(/^\/+/, '')}`,
    );
  });

  it('keeps the simulator path required by Expo Go', () => {
    constants.executionEnvironment = 'storeClient';
    constants.expoConfig.hostUri = '127.0.0.1:8081';
    constants.expoGoConfig.developer = true;
    expect(getAuthRedirectUrl('auth/recovery')).toBe(
      'exp://127.0.0.1:8081/--/auth/recovery',
    );
  });

  it('reads the recovery token sent by the email template', () => {
    expect(
      getAuthUrlParams(
        'flashfront://auth/recovery?token_hash=fixture-token&type=recovery',
      ),
    ).toEqual({
      type: 'recovery',
      tokenHash: 'fixture-token',
      errorDescription: null,
    });
  });

  it('explains expired email links instead of showing a generic error', () => {
    const { errorDescription } = getAuthUrlParams(
      'flashfront://auth/recovery#error=access_denied&error_description=Email+link+is+invalid+or+has+expired',
    );
    expect(mapAuthError(errorDescription || '')).toContain(
      'Request a new email',
    );
    expect(mapAuthError('Token has expired or is invalid')).toContain(
      'Request a new email',
    );
  });
});
