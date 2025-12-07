import React from 'react';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { useAppStore, Attribute } from '@/lib/store'; // Import Attribute type
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const userProfile = useAppStore((state) => state.userProfile);
  const attributes = useAppStore((state) => state.attributes);
  const level = useAppStore((state) => state.level);

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

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      {/* Player Card - Sticky Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border pb-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-primary-foreground">
            <span className="text-cyan-400">HUNTER</span> DASHBOARD
          </h1>
          <Link to="/settings">
            <Button variant="ghost" size="icon" className="text-text-secondary hover:text-primary-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.78 1.22a2 2 0 0 0 .73 2.73l.15.08a2 2 0 0 1 1 1.73v.56a2 2 0 0 1-1 1.73l-.15.08a2 2 0 0 0-.73 2.73l.78 1.22a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.78-1.22a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.73v-.56a2 2 0 0 1 1-1.73l.15-.08a2 2 0 0 0 .73-2.73l-.78-1.22a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </Button>
          </Link>
        </div>

        <div className="bg-card p-4 rounded-lg shadow-lg border border-border mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-semibold text-primary-foreground">Level {level.currentLevel} - {level.currentLevel <= 5 ? "Novice Hunter" : level.currentLevel <= 10 ? "E-Rank Hunter" : "Higher Rank Hunter"}</span>
            <span className="text-sm text-text-secondary">{level.currentXP} / {level.nextLevelXP} XP</span>
          </div>
          <Progress value={xpProgress} className="h-2 bg-muted" indicatorClassName="bg-gradient-to-r from-cyan-400 to-purple-400" />
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-text-secondary">{userProfile.currentWeight}kg</span>
            <span className="text-sm text-text-secondary">{userProfile.goalWeight}kg</span>
          </div>
          <Progress value={weightProgress} className="h-2 bg-muted" indicatorClassName="bg-gradient-to-r from-green-400 to-blue-400" />
        </div>
      </div>

      {/* Daily Quests Section */}
      <div className="bg-card p-4 rounded-lg shadow-lg border border-border mb-6">
        <h2 className="text-xl font-semibold text-primary-foreground mb-4">📋 TODAY'S QUESTS</h2>
        <p className="text-text-secondary">Daily quests will appear here.</p>
        {/* Placeholder for daily quests */}
      </div>

      {/* Attribute Ranks */}
      <div className="bg-card p-4 rounded-lg shadow-lg border border-border mb-6">
        <h2 className="text-xl font-semibold text-primary-foreground mb-4">💪 ATTRIBUTE RANKS</h2>
        <div className="grid grid-cols-2 gap-4 text-text-secondary">
          {Object.entries(attributes).map(([key, attr]) => ( // Explicitly type attr as Attribute
            <div key={key} className="flex justify-between items-center">
              <span className="capitalize">{key}:</span>
              <span className={`font-bold ${(attr as Attribute).rank === 'E' ? 'text-red-400' : (attr as Attribute).rank === 'D' ? 'text-orange-400' : 'text-green-400'}`}>
                {(attr as Attribute).rank}-Rank
              </span>
            </div>
          ))}
        </div>
        <Button className="w-full mt-4 bg-secondary hover:bg-secondary-foreground text-secondary-foreground hover:text-background transition-colors duration-300">
          RETEST AVAILABLE
        </Button>
      </div>

      {/* Active Quests */}
      <div className="bg-card p-4 rounded-lg shadow-lg border border-border mb-6">
        <h2 className="text-xl font-semibold text-primary-foreground mb-4">⚡ ACTIVE QUEST</h2>
        <p className="text-text-secondary">No active quests. Check back later!</p>
        {/* Placeholder for active quests */}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link to="/log-workout" className="w-full">
          <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 text-lg">
            🏋️ LOG WORKOUT
          </Button>
        </Link>
        <Link to="/add-meal" className="w-full">
          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg">
            🍽️ ADD MEAL
          </Button>
        </Link>
        <Link to="/progress-report" className="w-full">
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg">
            📊 PROGRESS
          </Button>
        </Link>
        <Link to="/upload-photo" className="w-full">
          <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg">
            📸 UPLOAD PHOTO
          </Button>
        </Link>
      </div>

      <MadeWithDyad />
    </div>
  );
};

export default Dashboard;