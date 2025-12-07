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
import RetestAttributes from "./pages/RetestAttributes";
import { useAppStore } from "./lib/store";
import React, { useEffect } from "react"; // Import useEffect

const queryClient = new QueryClient();

const App = () => {
  const userProfile = useAppStore((state) => state.userProfile);
  const validateAndSetUserId = useAppStore((state) => state.validateAndSetUserId);

  useEffect(() => {
    validateAndSetUserId();
  }, [validateAndSetUserId]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/awakening" element={<Awakening />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/log-workout" element={<LogWorkout />} />
            <Route path="/add-meal" element={<AddMeal />} />
            <Route path="/progress-report" element={<ProgressReport />} />
            <Route path="/upload-photo" element={<UploadPhoto />} />
            <Route path="/weigh-in" element={<WeighIn />} />
            <Route path="/log-creatine" element={<LogCreatine />} />
            <Route path="/log-sleep" element={<LogSleep />} />
            <Route path="/retest-attributes" element={<RetestAttributes />} />
            
            {/* Main routes, redirecting to Awakening if no profile */}
            <Route
              path="/dashboard"
              element={userProfile ? <Dashboard /> : <Navigate to="/awakening" replace />}
            />
            <Route
              path="/"
              element={userProfile ? <Navigate to="/dashboard" replace /> : <Navigate to="/awakening" replace />}
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;