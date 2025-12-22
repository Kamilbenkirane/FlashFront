import AsyncStorage from '@react-native-async-storage/async-storage';
import type React from 'react';
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Platform } from 'react-native';

// MMKV interface for type safety
interface MMKVInstance {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
}

// Storage abstraction layer for web compatibility
class StorageAdapter {
  private mmkv: MMKVInstance | null = null;

  constructor() {
    if (Platform.OS !== 'web') {
      try {
        const { MMKV } = require('react-native-mmkv');
        this.mmkv = new MMKV({
          id: 'achievements',
          encryptionKey: 'flashfront-achievements',
        });
      } catch (error) {
        console.warn('MMKV not available, falling back to AsyncStorage');
      }
    }
  }

  async getString(key: string): Promise<string | null> {
    if (this.mmkv) {
      return this.mmkv.getString(key) || null;
    }
    return await AsyncStorage.getItem(key);
  }

  async setString(key: string, value: string): Promise<void> {
    if (this.mmkv) {
      this.mmkv.set(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  }
}

const achievementStorage = new StorageAdapter();

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'study' | 'progress' | 'streak' | 'mastery' | 'social';
  type: 'count' | 'streak' | 'percentage' | 'time' | 'boolean';
  targetValue: number;
  currentValue: number;
  unlockedAt?: string;
  isCompleted: boolean;
  isNew?: boolean; // For showing unlock modal
}

export interface AchievementStats {
  totalStudySessions: number;
  totalCardsStudied: number;
  currentStreak: number;
  longestStreak: number;
  averageAccuracy: number;
  totalStudyTime: number; // in minutes
  perfectSessions: number;
  consecutiveCorrect: number;
  fastAnswers: number; // answers under 3 seconds
  decksCompleted: number;
}

interface AchievementContextType {
  achievements: Achievement[];
  stats: AchievementStats;
  updateStats: (newStats: Partial<AchievementStats>) => void;
  checkAchievements: () => Achievement[];
  markAchievementAsViewed: (achievementId: string) => void;
  resetAchievements: () => void;
  getCompletedAchievements: () => Achievement[];
  getAchievementProgress: (achievementId: string) => number;
}

const AchievementContext = createContext<AchievementContextType | undefined>(
  undefined,
);

// Default achievements configuration
const defaultAchievements: Omit<
  Achievement,
  'currentValue' | 'isCompleted' | 'unlockedAt' | 'isNew'
>[] = [
  // Study Category
  {
    id: 'first_study',
    title: 'First Steps',
    description: 'Complete your first study session',
    icon: '🎯',
    category: 'study',
    type: 'count',
    targetValue: 1,
  },
  {
    id: 'study_10',
    title: 'Getting Started',
    description: 'Complete 10 study sessions',
    icon: '📚',
    category: 'study',
    type: 'count',
    targetValue: 10,
  },
  {
    id: 'study_50',
    title: 'Dedicated Learner',
    description: 'Complete 50 study sessions',
    icon: '🎓',
    category: 'study',
    type: 'count',
    targetValue: 50,
  },
  {
    id: 'study_100',
    title: 'Scholar',
    description: 'Complete 100 study sessions',
    icon: '👨‍🎓',
    category: 'study',
    type: 'count',
    targetValue: 100,
  },

  // Progress Category
  {
    id: 'cards_100',
    title: 'Century Club',
    description: 'Study 100 flashcards',
    icon: '💯',
    category: 'progress',
    type: 'count',
    targetValue: 100,
  },
  {
    id: 'cards_500',
    title: 'Knowledge Seeker',
    description: 'Study 500 flashcards',
    icon: '🔍',
    category: 'progress',
    type: 'count',
    targetValue: 500,
  },
  {
    id: 'cards_1000',
    title: 'Master Learner',
    description: 'Study 1000 flashcards',
    icon: '🧠',
    category: 'progress',
    type: 'count',
    targetValue: 1000,
  },

  // Streak Category
  {
    id: 'streak_3',
    title: 'On Fire',
    description: 'Study for 3 days in a row',
    icon: '🔥',
    category: 'streak',
    type: 'streak',
    targetValue: 3,
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Study for 7 days in a row',
    icon: '⚡',
    category: 'streak',
    type: 'streak',
    targetValue: 7,
  },
  {
    id: 'streak_30',
    title: 'Monthly Master',
    description: 'Study for 30 days in a row',
    icon: '👑',
    category: 'streak',
    type: 'streak',
    targetValue: 30,
  },

  // Mastery Category
  {
    id: 'accuracy_80',
    title: 'Sharp Shooter',
    description: 'Achieve 80% accuracy',
    icon: '🎯',
    category: 'mastery',
    type: 'percentage',
    targetValue: 80,
  },
  {
    id: 'accuracy_90',
    title: 'Expert',
    description: 'Achieve 90% accuracy',
    icon: '🏆',
    category: 'mastery',
    type: 'percentage',
    targetValue: 90,
  },
  {
    id: 'perfect_session',
    title: 'Perfectionist',
    description: 'Complete a study session with 100% accuracy',
    icon: '💎',
    category: 'mastery',
    type: 'count',
    targetValue: 1,
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Answer 50 cards in under 3 seconds each',
    icon: '💨',
    category: 'mastery',
    type: 'count',
    targetValue: 50,
  },

  // Time Category
  {
    id: 'study_time_60',
    title: 'Hour Scholar',
    description: 'Study for 60 minutes total',
    icon: '⏰',
    category: 'progress',
    type: 'time',
    targetValue: 60,
  },
  {
    id: 'study_time_300',
    title: 'Time Investor',
    description: 'Study for 5 hours total',
    icon: '⌛',
    category: 'progress',
    type: 'time',
    targetValue: 300,
  },
];

const initialStats: AchievementStats = {
  totalStudySessions: 0,
  totalCardsStudied: 0,
  currentStreak: 0,
  longestStreak: 0,
  averageAccuracy: 0,
  totalStudyTime: 0,
  perfectSessions: 0,
  consecutiveCorrect: 0,
  fastAnswers: 0,
  decksCompleted: 0,
};

export const AchievementProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats>(initialStats);

