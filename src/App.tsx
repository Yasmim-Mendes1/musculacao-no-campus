import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "./components/ui/sonner";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import LoginPage from "./pages/Login";
import OnboardingPage from "./pages/Onboarding";
import DashboardPage from "./pages/Dashboard";
import WorkoutPage from "./pages/Workout";
import ProgressPage from "./pages/Progress";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { getProfile, saveProfile, isOnboarded, setOnboarded, generateWorkouts, saveWorkouts, type UserProfile } from "./lib/store";
import StreakPage from "./pages/Streak";
import LevelsPage from "./pages/Levels";
import WorkoutsListPage from "./pages/WorkoutsList";
import BadgesPage from "./pages/Badges";

const queryClient = new QueryClient();

const AppContent = () => {
  const [loggedIn, setLoggedIn] = useState(!!getProfile());
  const [onboarded, setOnboardedState] = useState(isOnboarded());
  const [isSignup, setIsSignup] = useState(false);

  const handleLogin = (name: string, email: string, signup: boolean): string | null => {
    if (signup) {
      // cadastro: cria perfil e vai pro onboarding
      const profile: UserProfile = {
        name, email,
        goal: "hipertrofia", level: "iniciante",
        daysPerWeek: 3, trainingDays: [],
        xp: 0, currentLevel: 1, streak: 0, bestStreak: 0,
        badges: [], completedWorkouts: 0,
        joinedAt: new Date().toISOString(),
      };
      saveProfile(profile);
      setLoggedIn(true);
      setOnboardedState(false);
      return null;
    } else {
      // login: verifica se já existe perfil com esse email
      const existing = getProfile();
      if (!existing || existing.email !== email) {
        return "E-mail não encontrado. Cadastre uma conta primeiro.";
      }
      setLoggedIn(true);
      setOnboardedState(isOnboarded());
      return null;
    }
  };

  const handleOnboarding = (data: { goal: string; level: string; daysPerWeek: number; trainingDays: string[] }) => {
    const p = getProfile()!;
    p.goal = data.goal as UserProfile["goal"];
    p.level = data.level;
    p.daysPerWeek = data.daysPerWeek;
    p.trainingDays = data.trainingDays;
    saveProfile(p);
    const workouts = generateWorkouts(data.goal, data.trainingDays);
    saveWorkouts(workouts);
    setOnboarded();
    setOnboardedState(true);
  };

  if (!loggedIn) return <LoginPage onLogin={handleLogin} />;
  if (!onboarded) return <OnboardingPage onComplete={handleOnboarding} />;

  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/workout" element={<WorkoutPage />} />
      <Route path="/progress" element={<ProgressPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/badges" element={<BadgesPage />} />
      <Route path="/streak" element={<StreakPage />} />
      <Route path="/workouts" element={<WorkoutsListPage />} />
      <Route path="/levels" element={<LevelsPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;