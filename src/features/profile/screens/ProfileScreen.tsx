import type { AppTabScreenProps } from '@/app/navigation/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { AppIcon } from '@/components/ui/icons';
import { StatsDashboard } from '@/features/profile/components/StatsDashboard';
import useTabScreenSpacing from '@/hooks/useTabScreenSpacing';
import { useAuth } from '@/providers/AuthProvider';
import { useUser } from '@/providers/UserProvider';
import { theme } from '@/tokens/theme';
import { triggerHaptic } from '@/utils/haptics';
import { showAlert } from '@/utils/showAlert';
import type React from 'react';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ProfileScreenProps = AppTabScreenProps<'Profile'>;

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { authUser, signOut } = useAuth();
  const { user, userError, onboardingPreferences, deleteAccount } = useUser();
  const { scrollContentContainerStyle, scrollIndicatorInsets } =
    useTabScreenSpacing();
  const [showAccount, setShowAccount] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const initials = (user?.user_name || authUser?.email || '?')
    .trim()
    .split(/\s+/)
    .map((name) => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          scrollContentContainerStyle,
        ]}
        scrollIndicatorInsets={scrollIndicatorInsets}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Typography
                variant="small"
                color="primary"
                style={styles.eyebrow}
              >
                THE BIGGER PICTURE
              </Typography>
              <Typography variant="heading1" style={styles.title}>
                Your progress
              </Typography>
            </View>
            <Pressable
              onPress={() => {
                triggerHaptic('selection');
                setShowAccount(!showAccount);
              }}
              style={[styles.avatar, showAccount && styles.avatarSelected]}
              accessibilityRole="button"
              accessibilityLabel="Account and study preferences"
              accessibilityState={{ expanded: showAccount }}
            >
              <Typography style={styles.avatarText}>{initials}</Typography>
              <View style={styles.settingsBadge}>
                <AppIcon
                  name="settings"
                  color={theme.colors.primary}
                  size={12}
                />
              </View>
            </Pressable>
          </View>
          <View style={styles.intro}>
            <Typography variant="body" color="muted" style={styles.introCopy}>
              Every review builds a little more.
            </Typography>
            {user ? (
              <Button
                title="Study"
                size="sm"
                variant="outline"
                onPress={() => {
                  triggerHaptic('impact');
                  navigation.navigate('Flashcard');
                }}
                icon={
                  <AppIcon
                    name="chevronRight"
                    size={17}
                    color={theme.colors.primary}
                  />
                }
                iconPosition="right"
              />
            ) : null}
          </View>

          {showAccount ? (
            <Card padding="lg" style={styles.accountCard}>
              <View style={styles.accountHeading}>
                <Typography variant="heading2">Your account</Typography>
                <Pressable
                  onPress={() => setShowAccount(false)}
                  style={styles.close}
                  accessibilityRole="button"
                  accessibilityLabel="Close account settings"
                >
                  <AppIcon
                    name="close"
                    size={20}
                    color={theme.colors.mutedForeground}
                  />
                </Pressable>
              </View>
              <View style={styles.accountIdentity}>
                <Typography variant="heading3">
                  {user?.user_name || 'Your study profile'}
                </Typography>
                <Typography variant="body" color="muted">
                  {authUser?.email || 'Email not available'}
                </Typography>
                {user?.subscription_date ? (
                  <Typography variant="small" color="muted">
                    Member since{' '}
                    {new Date(user.subscription_date).toLocaleDateString(
                      undefined,
                      { month: 'long', year: 'numeric' },
                    )}
                  </Typography>
                ) : null}
              </View>
              <Typography
                variant="small"
                color="primary"
                style={styles.eyebrow}
              >
                STUDY PREFERENCES
              </Typography>
              <View style={styles.detailRow}>
                <View style={styles.detailLabel}>
                  <AppIcon
                    name="crosshair"
                    size={18}
                    color={theme.colors.mutedForeground}
                  />
                  <Typography variant="body" color="muted">
                    Daily goal
                  </Typography>
                </View>
                <Typography variant="body">
                  {onboardingPreferences?.dailyGoal || 20} cards
                </Typography>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailLabel}>
                  <AppIcon
                    name="time"
                    size={18}
                    color={theme.colors.mutedForeground}
                  />
                  <Typography variant="body" color="muted">
                    Reminders
                  </Typography>
                </View>
                <Typography variant="body">
                  {onboardingPreferences?.reminderEnabled ? 'Enabled' : 'Off'}
                </Typography>
              </View>
              {userError ? (
                <Typography variant="caption" color="error">
                  {userError}
                </Typography>
              ) : null}
              <View style={styles.actions}>
                <View style={styles.action}>
                  <Button
                    title="Sign out"
                    variant="outline"
                    loading={isSigningOut}
                    disabled={isDeleting}
                    fullWidth
                    onPress={async () => {
                      setIsSigningOut(true);
                      await signOut();
                      setIsSigningOut(false);
                    }}
                  />
                </View>
                <View style={styles.action}>
                  <Button
                    title="Delete account"
                    variant="error"
                    loading={isDeleting}
                    disabled={isSigningOut}
                    fullWidth
                    onPress={() => {
                      showAlert(
                        'Delete account',
                        'This removes your Shuffle account and study profile. This cannot be undone.',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: async () => {
                              setIsDeleting(true);
                              const result = await deleteAccount();
                              if (!result.error) await signOut();
                              setIsDeleting(false);
                            },
                          },
                        ],
                      );
                    }}
                  />
                </View>
              </View>
            </Card>
          ) : null}

          {user ? <StatsDashboard /> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContainer: { paddingTop: theme.spacing.xxl },
  content: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.lg },
  headerCopy: { flex: 1, gap: theme.spacing.sm },
  eyebrow: { letterSpacing: 1.8, fontFamily: theme.fontFamily.medium },
  title: { fontSize: 36, lineHeight: 43, letterSpacing: -1.4 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSelected: { borderColor: theme.colors.primary },
  avatarText: {
    color: theme.colors.primary,
    fontSize: 17,
    fontFamily: theme.fontFamily.medium,
  },
  settingsBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  intro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
  introCopy: { flex: 1 },
  accountCard: { gap: theme.spacing.md, marginBottom: theme.spacing.xxl },
  accountHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  close: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountIdentity: { gap: theme.spacing.xs, paddingBottom: theme.spacing.lg },
  detailRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.sm,
  },
  detailLabel: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'center',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  action: { flex: 1, minWidth: 140 },
});

export default ProfileScreen;
