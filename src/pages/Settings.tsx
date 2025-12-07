import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Settings = () => {
  const navigate = useNavigate();
  const userProfile = useAppStore((state) => state.userProfile);
  const setAnthropicApiKey = useAppStore((state) => state.setAnthropicApiKey);
  const resetState = useAppStore((state) => state.resetState);

  const [apiKey, setApiKey] = useState<string>(userProfile?.anthropicApiKey || '');

  const handleSaveApiKey = () => {
    if (!apiKey) {
      toast.error("API Key cannot be empty.");
      return;
    }
    setAnthropicApiKey(apiKey);
    toast.success("Anthropic API Key saved successfully!");
  };

  const handleResetApp = () => {
    if (window.confirm("Are you sure you want to reset the entire application? All your progress will be lost.")) {
      resetState();
      toast.success("Application reset. Redirecting to Awakening.");
      navigate('/awakening');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-background text-foreground p-4 md:p-8">
      <div className="text-center max-w-md w-full space-y-6">
        <h1 className="text-3xl font-bold text-primary-foreground mb-6">
          <span className="text-cyan-400">SYSTEM</span> SETTINGS
        </h1>

        <div className="space-y-4 bg-card p-6 rounded-lg shadow-lg border border-border">
          <h2 className="text-2xl font-semibold text-primary-foreground">AI Integration</h2>
          <p className="text-sm text-text-secondary mb-2">
            Manage your Anthropic API Key for AI-powered features.
            <br />
            Get it from <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">console.anthropic.com</a>
          </p>
          <div>
            <Label htmlFor="apiKey" className="text-left block mb-1 text-text-secondary">Anthropic API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-input border-border text-foreground"
              placeholder="sk-ant-api03-..."
            />
          </div>
          <Button
            onClick={handleSaveApiKey}
            className="w-full bg-primary hover:bg-primary-foreground text-primary-foreground hover:text-background transition-colors duration-300"
          >
            Save API Key
          </Button>
        </div>

        <div className="space-y-4 bg-card p-6 rounded-lg shadow-lg border border-destructive">
          <h2 className="text-2xl font-semibold text-destructive">Danger Zone</h2>
          <p className="text-sm text-text-secondary">
            This action will reset all your progress and user data. This cannot be undone.
          </p>
          <Button
            onClick={handleResetApp}
            className="w-full bg-destructive hover:bg-destructive-foreground text-destructive-foreground hover:text-background transition-colors duration-300"
          >
            Reset All App Data
          </Button>
        </div>

        <Button
          onClick={() => navigate('/dashboard')}
          variant="outline"
          className="w-full border-border text-text-secondary hover:bg-accent hover:text-accent-foreground"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default Settings;