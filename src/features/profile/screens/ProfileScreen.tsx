import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
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

const ProfileScreen: React.FC = () => {
  const { authUser, signOut } = useAuth();
  const { user, userError, onboardingPreferences, deleteAccount } = useUser();
  const { scrollContentContainerStyle, scrollIndicatorInsets } =
    useTabScreenSpacing();
  const [showAccount, setShowAccount] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

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
            <Typography variant="heading1" style={styles.title}>
              {showAccount ? 'Account' : 'Progress'}
            </Typography>
            <Pressable
              onPress={() => {
                triggerHaptic('selection');
                setShowAccount(!showAccount);
              }}
              style={styles.accountButton}
              accessibilityRole="button"
              accessibilityLabel={showAccount ? 'Done' : 'Account'}
              accessibilityState={{ expanded: showAccount }}
              aria-expanded={showAccount}
            >
              <Typography variant="button" color="primary">
                {showAccount ? 'Done' : 'Account'}
              </Typography>
            </Pressable>
          </View>

          {showAccount ? (
            <View style={styles.account}>
              <Card padding="lg" style={styles.accountCard}>
                <View style={styles.identity}>
                  <Typography variant="heading3">
                    {user?.user_name || 'Account'}
                  </Typography>
                  <Typography variant="body" color="muted">
                    {authUser?.email || 'Email unavailable'}
                  </Typography>
                  {user?.subscription_date ? (
                    <Typography variant="caption" color="muted">
                      Member since{' '}
                      {new Date(user.subscription_date).toLocaleDateString(
                        undefined,
                        { month: 'long', year: 'numeric' },
                      )}
                    </Typography>
                  ) : null}
                </View>
                <View style={styles.preferences}>
                  <Typography variant="heading3">Study preferences</Typography>
                  <View style={styles.detailRow}>
                    <Typography variant="body" color="muted">
                      Daily goal
                    </Typography>
                    <Typography variant="body">
                      {onboardingPreferences?.dailyGoal || 20} cards
                    </Typography>
                  </View>
                  <View style={styles.detailRow}>
                    <Typography variant="body" color="muted">
                      Reminders
                    </Typography>
                    <Typography variant="body">
                      {onboardingPreferences?.reminderEnabled ? 'On' : 'Off'}
                    </Typography>
                  </View>
                </View>
              </Card>
              {userError ? (
                <Typography variant="caption" color="error">
                  {userError}
                </Typography>
              ) : null}
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
              <Button
                title="Delete account"
                variant="ghost"
                loading={isDeleting}
                disabled={isSigningOut}
                fullWidth
                onPress={() => {
                  showAlert(
                    'Delete account?',
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
          ) : user ? (
            <StatsDashboard />
          ) : userError ? (
            <Typography variant="body" color="error">
              {userError}
            </Typography>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContainer: { paddingTop: theme.spacing.xl },
  content: {
    width: '100%',
    maxWidth: 840,
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  title: { flex: 1 },
  accountButton: {
    minHeight: 44,
    minWidth: 64,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  account: { gap: theme.spacing.md },
  accountCard: { gap: theme.spacing.xl },
  identity: { gap: theme.spacing.xs },
  preferences: {
    gap: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    minHeight: 32,
  },
});

export default ProfileScreen;
