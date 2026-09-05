import type {
  AppAuthUser,
  AppSession,
  AuthOtpType,
} from '@/services/auth/types';
import { buildApiUrl } from '@/services/runtimeConfig';
import { Platform } from 'react-native';

interface AuthApiUserPayload {
  id: string;
  email: string;
}

interface AuthApiSessionPayload {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  token_type: string;
}

interface AuthApiResponsePayload {
  session?: AuthApiSessionPayload | null;
  user?: AuthApiUserPayload | null;
  requires_email_confirmation?: boolean;
  message?: string | null;
}

interface AuthMessagePayload {
  message?: string | null;
}

export interface AuthExchangeResult {
  session: AppSession | null;
  refreshToken: string | null;
  user: AppAuthUser | null;
  requiresEmailConfirmation: boolean;
  message: string | null;
}

const getDeviceLabel = () => `flashfront-${Platform.OS}`;

const parseErrorMessage = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';
  const errorPayload = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (typeof errorPayload?.detail === 'string') {
    return errorPayload.detail;
  }

  if (typeof errorPayload?.message === 'string') {
    return errorPayload.message;
  }

  if (response.status === 401) {
    return 'Your session has expired. Please sign in again.';
  }

  return `Request failed with status ${response.status}`;
};

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(buildApiUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
};

const mapAuthExchange = (
  payload: AuthApiResponsePayload,
): AuthExchangeResult => {
  const user = payload.user ?? null;
  const session =
    payload.session && user
      ? {
          accessToken: payload.session.access_token,
          expiresAt: payload.session.expires_at,
          user,
        }
      : null;

  return {
    session,
    refreshToken: payload.session?.refresh_token ?? null,
    user,
    requiresEmailConfirmation: payload.requires_email_confirmation ?? false,
    message: payload.message ?? null,
  };
};

export const signInRequest = async (
  email: string,
  password: string,
): Promise<AuthExchangeResult> => {
  const payload = await requestJson<AuthApiResponsePayload>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      device_label: getDeviceLabel(),
    }),
  });
  return mapAuthExchange(payload);
};

export const signUpRequest = async (
  email: string,
  password: string,
  emailRedirectTo: string,
): Promise<AuthExchangeResult> => {
  const payload = await requestJson<AuthApiResponsePayload>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      device_label: getDeviceLabel(),
      email_redirect_to: emailRedirectTo,
    }),
  });
  return mapAuthExchange(payload);
};

export const verifyEmailRequest = async (
  tokenHash: string,
  type: AuthOtpType,
): Promise<AuthExchangeResult> => {
  const payload = await requestJson<AuthApiResponsePayload>(
    '/auth/verify-email',
    {
      method: 'POST',
      body: JSON.stringify({
        token_hash: tokenHash,
        type,
        device_label: getDeviceLabel(),
      }),
    },
  );
  return mapAuthExchange(payload);
};

export const refreshSessionRequest = async (
  refreshToken: string,
): Promise<AuthExchangeResult> => {
  const payload = await requestJson<AuthApiResponsePayload>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({
      refresh_token: refreshToken,
      device_label: getDeviceLabel(),
    }),
  });
  return mapAuthExchange(payload);
};

export const logoutRequest = async (
  refreshToken: string,
): Promise<string | null> => {
  const payload = await requestJson<AuthMessagePayload>('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({
      refresh_token: refreshToken,
    }),
  });
  return payload?.message ?? null;
};

export const sendPasswordResetRequest = async (
  email: string,
  redirectTo: string,
): Promise<string | null> => {
  const payload = await requestJson<AuthMessagePayload>(
    '/auth/password/forgot',
    {
      method: 'POST',
      body: JSON.stringify({
        email,
        redirect_to: redirectTo,
      }),
    },
  );
  return payload?.message ?? null;
};

export const resendVerificationEmailRequest = async (
  email: string,
  emailRedirectTo: string,
): Promise<string | null> => {
  const payload = await requestJson<AuthMessagePayload>('/auth/email/resend', {
    method: 'POST',
    body: JSON.stringify({
      email,
      email_redirect_to: emailRedirectTo,
    }),
  });
  return payload?.message ?? null;
};

export const resetPasswordRequest = async (
  tokenHash: string,
  password: string,
): Promise<string | null> => {
  const payload = await requestJson<AuthMessagePayload>(
    '/auth/password/reset',
    {
      method: 'POST',
      body: JSON.stringify({
        token_hash: tokenHash,
        password,
        type: 'recovery',
      }),
    },
  );
  return payload?.message ?? null;
};
