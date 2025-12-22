import type React from 'react';
import { type ReactNode, createContext, useContext, useState } from 'react';
// import { MMKV } from 'react-native-mmkv';
import type {
  AnalyticsData,
  ChartDataPoint,
  StudyGoal,
  StudySession,
  StudyStats,
} from '../interfaces/StudySession';

// MMKV interface for type safety
interface MMKVInstance {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
}

// Storage helper class with fallback
class AnalyticsStorage {
  private mmkv: MMKVInstance | null = null;

  constructor() {
    try {
      const { MMKV } = require('react-native-mmkv');
      this.mmkv = new MMKV({
        id: 'analytics-storage',
        encryptionKey: 'flashfront-analytics-2024',
      });
    } catch (error) {
      console.warn('MMKV not available, falling back to memory storage');
    }
  }

  getString(key: string): string | null {
    if (this.mmkv) {
      return this.mmkv.getString(key) || null;
    }
    // Fallback to localStorage on web or memory storage
    return null;
  }

  set(key: string, value: string): void {
    if (this.mmkv) {
      this.mmkv.set(key, value);
    }
    // Fallback storage could be added here
  }
}

const analyticsStorage = new AnalyticsStorage();

interface AnalyticsContextType {
  // Session Management
  startStudySession: (
    userId: string,
    deckId: string,
    deckName: string,
    totalCards: number,
  ) => string;
  endStudySession: (
    sessionId: string,
    correctAnswers: number,
    incorrectAnswers: number,
  ) => void;
  updateSessionProgress: (sessionId: string, cardsStudied: number) => void;

  // Data Retrieval
  getStudyStats: (userId: string) => StudyStats;
  getAnalyticsData: (
    userId: string,
    timeRange: 'week' | 'month' | 'year',
  ) => AnalyticsData;
  getRecentSessions: (userId: string, limit?: number) => StudySession[];

  // Goals Management
  createStudyGoal: (
    userId: string,
    goal: Omit<StudyGoal, 'id' | 'current'>,
  ) => void;
  updateGoalProgress: (
    userId: string,
    goalId: string,
    progress: number,
  ) => void;
  getActiveGoals: (userId: string) => StudyGoal[];

