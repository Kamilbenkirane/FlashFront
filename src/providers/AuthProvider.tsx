import {
  logoutRequest,
  refreshSessionRequest,
  resendVerificationEmailRequest,
  resetPasswordRequest,
  sendPasswordResetRequest,
  signInRequest,
  signUpRequest,
  verifyEmailRequest,
} from '@/services/auth/authApi';
import { mapAuthError } from '@/services/auth/authErrors';
import { getAuthRedirectUrl } from '@/services/auth/authRedirect';
import {
  clearStoredRefreshToken,
  getStoredRefreshToken,
  saveRefreshToken,
} from '@/services/auth/authStorage';
import { getAuthUrlParams } from '@/services/auth/authUrl';
import {
  getAccessToken,
  registerSessionRefreshHandler,
  setActiveSession,
} from '@/services/auth/sessionState';
import type {
  AppAuthUser,
  AppSession,
  AuthOtpType,
} from '@/services/auth/types';
import * as Linking from 'expo-linking';
import type React from 'react';
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface AuthActionResult {
  error: string | null;
  message?: string;
  requiresEmailConfirmation?: boolean;
}

interface AuthContextType {
  session: AppSession | null;
  authUser: AppAuthUser | null;
  authLoading: boolean;
  authError: string | null;
  pendingEmail: string | null;
  requiresPasswordReset: boolean;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signUp: (email: string, password: string) => Promise<AuthActionResult>;
  signOut: () => Promise<AuthActionResult>;
  sendPasswordReset: (email: string) => Promise<AuthActionResult>;
  resendVerificationEmail: (email?: string) => Promise<AuthActionResult>;
  updatePassword: (password: string) => Promise<AuthActionResult>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<AppSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [requiresPasswordReset, setRequiresPasswordReset] = useState(false);
  const [recoveryTokenHash, setRecoveryTokenHash] = useState<string | null>(
    null,
  );

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const applyAuthError = useCallback((message: string) => {
    const nextError = mapAuthError(message);
    setAuthError(nextError);
    return nextError;
  }, []);

  const toActionError = useCallback(
    (error: unknown): AuthActionResult => {
      const message =
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.';
      return { error: applyAuthError(message) };
    },
    [applyAuthError],
  );

  const applySession = useCallback(
    async (nextSession: AppSession | null, refreshToken?: string | null) => {
      setSession(nextSession);
      setActiveSession(nextSession);

      if (!nextSession) {
        await clearStoredRefreshToken();
        return;
      }

      if (refreshToken) {
        await saveRefreshToken(refreshToken);
      }
    },
    [],
  );

  const clearLocalAuthState = useCallback(async () => {
    await applySession(null);
    setPendingEmail(null);
    setRequiresPasswordReset(false);
    setRecoveryTokenHash(null);
  }, [applySession]);

  const refreshSession = useCallback(async (): Promise<string | null> => {
    const storedRefreshToken = await getStoredRefreshToken();
    if (!storedRefreshToken) {
      await applySession(null);
      return null;
    }

    const result = await refreshSessionRequest(storedRefreshToken).catch(
      () => null,
    );

    if (!result?.session || !result.refreshToken) {
      await clearLocalAuthState();
      return null;
    }

    await applySession(result.session, result.refreshToken);
    setAuthError(null);
    return result.session.accessToken;
  }, [applySession, clearLocalAuthState]);

  const handleAuthUrl = useCallback(
    async (url: string) => {
      const { tokenHash, type, errorDescription } = getAuthUrlParams(url);

      if (errorDescription) {
        applyAuthError(errorDescription);
        return;
      }

      if (type === 'recovery' && tokenHash) {
        setRecoveryTokenHash(tokenHash);
        setRequiresPasswordReset(true);
        setAuthError(null);
        return;
      }

      if (!tokenHash || !type) {
        return;
      }

      const result = await verifyEmailRequest(
        tokenHash,
        type as AuthOtpType,
      ).catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : 'Something went wrong. Please try again.';
        applyAuthError(message);
        return null;
      });

      if (!result) {
        return;
      }

      if (result.session && result.refreshToken) {
        await applySession(result.session, result.refreshToken);
        setPendingEmail(null);
        setRequiresPasswordReset(false);
      }

