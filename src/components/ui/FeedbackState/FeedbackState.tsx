import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { AppIcon, type AppIconName } from '@/components/ui/icons';
import { theme } from '@/tokens/theme';
import type React from 'react';
import { StyleSheet, View } from 'react-native';

export interface FeedbackStateProps {
  title: string;
  description?: string;
  icon?: AppIconName;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
}

export const FeedbackState: React.FC<FeedbackStateProps> = ({
  title,
  description,
  icon = 'information',
  actionLabel,
  onAction,
  testID,
}) => {
  return (
    <View style={styles.container} testID={testID}>
      <Card variant="default" padding="lg" style={styles.card}>
        <View style={styles.iconWrap}>
          <AppIcon color={theme.colors.primary} name={icon} size={28} />
        </View>
        <Typography variant="heading3" style={styles.title}>
          {title}
        </Typography>
        {description ? (
          <Typography variant="body" color="muted" style={styles.description}>
            {description}
          </Typography>
        ) : null}
        {actionLabel && onAction ? (
          <Button
            title={actionLabel}
            onPress={onAction}
            variant="primary"
            fullWidth
          />
        ) : null}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
  },
  card: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    gap: theme.spacing.md,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryLight,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
  },
});
