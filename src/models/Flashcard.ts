// models/Flashcard.ts
import type { SessionData } from '../interfaces';

class Flashcard implements SessionData {
  // Properties of the Flashcard class
  card_id: string;
  recto: string; // Front side of the flashcard
  verso: string; // Back side of the flashcard
  lastReviewTimestamp: Date | null; // Last time the card was reviewed
  streak: number; // Current streak of correct answers
  success?: boolean | null; // Outcome of the last review (true if successful)
  difficulty: number; // Difficulty rating of the flashcard
  malus: number; // Penalty for incorrect answers
  popupScore: number; // Score determining when the card should pop up again
  probability?: number; // Probability of being chosen for the next review
  secondsSinceLastReview?: number; // Time since the last review in seconds

  constructor(dictCard: SessionData) {
    // Initializes a new Flashcard object with properly typed SessionData
    // Assigning values from dictCard to properties, using null coalescing for optional properties
    this.card_id = dictCard.card_id;
    this.recto = dictCard.recto;
    this.verso = dictCard.verso;
    // Parsing the lastReviewTimestamp to a Date object, or null if not provided
    this.lastReviewTimestamp = dictCard.lastReviewTimestamp
      ? new Date(dictCard.lastReviewTimestamp)
      : null;
    if (this.lastReviewTimestamp) {
      // The API returns the timestamp in local wall-clock terms, so shift it by
      // the zone offset to recover the true instant.
      const timezoneOffset = this.lastReviewTimestamp.getTimezoneOffset();
      this.lastReviewTimestamp.setMinutes(
        this.lastReviewTimestamp.getMinutes() + timezoneOffset,
      );
    }
    this.updateSecondsSinceLastReview(); // Update secondsSinceLastReview
    this.streak = dictCard.streak || 0; // Default streak to 0 if not specified
    this.success = dictCard.success; // Success is optional, may not be provided
    this.difficulty = dictCard.difficulty; // Difficulty rating of the flashcard
    this.malus = 0; // Initial malus is set to 0
    this.calculatePopupScore(); // Calculate initial popup score
    this.probability = 1; // Initial probability is set to 0
  }

  updateSecondsSinceLastReview(): void {
    // Calculate the time since the last review in seconds
    if (this.lastReviewTimestamp instanceof Date) {
      this.secondsSinceLastReview = Math.trunc(
        (Date.now() - this.lastReviewTimestamp.getTime()) / 1000,
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
    this.calculatePopupScore(); // Recalculate popup score after updating streak
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
      if (
        this.secondsSinceLastReview !== undefined &&
        this.secondsSinceLastReview < Tmax
      ) {
        popupScore =
          Math.min(
            10000,
            Math.exp(0.01 * (this.secondsSinceLastReview - Tmax)),
          ) + this.malus;
      } else if (this.secondsSinceLastReview !== undefined) {
        popupScore = this.secondsSinceLastReview / Tmax + this.malus;
      } else {
        // Fallback if secondsSinceLastReview is undefined
        popupScore = 2 + this.malus;
      }
    }
    this.popupScore = popupScore; // Set the calculated popup score
    return popupScore; // Return the calculated popup score
  }

  updateCard(success: boolean): void {
    // Updates the card with the result of the latest review
    this.lastReviewTimestamp = new Date(); // Set the last review timestamp to now
    this.updateStreak(success); // Update streak based on the review outcome
  }
}

export default Flashcard;
