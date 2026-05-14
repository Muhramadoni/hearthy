import { useEffect, useState } from "react";
import logoSrc from "../image/logo-hearthy.png";
import iconUser from "../icon/icon-user.svg";
import iconSetting from "../icon/icon-setting.svg";
import iconLogout from "../icon/icon-logout.svg";
import { getCurrentUser, logout } from "../services/authService";

export default function Navbar({ currentPage = "home", onNavigate, showLoginButton = false }) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    const handleStorage = () => setUser(getCurrentUser());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const isLoggedIn = !!user;
  const username = user?.name ?? "Pengguna";
  const shouldShowLoginButton = showLoginButton || !isLoggedIn;

  const handleLogout = async () => {
    await logout();
    setIsProfileMenuOpen(false);
    setUser(null);
    onNavigate("home");
  };

  return (
    <header className="px-6 py-6">
      <div className="mx-auto flex max-w-screen-2xl items-center gap-6 rounded-[32px] bg-white px-6 py-4 shadow-[0_24px_80px_-28px_rgba(15,23,42,0.16)] shadow-lg ring-1 ring-slate-200/70">
        <img
          src={logoSrc}
          alt="Hearthy logo"
          className="h-10 w-auto cursor-pointer"
          onClick={() => onNavigate("home")}
        />
        <nav className="hidden flex-1 items-center justify-center gap-8 text-sm font-semibold text-slate-700 md:flex">
          <button
            onClick={() => onNavigate("dashboard")}
            className={`px-4 py-2 rounded-lg transition cursor-pointer ${
              currentPage === "dashboard" ? "bg-[#1b4062] text-white font-bold" : "hover:bg-[#1b4062] hover:text-white"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate("assessment")}
            className={`px-4 py-2 rounded-lg transition cursor-pointer ${
              currentPage === "assessment" ? "bg-[#1b4062] text-white font-bold" : "hover:bg-[#1b4062] hover:text-white"
            }`}
          >
            Assessment
          </button>
          <button
            onClick={() => onNavigate("history")}
            className={`px-4 py-2 rounded-lg transition cursor-pointer ${
              currentPage === "history" ? "bg-[#1b4062] text-white font-bold" : "hover:bg-[#1b4062] hover:text-white"
            }`}
          >
            History
          </button>
        </nav>
        {shouldShowLoginButton ? (
          <button
            type="button"
            onClick={() => onNavigate("login")}
            className="inline-flex items-center justify-center rounded-full bg-[#1e3a5a] px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-[#1e3a5a]/20 transition hover:bg-[#173652]"
          >
            Login
          </button>
        ) : (
          <div className="relative">
            <button
              type="button"
              id="navbar-profile-btn"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm shadow-slate-200/50 transition hover:bg-slate-200"
            >
              <span>{username}</span>
              <img src={iconUser} alt="User icon" className="h-6 w-6 rounded-full" />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_-20px_rgba(15,23,42,0.16)] ring-1 ring-slate-200/70 z-50">
                <button
                  type="button"
                  onClick={() => {
                    onNavigate("profile");
                    setIsProfileMenuOpen(false);
                  }}
                  className="block w-full px-4 py-3 text-left bg-white text-sm font-medium text-slate-900 hover:bg-[#1b4062]/15 hover:text-slate-950 transition flex items-center gap-3"
                >
                  <img src={iconSetting} alt="Setting icon" className="h-5 w-5" />
                  Pengaturan
                </button>
                <button
                  id="navbar-logout-btn"
                  type="button"
                  onClick={handleLogout}
                  className="block w-full px-4 py-3 text-left bg-white text-sm font-medium text-red-600 hover:bg-red-50 transition flex items-center gap-3"
                >
                  <img src={iconLogout} alt="Logout icon" className="h-5 w-5" />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
