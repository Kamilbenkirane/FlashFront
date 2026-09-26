import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  ApiError,
  RequestTimeoutError,
  fetchWithTimeout,
  isDefinitiveRequestError,
} from '@/services/apiError';

describe('isDefinitiveRequestError', () => {
  it('flags rejections the server made on purpose', () => {
    expect(isDefinitiveRequestError(new ApiError('bad request', 400))).toBe(
      true,
    );
    expect(isDefinitiveRequestError(new ApiError('unauthorized', 401))).toBe(
      true,
    );
    expect(isDefinitiveRequestError(new ApiError('not found', 404))).toBe(true);
  });

  it('treats timeouts, rate limits, server errors and network failures as transient', () => {
    expect(isDefinitiveRequestError(new ApiError('timeout', 408))).toBe(false);
    expect(isDefinitiveRequestError(new ApiError('slow down', 429))).toBe(
      false,
    );
    expect(isDefinitiveRequestError(new ApiError('unavailable', 503))).toBe(
      false,
    );
    expect(
      isDefinitiveRequestError(new TypeError('Network request failed')),
    ).toBe(false);
    expect(isDefinitiveRequestError(new RequestTimeoutError())).toBe(false);
    expect(isDefinitiveRequestError(null)).toBe(false);
  });
});

describe('fetchWithTimeout', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('gives up on a request that never answers', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(
      (_input: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(new Error('aborted')),
          );
        }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const pending = fetchWithTimeout('https://api.example/me', undefined, 50);
    const assertion =
      expect(pending).rejects.toBeInstanceOf(RequestTimeoutError);
    await vi.advanceTimersByTimeAsync(50);
    await assertion;
  });

  it('passes a timely response through with the abort signal attached', async () => {
    const response = new Response('{}', { status: 200 });
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      fetchWithTimeout('https://api.example/me', { method: 'POST' }),
    ).resolves.toBe(response);

    const [, init] = fetchMock.mock.calls[0] ?? [];
    expect(init?.method).toBe('POST');
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it('re-throws a plain network failure unchanged', async () => {
    const failure = new TypeError('Network request failed');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(failure));

    await expect(fetchWithTimeout('https://api.example/me')).rejects.toBe(
      failure,
    );
  });
});
