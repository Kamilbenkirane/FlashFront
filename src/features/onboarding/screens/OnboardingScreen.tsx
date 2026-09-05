import { ShuffleMark } from '@/components/ui/Brand/ShuffleMark';
import { Button } from '@/components/ui/Button';
import { FeedbackState } from '@/components/ui/FeedbackState/FeedbackState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Typography } from '@/components/ui/Typography';
import { AuthTextField } from '@/features/auth/components/AuthTextField';
import DecksMultiSelect from '@/features/library/components/DecksMultiSelect';
import { getOnboardingStepError } from '@/features/onboarding/onboardingValidation';
import useDeckLibrary from '@/hooks/useDeckLibrary';
import useReducedMotion from '@/hooks/useReducedMotion';
import { useAuth } from '@/providers/AuthProvider';
import { useUser } from '@/providers/UserProvider';
import { theme } from '@/tokens/theme';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DEFAULT_DAILY_GOAL = 20;
const steps = ['Your name', 'Choose decks', 'Daily goal'];

const getSuggestedDisplayName = (
  authEmail: string | undefined,
  existingName: string | undefined,
) => {
  if (existingName) return existingName;
  if (!authEmail) return '';
  return authEmail.split('@')[0]?.replace(/[._-]+/g, ' ') || '';
};

