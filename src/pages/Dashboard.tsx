import React from 'react';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { useAppStore, Attribute } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { Dumbbell, Plus, Coffee, Moon, Camera, Scale } from 'lucide-react'; // Import new icons

const Dashboard = () => {
  const userProfile = useAppStore((state) => state.userProfile);
  const attributes = useAppStore((state) => state.attributes);
  const level = useAppStore((state) => state.level);
  const streaks = useAppStore((state) => state.streaks);
  const dailyLogs = useAppStore((state) => state.dailyLogs);
  const logDailyQuest = useAppStore((state) => state.logDailyQuest);

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-primary-foreground">Welcome, Hunter!</h1>
          <p className="text-xl text-text-secondary mb-8">
            Your journey begins with a System Awakening.
          </p>
          <Link to="/awakening">
            <Button className="bg-primary hover:bg-primary-foreground text-primary-foreground hover:text-background transition-colors duration-300 text-lg py-3">
              Begin Awakening
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const xpProgress = (level.currentXP / level.nextLevelXP) * 100;
  const weightProgress = ((userProfile.currentWeight - userProfile.startWeight) / (userProfile.goalWeight - userProfile.startWeight)) * 100;

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLog = dailyLogs.find(log => log.date === today);
  const quests = todayLog?.quests || {
    workout: { completed: false, xp: 100, target: 1 },
    calories: { completed: false, xp: 50, target: 3500, value: 0 },
    protein: { completed: false, xp: 50, target: 160, value: 0 },
    creatine: { completed: false, xp: 20, target: 1 },
    sleep: { completed: false, xp: 30, target: 7 },
  };

  const handleQuestToggle = (questName: keyof typeof quests) => {
    const currentQuest = quests[questName];
    if (!currentQuest.completed) {
      logDailyQuest(today, questName, { completed: true, xp: currentQuest.xp });
    }
  };

  const totalCaloriesToday = quests.calories.value || 0;
  const caloriesTarget = quests.calories.target || 0;
  const totalProteinToday = quests.protein.value || 0;
  const proteinTarget = quests.protein.target || 0;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      {/* Player Card */}
      <div className="bg-card p-6 rounded-lg shadow-lg border border-border mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-primary-foreground">PLAYER</h2>
          <span className="bg-sl-primary-accent text-sl-background text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {level.currentLevel <= 5 ? "Novice Hunter" : level.currentLevel <= 10 ? "E-Rank Hunter" : "Higher Rank Hunter"}
          </span>
        </div>

        <div className="mb-4">
          <div className="flex items-baseline justify-between">
            <span className="text-5xl font-bold text-sl-primary-accent">LVL. {level.currentLevel}</span>
            <span className="text-sm text-text-secondary">Streak: <span className="text-sl-warning font-bold">{streaks.current} Days 🔥</span></span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-text-secondary">EXPERIENCE</span>
            <span className="text-sm text-text-secondary">{level.currentXP} / {level.nextLevelXP} XP</span>
          </div>
          <Progress value={xpProgress} className="h-2 bg-muted" indicatorClassName="bg-gradient-to-r from-cyan-400 to-purple-400" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-text-secondary">WEIGHT GOAL</p>
            <p className="text-2xl font-bold text-foreground">{userProfile.currentWeight}kg <span className="text-text-secondary text-lg">→ {userProfile.goalWeight}kg</span></p>
            <Progress value={weightProgress} className="h-1 bg-muted" indicatorClassName="bg-gradient-to-r from-green-400 to-blue-400" />
          </div>
          <div className="text-right">
            <p className="text-sm text-text-secondary">HEIGHT</p>
            <p className="text-2xl font-bold text-foreground">{userProfile.height}cm</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-text-secondary">TODAY'S CALS</p>
            <p className="text-xl font-bold text-sl-primary-accent">{totalCaloriesToday} / {caloriesTarget} <span className="text-text-secondary">kcal</span></p>
            <Progress value={(totalCaloriesToday / caloriesTarget) * 100} className="h-1 bg-muted" indicatorClassName="bg-gradient-to-r from-cyan-400 to-purple-400" />
          </div>
          <div className="text-right">
            <p className="text-sm text-text-secondary">PROTEIN</p>
            <p className="text-xl font-bold text-sl-secondary-accent">{totalProteinToday}g / {proteinTarget}g</p>
            <Progress value={(totalProteinToday / proteinTarget) * 100} className="h-1 bg-muted" indicatorClassName="bg-gradient-to-r from-purple-400 to-pink-400" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link to="/log-workout" className="w-full">
          <Button className="w-full h-24 bg-card hover:bg-accent text-primary-accent border border-border flex flex-col items-center justify-center text-lg font-semibold transition-colors duration-300">
            <Dumbbell className="h-8 w-8 mb-1" />
            LOG WORKOUT
          </Button>
        </Link>
        <Link to="/add-meal" className="w-full">
          <Button className="w-full h-24 bg-card hover:bg-accent text-secondary-accent border border-border flex flex-col items-center justify-center text-lg font-semibold transition-colors duration-300">
            <Plus className="h-8 w-8 mb-1" />
            ADD MEAL
          </Button>
        </Link>
        <Link to="/log-creatine" className="w-full"> {/* New Creatine button */}
          <Button className="w-full h-24 bg-card hover:bg-accent text-sl-success border border-border flex flex-col items-center justify-center text-lg font-semibold transition-colors duration-300">
            <Coffee className="h-8 w-8 mb-1" />
            CREATINE
          </Button>
        </Link>
        <Link to="/log-sleep" className="w-full"> {/* New Sleep button */}
          <Button className="w-full h-24 bg-card hover:bg-accent text-sl-warning border border-border flex flex-col items-center justify-center text-lg font-semibold transition-colors duration-300">
            <Moon className="h-8 w-8 mb-1" />
            LOG SLEEP
          </Button>
        </Link>
        <Link to="/weigh-in" className="w-full">
          <Button className="w-full h-24 bg-card hover:bg-accent text-sl-primary-accent border border-border flex flex-col items-center justify-center text-lg font-semibold transition-colors duration-300">
            <Scale className="h-8 w-8 mb-1" />
            WEIGH IN
          </Button>
        </Link>
        <Link to="/upload-photo" className="w-full">
          <Button className="w-full h-24 bg-card hover:bg-accent text-sl-secondary-accent border border-border flex flex-col items-center justify-center text-lg font-semibold transition-colors duration-300">
            <Camera className="h-8 w-8 mb-1" />
            UPLOAD PHOTO
          </Button>
        </Link>
      </div>

      {/* Daily Quests Section */}
      <div className="bg-card p-4 rounded-lg shadow-lg border border-border mb-6">
        <h2 className="text-xl font-semibold text-primary-foreground mb-4">📋 TODAY'S QUESTS</h2>
        <div className="space-y-3">
          {Object.entries(quests).map(([questName, quest]) => (
            <div key={questName} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={questName}
                  checked={quest.completed}
                  onCheckedChange={() => handleQuestToggle(questName as keyof typeof quests)}
                  disabled={quest.completed}
                />
                <label
                  htmlFor={questName}
                  className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${quest.completed ? 'line-through text-text-secondary' : 'text-foreground'}`}
                >
                  {questName.charAt(0).toUpperCase() + questName.slice(1)} ({quest.xp} XP)
                </label>
              </div>
              {quest.value !== undefined && quest.target !== undefined && (
                <span className="text-sm text-text-secondary">
                  {quest.value} / {quest.target} {questName === 'calories' ? 'kcal' : questName === 'protein' ? 'g' : ''}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* This week's training schedule - Placeholder */}
      <div className="bg-card p-4 rounded-lg shadow-lg border border-border mb-6">
        <h2 className="text-xl font-semibold text-primary-foreground mb-4">🗓️ THIS WEEK'S TRAINING</h2>
        <p className="text-text-secondary">No schedule set. Plan your workouts!</p>
      </div>

      {/* Attribute Ranks */}
      <div className="bg-card p-4 rounded-lg shadow-lg border border-border mb-6">
        <h2 className="text-xl font-semibold text-primary-foreground mb-4">💪 ATTRIBUTE RANKS</h2>
        <div className="grid grid-cols-2 gap-4 text-text-secondary">
          {Object.entries(attributes).map(([key, attr]) => (
            <div key={key} className="flex justify-between items-center">
              <span className="capitalize">{key}:</span>
              <span className={`font-bold ${attr.rank === 'E' ? 'text-red-400' : attr.rank === 'D' ? 'text-orange-400' : 'text-green-400'}`}>
                {attr.rank}-Rank (Score: {attr.score}) {/* Display score for clarity */}
              </span>
            </div>
          ))}
        </div>
        <Link to="/retest-attributes"> {/* Link the button */}
          <Button className="w-full mt-4 bg-secondary hover:bg-secondary-foreground text-secondary-foreground hover:text-background transition-colors duration-300">
            RETEST AVAILABLE
          </Button>
        </Link>
      </div>

      {/* Active Quests */}
      <div className="bg-card p-4 rounded-lg shadow-lg border border-border mb-6">
        <h2 className="text-xl font-semibold text-primary-foreground mb-4">⚡ ACTIVE QUEST</h2>
        <p className="text-text-secondary">No active quests. Check back later!</p>
        {/* Placeholder for active quests */}
      </div>

      <MadeWithDyad />
    </div>
  );
};

export default Dashboard;