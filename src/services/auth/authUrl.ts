import * as Linking from 'expo-linking';

export const getAuthUrlParams = (url: string) => {
  const [baseUrl, hash = ''] = url.split('#');
  const parsed = Linking.parse(baseUrl);
  const params = new URLSearchParams();

  Object.entries(parsed.queryParams ?? {}).forEach(([key, value]) => {
    if (typeof value === 'string') {
      params.set(key, value);
    }
  });

  const hashParams = new URLSearchParams(hash);
  hashParams.forEach((value, key) => {
    params.set(key, value);
  });

  return {
    type: params.get('type'),
    tokenHash: params.get('token_hash'),
    errorDescription: params.get('error_description') || params.get('error'),
  };
};
