export type AuthOtpType =
  | 'signup'
  | 'invite'
  | 'magiclink'
  | 'recovery'
  | 'email_change'
  | 'email';

export interface AppAuthUser {
  id: string;
  email: string;
}

export interface AppSession {
  accessToken: string;
  expiresAt: string;
  user: AppAuthUser;
}