const OnboardingScreen: React.FC = () => {
  const { authUser } = useAuth();
  const { user, completeOnboarding, userError } = useUser();
  const {
    decks,
    isLoading: decksLoading,
    error: decksError,
    reload: reloadDecks,
  } = useDeckLibrary();
  const reducedMotion = useReducedMotion();
  const scrollRef = useRef<ScrollView>(null);
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [selectedDeckIds, setSelectedDeckIds] = useState<(string | number)[]>(
    [],
  );
  const [dailyGoal, setDailyGoal] = useState(DEFAULT_DAILY_GOAL);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setDisplayName(
      (current) =>
        current || getSuggestedDisplayName(authUser?.email, user?.user_name),
    );
  }, [authUser?.email, user?.user_name]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: !reducedMotion });
  }, [step, reducedMotion]);

  const handleSelectDecks = useCallback((deckIds: (string | number)[]) => {
    setSelectedDeckIds(deckIds);
    setFieldError(null);
  }, []);

  const handleContinue = async () => {
    if (isSubmitting) return;
    const error = getOnboardingStepError(step, displayName, selectedDeckIds);
    setFieldError(error);
    if (error) return;
    Keyboard.dismiss();
    if (step < steps.length - 1) {
      setStep((current) => current + 1);
      return;
    }

    setIsSubmitting(true);
    const result = await completeOnboarding({
      displayName,
      selectedDeckIds,
      dailyGoal,
      reminderEnabled,
    });
    setIsSubmitting(false);
    if (result.error) setFieldError(result.error);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === 'ios' ? 'interactive' : 'on-drag'
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.shell}>
            <View style={styles.masthead}>
              <View style={styles.brand}>
                <ShuffleMark size={32} />
                <Typography style={styles.brandName}>Shuffle</Typography>
              </View>
              <View
                style={styles.progress}
                accessible
                accessibilityRole="progressbar"
                accessibilityLabel="Setup"
                accessibilityValue={{
                  min: 1,
                  max: steps.length,
                  now: step + 1,
                }}
              >
                <View style={styles.dots}>
                  {steps.map((label, index) => (
                    <View
                      key={label}
                      style={[styles.dot, index <= step && styles.dotActive]}
                    />
                  ))}
                </View>
                <Typography variant="caption" color="muted">
                  {step + 1} of {steps.length}
                </Typography>
              </View>
            </View>

            <View style={styles.panel}>
              <View style={styles.header}>
                <Typography
                  style={styles.title}
                  accessibilityRole="header"
                  accessibilityLiveRegion="polite"
                >
                  {steps[step]}
                </Typography>
                {step === 1 ? (
                  <Typography color="muted">
                    Select at least one deck.
                  </Typography>
                ) : null}
              </View>

              {step === 0 ? (
                <AuthTextField
                  label="Display name"
                  value={displayName}
                  onChangeText={(value) => {
                    setDisplayName(value);
                    setFieldError(null);
                  }}
                  placeholder="Your name"
                  autoCapitalize="words"
                  autoComplete="name"
                  returnKeyType="done"
                  onSubmitEditing={() => void handleContinue()}
                />
              ) : step === 1 ? (
                decksLoading ? (
                  <LoadingState message="Loading decks…" />
                ) : decksError ? (
                  <FeedbackState
                    title="Couldn't load decks"
                    description={decksError}
                    icon="cloudOff"
                    actionLabel="Try again"
                    onAction={() => void reloadDecks()}
                  />
                ) : decks.length === 0 ? (
                  <FeedbackState
                    title="No decks available"
                    description="Reload to try again."
                    icon="library"
                    actionLabel="Reload decks"
                    onAction={() => void reloadDecks()}
                  />
                ) : (
                  <DecksMultiSelect
                    decks={decks}
                    selectedDeckIds={selectedDeckIds}
                    onSelectDecks={handleSelectDecks}
                  />
                )
              ) : (
                <View style={styles.preferences}>
                  <View style={styles.goalRow}>
                    <Button
                      title="−"
                      variant="outline"
                      size="lg"
                      accessibilityLabel="Decrease daily goal by 5 cards"
                      disabled={dailyGoal <= 5 || isSubmitting}
                      onPress={() =>
                        setDailyGoal((current) => Math.max(5, current - 5))
                      }
                    />
                    <View
                      style={styles.goalValue}
                      accessible
                      accessibilityLabel={`Daily goal: ${dailyGoal} cards`}
                    >
                      <Typography style={styles.goalNumber}>
                        {dailyGoal}
                      </Typography>
                      <Typography variant="caption" color="muted">
                        cards per day
                      </Typography>
                    </View>
                    <Button
                      title="+"
                      variant="outline"
                      size="lg"
                      accessibilityLabel="Increase daily goal by 5 cards"
                      disabled={dailyGoal >= 60 || isSubmitting}
                      onPress={() =>
                        setDailyGoal((current) => Math.min(60, current + 5))
                      }
                    />
                  </View>
                  <View style={styles.toggleRow}>
                    <Typography style={styles.toggleLabel}>
                      Reminders when available
                    </Typography>
                    <View style={styles.reminderSwitch}>
                      <Switch
                        value={reminderEnabled}
                        onValueChange={setReminderEnabled}
                        disabled={isSubmitting}
                        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                        accessibilityLabel="Daily reminder preference"
                        accessibilityHint="Saves your preference for future daily reminders"
                        trackColor={{
                          false: theme.colors.muted,
                          true: theme.colors.primary,
                        }}
                        thumbColor={theme.colors.foreground}
                        {...(Platform.OS === 'web'
                          ? { activeThumbColor: theme.colors.foreground }
                          : {})}
                      />
                    </View>
                  </View>
                </View>
              )}

              {fieldError || userError ? (
                <Typography color="error" accessibilityLiveRegion="polite">
                  {fieldError || userError}
                </Typography>
              ) : null}

              <View style={styles.actions}>
                <Button
                  title={step === 2 ? 'Finish setup' : 'Continue'}
                  size="lg"
                  onPress={() => void handleContinue()}
                  loading={isSubmitting}
                  fullWidth
                />
                {step > 0 ? (
                  <Pressable
                    style={styles.backLink}
                    disabled={isSubmitting}
                    accessibilityRole="button"
                    accessibilityLabel="Back to the previous setup step"
                    accessibilityState={{ disabled: isSubmitting }}
                    onPress={() => {
                      Keyboard.dismiss();
                      setFieldError(null);
                      setStep((current) => current - 1);
                    }}
                  >
                    <Typography variant="caption" color="muted">
                      Back
                    </Typography>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.xxxl,
  },
  shell: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    gap: theme.spacing.xxl,
  },
  masthead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  brandName: {
    fontSize: 22,
    lineHeight: 30,
    fontFamily: theme.fontFamily.medium,
    letterSpacing: -0.8,
  },
  header: { gap: theme.spacing.md },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  dots: { flexDirection: 'row', gap: 4 },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.border,
  },
  dotActive: { backgroundColor: theme.colors.primary },
  panel: {
    gap: theme.spacing.xxl,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.xxl,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.9,
    fontFamily: theme.fontFamily.medium,
  },
  preferences: { gap: theme.spacing.xxl },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  goalValue: { flex: 1, alignItems: 'center', gap: theme.spacing.xs },
  goalNumber: {
    fontSize: 36,
    lineHeight: 44,
    fontFamily: theme.fontFamily.medium,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  toggleLabel: { flex: 1 },
  reminderSwitch: { minHeight: 44, justifyContent: 'center' },
  actions: { gap: theme.spacing.sm },
  backLink: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});

export default OnboardingScreen;
