import type { Deck } from '../../../interfaces';

export interface DeckCardProps {
  deck: Deck;
  isSubscribed: boolean;
  onSubscriptionToggle: (deck: Deck, subscribe: boolean) => void;
  onPress: (deck: Deck) => void;
  testID?: string;
  className?: string;
}
