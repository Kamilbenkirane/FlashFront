import type { Moment } from 'moment';
import type { ViewStyle } from 'react-native';

export interface FlashcardData {
  card_id: string;
  recto: string;
  verso: string;
  streak: number;
  secondsSinceLastReview?: number;
  popupScore: number;
  difficulty: number;
  malus: number;
  lastReviewTimestamp?: string | Date | Moment | null;
  success?: boolean | null;
  probability?: number;
}

export interface FlashcardProps {
  flashcard: FlashcardData;
  onFlip?: (isFlipped: boolean) => void;
  style?: ViewStyle;
  testID?: string;
}
