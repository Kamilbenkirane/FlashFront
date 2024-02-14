// models/Flashcard.ts
import { IFlashcard } from '../interfaces/IFlashcard';
import moment, { Moment } from 'moment';

class Flashcard implements IFlashcard {
  // Properties of the Flashcard class
  card_id: string;
  recto: string; // Front side of the flashcard
  verso: string; // Back side of the flashcard
  lastReviewTimestamp?: Moment | null; // Last time the card was reviewed
  streak: number; // Current streak of correct answers
  success?: boolean | null; // Outcome of the last review (true if successful)
  difficulty: number; // Difficulty rating of the flashcard
  malus: number; // Penalty for incorrect answers
  popupScore: number; // Score determining when the card should pop up again
  probability?: number; // Probability of being chosen for the next review
  secondsSinceLastReview?: number; // Time since the last review in seconds

  constructor(dictCard: any) {
    // Initializes a new Flashcard object with data from dictCard
    // Assigning values from dictCard to properties, using null coalescing for optional properties
    this.card_id = dictCard.card_id;
    this.recto = dictCard.recto;
    this.verso = dictCard.verso;
    // Parsing the lastReviewTimestamp to a Moment object, or null if not provided
    this.lastReviewTimestamp = dictCard.last_review_timestamp
      ? moment(dictCard.last_review_timestamp)
      : null;
    // If lastReviewTimestamp is not null, subtract 1 hour from it
    if (this.lastReviewTimestamp) {
      this.lastReviewTimestamp.subtract(1, 'hours');
    }
    this.updateSecondsSinceLastReview(); // Update secondsSinceLastReview
    this.streak = dictCard.streak || 0; // Default streak to 0 if not specified
    this.success = dictCard.success; // Success is optional, may not be provided
    this.difficulty = dictCard.difficulty; // Difficulty rating of the flashcard
    this.malus = 0; // Initial malus is set to 0
    this.popupScore = this.calculatePopupScore(); // Calculate initial popup score
    this.probability = 1; // Initial probability is set to 0
  }

  updateSecondsSinceLastReview(): void {
    // Calculate the time since the last review in seconds
    if (this.lastReviewTimestamp) {
      this.secondsSinceLastReview = moment().diff(
        this.lastReviewTimestamp,
        'seconds',
      );
    } else {
      this.secondsSinceLastReview = undefined; // Reset or keep undefined if there's no lastReviewTimestamp
    }
  }
  updateStreak(success: boolean): void {
    // Updates the streak based on review outcome
    if (success) {
      this.streak += 1; // Increment streak if the review was successful
      this.malus = 0; // Reset malus on success
    } else {
      this.streak = Math.floor(this.streak * 0.7); // Reduce streak by 30% on failure
      this.malus += 1; // Increment malus on failure
    }
    this.updateSecondsSinceLastReview();
    this.popupScore = this.calculatePopupScore(); // Recalculate popup score after updating streak
  }

  calculatePopupScore(): number {
    // Calculates the score determining the card's review priority
    let popupScore = 0;
    this.updateSecondsSinceLastReview();
    // If the card has never been reviewed, start with a base score
    if (!this.lastReviewTimestamp) {
      popupScore = 2 + this.malus;
    } else if (this.streak === 0) {
      // If the streak is 0, use a slightly lower base score
      popupScore = 1 + this.malus;
    } else {
      // Calculate Tmax using an exponential function of the streak
      const a = 17;
      const b = 0.8;
      const Tmax = a * Math.exp(b * this.streak);
      // Calculate the time since the last review in seconds

      // Adjust the popup score based on how long it's been since the last review relative to Tmax
      if (this.secondsSinceLastReview < Tmax) {
        popupScore =
          Math.min(
            10000,
            Math.exp(0.01 * (this.secondsSinceLastReview - Tmax)),
          ) + this.malus;
      } else {
        popupScore = this.secondsSinceLastReview / Tmax + this.malus;
      }
    }
    return popupScore; // Return the calculated popup score
  }

  updateCard(success: boolean): void {
    // Updates the card with the result of the latest review
    this.lastReviewTimestamp = moment(); // Set the last review timestamp to now
    this.updateStreak(success); // Update streak based on the review outcome
  }
}

export default Flashcard; // Export the Flashcard class for use elsewhere
