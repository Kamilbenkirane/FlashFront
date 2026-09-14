const defaultLocalApiUrl = 'http://127.0.0.1:5001';

const trimTrailingSlashes = (url: string) => url.replace(/\/+$/, '');

const apiUrl = trimTrailingSlashes(
  process.env.EXPO_PUBLIC_API_URL || defaultLocalApiUrl,
);

/** Supabase project URL; Google sign-in is unavailable until it is set. */
export const supabaseUrl =
  trimTrailingSlashes(process.env.EXPO_PUBLIC_SUPABASE_URL || '') || null;

export const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiUrl}${normalizedPath}`;
};