  // Current session state
  currentSession: StudySession | null;
  isSessionActive: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(
  undefined,
);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  children,
}) => {
  const [currentSession, setCurrentSession] = useState<StudySession | null>(
    null,
  );
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Helper functions for data persistence
  const saveSession = (session: StudySession) => {
    try {
      const sessions = getSessions(session.userId);
      sessions.push(session);
      analyticsStorage.set(
        `sessions_${session.userId}`,
        JSON.stringify(sessions),
      );
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const getSessions = (userId: string): StudySession[] => {
    try {
      const sessionsData = analyticsStorage.getString(`sessions_${userId}`);
      if (sessionsData) {
        const sessions = JSON.parse(sessionsData);
        return sessions.map((session: StudySession) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined,
          completedDate: new Date(session.completedDate),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting sessions:', error);
      return [];
    }
  };

  const saveStats = (userId: string, stats: StudyStats) => {
    try {
      analyticsStorage.set(`stats_${userId}`, JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving stats:', error);
    }
  };

  const getStoredStats = (userId: string): StudyStats | null => {
    try {
      const statsData = analyticsStorage.getString(`stats_${userId}`);
      if (statsData) {
        const stats = JSON.parse(statsData);
        return {
          ...stats,
          studyGoals:
            stats.studyGoals?.map((goal: StudyGoal) => ({
              ...goal,
              startDate: new Date(goal.startDate),
              endDate: new Date(goal.endDate),
            })) || [],
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting stats:', error);
      return null;
    }
  };

  // Core analytics functions
  const startStudySession = (
    userId: string,
    deckId: string,
    deckName: string,
    totalCards: number,
  ): string => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: StudySession = {
      id: sessionId,
      userId,
      deckId,
      deckName,
      startTime: new Date(),
      totalCards,
      cardsStudied: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      accuracy: 0,
      sessionType: 'mixed',
      completedDate: new Date(),
    };

    setCurrentSession(session);
    setIsSessionActive(true);
    return sessionId;
  };

  const endStudySession = (
    sessionId: string,
    correctAnswers: number,
    incorrectAnswers: number,
  ) => {
    if (!currentSession || currentSession.id !== sessionId) return;

    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - currentSession.startTime.getTime()) / 1000,
    );
    const totalAnswers = correctAnswers + incorrectAnswers;
    const accuracy =
      totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

    const completedSession: StudySession = {
      ...currentSession,
      endTime,
      duration,
      correctAnswers,
      incorrectAnswers,
      accuracy,
      cardsStudied: totalAnswers,
      completedDate: endTime,
    };

    saveSession(completedSession);
    updateUserStats(currentSession.userId, completedSession);

    setCurrentSession(null);
    setIsSessionActive(false);
  };

  const updateSessionProgress = (sessionId: string, cardsStudied: number) => {
    if (currentSession && currentSession.id === sessionId) {
      setCurrentSession({
        ...currentSession,
        cardsStudied,
      });
    }
  };

  const updateUserStats = (userId: string, session: StudySession) => {
    const currentStats = getStoredStats(userId) || {
      totalSessions: 0,
      totalStudyTime: 0,
      totalCardsStudied: 0,
      averageAccuracy: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalCorrectAnswers: 0,
      totalIncorrectAnswers: 0,
      studyGoals: [],
      weeklyStats: [],
      monthlyStats: [],
    };

    const updatedStats: StudyStats = {
      ...currentStats,
      totalSessions: currentStats.totalSessions + 1,
      totalStudyTime: currentStats.totalStudyTime + (session.duration || 0),
      totalCardsStudied: currentStats.totalCardsStudied + session.cardsStudied,
      totalCorrectAnswers:
        currentStats.totalCorrectAnswers + session.correctAnswers,
      totalIncorrectAnswers:
        currentStats.totalIncorrectAnswers + session.incorrectAnswers,
      averageAccuracy: calculateNewAverage(
        currentStats.averageAccuracy,
        currentStats.totalSessions,
        session.accuracy,
      ),
    };

    // Update streak logic
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const today = new Date();

    const sessionsToday = getSessions(userId).filter((s) =>
      isSameDay(new Date(s.completedDate), today),
    );

    if (sessionsToday.length === 1) {
      // First session today
      const sessionsYesterday = getSessions(userId).filter((s) =>
        isSameDay(new Date(s.completedDate), yesterday),
      );

      if (sessionsYesterday.length > 0) {
        updatedStats.currentStreak = currentStats.currentStreak + 1;
      } else {
        updatedStats.currentStreak = 1;
      }

      if (updatedStats.currentStreak > currentStats.longestStreak) {
        updatedStats.longestStreak = updatedStats.currentStreak;
      }
    }

    saveStats(userId, updatedStats);
  };

  const calculateNewAverage = (
    currentAvg: number,
    count: number,
    newValue: number,
  ): number => {
    return (currentAvg * count + newValue) / (count + 1);
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const getStudyStats = (userId: string): StudyStats => {
    return (
      getStoredStats(userId) || {
        totalSessions: 0,
        totalStudyTime: 0,
        totalCardsStudied: 0,
        averageAccuracy: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalCorrectAnswers: 0,
        totalIncorrectAnswers: 0,
        studyGoals: [],
        weeklyStats: [],
        monthlyStats: [],
      }
    );
  };

  const getAnalyticsData = (
    userId: string,
    timeRange: 'week' | 'month' | 'year',
  ): AnalyticsData => {
    const sessions = getSessions(userId);
    const now = new Date();
    const startDate = new Date();

    // Set time range
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const filteredSessions = sessions.filter(
      (session) => new Date(session.completedDate) >= startDate,
    );

    // Generate chart data
    const accuracyTrend: ChartDataPoint[] = filteredSessions.map(
      (session, index) => ({
        x: index + 1,
        y: session.accuracy,
        label: new Date(session.completedDate).toLocaleDateString(),
      }),
    );

    const studyTimeTrend: ChartDataPoint[] = filteredSessions.map(
      (session, index) => ({
        x: index + 1,
        y: (session.duration || 0) / 60, // Convert to minutes
        label: new Date(session.completedDate).toLocaleDateString(),
      }),
    );

    const cardsStudiedTrend: ChartDataPoint[] = filteredSessions.map(
      (session, index) => ({
        x: index + 1,
        y: session.cardsStudied,
        label: new Date(session.completedDate).toLocaleDateString(),
      }),
    );

    // Deck performance aggregation
    const deckStats = new Map<
      string,
      { accuracy: number[]; studyTime: number; cardsStudied: number }
    >();

    filteredSessions.forEach((session) => {
      const existing = deckStats.get(session.deckName) || {
        accuracy: [],
        studyTime: 0,
        cardsStudied: 0,
      };
      existing.accuracy.push(session.accuracy);
      existing.studyTime += session.duration || 0;
      existing.cardsStudied += session.cardsStudied;
      deckStats.set(session.deckName, existing);
    });

    const deckPerformance = Array.from(deckStats.entries()).map(
      ([deckName, stats]) => ({
        deckName,
        accuracy:
          stats.accuracy.reduce((a, b) => a + b, 0) / stats.accuracy.length,
        studyTime: stats.studyTime / 60, // Convert to minutes
        cardsStudied: stats.cardsStudied,
      }),
    );

    return {
      accuracyTrend,
      studyTimeTrend,
      cardsStudiedTrend,
      streakHistory: [], // Implement streak history calculation
      deckPerformance,
    };
  };

  const getRecentSessions = (userId: string, limit = 10): StudySession[] => {
    const sessions = getSessions(userId);
    return sessions
      .sort(
        (a, b) =>
          new Date(b.completedDate).getTime() -
          new Date(a.completedDate).getTime(),
      )
      .slice(0, limit);
  };

  const createStudyGoal = (
    userId: string,
    goalData: Omit<StudyGoal, 'id' | 'current'>,
  ) => {
    const goal: StudyGoal = {
      ...goalData,
      id: `goal_${Date.now()}`,
      current: 0,
    };

    const stats = getStoredStats(userId) || getStudyStats(userId);
    stats.studyGoals.push(goal);
    saveStats(userId, stats);
  };

  const updateGoalProgress = (
    userId: string,
    goalId: string,
    progress: number,
  ) => {
    const stats = getStoredStats(userId);
    if (stats) {
      const goalIndex = stats.studyGoals.findIndex((g) => g.id === goalId);
      if (goalIndex !== -1) {
        stats.studyGoals[goalIndex].current = progress;
        if (progress >= stats.studyGoals[goalIndex].target) {
          stats.studyGoals[goalIndex].completed = true;
        }
        saveStats(userId, stats);
      }
    }
  };

  const getActiveGoals = (userId: string): StudyGoal[] => {
    const stats = getStoredStats(userId);
    if (!stats) return [];

    const now = new Date();
    return stats.studyGoals.filter(
      (goal) => !goal.completed && new Date(goal.endDate) > now,
    );
  };

  const value: AnalyticsContextType = {
    startStudySession,
    endStudySession,
    updateSessionProgress,
    getStudyStats,
    getAnalyticsData,
    getRecentSessions,
    createStudyGoal,
    updateGoalProgress,
    getActiveGoals,
    currentSession,
    isSessionActive,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};
