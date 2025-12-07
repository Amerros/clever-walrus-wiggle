import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Awakening from "./pages/Awakening";
import Settings from "./pages/Settings";
import LogWorkout from "./pages/LogWorkout";
import AddMeal from "./pages/AddMeal";
import ProgressReport from "./pages/ProgressReport";
import UploadPhoto from "./pages/UploadPhoto";
import WeighIn from "./pages/WeighIn";
import LogCreatine from "./pages/LogCreatine";
import LogSleep from "./pages/LogSleep";
import Header from "./components/Header";
import Login from "./pages/Login"; // Import the new Login page
import { SessionProvider, useSession } from "./components/SessionProvider"; // Import SessionProvider and useSession
import { useAppStore } from "./lib/store";
import React, { useEffect } from "react";

const queryClient = new QueryClient();

// A wrapper component to handle authentication-based redirection
const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useSession();
  const setProfile = useAppStore((state) => state.setProfile);
  const userProfile = useAppStore((state) => state.userProfile);

  useEffect(() => {
    if (!isLoading && user && !userProfile?.userId) {
      // If user is logged in via Supabase but not yet in Zustand store, set a basic profile
      // This is a placeholder; a real app might fetch full profile from 'profiles' table
      setProfile({
        userId: user.id,
        height: userProfile?.height || 175, // Default or existing
        startWeight: userProfile?.startWeight || 70, // Default or existing
        currentWeight: userProfile?.currentWeight || 70, // Default or existing
        goalWeight: userProfile?.goalWeight || 75, // Default or existing
        startDate: userProfile?.startDate || new Date().toISOString().split('T')[0],
      });
    }
  }, [isLoading, user, userProfile, setProfile]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Loading session...</div>;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SessionProvider> {/* Wrap with SessionProvider */}
            <Header />
            <AuthWrapper> {/* Wrap routes that need auth with AuthWrapper */}
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/awakening" element={<Awakening />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/log-workout" element={<LogWorkout />} />
                <Route path="/add-meal" element={<AddMeal />} />
                <Route path="/progress-report" element={<ProgressReport />} />
                <Route path="/upload-photo" element={<UploadPhoto />} />
                <Route path="/weigh-in" element={<WeighIn />} />
                <Route path="/log-creatine" element={<LogCreatine />} />
                <Route path="/log-sleep" element={<LogSleep />} />
                
                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={<ProtectedRoute element={<Dashboard />} />}
                />
                <Route
                  path="/"
                  element={<ProtectedRoute element={<Dashboard />} />}
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthWrapper>
          </SessionProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

// Component to protect routes
const ProtectedRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { user, isLoading } = useSession();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{element}</>;
};

export default App;