import { beforeEach, describe, expect, it, vi } from 'vitest';

const { constants, webBrowser } = vi.hoisted(() => {
  process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co/';
  return {
    constants: {
      executionEnvironment: 'standalone',
      expoConfig: {
        scheme: 'flashfront',
        hostUri: undefined as string | undefined,
      },
      expoGoConfig: { developer: false },
    },
    webBrowser: {
      maybeCompleteAuthSession: vi.fn(),
      openAuthSessionAsync: vi.fn(),
    },
  };
});

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
vi.mock(
  'expo-linking',
  async () => import('../../../node_modules/expo-linking/build/createURL.js'),
);
vi.mock('expo-web-browser', () => webBrowser);

import { getGoogleAuthorizeUrl, openGoogleSignIn } from '@/services/auth/oauth';

const redirectTo = 'flashfront://auth/callback';
const authorizeUrl =
  'https://example.supabase.co/auth/v1/authorize?provider=google&redirect_to=flashfront%3A%2F%2Fauth%2Fcallback';

describe('Google sign-in', () => {
  beforeEach(() => {
    webBrowser.openAuthSessionAsync.mockReset();
  });

  it('sends the auth browser to Supabase with the app callback', () => {
    expect(getGoogleAuthorizeUrl(redirectTo)).toBe(authorizeUrl);
  });

  it('returns the session Supabase redirects back with', async () => {
    webBrowser.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: `${redirectTo}#access_token=access&expires_in=3600&refresh_token=refresh&token_type=bearer`,
    });

    await expect(openGoogleSignIn(redirectTo)).resolves.toEqual({
      refreshToken: 'refresh',
      error: null,
    });
    expect(webBrowser.openAuthSessionAsync).toHaveBeenCalledWith(
      authorizeUrl,
      redirectTo,
    );
  });

  it('stays silent when the user closes the browser', async () => {
    webBrowser.openAuthSessionAsync.mockResolvedValue({ type: 'cancel' });

    await expect(openGoogleSignIn(redirectTo)).resolves.toEqual({
      refreshToken: null,
      error: null,
    });
  });

  it('maps a denied consent screen to a user-facing message', async () => {
    webBrowser.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: `${redirectTo}#error=access_denied&error_code=400&error_description=`,
    });

    await expect(openGoogleSignIn(redirectTo)).resolves.toEqual({
      refreshToken: null,
      error: 'Google sign-in was canceled.',
    });
  });

  it('rejects a callback that carries no session', async () => {
    webBrowser.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: `${redirectTo}#token_type=bearer`,
    });

    await expect(openGoogleSignIn(redirectTo)).resolves.toEqual({
      refreshToken: null,
      error: 'Google sign-in did not return a session. Please try again.',
    });
  });

  it('reports a missing Supabase URL instead of opening the browser', async () => {
    vi.stubEnv('EXPO_PUBLIC_SUPABASE_URL', '');
    vi.resetModules();
    const oauth = await import('@/services/auth/oauth');

    await expect(oauth.openGoogleSignIn(redirectTo)).resolves.toEqual({
      refreshToken: null,
      error:
        'Google sign-in is not configured. Set EXPO_PUBLIC_SUPABASE_URL to enable it.',
    });
    expect(webBrowser.openAuthSessionAsync).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });
});
