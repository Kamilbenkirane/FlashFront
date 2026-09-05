import { ProgressBar } from '@/components/ui/ProgressBar';
import { Typography } from '@/components/ui/Typography';
import { AppIcon } from '@/components/ui/icons';
import { theme } from '@/tokens/theme';
import type React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

interface StudyHeaderProps {
  title: string;
  completedCards: number;
  totalCards: number;
  onOpenChat?: () => void;
  onOpenSettings?: () => void;
}

export const StudyHeader: React.FC<StudyHeaderProps> = ({
  title,
  completedCards,
  totalCards,
  onOpenChat,
  onOpenSettings,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Typography variant="heading2" style={styles.headerTitle}>
          {title}
        </Typography>
        <View style={styles.actions}>
          {onOpenChat ? (
            <Pressable
              onPress={onOpenChat}
              style={styles.actionButton}
              accessibilityRole="button"
              accessibilityLabel="Open study chat"
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <AppIcon
                color={theme.colors.mutedForeground}
                name="sparkles"
                size={18}
                strokeWidth={1.75}
              />
            </Pressable>
          ) : null}
          {onOpenSettings ? (
            <Pressable
              onPress={onOpenSettings}
              style={styles.actionButton}
              accessibilityRole="button"
              accessibilityLabel="Open study settings"
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <AppIcon
                color={theme.colors.mutedForeground}
                name="settings"
                size={18}
                strokeWidth={1.75}
              />
            </Pressable>
          ) : null}
        </View>
      </View>

      {totalCards > 0 ? (
        <ProgressBar
          progress={completedCards}
          total={totalCards}
          showLabel={true}
          showPercentage={true}
          color="primary"
          size="lg"
          className="mt-2"
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: 'transparent',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    textAlign: 'left',
    color: theme.colors.foreground,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginLeft: theme.spacing.md,
  },
  actionButton: {
    minWidth: 40,
    minHeight: 40,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
});
