import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { AppIcon } from '@/components/ui/icons';
import type { Deck } from '@/interfaces';
import { theme } from '@/tokens/theme';
import { triggerHaptic } from '@/utils/haptics';
import type React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path } from 'react-native-svg';

export interface DeckCardProps {
  deck: Deck;
  isSubscribed: boolean;
  isSubscriptionPending?: boolean;
  onSubscriptionToggle: (deck: Deck, subscribe: boolean) => void;
  onPress: (deck: Deck) => void;
  testID?: string;
  className?: string;
}

const DeckArtwork = ({ variant }: { variant: number }) => (
  <Svg width="100%" height="100%" viewBox="0 0 240 128" accessible={false}>
    <G stroke={theme.colors.primary} fill="none" strokeWidth={0.8}>
      {variant === 0 ? (
        <>
          <Circle cx={120} cy={68} r={35} opacity={0.75} />
          <Circle cx={120} cy={68} r={55} opacity={0.18} />
          <Ellipse
            cx={120}
            cy={68}
            rx={86}
            ry={22}
            rotation={-28}
            origin="120, 68"
            opacity={0.75}
          />
          <Ellipse cx={120} cy={68} rx={22} ry={35} opacity={0.35} />
          <Circle
            cx={182}
            cy={36}
            r={4}
            fill={theme.colors.primary}
            stroke="none"
          />
        </>
      ) : variant === 1 ? (
        <>
          <Path
            d="M 66 117 V 67 A 54 54 0 0 1 174 67 V 117 M 79 117 V 67 A 41 41 0 0 1 161 67 V 117 M 92 117 V 67 A 28 28 0 0 1 148 67 V 117"
            opacity={0.6}
          />
          <Line x1={46} x2={194} y1={117} y2={117} opacity={0.25} />
          <Path
            d="M120 43 L125 62 L144 67 L125 72 L120 91 L115 72 L96 67 L115 62 Z"
            fill={theme.colors.primary}
            fillOpacity={0.12}
          />
        </>
      ) : (
        <>
          <Path
            d="M52 85 L88 35 L132 64 L185 28 L168 99 L132 64 L88 35"
            opacity={0.65}
          />
          <Circle cx={120} cy={66} r={55} strokeDasharray="2 7" opacity={0.3} />
          <G fill={theme.colors.primary} stroke="none">
            <Circle cx={52} cy={85} r={3} />
            <Circle cx={88} cy={35} r={4} />
            <Circle cx={132} cy={64} r={5} />
            <Circle cx={185} cy={28} r={3} />
            <Circle cx={168} cy={99} r={3} />
          </G>
        </>
      )}
      <Path d="M31 28 H39 M35 24 V32 M204 91 H212 M208 87 V95" opacity={0.45} />
    </G>
  </Svg>
);

export const DeckCard: React.FC<DeckCardProps> = ({
  deck,
  isSubscribed,
  isSubscriptionPending = false,
  onSubscriptionToggle,
  onPress,
  className = '',
  testID,
}) => (
  <Card padding="none" className={className} style={styles.card}>
    <Pressable
      onPress={() => {
        triggerHaptic('impact');
        onPress(deck);
      }}
      disabled={isSubscriptionPending}
      style={({ pressed }) => [styles.main, pressed && styles.pressed]}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${deck.deck_name}, ${deck.subject} deck`}
      accessibilityState={{ disabled: isSubscriptionPending }}
      accessibilityHint={
        isSubscribed
          ? 'Starts studying this deck'
          : 'Offers to add this deck and start studying'
      }
    >
      <View style={styles.artwork} pointerEvents="none">
        <DeckArtwork variant={Number(deck.deck_id) % 3} />
      </View>
      <View style={styles.content}>
        <Typography
          variant="small"
          color="primary"
          style={styles.subject}
          numberOfLines={1}
        >
          {deck.subject}
        </Typography>
        <Typography variant="heading3" style={styles.title} numberOfLines={2}>
          {deck.deck_name}
        </Typography>
        {deck.author ? (
          <Typography variant="small" color="muted" numberOfLines={1}>
            {deck.author}
          </Typography>
        ) : null}
        <View style={styles.meta}>
          <Typography variant="caption" color="muted">
            {deck.card_count === undefined
              ? 'Explore deck'
              : `${deck.card_count} cards`}
          </Typography>
          <AppIcon name="chevronRight" size={17} color={theme.colors.primary} />
        </View>
      </View>
    </Pressable>
    <View style={styles.footer}>
      <Button
        title={isSubscribed ? 'Study deck' : 'Add deck'}
        variant="primary"
        size="sm"
        onPress={() => {
          triggerHaptic('impact');
          if (isSubscribed) onPress(deck);
          else onSubscriptionToggle(deck, true);
        }}
        accessibilityLabel={
          isSubscribed
            ? `Study ${deck.deck_name}`
            : `Add ${deck.deck_name} to my decks`
        }
        loading={isSubscriptionPending}
        disabled={isSubscriptionPending}
        fullWidth
      />
    </View>
    {isSubscribed ? (
      <Pressable
        style={styles.removeControl}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${deck.deck_name} from my decks`}
        accessibilityState={{ disabled: isSubscriptionPending }}
        disabled={isSubscriptionPending}
        onPress={() => {
          triggerHaptic('selection');
          onSubscriptionToggle(deck, false);
        }}
      >
        <View style={styles.savedBadge}>
          <AppIcon name="check" size={14} color={theme.colors.primary} />
        </View>
      </Pressable>
    ) : null}
  </Card>
);

const styles = StyleSheet.create({
  card: { flex: 1, width: '100%' },
  main: { flex: 1 },
  pressed: { opacity: 0.75 },
  artwork: {
    height: 112,
    backgroundColor: theme.colors.secondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  savedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  removeControl: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, padding: theme.spacing.md, gap: 6 },
  subject: { letterSpacing: 0.6, fontFamily: theme.fontFamily.medium },
  title: {
    minHeight: 48,
    lineHeight: 24,
    fontFamily: theme.fontFamily.semibold,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  footer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
});
