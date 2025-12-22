export interface StudySession {
  id: string;
  userId: string;
  deckId: string;
  deckName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  totalCards: number;
  cardsStudied: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number; // percentage
  sessionType: 'review' | 'new' | 'mixed';
  completedDate: Date;
}

export interface StudyStats {
  totalSessions: number;
  totalStudyTime: number; // in seconds
  totalCardsStudied: number;
  averageAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  totalCorrectAnswers: number;
  totalIncorrectAnswers: number;
  studyGoals: StudyGoal[];
  weeklyStats: WeeklyStats[];
  monthlyStats: MonthlyStats[];
}

export interface StudyGoal {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: number; // minutes for time goals, cards for card goals
  goalType: 'study_time' | 'cards_studied' | 'accuracy' | 'streak';
  current: number;
  startDate: Date;
  endDate: Date;
  completed: boolean;
  description: string;
}

export interface WeeklyStats {
  weekStart: Date;
  weekEnd: Date;
  totalSessions: number;
  totalStudyTime: number;
  totalCardsStudied: number;
  averageAccuracy: number;
  dailyBreakdown: DailyStats[];
}

export interface MonthlyStats {
  month: number;
  year: number;
  totalSessions: number;
  totalStudyTime: number;
  totalCardsStudied: number;
  averageAccuracy: number;
  weeklyBreakdown: WeeklyStats[];
}

export interface DailyStats {
  date: Date;
  sessions: number;
  studyTime: number;
  cardsStudied: number;
  accuracy: number;
}

export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
}

export interface AnalyticsData {
  accuracyTrend: ChartDataPoint[];
  studyTimeTrend: ChartDataPoint[];
  cardsStudiedTrend: ChartDataPoint[];
  streakHistory: ChartDataPoint[];
  deckPerformance: Array<{
    deckName: string;
    accuracy: number;
    studyTime: number;
    cardsStudied: number;
  }>;
}
