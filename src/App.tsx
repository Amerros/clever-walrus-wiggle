import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard"; // Renamed from Index
import NotFound from "./pages/NotFound";
import Awakening from "./pages/Awakening";
import Settings from "./pages/Settings";
import { useAppStore } from "./lib/store";
import React from "react";

const queryClient = new QueryClient();

const App = () => {
  const userProfile = useAppStore((state) => state.userProfile);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/awakening" element={<Awakening />} />
            <Route path="/settings" element={<Settings />} />
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