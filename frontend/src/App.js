import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import Welcome from "@/pages/Welcome";
import AgeSelection from "@/pages/AgeSelection";
import Dashboard from "@/pages/Dashboard";
import LessonLibrary from "@/pages/LessonLibrary";
import LiveTeachingPlate from "@/pages/LiveTeachingPlate";
import Quiz from "@/pages/Quiz";
import ProgressBadges from "@/pages/ProgressBadges";
import FamilyChallenge from "@/pages/FamilyChallenge";
import GlobalFoodMission from "@/pages/GlobalFoodMission";
import FoodTruckBuilder from "@/pages/FoodTruckBuilder";
import RestaurantBuilder from "@/pages/RestaurantBuilder";
import ParentTeacherInfo from "@/pages/ParentTeacherInfo";
import Settings from "@/pages/Settings";
import BottomNavigation from "@/components/BottomNavigation";

const HIDE_NAV_PATHS = ["/", "/age", "/parent"];
const FLUID_PATHS = ["/"];

function ShellContent() {
  const location = useLocation();
  const hideNav = HIDE_NAV_PATHS.includes(location.pathname);
  const fluid = FLUID_PATHS.includes(location.pathname);

  return (
    <div
      className={`cck-shell ${hideNav ? "cck-no-nav" : ""} ${fluid ? "cck-shell-fluid" : ""}`}
      data-testid="app-shell"
    >
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/age" element={<AgeSelection />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/lessons" element={<LessonLibrary />} />
        <Route path="/lesson/:lessonId" element={<LiveTeachingPlate />} />
        <Route path="/quiz/:lessonId" element={<Quiz />} />
        <Route path="/progress" element={<ProgressBadges />} />
        <Route path="/family" element={<FamilyChallenge />} />
        <Route path="/global" element={<GlobalFoodMission />} />
        <Route path="/food-truck" element={<FoodTruckBuilder />} />
        <Route path="/restaurant" element={<RestaurantBuilder />} />
        <Route path="/parent" element={<ParentTeacherInfo />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      {!hideNav && <BottomNavigation />}
    </div>
  );
}

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ShellContent />
        <Toaster richColors position="top-center" />
      </BrowserRouter>
    </div>
  );
}