      setAuthError(null);
    },
    [applyAuthError, applySession],
  );

  useEffect(() => {
    let isMounted = true;

    const hydrateSession = async () => {
      const initialUrl = await Linking.getInitialURL();
      const initialParams = initialUrl ? getAuthUrlParams(initialUrl) : null;
      if (initialUrl) {
        await handleAuthUrl(initialUrl);
      }

      if (initialParams?.type !== 'recovery' && !getAccessToken()) {
        await refreshSession();
      }

      if (!isMounted) {
        return;
      }

      setAuthLoading(false);
    };

    registerSessionRefreshHandler(refreshSession);
    void hydrateSession();

    const urlSubscription = Linking.addEventListener('url', ({ url }) => {
      void handleAuthUrl(url);
    });

    return () => {
      isMounted = false;
      registerSessionRefreshHandler(null);
      urlSubscription.remove();
    };
  }, [handleAuthUrl, refreshSession]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      clearAuthError();
      setPendingEmail(null);
      const result = await signInRequest(email, password).catch(toActionError);

      if ('error' in result) {
        return result;
      }

      if (!result.session || !result.refreshToken) {
        return {
          error: applyAuthError('Could not create an authenticated session.'),
        };
      }

      await applySession(result.session, result.refreshToken);
      setRequiresPasswordReset(false);
      return { error: null };
    },
    [applyAuthError, applySession, clearAuthError],
  );

  const signUp = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      clearAuthError();
      const result = await signUpRequest(
        email,
        password,
        getAuthRedirectUrl('auth/callback'),
      ).catch(toActionError);

      if ('error' in result) {
        return result;
      }

      setPendingEmail(email);
      if (result.session && result.refreshToken) {
        await applySession(result.session, result.refreshToken);
      }
      return {
        error: null,
        requiresEmailConfirmation: result.requiresEmailConfirmation,
      };
    },
    [applyAuthError, applySession, clearAuthError],
  );

  const signOut = useCallback(async (): Promise<AuthActionResult> => {
    const storedRefreshToken = await getStoredRefreshToken();
    if (storedRefreshToken) {
      await logoutRequest(storedRefreshToken).catch(() => null);
    }

    await clearLocalAuthState();
    setAuthError(null);
    return { error: null };
  }, [clearLocalAuthState]);

  const sendPasswordReset = useCallback(
    async (email: string): Promise<AuthActionResult> => {
      clearAuthError();
      const result = await sendPasswordResetRequest(
        email,
        getAuthRedirectUrl('auth/recovery'),
      )
        .then((message) => ({ error: null, message }))
        .catch(toActionError);

      if (result.error) {
        return result;
      }

      setPendingEmail(email);
      return {
        error: null,
        message: result.message || 'Check your inbox for a reset link.',
      };
    },
    [clearAuthError, toActionError],
  );

  const resendVerificationEmail = useCallback(
    async (email?: string): Promise<AuthActionResult> => {
      const targetEmail = email || pendingEmail;
      if (!targetEmail) {
        return {
          error: 'Enter your email address to resend the verification link.',
        };
      }

      const result = await resendVerificationEmailRequest(
        targetEmail,
        getAuthRedirectUrl('auth/callback'),
      )
        .then((message) => ({ error: null, message }))
        .catch(toActionError);

      if (result.error) {
        return result;
      }

      setPendingEmail(targetEmail);
      return {
        error: null,
        message: result.message || 'We sent another verification email.',
      };
    },
    [pendingEmail, toActionError],
  );

  const updatePassword = useCallback(
    async (password: string): Promise<AuthActionResult> => {
      if (!recoveryTokenHash) {
        return {
          error: 'Open the password reset link on this device first.',
        };
      }

      const result = await resetPasswordRequest(recoveryTokenHash, password)
        .then((message) => ({ error: null, message }))
        .catch(toActionError);

      if (result.error) {
        return result;
      }

      await clearLocalAuthState();
      return {
        error: null,
        message:
          result.message || 'Password updated. Sign in with your new password.',
      };
    },
    [clearLocalAuthState, recoveryTokenHash, toActionError],
  );

  const value = useMemo<AuthContextType>(
    () => ({
      session,
      authUser: session?.user ?? null,
      authLoading,
      authError,
      pendingEmail,
      requiresPasswordReset,
      signIn,
      signUp,
      signOut,
      sendPasswordReset,
      resendVerificationEmail,
      updatePassword,
      clearAuthError,
    }),
    [
      session,
      authLoading,
      authError,
      pendingEmail,
      requiresPasswordReset,
      signIn,
      signUp,
      signOut,
      sendPasswordReset,
      resendVerificationEmail,
      updatePassword,
      clearAuthError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
