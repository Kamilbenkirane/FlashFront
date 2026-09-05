import * as Linking from 'expo-linking';

export const getAuthRedirectUrl = (path: string) => {
  const normalizedPath = path.replace(/^\/+/, '');
  return Linking.createURL(`/${normalizedPath}`);
};
