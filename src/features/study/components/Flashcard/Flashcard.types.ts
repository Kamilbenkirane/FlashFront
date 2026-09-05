import type { StudyCard } from '@/domain/study/models/Flashcard';
import type { StyleProp, ViewStyle } from 'react-native';

export interface FlashcardProps {
  flashcard: StudyCard;
  cardToken: number;
  disabled?: boolean;
  revealed?: boolean;
  onFlip?: (isFlipped: boolean) => void;
  onSwipedLeft?: () => void;
  onSwipedRight?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
