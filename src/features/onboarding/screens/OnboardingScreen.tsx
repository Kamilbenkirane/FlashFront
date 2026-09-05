import { ShuffleMark } from '@/components/ui/Brand/ShuffleMark';
import { Button } from '@/components/ui/Button';
import { FeedbackState } from '@/components/ui/FeedbackState/FeedbackState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Typography } from '@/components/ui/Typography';
import { AppIcon } from '@/components/ui/icons';
import { AuthTextField } from '@/features/auth/components/AuthTextField';
import DecksMultiSelect from '@/features/library/components/DecksMultiSelect';
import { getOnboardingStepError } from '@/features/onboarding/onboardingValidation';
import useDeckLibrary from '@/hooks/useDeckLibrary';
import useReducedMotion from '@/hooks/useReducedMotion';
import { useAuth } from '@/providers/AuthProvider';
import { useUser } from '@/providers/UserProvider';
import { theme } from '@/tokens/theme';
import { MotiView } from 'moti';
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
const steps = [
  {
    label: 'About you',
    title: 'Make yourself at home.',
    subtitle: 'A few small choices to make Shuffle feel like yours.',
  },
  {
    label: 'Your interests',
    title: 'Follow your curiosity.',
    subtitle:
      'Choose at least one starter deck. Your first discovery begins here.',
  },
  {
    label: 'Your rhythm',
    title: 'Small steps add up.',
    subtitle:
      'Choose a daily card goal that fits your day. Even five cards count.',
  },
];

