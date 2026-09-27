import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { initialsOf } from "@/utils/formatters";
import { useState } from "react";

const NAV_LINKS = [
  { to: "/", label: "داشبورد" },
  { to: "/projects", label: "پروژه‌ها" },
  { to: "/my-projects", label: "پروژه‌های من" },
  { to: "/proposals", label: "پیشنهادهای من" },
  { to: "/bookmarks", label: "نشان‌شده‌ها" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-3.5 py-2 text-sm font-medium transition ${
      isActive ? "bg-brand-600/10 text-brand-700" : "text-muted hover:bg-white/50 hover:text-ink"
    }`;

  return (
    <header className="sticky top-0 z-30 border-b border-white/40 bg-white/60 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white shadow-md shadow-brand-900/20">
              ف
            </span>
            <span className="text-base font-bold text-ink">فریلنسر</span>
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.to === "/"} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <NavLink to="/projects/new" className="btn-accent hidden px-4 py-2 text-xs sm:inline-flex">
            ثبت پروژه جدید
          </NavLink>

          <NavLink to="/profile" className="flex items-center gap-2">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-white/70"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 ring-2 ring-white/70">
                {initialsOf(user?.name)}
              </span>
            )}
          </NavLink>

          <button onClick={handleLogout} className="hidden text-sm font-medium text-muted hover:text-red-600 md:inline">
            خروج
          </button>

          <button
            className="rounded-full bg-white/50 p-2 text-ink backdrop-blur-sm md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="باز کردن منو"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-white/40 bg-white/70 px-4 py-3 backdrop-blur-lg md:hidden">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={linkClass}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/projects/new" className={linkClass} onClick={() => setMenuOpen(false)}>
            ثبت پروژه جدید
          </NavLink>
          <button onClick={handleLogout} className="rounded-full px-3.5 py-2 text-right text-sm font-medium text-red-600">
            خروج
          </button>
        </nav>
      )}
    </header>
  );
}
