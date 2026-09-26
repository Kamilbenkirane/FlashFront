import { describe, expect, it } from 'vitest';

import { ApiError } from '@/services/apiError';
import {
  isDefinitiveAuthRejection,
  isSessionExpiringSoon,
  parseSessionExpiry,
} from '@/services/auth/authSession';

describe('parseSessionExpiry', () => {
  it('reads ISO dates and unix timestamps in seconds or milliseconds', () => {
    const expected = Date.parse('2026-09-14T10:00:00Z');

    expect(parseSessionExpiry('2026-09-14T10:00:00Z')).toBe(expected);
    expect(parseSessionExpiry(`${expected / 1000}`)).toBe(expected);
    expect(parseSessionExpiry(`${expected}`)).toBe(expected);
  });

  it('gives up on missing or unreadable values', () => {
    expect(parseSessionExpiry('')).toBeNull();
    expect(parseSessionExpiry(undefined)).toBeNull();
    expect(parseSessionExpiry('soon')).toBeNull();
  });
});

describe('isSessionExpiringSoon', () => {
  const now = Date.parse('2026-09-14T10:00:00Z');

  it('is true within the margin, on unknown expiry, and after expiry', () => {
    expect(
      isSessionExpiringSoon({ expiresAt: '2026-09-14T10:00:30Z' }, now),
    ).toBe(true);
    expect(
      isSessionExpiringSoon({ expiresAt: '2026-09-14T09:00:00Z' }, now),
    ).toBe(true);
    expect(isSessionExpiringSoon({ expiresAt: '' }, now)).toBe(true);
  });

  it('is false for a token that still has time left', () => {
    expect(
      isSessionExpiringSoon({ expiresAt: '2026-09-14T10:30:00Z' }, now),
    ).toBe(false);
  });
});

describe('isDefinitiveAuthRejection', () => {
  it('only ends the session on a deliberate rejection', () => {
    expect(isDefinitiveAuthRejection(new ApiError('invalid token', 401))).toBe(
      true,
    );
    expect(isDefinitiveAuthRejection(new ApiError('bad request', 400))).toBe(
      true,
    );
    expect(isDefinitiveAuthRejection(new ApiError('down', 502))).toBe(false);
    expect(
      isDefinitiveAuthRejection(new TypeError('Network request failed')),
    ).toBe(false);
  });
});
