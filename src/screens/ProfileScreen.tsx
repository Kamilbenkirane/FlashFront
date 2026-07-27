import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import UsersDropdown from '../components/UsersDropdown';
import { Button } from '../components/ui/Button/Button';
import { Card } from '../components/ui/Card/Card';
import { Typography } from '../components/ui/Typography/Typography';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import useSubscribedDecks from '../hooks/useSubscribedDecks';
import useUsers from '../hooks/useUsers';
import type { User } from '../interfaces';
import { triggerHaptic } from '../utils/haptics';

const ProfileScreen = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, setUser } = useUser();
  const users = useUsers();
  const decks = useSubscribedDecks(user);

  const [showSettings, setShowSettings] = useState(false);

  const handleUserSelect = (selectedUser: User | null = null) => {
    setUser(selectedUser);
    triggerHaptic('selection');
  };

  const handleToggleSettings = () => {
    setShowSettings(!showSettings);
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
        {user && (
          <Typography variant="caption" color="secondary">
            Subscribed to {decks?.length || 0} deck
            {decks?.length === 1 ? '' : 's'}
          </Typography>
        )}
      </Card>

      {/* Settings Section */}
      <Card variant="outlined" style={styles.cardSpacing}>
        <TouchableOpacity onPress={handleToggleSettings}>
          <Typography variant="heading3" style={styles.sectionTitle}>
            ⚙️ Settings {showSettings ? '▼' : '▶️'}
          </Typography>
        </TouchableOpacity>

        {showSettings && (
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
    </ScrollView>
  );
};

export default ProfileScreen;
