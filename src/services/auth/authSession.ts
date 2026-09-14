import { isDefinitiveRequestError } from '@/services/apiError';
import type { AppSession } from '@/services/auth/types';

const NUMERIC_TIMESTAMP = /^\d+(\.\d+)?$/;

// Accepts an ISO date or a unix timestamp in seconds or milliseconds.
export const parseSessionExpiry = (
  expiresAt: string | null | undefined,
): number | null => {
  if (!expiresAt) {
    return null;
  }

  const trimmed = expiresAt.trim();
  if (NUMERIC_TIMESTAMP.test(trimmed)) {
    const numeric = Number(trimmed);
    return numeric > 1e12 ? numeric : numeric * 1000;
  }

  const parsed = Date.parse(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
};

// Unknown expiry counts as expiring, so the token is refreshed to be safe.
export const isSessionExpiringSoon = (
  session: Pick<AppSession, 'expiresAt'>,
  now = Date.now(),
  marginMs = 60_000,
) => {
  const expiry = parseSessionExpiry(session.expiresAt);
  return expiry === null || expiry - now <= marginMs;
};

// Only a rejection the auth server made on purpose ends the local session.
// Being offline, a timeout or a server outage must never sign the user out.
export const isDefinitiveAuthRejection = (error: unknown) =>
  isDefinitiveRequestError(error);
