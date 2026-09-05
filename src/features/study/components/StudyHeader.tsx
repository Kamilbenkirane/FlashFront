import { ProgressBar } from '@/components/ui/ProgressBar';
import { Typography } from '@/components/ui/Typography';
import { AppIcon } from '@/components/ui/icons';
import { theme } from '@/tokens/theme';
import { Pressable, StyleSheet, View } from 'react-native';

interface StudyHeaderProps {
  title: string;
  completedCards: number;
  totalCards: number;
  isActive?: boolean;
  onOpenChat?: () => void;
  onOpenSettings?: () => void;
  onFinish?: () => void;
}

export const StudyHeader = ({
  title,
  completedCards,
  totalCards,
  isActive,
  onOpenChat,
  onOpenSettings,
  onFinish,
}: StudyHeaderProps) => (
  <View style={[styles.header, isActive && styles.activeHeader]}>
    <View style={styles.row}>
      <View style={styles.title}>
        <Typography
          variant={isActive ? 'heading3' : 'heading1'}
          accessibilityRole="header"
          numberOfLines={1}
        >
          {isActive ? title : 'Study'}
        </Typography>
        {isActive ? (
          <Typography variant="small" color="muted">
            {completedCards} / {totalCards} reviews
          </Typography>
        ) : null}
      </View>
      {onFinish ? (
        <Pressable
          onPress={onFinish}
          accessibilityRole="button"
          accessibilityLabel="Finish this session"
          style={styles.finish}
        >
          <Typography variant="caption" color="muted">
            Finish
          </Typography>
        </Pressable>
      ) : null}
      {onOpenChat ? (
        <Pressable
          onPress={onOpenChat}
          accessibilityRole="button"
          accessibilityLabel="Open study assistant"
          style={styles.iconButton}
        >
          <AppIcon
            name="messageCircle"
            size={20}
            color={theme.colors.mutedForeground}
          />
        </Pressable>
      ) : null}
      {onOpenSettings ? (
        <Pressable
          onPress={onOpenSettings}
          accessibilityRole="button"
          accessibilityLabel="Open session settings"
          style={styles.iconButton}
        >
          <AppIcon
            name="settings"
            size={20}
            color={theme.colors.mutedForeground}
          />
        </Pressable>
      ) : null}
    </View>
    {isActive ? (
      <ProgressBar
        progress={completedCards}
        total={totalCards}
        showLabel={false}
        size="sm"
      />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  header: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 16,
  },
  activeHeader: { maxWidth: 688 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  title: { flex: 1, minWidth: 0, gap: 4 },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finish: {
    minWidth: 48,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
