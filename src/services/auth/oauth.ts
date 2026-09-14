import { mapAuthError } from '@/services/auth/authErrors';
import { getAuthUrlParams } from '@/services/auth/authUrl';
import { supabaseUrl } from '@/services/runtimeConfig';
import * as WebBrowser from 'expo-web-browser';

// On web, the popup Supabase redirects back to hands its URL to the opener
// and closes itself. No-op on native.
WebBrowser.maybeCompleteAuthSession();

export interface GoogleSignInResult {
  /** Supabase refresh token from the callback; null when the user backed out. */
  refreshToken: string | null;
  /** User-facing message; null when the user backed out. */
  error: string | null;
}

export const getGoogleAuthorizeUrl = (redirectTo: string) => {
  if (!supabaseUrl) {
    return null;
  }

  const params = new URLSearchParams({
    provider: 'google',
    redirect_to: redirectTo,
  });
  return `${supabaseUrl}/auth/v1/authorize?${params.toString()}`;
};

/**
 * Runs Supabase's hosted Google flow in the system auth browser and returns
 * the session it redirects back with. The tokens are exchanged through the
 * backend afterwards, so the app never needs a Supabase client.
 */
export const openGoogleSignIn = async (
  redirectTo: string,
): Promise<GoogleSignInResult> => {
  const authorizeUrl = getGoogleAuthorizeUrl(redirectTo);
  if (!authorizeUrl) {
    return {
      refreshToken: null,
      error:
        'Google sign-in is not configured. Set EXPO_PUBLIC_SUPABASE_URL to enable it.',
    };
  }

  const browserResult = await WebBrowser.openAuthSessionAsync(
    authorizeUrl,
    redirectTo,
  );
  if (browserResult.type !== 'success') {
    return { refreshToken: null, error: null };
  }

  const { refreshToken, errorDescription } = getAuthUrlParams(
    browserResult.url,
  );
  if (errorDescription) {
    return { refreshToken: null, error: mapAuthError(errorDescription) };
  }

  if (!refreshToken) {
    return {
      refreshToken: null,
      error: 'Google sign-in did not return a session. Please try again.',
    };
  }

  return { refreshToken, error: null };
};
