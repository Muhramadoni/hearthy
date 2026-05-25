import { useState, useEffect } from "react";
import HomePage from "./page/homepage.jsx";
import DashboardPage from "./page/dashboard.jsx";
import AssessmentPage from "./page/assessment.jsx";
import UserProfilePage from "./page/user-profile.jsx";
import LoginPage from "./page/login.jsx";
import RegisterPage from "./page/register.jsx";
import ResetPasswordPage from "./page/reset.jsx";
import HistoryDetailPage from "./page/history-detail.jsx";
import { isAuthenticated } from "./services/authService";

// Halaman yang membutuhkan login
const PROTECTED_PAGES = ["dashboard", "assessment", "history-detail", "profile"];

export default function App() {
  const getInitialPage = () => {
    const sessionPage = sessionStorage.getItem("currentPage");
    if (sessionPage) {
      if (PROTECTED_PAGES.includes(sessionPage) && !isAuthenticated()) {
        return "login";
      }
      return sessionPage;
    }

    if (isAuthenticated()) {
      return "dashboard";
    }
    
    return "home";
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage);

  useEffect(() => {
    sessionStorage.setItem("currentPage", currentPage);
  }, [currentPage]);

  const handleNavigate = (page) => {
    // Jika halaman protected tapi belum login → redirect ke login
    if (PROTECTED_PAGES.includes(page) && !isAuthenticated()) {
      setCurrentPage("login");
      window.scrollTo(0, 0);
      return;
    }
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
      {currentPage === "history-detail" && (
        <HistoryDetailPage
          currentPage={currentPage}
          onNavigate={handleNavigate}
        />
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
      {currentPage === "register" && (
        <RegisterPage currentPage={currentPage} onNavigate={handleNavigate} />
      )}
      {currentPage === "reset" && (
        <ResetPasswordPage
          currentPage={currentPage}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}