  // Load data from storage on mount
  useEffect(() => {
    loadAchievements();
    loadStats();
  }, []);

  const loadAchievements = async () => {
    try {
      const storedAchievements =
        await achievementStorage.getString('achievements');
      if (storedAchievements) {
        setAchievements(JSON.parse(storedAchievements));
      } else {
        // Initialize with default achievements
        const initialAchievements: Achievement[] = defaultAchievements.map(
          (a) => ({
            ...a,
            currentValue: 0,
            isCompleted: false,
          }),
        );
        setAchievements(initialAchievements);
        await achievementStorage.setString(
          'achievements',
          JSON.stringify(initialAchievements),
        );
      }
    } catch (error) {
      console.error('Failed to load achievements:', error);
    }
  };

  const loadStats = async () => {
    try {
      const storedStats = await achievementStorage.getString('stats');
      if (storedStats) {
        setStats(JSON.parse(storedStats));
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const updateStats = async (newStats: Partial<AchievementStats>) => {
    const updatedStats = { ...stats, ...newStats };
    setStats(updatedStats);
    await achievementStorage.setString('stats', JSON.stringify(updatedStats));
  };

  const checkAchievements = (): Achievement[] => {
    const newlyUnlocked: Achievement[] = [];

    const updatedAchievements = achievements.map((achievement) => {
      if (achievement.isCompleted) return achievement;

      let currentValue = achievement.currentValue;
      let isCompleted = false;

      // Update current value based on achievement type and stats
      switch (achievement.id) {
        case 'first_study':
        case 'study_10':
        case 'study_50':
        case 'study_100':
          currentValue = stats.totalStudySessions;
          break;
        case 'cards_100':
        case 'cards_500':
        case 'cards_1000':
          currentValue = stats.totalCardsStudied;
          break;
        case 'streak_3':
        case 'streak_7':
        case 'streak_30':
          currentValue = stats.currentStreak;
          break;
        case 'accuracy_80':
        case 'accuracy_90':
          currentValue = stats.averageAccuracy;
          break;
        case 'perfect_session':
          currentValue = stats.perfectSessions;
          break;
        case 'speed_demon':
          currentValue = stats.fastAnswers;
          break;
        case 'study_time_60':
        case 'study_time_300':
          currentValue = stats.totalStudyTime;
          break;
      }

      // Check if achievement is completed
      if (currentValue >= achievement.targetValue) {
        isCompleted = true;
        if (!achievement.isCompleted) {
          // Newly unlocked!
          newlyUnlocked.push({
            ...achievement,
            currentValue,
            isCompleted,
            unlockedAt: new Date().toISOString(),
            isNew: true,
          });
        }
      }

      return {
        ...achievement,
        currentValue,
        isCompleted,
        unlockedAt:
          isCompleted && !achievement.unlockedAt
            ? new Date().toISOString()
            : achievement.unlockedAt,
      };
    });

    setAchievements(updatedAchievements);
    achievementStorage.setString(
      'achievements',
      JSON.stringify(updatedAchievements),
    );

    return newlyUnlocked;
  };

  const markAchievementAsViewed = (achievementId: string) => {
    const updatedAchievements = achievements.map((achievement) =>
      achievement.id === achievementId
        ? { ...achievement, isNew: false }
        : achievement,
    );
    setAchievements(updatedAchievements);
    achievementStorage.setString(
      'achievements',
      JSON.stringify(updatedAchievements),
    );
  };

  const resetAchievements = () => {
    const resetAchievements: Achievement[] = defaultAchievements.map((a) => ({
      ...a,
      currentValue: 0,
      isCompleted: false,
    }));

    setAchievements(resetAchievements);
    setStats(initialStats);

    achievementStorage.setString(
      'achievements',
      JSON.stringify(resetAchievements),
    );
    achievementStorage.setString('stats', JSON.stringify(initialStats));
  };

  const getCompletedAchievements = (): Achievement[] => {
    return achievements.filter((a) => a.isCompleted);
  };

  const getAchievementProgress = (achievementId: string): number => {
    const achievement = achievements.find((a) => a.id === achievementId);
    if (!achievement) return 0;
    return (
      Math.min(achievement.currentValue / achievement.targetValue, 1) * 100
    );
  };

  const value: AchievementContextType = {
    achievements,
    stats,
    updateStats,
    checkAchievements,
    markAchievementAsViewed,
    resetAchievements,
    getCompletedAchievements,
    getAchievementProgress,
  };

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  );
};

export const useAchievements = (): AchievementContextType => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error(
      'useAchievements must be used within an AchievementProvider',
    );
  }
  return context;
};
