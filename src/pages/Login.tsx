import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary-foreground">
            <span className="text-cyan-400">SYSTEM</span> LOGIN
          </CardTitle>
          <p className="text-sm text-text-secondary">
            Access your Hunter Profile
          </p>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            providers={[]} // No third-party providers unless specified
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--sl-primary-accent))',
                    brandAccent: 'hsl(var(--sl-secondary-accent))',
                    inputBackground: 'hsl(var(--input))',
                    inputBorder: 'hsl(var(--border))',
                    inputLabel: 'hsl(var(--text-secondary))',
                    inputText: 'hsl(var(--foreground))',
                    anchorTextColor: 'hsl(var(--sl-primary-accent))',
                    anchorTextHoverColor: 'hsl(var(--sl-secondary-accent))',
                  },
                },
              },
            }}
            theme="dark" // Using dark theme to match app's aesthetic
            redirectTo={window.location.origin + '/dashboard'} // Redirect to dashboard after login
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;