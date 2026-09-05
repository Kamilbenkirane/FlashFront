const defaultLocalApiUrl = 'http://127.0.0.1:5001';

const apiUrl = (process.env.EXPO_PUBLIC_API_URL || defaultLocalApiUrl).replace(
  /\/+$/,
  '',
);

export const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiUrl}${normalizedPath}`;
};
