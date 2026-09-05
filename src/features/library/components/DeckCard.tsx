import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { AppIcon } from '@/components/ui/icons';
import type { Deck } from '@/interfaces';
import { theme } from '@/tokens/theme';
import { triggerHaptic } from '@/utils/haptics';
import type React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

export interface DeckCardProps {
  deck: Deck;
  isSubscribed: boolean;
  isSubscriptionPending?: boolean;
  onSubscriptionToggle: (deck: Deck, subscribe: boolean) => void;
  onPress: (deck: Deck) => void;
  testID?: string;
  className?: string;
}

export const DeckCard: React.FC<DeckCardProps> = ({
  deck,
  isSubscribed,
  isSubscriptionPending = false,
  onSubscriptionToggle,
  onPress,
  className = '',
  testID,
}) => {
  const handleSubscriptionToggle = () => {
    triggerHaptic('impact');
    onSubscriptionToggle(deck, !isSubscribed);
  };

  const handlePress = () => {
    triggerHaptic('impact');
    onPress(deck);
  };

  const metaItems = [
    deck.author,
    deck.card_count ? `${deck.card_count} cards` : null,
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <Pressable
      onPress={handlePress}
      className={className}
      style={styles.container}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${deck.deck_name} deck`}
      accessibilityHint={
        isSubscribed
          ? 'Opens this deck and starts studying'
          : 'Opens deck details. Subscribe first to study it.'
      }
    >
      <Card variant="default" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeading}>
            <View style={styles.subjectChip}>
              <Typography
                variant="caption"
                color="primary"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.subjectChipLabel}
              >
                {deck.subject}
              </Typography>
            </View>
          </View>
          <View style={styles.statusSlot}>
            <View
              style={[
                styles.statusIcon,
                isSubscribed ? styles.statusIconActive : styles.statusIconIdle,
              ]}
              accessible={false}
              importantForAccessibility="no"
            >
              <AppIcon
                color={
                  isSubscribed
                    ? theme.colors.success.DEFAULT
                    : theme.colors.primary
                }
                name={isSubscribed ? 'check' : 'plus'}
                size={16}
                strokeWidth={2.35}
              />
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Typography variant="heading3" style={styles.title} numberOfLines={2}>
            {deck.deck_name}
          </Typography>

          <View style={styles.meta}>
            <Typography variant="caption" color="muted" numberOfLines={1}>
              {metaItems || 'Ready to study'}
            </Typography>
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title={isSubscribed ? 'Unsubscribe' : 'Subscribe'}
            variant={isSubscribed ? 'outline' : 'primary'}
            size="sm"
            onPress={handleSubscriptionToggle}
            loading={isSubscriptionPending}
            disabled={isSubscriptionPending}
            fullWidth
          />
        </View>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    minHeight: 188,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  headerLeading: {
    flex: 1,
    minWidth: 0,
  },
  subjectChip: {
    maxWidth: '100%',
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryLight,
  },
  subjectChipLabel: {
    flexShrink: 1,
  },
  statusSlot: {
    width: 44,
    minWidth: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statusIcon: {
    width: 30,
    height: 30,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  statusIconActive: {
    backgroundColor: theme.colors.success.light,
    borderColor: theme.colors.success.light,
  },
  statusIconIdle: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.border,
  },
  content: {
    flex: 1,
    marginBottom: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.sm,
  },
  meta: {
    marginBottom: theme.spacing.md,
  },
  footer: {
    marginTop: theme.spacing.sm,
  },
});
