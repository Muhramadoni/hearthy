import logoSrc from "../image/logo-hearthy.png";
import iconUser from "../icon/icon-user.svg";

export default function Navbar({ currentPage, onNavigate }) {
  return (
    <header className="px-6 py-6">
      <div className="mx-auto flex max-w-screen-2xl items-center gap-6 rounded-[32px] bg-black px-6 py-4 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.12)]">
        <img
          src={logoSrc}
          alt="Hearthy logo"
          className="h-10 w-auto cursor-pointer"
          onClick={() => onNavigate("home")}
        />
        <nav className="hidden flex-1 items-center justify-center gap-8 text-sm font-semibold text-slate-700 md:flex">
          <button
            onClick={() => onNavigate("dashboard")}
            className={`transition ${
              currentPage === "dashboard"
                ? "text-slate-950 font-bold"
                : "hover:text-slate-900"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate("assessment")}
            className={`transition ${
              currentPage === "assessment"
                ? "text-slate-950 font-bold"
                : "hover:text-slate-900"
            }`}
          >
            Assessment
          </button>
          <button
            onClick={() => onNavigate("history")}
            className={`transition ${
              currentPage === "history"
                ? "text-slate-950 font-bold"
                : "hover:text-slate-900"
            }`}
          >
            History
          </button>
        </nav>
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950 transition hover:text-slate-900">
          <span>Ramadoni</span>
          <img src={iconUser} alt="User icon" className="h-6 w-6" />
        </div>
      </div>
    </header>
  );
}
