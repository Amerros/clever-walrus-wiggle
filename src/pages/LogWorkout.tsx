import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LogWorkout = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="text-center max-w-md w-full space-y-6">
        <h1 className="text-4xl font-bold text-primary-foreground mb-6">
          <span className="text-cyan-400">LOG</span> WORKOUT
        </h1>
        <p className="text-lg text-text-secondary mb-8">
          This is where you'll log your daily training sessions.
        </p>
        <Link to="/dashboard">
          <Button
            variant="outline"
            className="w-full border-border text-text-secondary hover:bg-accent hover:text-accent-foreground"
          >
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default LogWorkout;