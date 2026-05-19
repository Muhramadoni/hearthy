import { useEffect, useState } from "react";
import logoSrc from "../image/logo-hearthy.png";
import iconUser from "../icon/icon-user.svg";
import iconSetting from "../icon/icon-setting.svg";
import iconLogout from "../icon/icon-logout.svg";
import { getCurrentUser, logout } from "../services/authService";
import Swal from "sweetalert2";

export default function Navbar({ currentPage = "home", onNavigate, showLoginButton = false }) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    const result = await Swal.fire({
      title: "Keluar dari akun?",
      text: "Apakah kamu yakin ingin keluar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
      confirmButtonColor: "#1e3a5a",
      cancelButtonColor: "#e2e8f0",
      customClass: {
        cancelButton: "!text-slate-900",
        popup: "!rounded-3xl",
        title: "!text-[#1e3a5a]",
      },
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    await logout();
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
    setUser(null);
    onNavigate("home");
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "assessment", label: "Assessment" },
    { id: "history", label: "History" },
  ];

  return (
    <>
      {/* Placeholder to prevent content from hiding under the fixed navbar */}
      <div className="h-[88px] md:h-[120px] w-full shrink-0" aria-hidden="true"></div>

      <header className="fixed top-0 left-0 right-0 z-40 pointer-events-none">
        {/* Efek blur gradual untuk area di luar navbar (sebelum konten menyentuh tepi atas layar) */}
        <div className="absolute inset-0 bg-[#f0f0f0]/60 backdrop-blur-md [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]"></div>
        
        <div className="relative px-4 py-4 md:px-6 md:py-6">
          <div className="pointer-events-auto mx-auto flex max-w-screen-2xl items-center justify-between gap-4 md:gap-6 rounded-3xl md:rounded-[32px] bg-white/80 backdrop-blur-lg px-4 md:px-6 py-3 md:py-4 shadow-[0_24px_80px_-28px_rgba(15,23,42,0.16)] shadow-lg ring-1 ring-slate-200/70">
          
          <div className="flex items-center">
            <img
              src={logoSrc}
              alt="Hearthy logo"
              className="h-8 md:h-10 w-auto cursor-pointer"
              onClick={() => onNavigate("home")}
            />
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-8 text-sm font-semibold text-slate-700 md:flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 rounded-lg transition cursor-pointer ${
                  currentPage === item.id ? "bg-[#1b4062] text-white font-bold" : "hover:bg-[#1b4062] hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
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

            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              className="md:hidden flex items-center justify-center p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <div 
        className={`fixed inset-0 z-[100] md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-slate-900/50 transition-opacity duration-300 ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Sidebar Content */}
        <div 
          className={`absolute inset-y-0 right-0 w-64 sm:w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-6 flex items-center justify-between border-b border-slate-100">
            <img src={logoSrc} alt="Hearthy logo" className="h-8 w-auto" />
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl transition font-semibold ${
                  currentPage === item.id 
                    ? "bg-[#1b4062] text-white" 
                    : "text-slate-700 hover:bg-[#1b4062] hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          
          <div className="p-6 border-t border-slate-100">
            {shouldShowLoginButton ? (
              <button
                type="button"
                onClick={() => {
                  onNavigate("login");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center rounded-xl bg-[#1e3a5a] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#173652]"
              >
                Login
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                 <div className="flex items-center gap-3 px-2 py-2 mb-2">
                    <img src={iconUser} alt="User" className="h-10 w-10 rounded-full" />
                    <div className="overflow-hidden">
                      <p className="font-semibold text-slate-900 truncate">{username}</p>
                      <p className="text-xs text-slate-500 truncate">Pengguna Hearthy</p>
                    </div>
                 </div>
                 <button
                    type="button"
                    onClick={() => {
                      onNavigate("profile");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition flex items-center gap-3"
                  >
                    <img src={iconSetting} alt="Setting" className="h-5 w-5" />
                    Pengaturan
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition flex items-center gap-3"
                  >
                    <img src={iconLogout} alt="Logout" className="h-5 w-5" />
                    Logout
                  </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
