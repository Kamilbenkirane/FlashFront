import { expect, it } from 'vitest';
import { getOnboardingStepError } from './onboardingValidation';

it('requires the right choices at each step and rechecks them before saving', () => {
  expect(getOnboardingStepError(0, '  ', [])).toBe(
    'Choose a display name to continue.',
  );
  expect(getOnboardingStepError(0, ' Ada ', [])).toBeNull();
  expect(getOnboardingStepError(1, 'Ada', [])).toBe(
    'Pick at least one starter deck to continue.',
  );
  expect(getOnboardingStepError(1, 'Ada', ['1'])).toBeNull();
  expect(getOnboardingStepError(2, 'Ada', [])).toBe(
    'Pick at least one starter deck to continue.',
  );
  expect(getOnboardingStepError(2, '', [1])).toBe(
    'Choose a display name to continue.',
  );
  expect(getOnboardingStepError(2, 'Ada', [1, '2'])).toBeNull();
});
