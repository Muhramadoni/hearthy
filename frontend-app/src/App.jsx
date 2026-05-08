import { useState } from "react";
import HomePage from "./page/homepage.jsx";
import DashboardPage from "./page/dashboard.jsx";
import AssessmentPage from "./page/assessment.jsx";
import HistoryPage from "./page/history.jsx";
import UserProfilePage from "./page/user-profile.jsx";
import LoginPage from "./page/login.jsx";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-slate-950">
      {currentPage === "home" && (
        <HomePage currentPage={currentPage} onNavigate={handleNavigate} />
      )}
      {currentPage === "dashboard" && (
        <DashboardPage currentPage={currentPage} onNavigate={handleNavigate} />
      )}
      {currentPage === "assessment" && (
        <AssessmentPage currentPage={currentPage} onNavigate={handleNavigate} />
      )}
      {currentPage === "history" && (
        <HistoryPage currentPage={currentPage} onNavigate={handleNavigate} />
      )}
      {currentPage === "profile" && (
        <UserProfilePage
          currentPage={currentPage}
          onNavigate={handleNavigate}
        />
      )}
      {currentPage === "login" && (
        <LoginPage currentPage={currentPage} onNavigate={handleNavigate} />
      )}
    </div>
  );
}
