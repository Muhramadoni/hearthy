import { useState } from "react";
import HomePage, { MainNavbar } from "./page/homepage.jsx";
import DashboardPage from "./page/dashboard.jsx";
import AssessmentPage from "./page/assessment.jsx";
import HistoryPage from "./page/history.jsx";

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-slate-950">
      {currentPage !== "home" && (
        <MainNavbar currentPage={currentPage} onNavigate={handleNavigate} />
      )}

      {currentPage === "home" && (
        <HomePage currentPage={currentPage} onNavigate={handleNavigate} />
      )}
      {currentPage === "dashboard" && <DashboardPage />}
      {currentPage === "assessment" && <AssessmentPage />}
      {currentPage === "history" && <HistoryPage />}
    </div>
  );
}
