import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { AppIcon } from '@/components/ui/icons';
import type { Deck } from '@/interfaces';
import { theme } from '@/tokens/theme';
import { triggerHaptic } from '@/utils/haptics';
import { showAlert } from '@/utils/showAlert';
import type React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

export interface DeckCardProps {
  deck: Deck;
  isSubscribed: boolean;
  isSubscriptionPending?: boolean;
  onSubscriptionToggle: (deck: Deck, subscribe: boolean) => void;
  onPress: (deck: Deck) => void;
  testID?: string;
}

export const DeckCard: React.FC<DeckCardProps> = ({
  deck,
  isSubscribed,
  isSubscriptionPending = false,
  onSubscriptionToggle,
  onPress,
  testID,
}) => (
  <Card style={styles.card}>
    <Pressable
      onPress={() => {
        triggerHaptic('selection');
        onPress(deck);
      }}
      disabled={isSubscriptionPending}
      style={styles.content}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${deck.deck_name}, ${deck.subject}`}
      accessibilityState={{ disabled: isSubscriptionPending }}
      accessibilityHint={
        isSubscribed ? 'Study this deck' : 'Add this deck and study'
      }
    >
      <Typography variant="body" style={styles.title}>
        {deck.deck_name}
      </Typography>
      <Typography variant="caption" color="muted">
        {deck.subject}
        {deck.card_count === undefined ? '' : ` · ${deck.card_count} cards`}
      </Typography>
    </Pressable>
    <View style={styles.actions}>
      {isSubscribed ? (
        <Pressable
          style={styles.study}
          accessibilityRole="button"
          accessibilityLabel={`Study ${deck.deck_name}`}
          accessibilityState={{
            disabled: isSubscriptionPending,
            busy: isSubscriptionPending,
          }}
          disabled={isSubscriptionPending}
          onPress={() => {
            triggerHaptic('selection');
            onPress(deck);
          }}
        >
          {isSubscriptionPending ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Typography
              variant="caption"
              color="primary"
              style={styles.studyLabel}
            >
              Study
            </Typography>
          )}
        </Pressable>
      ) : (
        <Button
          title="Add"
          variant="outline"
          size="sm"
          onPress={() => {
            triggerHaptic('selection');
            onSubscriptionToggle(deck, true);
          }}
          accessibilityLabel={`Add ${deck.deck_name}`}
          loading={isSubscriptionPending}
          disabled={isSubscriptionPending}
        />
      )}
      {isSubscribed ? (
        <Pressable
          style={styles.remove}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${deck.deck_name}`}
          accessibilityState={{ disabled: isSubscriptionPending }}
          disabled={isSubscriptionPending}
          onPress={() =>
            showAlert(
              'Remove deck?',
              `Remove "${deck.deck_name}" from added decks?`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Remove',
                  style: 'destructive',
                  onPress: () => onSubscriptionToggle(deck, false),
                },
              ],
            )
          }
        >
          <AppIcon
            name="close"
            size={18}
            color={theme.colors.mutedForeground}
          />
        </Pressable>
      ) : null}
    </View>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: 18,
  },
  content: {
    flex: 1,
    minWidth: 132,
    minHeight: 44,
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  title: { fontFamily: theme.fontFamily.medium, fontSize: 16, lineHeight: 23 },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginLeft: 'auto',
  },
  study: {
    minWidth: 64,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.secondary,
  },
  studyLabel: { fontFamily: theme.fontFamily.semibold },
  remove: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
