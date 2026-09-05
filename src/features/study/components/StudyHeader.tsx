import { GlassSurface } from '@/components/ui/Brand/GlassSurface';
import { ShuffleMark } from '@/components/ui/Brand/ShuffleMark';
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
  <View style={styles.header}>
    <View style={styles.row}>
      <View style={styles.brand}>
        <ShuffleMark size={34} />
        <Typography style={styles.wordmark}>Shuffle</Typography>
      </View>
      <View style={styles.actions}>
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
        {onOpenChat || onOpenSettings ? (
          <GlassSurface style={styles.actions}>
            {onOpenChat ? (
              <Pressable
                onPress={onOpenChat}
                accessibilityRole="button"
                accessibilityLabel="Open study assistant"
                style={styles.iconButton}
              >
                <AppIcon
                  name="sparkles"
                  size={20}
                  color={theme.colors.primary}
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
                  size={19}
                  color={theme.colors.foreground}
                />
              </Pressable>
            ) : null}
          </GlassSurface>
        ) : (
          <Typography variant="small" color="muted" style={styles.eyebrow}>
            MAKE IT STICK
          </Typography>
        )}
      </View>
    </View>
    {isActive ? (
      <View style={styles.session}>
        <View style={styles.sessionLabel}>
          <Typography
            variant="caption"
            color="muted"
            numberOfLines={1}
            style={{ flex: 1 }}
          >
            {title}
          </Typography>
          <Typography variant="caption" color="primary">
            {completedCards} / {totalCards} reviews
          </Typography>
        </View>
        <ProgressBar
          progress={completedCards}
          total={totalCards}
          showLabel={false}
          size="sm"
        />
      </View>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  header: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  wordmark: {
    fontSize: 25,
    lineHeight: 32,
    fontFamily: theme.fontFamily.medium,
    letterSpacing: -1.1,
  },
  eyebrow: { letterSpacing: 1.5, fontSize: 10 },
  actions: { flexDirection: 'row', alignItems: 'center' },
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
    marginRight: 6,
  },
  session: { maxWidth: 640, width: '100%', alignSelf: 'center', gap: 10 },
  sessionLabel: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