const getSuggestedDisplayName = (
  authEmail: string | undefined,
  existingName: string | undefined,
) => {
  if (existingName) {
    return existingName;
  }
  if (!authEmail) {
    return '';
  }
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
    if (isSubmitting) {
      return;
    }
    const error = getOnboardingStepError(step, displayName, selectedDeckIds);
    setFieldError(error);
    if (error) {
      return;
    }
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
    if (result.error) {
      setFieldError(result.error);
    }
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
              <Typography variant="caption" color="muted">
                Let's begin
              </Typography>
            </View>

            <View
              style={styles.steps}
              accessible
              accessibilityRole="progressbar"
              accessibilityLabel={`Setup: ${steps[step].label}`}
              accessibilityValue={{ min: 1, max: steps.length, now: step + 1 }}
            >
              {steps.map((item, index) => (
                <View key={item.label} style={styles.step}>
                  <View
                    style={[
                      styles.stepTrack,
                      index <= step && styles.stepTrackActive,
                    ]}
                  />
                  <Typography
                    variant="caption"
                    color={index === step ? 'primary' : 'muted'}
                    style={styles.stepLabel}
                  >
                    {item.label}
                  </Typography>
                </View>
              ))}
            </View>

            <View style={styles.header}>
              <Typography
                variant="caption"
                color="primary"
                style={styles.eyebrow}
              >
                YOUR FIRST CHAPTER · 0{step + 1}
              </Typography>
              <Typography
                style={styles.title}
                accessibilityRole="header"
                accessibilityLiveRegion="polite"
              >
                {steps[step].title}
              </Typography>
              <Typography color="muted" style={styles.subtitle}>
                {steps[step].subtitle}
              </Typography>
            </View>

            <MotiView
              key={step}
              from={{ opacity: 0, translateY: reducedMotion ? 0 : 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: reducedMotion ? 0 : 220 }}
              style={styles.panel}
            >
              {step === 0 ? (
                <>
                  <View style={styles.deckIntro}>
                    <View style={styles.welcomeMark}>
                      <AppIcon
                        name="sparkles"
                        size={24}
                        color={theme.colors.primary}
                      />
                    </View>
                    <Typography variant="heading3" style={styles.readyCopy}>
                      A space for your curiosity.
                    </Typography>
                  </View>
                  <AuthTextField
                    label="What should we call you?"
                    value={displayName}
                    onChangeText={(value) => {
                      setDisplayName(value);
                      setFieldError(null);
                    }}
                    placeholder="Your name"
                    autoCapitalize="words"
                    autoComplete="name"
                    helperText="The name on your learning profile."
                    returnKeyType="done"
                    onSubmitEditing={() => void handleContinue()}
                  />
                  <View style={styles.accountRow}>
                    <AppIcon
                      name="person"
                      size={18}
                      color={theme.colors.mutedForeground}
                    />
                    <View style={styles.accountCopy}>
                      <Typography variant="caption" color="muted">
                        Signed in as
                      </Typography>
                      <Typography variant="caption">
                        {authUser?.email || 'your account'}
                      </Typography>
                    </View>
                  </View>
                </>
              ) : step === 1 ? (
                <>
                  <View style={styles.deckIntro}>
                    <View style={styles.welcomeMark}>
                      <AppIcon
                        name="layers"
                        size={24}
                        color={theme.colors.primary}
                      />
                    </View>
                    <View style={styles.accountCopy}>
                      <Typography variant="heading3">
                        A good place to begin
                      </Typography>
                      <Typography color="muted">
                        You can explore more decks in the library.
                      </Typography>
                    </View>
                  </View>
                  {decksLoading ? (
                    <LoadingState
                      message="Finding your starter decks…"
                      className="justify-center"
                    />
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
                      title="No starter decks yet"
                      description="Try loading the library again to find your first deck."
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
                  )}
                  {selectedDeckIds.length > 0 ? (
                    <View
                      style={styles.selectionNote}
                      accessibilityLiveRegion="polite"
                    >
                      <AppIcon
                        name="checkCircle"
                        size={18}
                        color={theme.colors.primary}
                      />
                      <Typography variant="caption" color="primary">
                        {selectedDeckIds.length} deck
                        {selectedDeckIds.length === 1 ? '' : 's'} ready for your
                        first session
                      </Typography>
                    </View>
                  ) : null}
                </>
              ) : (
                <>
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
                      style={styles.goalDial}
                      accessible
                      accessibilityLabel={`Daily goal: ${dailyGoal} cards`}
                    >
                      <Typography style={styles.goalNumber} color="primary">
                        {dailyGoal}
                      </Typography>
                      <Typography variant="caption" color="muted">
                        cards a day
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
                  <Typography
                    variant="caption"
                    color="muted"
                    style={styles.goalHint}
                  >
                    A little focus today. More to remember tomorrow.
                  </Typography>
                  <View style={styles.toggleRow}>
                    <View style={styles.accountCopy}>
                      <Typography variant="body">A gentle nudge</Typography>
                      <Typography variant="caption" color="muted">
                        Save my preference for future daily reminders.
                      </Typography>
                    </View>
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
                      />
                    </View>
                  </View>
                  <View style={styles.readyNote}>
                    <AppIcon
                      name="checkCircle"
                      size={20}
                      color={theme.colors.primary}
                    />
                    <Typography variant="caption" style={styles.readyCopy}>
                      {displayName.trim()}, your{' '}
                      {selectedDeckIds.length === 1
                        ? 'first deck is'
                        : `${selectedDeckIds.length} decks are`}{' '}
                      ready. Let’s make a little progress.
                    </Typography>
                  </View>
                </>
              )}
            </MotiView>

            {fieldError || userError ? (
              <View style={styles.errorBox} accessibilityLiveRegion="polite">
                <Typography variant="body" color="error">
                  {fieldError || userError}
                </Typography>
              </View>
            ) : null}

            <View style={styles.actions}>
              <Button
                title={
                  step === 0
                    ? 'Choose starter decks'
                    : step === 1
                      ? 'Set my daily rhythm'
                      : 'Let’s begin'
                }
                accessibilityLabel={
                  step === 2 ? 'Finish setup and start learning' : undefined
                }
                icon={
                  <AppIcon
                    name="chevronRight"
                    size={18}
                    color={theme.colors.primaryForeground}
                  />
                }
                iconPosition="right"
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
              ) : (
                <Typography
                  variant="caption"
                  color="muted"
                  style={styles.footerNote}
                >
                  A few choices. Then you're ready to explore.
                </Typography>
              )}
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
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.xxl,
  },
  shell: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    gap: theme.spacing.xxl,
  },
  masthead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  brandName: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: theme.fontFamily.medium,
    letterSpacing: -0.8,
  },
  steps: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  step: { flex: 1, gap: theme.spacing.sm },
  stepTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
  },
  stepTrackActive: { backgroundColor: theme.colors.primary },
  stepLabel: { fontSize: 11, lineHeight: 16 },
  header: { gap: theme.spacing.md },
  eyebrow: {
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 1.5,
    fontFamily: theme.fontFamily.medium,
  },
  title: {
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -1.4,
    fontFamily: theme.fontFamily.medium,
  },
  subtitle: { fontSize: 15, lineHeight: 23 },
  panel: {
    gap: theme.spacing.xxl,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.xxl,
    padding: theme.spacing.xl,
  },
  welcomeMark: {
    width: 48,
    height: 48,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  accountCopy: { flex: 1, minWidth: 0, gap: theme.spacing.xs },
  deckIntro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  selectionNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  goalDial: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xl,
  },
  goalNumber: {
    fontSize: 64,
    lineHeight: 70,
    letterSpacing: -3,
    fontFamily: theme.fontFamily.medium,
  },
  goalHint: { textAlign: 'center', marginTop: -theme.spacing.md },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  readyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  reminderSwitch: { minHeight: 44, justifyContent: 'center' },
  readyCopy: { flex: 1 },
  actions: { gap: theme.spacing.sm },
  backLink: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  footerNote: { textAlign: 'center', paddingVertical: theme.spacing.md },
  errorBox: {
    backgroundColor: theme.colors.destructive.light,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
});

export default OnboardingScreen;
