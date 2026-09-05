import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FeedbackState } from '@/components/ui/FeedbackState/FeedbackState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Typography } from '@/components/ui/Typography';
import DecksMultiSelect from '@/features/library/components/DecksMultiSelect';
import useDeckLibrary from '@/hooks/useDeckLibrary';
import { useAuth } from '@/providers/AuthProvider';
import { useUser } from '@/providers/UserProvider';
import { theme } from '@/tokens/theme';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DEFAULT_DAILY_GOAL = 20;

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

  const progressValue = useMemo(() => {
    let completed = 0;
    if (displayName.trim()) {
      completed += 1;
    }
    if (selectedDeckIds.length > 0) {
      completed += 1;
    }

    return completed;
  }, [displayName, selectedDeckIds.length]);

  const handleFinish = async () => {
    if (!displayName.trim()) {
      setFieldError('Choose a display name to continue.');
      return;
    }

    if (selectedDeckIds.length === 0) {
      setFieldError('Pick at least one starter deck to continue.');
      return;
    }

    setFieldError(null);
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
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Typography variant="heading1" style={styles.headerTitle}>
            Finish setup
          </Typography>
          <Typography
            variant="body"
            color="muted"
            style={styles.headerSubtitle}
          >
            Personalize FlashFront once so the rest of the app can feel like
            yours.
          </Typography>
        </View>

        <ProgressBar
          progress={progressValue}
          total={2}
          showLabel={true}
          showPercentage={false}
          color="primary"
          size="lg"
        />

        <Card variant="raised" padding="lg" style={styles.card}>
          <View style={styles.section}>
            <Typography variant="heading3">Account</Typography>
            <Typography variant="body" color="muted">
              Signed in as {authUser?.email || 'your account'}.
            </Typography>
          </View>

          <View style={styles.section}>
            <Typography variant="caption" color="muted">
              Display name
            </Typography>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Ada Lovelace"
              placeholderTextColor={theme.colors.placeholder}
              style={styles.input}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.section}>
            <Typography variant="heading3">Starter decks</Typography>
            <Typography variant="body" color="muted">
              Choose at least one deck so your first study session is ready.
            </Typography>
            {decksLoading ? (
              <LoadingState
                message="Loading starter decks..."
                className="justify-center"
              />
            ) : decksError ? (
              <FeedbackState
                title="Couldn't load decks"
                description={decksError}
                icon="cloudOff"
                actionLabel="Retry"
                onAction={() => void reloadDecks()}
              />
            ) : (
              <DecksMultiSelect
                decks={decks}
                onSelectDecks={setSelectedDeckIds}
              />
            )}
          </View>

          <View style={styles.section}>
            <Typography variant="heading3">Daily habit</Typography>
            <Typography variant="body" color="muted">
              Start with a target that feels easy to keep every day.
            </Typography>
            <View style={styles.goalRow}>
              <Button
                title="-"
                variant="outline"
                size="sm"
                onPress={() =>
                  setDailyGoal((current) => Math.max(5, current - 5))
                }
              />
              <View style={styles.goalValue}>
                <Typography variant="heading2">{dailyGoal}</Typography>
                <Typography variant="caption" color="muted">
                  cards / day
                </Typography>
              </View>
              <Button
                title="+"
                variant="outline"
                size="sm"
                onPress={() =>
                  setDailyGoal((current) => Math.min(60, current + 5))
                }
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleCopy}>
                <Typography variant="body">
                  Daily reminder preference
                </Typography>
                <Typography variant="small" color="muted">
                  Save whether you want reminder nudges later on.
                </Typography>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{
                  false: theme.colors.muted,
                  true: theme.colors.primary,
                }}
                thumbColor="#ffffff"
              />
            </View>
          </View>

          {fieldError || userError ? (
            <Typography variant="small" color="error">
              {fieldError || userError}
            </Typography>
          ) : null}

          <Button
            title="Finish setup"
            onPress={() => void handleFinish()}
            loading={isSubmitting}
            fullWidth
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  header: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  headerTitle: {
    textAlign: 'left',
  },
  headerSubtitle: {
    textAlign: 'left',
  },
  card: {
    gap: theme.spacing.lg,
  },
  section: {
    gap: theme.spacing.sm,
  },
  input: {
    minHeight: 48,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.input,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.foreground,
    fontFamily: theme.fontFamily.sans,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  goalValue: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  toggleCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
});

export default OnboardingScreen;
