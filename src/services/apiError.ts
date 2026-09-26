export const DEFAULT_REQUEST_TIMEOUT_MS = 20_000;

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export class RequestTimeoutError extends Error {
  constructor(message = 'The request took too long. Please try again.') {
    super(message);
    this.name = 'RequestTimeoutError';
  }
}

// The server answered and rejected the request on purpose (bad token, unknown
// card, validation error...). Sending the same request again will not help,
// unlike a network failure, a timeout, a rate limit, or a server error.
export const isDefinitiveRequestError = (error: unknown): boolean =>
  error instanceof ApiError &&
  error.status >= 400 &&
  error.status < 500 &&
  error.status !== 408 &&
  error.status !== 429;

// A plain fetch never gives up on its own on mobile: a request sent while the
// network looks connected but is not reachable can hang for a minute or more.
export const fetchWithTimeout = async (
  input: string,
  init?: RequestInit,
  timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
): Promise<Response> => {
  if (init?.signal) {
    return fetch(input, init);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new RequestTimeoutError();
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};
