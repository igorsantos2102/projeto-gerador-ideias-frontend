import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Sun, Moon, ChevronDown, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from '@/hooks/useTheme';

export type NavItem = Readonly<{ to: string; label: string; exact?: boolean }>;

export type UserMenuProps = Readonly<{
  userName?: string;
  onLogout?: () => void;
  nav?: NavItem[];
  includeMobileNav?: boolean;
  className?: string;
}>;

export const UserMenu: React.FC<UserMenuProps> = ({
  userName = "Usuário",
  onLogout,
  nav = [],
  includeMobileNav = true,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const { darkMode, toggleDarkMode } = useTheme();

  // close on outside click / escape
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!open) return;
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleToggleTheme = () => {
    toggleDarkMode();
    setOpen(false);
  };

  const handleLogout = () => {
    setOpen(false);
    if (onLogout) onLogout();
    else navigate("/login");
  };

  const NAVIGATION_PATHS = new Set<string>([
    "/generator",
    "/my-ideas",
    "/community",
    "/favorites",
  ]);

  const DASHBOARD_PATHS = new Set<string>([
    "/dashboard",
    "/chatbot-metrics",
  ]);

  const navigationItems = nav.filter((item) => NAVIGATION_PATHS.has(item.to));
  const dashboardItems = nav.filter((item) => DASHBOARD_PATHS.has(item.to));

  return (
    <div className={cn("relative", className)}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full transition-all-smooth hover:scale-105",
          darkMode 
            ? "bg-slate-800/50 hover:bg-slate-700 border border-slate-700/50"
            : "bg-blue-50 hover:bg-blue-100 border border-blue-200/50"
        )}
      >
        <span className="text-sm font-light">{userName}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform",
            open ? "rotate-180" : "rotate-0"
          )}
        />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className={cn(
            "absolute right-0 mt-2 w-64 rounded-xl border shadow-lg z-[9999] animate-slideDown overflow-hidden",
            darkMode
              ? "bg-slate-900 border-slate-700"
              : "bg-white border-gray-200"
          )}
        >

          {/* Theme toggle */}
          <button
            type="button"
            onClick={handleToggleTheme}
            className={cn(
              "w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-all-smooth",
              darkMode ? "hover:bg-slate-800 text-slate-50" : "hover:bg-gray-100"
            )}
            role="menuitem"
          >
            {darkMode ? (
              <>
                <Sun className="w-4 h-4 text-yellow-500" />
                <span>Modo claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-blue-600" />
                <span>Modo escuro</span>
              </>
            )}
          </button>

          {/* Divider principal após toggle (mantido) */}
          <div
            className={cn(
              "my-1 h-px",
              darkMode ? "bg-slate-700" : "bg-gray-200"
            )}
          />

          {/* Navegação + Dashboards dentro do menu */}
          {includeMobileNav && nav.length > 0 && (
            <>
              {/* Seção: Navegação */}
              {navigationItems.length > 0 && (
                <>
                  <div
                    className={cn(
                      "px-4 pt-2 pb-1 text-xs uppercase tracking-wide",
                      darkMode ? "text-slate-400" : "text-gray-500"
                    )}
                  >
                    Navegação
                  </div>
                  <ul className="py-1">
                    {navigationItems.map((item) => (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          end={item.exact}
                          onClick={() => setOpen(false)}
                          className={({ isActive }) => {
                            const base =
                              "block px-4 py-2 text-sm transition-all-smooth";
                            let stateClass = "";

                            if (isActive && darkMode)
                              stateClass = "text-blue-300";
                            else if (isActive && !darkMode)
                              stateClass = "text-blue-600";
                            else if (!isActive && darkMode)
                              stateClass =
                                "text-slate-100 hover:bg-slate-800";
                            else
                              stateClass =
                                "text-gray-700 hover:bg-gray-100";

                            return cn(base, stateClass);
                          }}
                        >
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Divider mais sutil entre seções */}
              {navigationItems.length > 0 && dashboardItems.length > 0 && (
                <div
                  className={cn(
                    "mx-4 my-1 h-px",
                    darkMode ? "bg-slate-700" : "bg-gray-200"
                  )}
                />
              )}

              {/* Seção: Dashboards de uso */}
              {dashboardItems.length > 0 && (
                <>
                  <div
                    className={cn(
                      "px-4 pt-2 pb-1 text-xs uppercase tracking-wide",
                      darkMode ? "text-slate-400" : "text-gray-500"
                    )}
                  >
                    Dashboards de uso
                  </div>
                  <ul className="py-1">
                    {dashboardItems.map((item) => (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          end={item.exact}
                          onClick={() => setOpen(false)}
                          className={({ isActive }) => {
                            const base =
                              "block px-4 py-2 text-sm transition-all-smooth";
                            let stateClass = "";

                            if (isActive && darkMode)
                              stateClass = "text-blue-300";
                            else if (isActive && !darkMode)
                              stateClass = "text-blue-600";
                            else if (!isActive && darkMode)
                              stateClass =
                                "text-slate-100 hover:bg-slate-800";
                            else
                              stateClass =
                                "text-gray-700 hover:bg-gray-100";

                            return cn(base, stateClass);
                          }}
                        >
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Divider */}
              <div
                className={cn(
                  "my-1 h-px",
                  darkMode ? "bg-slate-700" : "bg-gray-200"
                )}
              />
            </>
          )}

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              "w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-all-smooth",
              darkMode
                ? "text-red-400 hover:bg-slate-800"
                : "text-red-600 hover:bg-red-50"
            )}
            role="menuitem"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
