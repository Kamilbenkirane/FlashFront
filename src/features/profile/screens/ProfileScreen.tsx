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
import type React from 'react';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ProfileScreenProps = AppTabScreenProps<'Profile'>;

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { authUser, signOut } = useAuth();
  const { user, onboardingPreferences, deleteAccount } = useUser();
  const {
    scrollContentContainerStyle,
    scrollIndicatorInsets,
    viewportOffsetStyle,
  } = useTabScreenSpacing();

  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const getUserInitials = () => {
    if (!user?.user_name) {
      return '?';
    }

    return user.user_name
      .split(' ')
      .map((name) => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <ScrollView
        style={[styles.container, viewportOffsetStyle]}
        contentContainerStyle={[
          styles.scrollContainer,
          scrollContentContainerStyle,
        ]}
        scrollIndicatorInsets={scrollIndicatorInsets}
      >
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Typography style={styles.avatarText}>
              {getUserInitials()}
            </Typography>
          </View>
          <Typography variant="heading2">
            {user?.user_name || 'Your profile'}
          </Typography>
          {authUser?.email ? (
            <Typography variant="caption" color="muted">
              {authUser.email}
            </Typography>
          ) : null}
          {user?.subscription_date ? (
            <Typography variant="caption" color="muted">
              Member since{' '}
              {new Date(user.subscription_date).toLocaleDateString()}
            </Typography>
          ) : null}
        </View>

        <Card variant="raised" style={styles.cardSpacing}>
          <View style={styles.sectionHeader}>
            <AppIcon
              color={theme.colors.primary}
              name="person"
              size={22}
              style={{ marginRight: theme.spacing.sm }}
            />
            <Typography variant="heading3">Account</Typography>
          </View>
          <View style={styles.detailRow}>
            <Typography variant="caption" color="muted">
              Study profile
            </Typography>
            <Typography variant="body">
              {user?.user_name || 'Not available'}
            </Typography>
          </View>
          <View style={styles.detailRow}>
            <Typography variant="caption" color="muted">
              Email
            </Typography>
            <Typography variant="body">
              {authUser?.email || 'Not available'}
            </Typography>
          </View>
        </Card>

        <Card variant="default" style={styles.cardSpacing}>
          <View style={styles.sectionHeader}>
            <AppIcon
              color={theme.colors.primary}
              name="settings"
              size={22}
              style={{ marginRight: theme.spacing.sm }}
            />
            <Typography variant="heading3">Study preferences</Typography>
          </View>

          <View style={styles.detailRow}>
            <Typography variant="caption" color="muted">
              Daily goal
            </Typography>
            <Typography variant="body">
              {onboardingPreferences?.dailyGoal || 20} cards / day
            </Typography>
          </View>
          <View style={styles.detailRow}>
            <Typography variant="caption" color="muted">
              Reminder preference
            </Typography>
            <Typography variant="body">
              {onboardingPreferences?.reminderEnabled ? 'Enabled' : 'Off'}
            </Typography>
          </View>
        </Card>

        {user ? (
          <Card variant="default" style={styles.cardSpacing}>
            <Pressable
              onPress={() => {
                setShowAnalytics(!showAnalytics);
                triggerHaptic('impact');
              }}
              accessibilityRole="button"
              accessibilityLabel="Toggle detailed analytics"
              accessibilityState={{ expanded: showAnalytics }}
            >
              <View style={styles.sectionHeader}>
                <AppIcon
                  color={theme.colors.primary}
                  name="chart"
                  size={22}
                  style={{ marginRight: theme.spacing.sm }}
                />
                <Typography variant="heading3" style={{ flex: 1 }}>
                  Detailed Analytics
                </Typography>
                <AppIcon
                  color={theme.colors.mutedForeground}
                  name={showAnalytics ? 'chevronDown' : 'chevronRight'}
                  size={20}
                />
              </View>
            </Pressable>

            {showAnalytics ? <StatsDashboard /> : null}
          </Card>
        ) : null}

        <Card variant="default" style={styles.cardSpacing}>
          <View style={styles.sectionHeader}>
            <AppIcon
              color={theme.colors.primary}
              name="information"
              size={22}
              style={{ marginRight: theme.spacing.sm }}
            />
            <Typography variant="heading3">Account actions</Typography>
          </View>

          <View style={styles.actions}>
            <Button
              title="Sign out"
              variant="outline"
              onPress={async () => {
                setIsSigningOut(true);
                await signOut();
                setIsSigningOut(false);
              }}
              loading={isSigningOut}
              fullWidth
            />
            <Button
              title="Delete account"
              variant="error"
              onPress={() => {
                Alert.alert(
                  'Delete account',
                  'This removes your FlashFront account and study profile. This cannot be undone.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: async () => {
                        setIsDeleting(true);
                        const result = await deleteAccount();
                        if (!result.error) {
                          await signOut();
                        }
                        setIsDeleting(false);
                      },
                    },
                  ],
                );
              }}
              loading={isDeleting}
              fullWidth
            />
          </View>
        </Card>

        {user && (
          <View style={{ marginTop: theme.spacing.lg }}>
            <Button
              title="Start Quick Study Session"
              onPress={() => {
                triggerHaptic('impact');
                navigation.navigate('Flashcard');
              }}
              variant="primary"
              fullWidth
              className="mb-4"
              icon={
                <AppIcon
                  color={theme.colors.primaryForeground}
                  name="flash"
                  size={20}
                />
              }
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },
  avatarText: {
    fontSize: 32,
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.semibold,
  },
  cardSpacing: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actions: {
    gap: theme.spacing.md,
  },
});

export default ProfileScreen;
