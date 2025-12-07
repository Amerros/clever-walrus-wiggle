import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { format } from 'date-fns';

export type AttributeRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface UserProfile {
  userId: string;
  height: number;
  startWeight: number;
  currentWeight: number;
  goalWeight: number;
  startDate: string;
}

export interface Attribute {
  rank: AttributeRank;
  score: number; // For Intelligence, Strength, Endurance, Agility
  lastTest?: string; // Date of last test
  rolling30day?: number; // For Discipline
  weeklyAvg?: number; // For Recovery
}

export interface Attributes {
  intelligence: Attribute;
  strength: Attribute;
  endurance: Attribute;
  agility: Attribute;
  discipline: Attribute;
  recovery: Attribute;
}

export interface Level {
  currentLevel: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
}

export interface Streaks {
  current: number;
  longest: number;
  lastActive: string; // Date string 'YYYY-MM-DD'
}

export interface DailyQuest {
  completed: boolean;
  xp: number;
  value?: number; // For calories/protein/sleep hours
  target?: number; // For quests with specific targets (e.g., 2000 calories, 150g protein)
}

export interface DailyLog {
  date: string;
  quests: {
    workout: DailyQuest;
    calories: DailyQuest;
    protein: DailyQuest;
    creatine: DailyQuest;
    sleep: DailyQuest;
    kickboxing?: DailyQuest; // Example of an optional quest
  };
  workout?: any; // Placeholder for detailed workout data
  totalXP: number;
}

export interface AppState {
  userProfile: UserProfile | null;
  attributes: Attributes;
  level: Level;
  streaks: Streaks;
  dailyLogs: DailyLog[];
  activeQuests: any[]; // Placeholder for random quests
  setProfile: (profile: UserProfile) => void;
  setAttribute: (attributeName: keyof Attributes, attribute: Attribute) => void;
  addXP: (amount: number) => void;
  logDailyQuest: (date: string, questName: keyof DailyLog['quests'], data: Partial<DailyQuest>) => void;
  updateCurrentWeight: (newWeight: number) => void;
  resetState: () => void;
}

const initialProfile: UserProfile = {
  userId: '',
  height: 0,
  startWeight: 0,
  currentWeight: 0,
  goalWeight: 0,
  startDate: '',
};

const initialAttributes: Attributes = {
  intelligence: { rank: 'E', score: 0 },
  strength: { rank: 'E', score: 0 },
  endurance: { rank: 'E', score: 0 },
  agility: { rank: 'E', score: 0 },
  discipline: { rank: 'E', score: 0, rolling30day: 0 },
  recovery: { rank: 'E', score: 0, weeklyAvg: 0 },
};

const initialLevel: Level = {
  currentLevel: 1,
  currentXP: 0,
  nextLevelXP: 1000,
  totalXP: 0,
};

const initialStreaks: Streaks = {
  current: 0,
  longest: 0,
  lastActive: '',
};

const calculateNextLevelXP = (level: number) => {
  if (level === 1) return 1000;
  return Math.round(initialLevel.nextLevelXP * Math.pow(1.5, level - 1));
};

