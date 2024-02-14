// Session.ts
import Flashcard from "./Flashcard";

class Session {
  pile: Flashcard[];
  flashcards: Flashcard[];
  totalCards: number;
  totalScore: number;

  constructor(sessionData: any[]) {
    // Consider a more specific type for sessionData if possible
    this.pile = sessionData
      ? sessionData.map((data) => new Flashcard(data))
      : [];
    this.flashcards = [];
    this.updateActiveCardsFromPile();
    this.totalCards = this.flashcards.length;
    this.totalScore = this.flashcards.reduce(
      (acc, card) => acc + card.popupScore,
      0,
    );
  }

  updateActiveCardsFromPile(): void {
    const previouslyReviewedCards = this.pile.filter(
      (card) => card.lastReviewTimestamp !== null,
    );
    previouslyReviewedCards.forEach((card) => {
      this.flashcards.push(card);
      this.pile = this.pile.filter((p) => p !== card); // Remove the card from the pile
    });

    this.totalScore = this.flashcards.reduce(
      (acc, card) => acc + card.popupScore,
      0,
    );
    if (this.validateAllActiveCardsHaveBeenReviewed()) {
      while (this.totalScore < 30 && this.pile.length > 0) {
        const newCard = this.pile.shift();
        if (newCard) {
          this.flashcards.push(newCard);
          this.totalScore = this.flashcards.reduce(
            (acc, card) => acc + card.popupScore,
            0,
          );
        }
      }
    }
  }

  validateAllActiveCardsHaveBeenReviewed(): boolean {
    return this.flashcards.every((card) => card.lastReviewTimestamp !== null);
  }

  getNextCard(): Flashcard | undefined {
    this.updateActiveCardsFromPile();

    // First, update the popup score of each card
    this.updateAllPopupScores();

    // Then, update the deck's total score
    this.totalScore = this.getTotalScore();

    // Compute probabilities for each card
    this.computeCardProbabilities();

    this.totalCards = this.flashcards.length;

    // Choose a card randomly based on the probability
    return this.chooseCardBasedOnProbability();
  }

  getTotalScore(): number {
    return this.flashcards.reduce((acc, card) => acc + card.popupScore, 0);
  }

  updateAllPopupScores(): void {
    this.flashcards.forEach((card) => card.calculatePopupScore());
  }

  computeCardProbabilities(): void {
    this.totalScore = this.getTotalScore();
    this.flashcards.forEach((card) => {
      card.probability = card.popupScore / this.totalScore;
    });
  }

  chooseCardBasedOnProbability(): Flashcard | undefined {
    const rand = Math.random();
    let sum = 0;

    for (const card of this.flashcards) {
      sum += card.probability ?? 0; // Assuming Flashcard has a 'probability' property
      if (rand <= sum) {
        return card;
      }
    }
    return undefined; // In case no card is selected, though this should not happen
  }
}

export default Session;
