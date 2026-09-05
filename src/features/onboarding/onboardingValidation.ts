export const getOnboardingStepError = (
  step: number,
  displayName: string,
  selectedDeckIds: readonly (string | number)[],
) => {
  if (!displayName.trim()) {
    return 'Choose a display name to continue.';
  }

  if (step > 0 && selectedDeckIds.length === 0) {
    return 'Pick at least one starter deck to continue.';
  }

  return null;
};