const defaultDailyQuests = () => ({
  workout: { completed: false, xp: 100, target: 1 }, // 1 workout
  calories: { completed: false, xp: 50, target: 3500, value: 0 }, // 3500 kcal target, starting at 0
  protein: { completed: false, xp: 50, target: 160, value: 0 }, // 160g protein target, starting at 0
  creatine: { completed: false, xp: 20, target: 1 }, // 1 dose
  sleep: { completed: false, xp: 30, target: 7 }, // 7 hours sleep
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      userProfile: null,
      attributes: initialAttributes,
      level: initialLevel,
      streaks: initialStreaks,
      dailyLogs: [],
      activeQuests: [],

      setProfile: (profile) => set({ userProfile: profile }),
      setAttribute: (attributeName, attribute) =>
        set((state) => ({
          attributes: {
            ...state.attributes,
            [attributeName]: attribute,
          },
        })),
      addXP: (amount) =>
        set((state) => {
          const newXP = state.level.currentXP + amount;
          const newTotalXP = state.level.totalXP + amount;
          let newLevel = state.level.currentLevel;
          let newNextLevelXP = state.level.nextLevelXP;
          let remainingXP = newXP;

          while (remainingXP >= newNextLevelXP) {
            newLevel++;
            remainingXP -= newNextLevelXP;
            newNextLevelXP = calculateNextLevelXP(newLevel);
            // TODO: Trigger level up animation/notification
          }

          return {
            level: {
              currentLevel: newLevel,
              currentXP: remainingXP,
              nextLevelXP: newNextLevelXP,
              totalXP: newTotalXP,
            },
          };
        }),
      logDailyQuest: (date, questName, data) =>
        set((state) => {
          const todayLogIndex = state.dailyLogs.findIndex((log) => log.date === date);
          let updatedDailyLogs = [...state.dailyLogs];
          let currentLog: DailyLog;

          if (todayLogIndex !== -1) {
            currentLog = { ...updatedDailyLogs[todayLogIndex] };
          } else {
            currentLog = {
              date,
              quests: defaultDailyQuests(),
              totalXP: 0,
            };
            updatedDailyLogs.push(currentLog);
          }

          const oldQuestState = currentLog.quests[questName];
          
          // Accumulate value for calories and protein
          let newValue = oldQuestState.value || 0;
          if (questName === 'calories' || questName === 'protein') {
            newValue += (data.value || 0);
          } else {
            newValue = data.value !== undefined ? data.value : newValue; // For other quests, just set if provided
          }

          currentLog.quests = {
            ...currentLog.quests,
            [questName]: { ...oldQuestState, ...data, value: newValue, completed: (data.completed || (newValue >= (oldQuestState.target || Infinity))) },
          };

          // Update total XP for the day
          currentLog.totalXP = Object.values(currentLog.quests).reduce(
            (sum, q) => sum + (q.completed ? q.xp : 0),
            0,
          );

          if (todayLogIndex !== -1) {
            updatedDailyLogs[todayLogIndex] = currentLog;
          } else {
            updatedDailyLogs = [...updatedDailyLogs.filter(log => log.date !== date), currentLog];
          }

          // Add XP to global level
          const xpGained = (currentLog.quests[questName].completed && !oldQuestState.completed) ? currentLog.quests[questName].xp : 0;
          if (xpGained > 0) {
            get().addXP(xpGained);
          }

          // Update streaks
          const todayDate = format(new Date(), 'yyyy-MM-dd');
          const yesterdayDate = format(new Date(new Date().setDate(new Date().getDate() - 1)), 'yyyy-MM-dd');
          let newStreaks = { ...state.streaks };

          if (todayDate === date) { // Only update streak if logging for today
            if (newStreaks.lastActive === yesterdayDate) {
              newStreaks.current += 1;
            } else if (newStreaks.lastActive !== todayDate) {
              newStreaks.current = 1; // Start new streak if not active yesterday or today
            }
            newStreaks.lastActive = todayDate;
            if (newStreaks.current > newStreaks.longest) {
              newStreaks.longest = newStreaks.current;
            }
          }

          return { dailyLogs: updatedDailyLogs, streaks: newStreaks };
        }),
      updateCurrentWeight: (newWeight) =>
        set((state) => ({
          userProfile: state.userProfile
            ? { ...state.userProfile, currentWeight: newWeight }
            : null,
        })),
      resetState: () => set({
        userProfile: null,
        attributes: initialAttributes,
        level: initialLevel,
        streaks: initialStreaks,
        dailyLogs: [],
        activeQuests: [],
      }),
    }),
    {
      name: 'solo-leveling-app-storage', // unique name
      storage: createJSONStorage(() => localStorage),
    },
  ),
);