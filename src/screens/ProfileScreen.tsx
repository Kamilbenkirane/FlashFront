import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import UsersDropdown from '../components/UsersDropdown';
import { AchievementGallery } from '../components/ui/AchievementGallery';
import { AchievementModal } from '../components/ui/AchievementModal';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StatsDashboard } from '../components/ui/StatsDashboard';
import { Typography } from '../components/ui/Typography';
import {
  type Achievement,
  useAchievements,
} from '../context/AchievementContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import useSubscribedDecks from '../hooks/useSubscribedDecks';
import useUsers from '../hooks/useUsers';
import type { User } from '../interfaces';
import { triggerHaptic } from '../utils/haptics';

interface UserStats {
  totalStudySessions: number;
  currentStreak: number;
  longestStreak: number;
  averageAccuracy: number;
  totalCardsStudied: number;
  timeSpentStudying: number; // in minutes
  favoriteSubject: string;
}

const ProfileScreen = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, setUser } = useUser();
  const { achievements, stats, checkAchievements } = useAchievements();
  const analytics = useAnalytics();
  const users = useUsers();
  const decks = useSubscribedDecks(user);

  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  const handleUserSelect = (selectedUser: User | null = null) => {
    setUser(selectedUser);
    triggerHaptic('selection');
  };

  const handleToggleSettings = () => {
    setShowSettings(!showSettings);
    triggerHaptic('impact');
  };

  const handleToggleAnalytics = () => {
    setShowAnalytics(!showAnalytics);
    triggerHaptic('impact');
  };

  const handleThemeToggle = () => {
    toggleTheme();
    triggerHaptic('impact');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.neutral[25],
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
      backgroundColor: theme.colors.primary[500],
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    avatarText: {
      fontSize: 32,
      color: '#ffffff',
      fontWeight: 'bold',
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.lg,
    },
    statCard: {
      width: '48%',
      marginBottom: theme.spacing.md,
    },
    statNumber: {
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    statLabel: {
      textAlign: 'center',
    },
    achievementCard: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    achievementIcon: {
      fontSize: 24,
      marginRight: theme.spacing.md,
    },
    achievementContent: {
      flex: 1,
    },
    achievementProgress: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.xs,
    },
    progressBar: {
      flex: 1,
      height: 4,
      backgroundColor: theme.colors.neutral[200],
      borderRadius: 2,
      marginRight: theme.spacing.sm,
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary[500],
      borderRadius: 2,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral[200],
    },
    sectionTitle: {
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.md,
    },
    cardSpacing: {
      marginBottom: theme.spacing.lg,
    },
  });

  const getUserInitials = () => {
    if (!user?.user_name) return '👤';
    return user.user_name
      .split(' ')
      .map((name) => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStatCard = (
    title: string,
    value: string | number,
    subtitle?: string,
  ) => (
    <Card variant="elevated" style={styles.statCard}>
      <Typography variant="heading2" style={styles.statNumber} color="primary">
        {value}
      </Typography>
      <Typography variant="caption" style={styles.statLabel} color="secondary">
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="small" style={styles.statLabel}>
          {subtitle}
        </Typography>
      )}
    </Card>
  );

  const handleAchievementPress = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShowAchievementModal(true);
    triggerHaptic('selection');
  };

  const handleCloseAchievementModal = () => {
    setShowAchievementModal(false);
    setSelectedAchievement(null);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Typography style={styles.avatarText}>{getUserInitials()}</Typography>
        </View>
        <Typography variant="heading2" color="primary">
          {user?.user_name || 'Select User'}
        </Typography>
        {user?.subscription_date && (
          <Typography variant="caption" color="secondary">
            Member since {new Date(user.subscription_date).toLocaleDateString()}
          </Typography>
        )}
      </View>

      {/* User Selection */}
      <Card variant="outlined" style={styles.cardSpacing}>
        <Typography variant="heading3" style={styles.sectionTitle}>
          👤 Profile
        </Typography>
        <UsersDropdown users={users} onSelectUser={handleUserSelect} />
      </Card>

      {user && (
        <>
          {/* Statistics Dashboard */}
          <Card variant="default" style={styles.cardSpacing}>
            <Typography variant="heading3" style={styles.sectionTitle}>
              📊 Study Statistics
            </Typography>
            <View style={styles.statsGrid}>
              {renderStatCard('Study Sessions', stats.totalStudySessions)}
              {renderStatCard('Current Streak', stats.currentStreak, '🔥 days')}
              {renderStatCard('Cards Studied', stats.totalCardsStudied)}
              {renderStatCard('Accuracy', `${stats.averageAccuracy}%`)}
              {renderStatCard('Study Time', `${stats.totalStudyTime}m`)}
              {renderStatCard('Subscribed Decks', decks?.length || 0)}
            </View>
          </Card>

          {/* Achievements Section */}
          <Card variant="default" style={styles.cardSpacing}>
            <AchievementGallery
              onAchievementPress={handleAchievementPress}
              showFilters={false}
              compactView={true}
            />
          </Card>

          {/* Analytics Section */}
          <Card variant="outlined" style={styles.cardSpacing}>
            <TouchableOpacity onPress={handleToggleAnalytics}>
              <Typography variant="heading3" style={styles.sectionTitle}>
                📊 Detailed Analytics {showAnalytics ? '▼' : '▶️'}
              </Typography>
            </TouchableOpacity>

            {showAnalytics && user && (
              <StatsDashboard userId={user.user_id.toString()} />
            )}
          </Card>
        </>
      )}

      {/* Settings Section */}
      <Card variant="outlined" style={styles.cardSpacing}>
        <TouchableOpacity onPress={handleToggleSettings}>
          <Typography variant="heading3" style={styles.sectionTitle}>
            ⚙️ Settings {showSettings ? '▼' : '▶️'}
          </Typography>
        </TouchableOpacity>

        {showSettings && (
          <>
            <View style={styles.settingRow}>
              <Typography variant="body">Dark Mode</Typography>
              <Switch
                value={isDark}
                onValueChange={handleThemeToggle}
                trackColor={{
                  false: theme.colors.neutral[200],
                  true: theme.colors.primary[500],
                }}
                thumbColor={isDark ? '#ffffff' : theme.colors.neutral[100]}
              />
            </View>

            <View style={styles.settingRow}>
              <Typography variant="body">Notifications</Typography>
              <Switch
                value={false}
                onValueChange={() => triggerHaptic('impact')}
                trackColor={{
                  false: theme.colors.neutral[200],
                  true: theme.colors.primary[500],
                }}
              />
            </View>

            <View style={styles.settingRow}>
              <Typography variant="body">Study Reminders</Typography>
              <Switch
                value={true}
                onValueChange={() => triggerHaptic('impact')}
                trackColor={{
                  false: theme.colors.neutral[200],
                  true: theme.colors.primary[500],
                }}
              />
            </View>
          </>
        )}
      </Card>

      {/* Action Buttons */}
      {user && (
        <View style={{ marginTop: theme.spacing.lg }}>
          <Button
            title="🚀 Start Quick Study Session"
            onPress={() => triggerHaptic('impact')}
            variant="primary"
            fullWidth
            className="mb-4"
          />
        </View>
      )}

      {/* Achievement Modal */}
      {selectedAchievement && (
        <AchievementModal
          visible={showAchievementModal}
          title={selectedAchievement.title}
          description={selectedAchievement.description}
          icon={selectedAchievement.icon}
          onClose={handleCloseAchievementModal}
        />
      )}
    </ScrollView>
  );
};

export default ProfileScreen;
