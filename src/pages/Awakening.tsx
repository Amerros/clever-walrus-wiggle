import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Awakening = () => {
  const navigate = useNavigate();
  const setProfile = useAppStore((state) => state.setProfile);
  const userProfile = useAppStore((state) => state.userProfile);

  const [height, setHeight] = useState<number>(userProfile?.height || 189);
  const [currentWeight, setCurrentWeight] = useState<number>(userProfile?.currentWeight || 72);
  const [goalWeight, setGoalWeight] = useState<number>(userProfile?.goalWeight || 78);
  // const [apiKey, setApiKey] = useState<string>(userProfile?.anthropicApiKey || ''); // Removed

  const handleBeginEvaluation = () => {
    if (!height || !currentWeight || !goalWeight) { // Removed apiKey check
      toast.error("Please fill in all fields.");
      return;
    }

    const newProfile = {
      userId: 'user-123', // In a real app, this would be dynamic
      height,
      startWeight: currentWeight,
      currentWeight,
      goalWeight,
      startDate: new Date().toISOString().split('T')[0],
      // anthropicApiKey: apiKey, // Removed
    };
    setProfile(newProfile);
    toast.success("System Initialized! Welcome, Hunter.");
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="text-center max-w-md w-full space-y-6">
        <h1 className="text-4xl font-bold text-primary-foreground mb-6 animate-pulse">
          <span className="text-cyan-400">SYSTEM</span> INITIALIZATION...
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          <span className="text-purple-400">SCANNING USER CAPABILITIES...</span>
          <br />
          <span className="text-purple-400">CONNECTING TO EVALUATION SYSTEM...</span>
          <br />
          <span className="text-purple-400">PREPARING RANK EVALUATION TESTS...</span>
        </p>

        <div className="space-y-4 bg-card p-6 rounded-lg shadow-lg border border-border">
          <p className="text-warning text-sm font-semibold">
            WARNING: THESE TESTS ARE DESIGNED TO FIND YOUR TRUE LIMITS
            <br />
            MOST USERS START AT E-RANK
            <br />
            ONLY THE EXCEPTIONAL REACH HIGHER
          </p>
          <h2 className="text-2xl font-semibold text-primary-foreground mt-4">Enter Your Stats</h2>

          <div>
            <Label htmlFor="height" className="text-left block mb-1 text-text-secondary">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="bg-input border-border text-foreground"
            />
          </div>
          <div>
            <Label htmlFor="currentWeight" className="text-left block mb-1 text-text-secondary">Current Weight (kg)</Label>
            <Input
              id="currentWeight"
              type="number"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(Number(e.target.value))}
              className="bg-input border-border text-foreground"
            />
          </div>
          <div>
            <Label htmlFor="goalWeight" className="text-left block mb-1 text-text-secondary">Goal Weight (kg)</Label>
            <Input
              id="goalWeight"
              type="number"
              value={goalWeight}
              onChange={(e) => setGoalWeight(Number(e.target.value))}
              className="bg-input border-border text-foreground"
            />
          </div>
          {/* Removed AI Integration Setup section */}

          <Button
            onClick={handleBeginEvaluation}
            className="w-full bg-primary hover:bg-primary-foreground text-primary-foreground hover:text-background transition-colors duration-300 text-lg py-3 mt-6 relative overflow-hidden group"
          >
            <span className="relative z-10">BEGIN ATTRIBUTE ASSESSMENT</span>
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Awakening;