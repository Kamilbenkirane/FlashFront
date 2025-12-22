import type React from 'react';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  type Achievement,
  useAchievements,
} from '../../../context/AchievementContext';
import { useTheme } from '../../../context/ThemeContext';
import { triggerHaptic } from '../../../utils/haptics';
import { AchievementBadge } from '../AchievementBadge';
import { Typography } from '../Typography';

type AchievementCategory =
  | 'all'
  | 'study'
  | 'progress'
  | 'streak'
  | 'mastery'
  | 'social';

export interface AchievementGalleryProps {
  onAchievementPress?: (achievement: Achievement) => void;
  showFilters?: boolean;
  compactView?: boolean;
}

export const AchievementGallery: React.FC<AchievementGalleryProps> = ({
  onAchievementPress,
  showFilters = true,
  compactView = false,
}) => {
  const { theme } = useTheme();
  const { achievements, getAchievementProgress } = useAchievements();
  const [selectedCategory, setSelectedCategory] =
    useState<AchievementCategory>('all');

  const categories = [
    { id: 'all' as const, label: 'All', icon: '🏆' },
    { id: 'study' as const, label: 'Study', icon: '📚' },
    { id: 'progress' as const, label: 'Progress', icon: '📈' },
    { id: 'streak' as const, label: 'Streak', icon: '🔥' },
    { id: 'mastery' as const, label: 'Mastery', icon: '🎯' },
    { id: 'social' as const, label: 'Social', icon: '👥' },
  ];

  const filteredAchievements = achievements.filter(
    (achievement) =>
      selectedCategory === 'all' || achievement.category === selectedCategory,
  );

  const completedCount = achievements.filter((a) => a.isCompleted).length;
  const totalCount = achievements.length;
  const progressPercent =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleCategoryPress = (category: AchievementCategory) => {
    setSelectedCategory(category);
    triggerHaptic('selection');
  };

  const handleAchievementPress = (achievement: Achievement) => {
    if (onAchievementPress) {
      onAchievementPress(achievement);
    }
  };

  const getAchievementStatus = (achievement: Achievement) => {
    if (achievement.isCompleted) return 'completed';
    if (achievement.currentValue > 0) return 'in_progress';
    return 'locked';
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      marginBottom: theme.spacing.lg,
    },
    progressSection: {
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    progressText: {
      marginBottom: theme.spacing.xs,
    },
    progressBar: {
      width: '100%',
      height: 8,
      backgroundColor: theme.colors.neutral[200],
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary[500],
      borderRadius: 4,
    },
    filtersContainer: {
      marginBottom: theme.spacing.lg,
    },
    filtersScrollView: {
      flexGrow: 0,
    },
    categoryFilter: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.neutral[100],
      marginRight: theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
    },
    categoryFilterActive: {
      backgroundColor: theme.colors.primary[500],
    },
    categoryIcon: {
      marginRight: theme.spacing.xs,
    },
    categoryText: {
      fontSize: 14,
    },
    categoryTextActive: {
      color: '#ffffff',
    },
    achievementsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.xs,
    },
    achievementWrapper: {
      width: compactView ? '22%' : '31%',
      marginBottom: theme.spacing.md,
    },
    emptyState: {
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: theme.spacing.md,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.sm,
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      marginBottom: theme.spacing.xs,
    },
  });

  const renderCategoryFilter = (category: (typeof categories)[0]) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryFilter,
        selectedCategory === category.id && styles.categoryFilterActive,
      ]}
      onPress={() => handleCategoryPress(category.id)}
    >
      <Typography style={styles.categoryIcon}>{category.icon}</Typography>
      <Typography
        variant="caption"
        style={[
          styles.categoryText,
          selectedCategory === category.id && styles.categoryTextActive,
        ]}
      >
        {category.label}
      </Typography>
    </TouchableOpacity>
  );

  const renderAchievement = (achievement: Achievement) => (
    <View key={achievement.id} style={styles.achievementWrapper}>
      <AchievementBadge
        title={achievement.title}
        description={achievement.description}
        icon={achievement.icon}
        status={getAchievementStatus(achievement)}
        progress={achievement.currentValue}
        maxProgress={achievement.targetValue}
        size={compactView ? 'sm' : 'md'}
        onPress={() => handleAchievementPress(achievement)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {!compactView && (
        <View style={styles.header}>
          <View style={styles.progressSection}>
            <Typography
              variant="heading3"
              style={styles.progressText}
              color="primary"
            >
              🏆 Achievement Progress
            </Typography>
            <Typography
              variant="caption"
              style={styles.progressText}
              color="secondary"
            >
              {completedCount} of {totalCount} achievements unlocked
            </Typography>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${progressPercent}%` }]}
              />
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Typography
                  variant="heading3"
                  style={styles.statNumber}
                  color="primary"
                >
                  {completedCount}
                </Typography>
                <Typography variant="caption" color="secondary">
                  Unlocked
                </Typography>
              </View>
              <View style={styles.statItem}>
                <Typography
                  variant="heading3"
                  style={styles.statNumber}
                  color="primary"
                >
                  {Math.round(progressPercent)}%
                </Typography>
                <Typography variant="caption" color="secondary">
                  Complete
                </Typography>
              </View>
              <View style={styles.statItem}>
                <Typography
                  variant="heading3"
                  style={styles.statNumber}
                  color="primary"
                >
                  {totalCount - completedCount}
                </Typography>
                <Typography variant="caption" color="secondary">
                  Remaining
                </Typography>
              </View>
            </View>
          </View>
        </View>
      )}

      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScrollView}
          >
            {categories.map(renderCategoryFilter)}
          </ScrollView>
        </View>
      )}

      <View>
        {filteredAchievements.length > 0 ? (
          <View style={styles.achievementsGrid}>
            {filteredAchievements.map(renderAchievement)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Typography style={styles.emptyIcon}>🎯</Typography>
            <Typography variant="heading3" color="secondary">
              No achievements found
            </Typography>
            <Typography
              variant="body"
              color="secondary"
              style={{ textAlign: 'center' }}
            >
              Start studying to unlock achievements in this category!
            </Typography>
          </View>
        )}
      </View>
    </View>
  );
};
