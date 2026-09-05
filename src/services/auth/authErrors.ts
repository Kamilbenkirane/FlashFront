export const mapAuthError = (message: string) => {
  const normalized = message.toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return 'Incorrect email or password.';
  }
  if (normalized.includes('incorrect email or password')) {
    return 'Incorrect email or password.';
  }
  if (normalized.includes('email not confirmed')) {
    return 'Confirm your email before signing in.';
  }
  if (normalized.includes('confirm your email')) {
    return 'Confirm your email before signing in.';
  }
  if (normalized.includes('user already registered')) {
    return 'An account already exists for this email.';
  }
  if (normalized.includes('user already exists')) {
    return 'An account already exists for this email.';
  }
  if (normalized.includes('password should be at least')) {
    return 'Use a password with at least 8 characters.';
  }
  if (normalized.includes('at least 8 characters')) {
    return 'Use a password with at least 8 characters.';
  }
  if (
    normalized.includes('recovery link') ||
    normalized.includes('email link') ||
    normalized.includes('otp_expired') ||
    normalized.includes('token has expired')
  ) {
    return 'This link is invalid or has expired. Request a new email and open it on the device running Shuffle.';
  }
  if (normalized.includes('network')) {
    return 'Could not reach the API. Check your connection and try again.';
  }
  if (normalized.includes('request failed with status')) {
    return message;
  }
  if (normalized.includes('temporarily unavailable')) {
    return 'Authentication is temporarily unavailable. Please try again.';
  }

  return 'Something went wrong. Please try again.';
};
