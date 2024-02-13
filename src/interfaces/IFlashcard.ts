// interfaces/IFlashcard.ts
import { Moment } from 'moment';

export interface IFlashcard {
    card_id: string;
    recto: string;
    verso: string;
    lastReviewTimestamp?: Moment | null;
    streak: number;
    success?: boolean | null;
    difficulty: number;
    malus: number;
    popupScore: number;
    probability?: number;
}

// Additional interfaces can be defined here if needed.
