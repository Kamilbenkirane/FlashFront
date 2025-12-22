import type React from 'react';
import { Pressable, View } from 'react-native';
import { triggerHaptic } from '../../../utils/haptics';
import { Button } from '../Button';
import { Card } from '../Card';
import { ProgressBar } from '../ProgressBar';
import { Typography } from '../Typography';
import type { DeckCardProps } from './DeckCard.types';

export const DeckCard: React.FC<DeckCardProps> = ({
  deck,
  isSubscribed,
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
    onPress?.(deck);
  };

  // Calculate mock progress (replace with real data when available)
  const progress = Math.random() * 100; // Mock progress
  const cardCount = deck.card_count || Math.floor(Math.random() * 200) + 20;
  const difficulty = deck.difficulty || 'Medium';

  return (
    <Pressable
      onPress={handlePress}
      className={`flex-1 m-2 ${className}`}
      testID={testID}
    >
      <Card className="p-4 min-h-[180px]">
        {/* Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded-xl">
            <Typography
              variant="caption"
              className="text-primary-500 font-semibold"
            >
              {deck.subject}
            </Typography>
          </View>
          <View className="w-6 h-6 rounded-xl bg-neutral-200 dark:bg-neutral-600 justify-center items-center">
            <Typography
              variant="body"
              className="text-success-500 font-bold text-sm"
            >
              {isSubscribed ? '✓' : '+'}
            </Typography>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 mb-4">
          <Typography variant="heading3" className="mb-2" numberOfLines={2}>
            {deck.deck_name}
          </Typography>

          <View className="mb-3">
            <Typography
              variant="caption"
              className="text-neutral-500 dark:text-neutral-400"
            >
              {cardCount} cards • {difficulty}
            </Typography>
          </View>

          {/* Progress */}
          {isSubscribed && (
            <View className="mt-auto">
              <Typography
                variant="caption"
                className="text-neutral-500 dark:text-neutral-400 mb-1"
              >
                Progress
              </Typography>
              <ProgressBar
                progress={progress}
                total={100}
                showLabel={false}
                showPercentage={true}
                color="primary"
                size="sm"
              />
            </View>
          )}
        </View>

        {/* Footer */}
        <View className="mt-auto">
          <Button
            title={isSubscribed ? 'Unsubscribe' : 'Subscribe'}
            variant={isSubscribed ? 'secondary' : 'primary'}
            size="sm"
            onPress={handleSubscriptionToggle}
            fullWidth
          />
        </View>
      </Card>
    </Pressable>
  );
};
