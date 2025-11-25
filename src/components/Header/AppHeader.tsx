import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import Brand from "./Brand";
import UserMenu from "./UserMenu";
import { useLogout } from "@/lib/auth";
import { useTheme } from "@/hooks/useTheme";

export type NavItem = Readonly<{ to: string; label: string; exact?: boolean }>;

const DEFAULT_NAV: NavItem[] = [
  { to: "/generator", label: "Início" },
  { to: "/my-ideas", label: "Minhas Ideias"},
  { to: "/community", label: "Comunidade" },
  { to: "/favorites", label: "Ideias Favoritas" },
  { to: "/dashboard", label: "Métricas de Ideias Geradas" },
  { to: "/chatbot-metrics", label: "Métricas da Aiko IA"}
];

export type AppHeaderProps = Readonly<{
  nav?: NavItem[];
  className?: string;
}>;

export const AppHeader: React.FC<AppHeaderProps> = ({
  nav = DEFAULT_NAV,
  className,
}) => {
  const handleLogout = useLogout();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user?.name || "Usuário";
  const { darkMode } = useTheme();

  const headerBase =
    "sticky top-0 z-50 border-b backdrop-blur-md";
  
  const headerTheme = darkMode
    ? "bg-slate-900/95 border-slate-800"
    : "bg-white/95 border-gray-200";

  const PRIMARY_NAV_PATHS = new Set([
    "/generator",
    "/my-ideas",
    "/community",
  ]);

  const primaryNav = nav.filter((item) => PRIMARY_NAV_PATHS.has(item.to));

  return (
    <header
      className={cn(
        headerBase,
        headerTheme,
        className
      )}
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
    >
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        {/* Brand */}
        <Brand />

        <div className="flex items-center gap-8">
          {/* Primary nav */}
          <nav className="hidden md:flex gap-8">
            {primaryNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => {
                  const base =
                    "text-sm font-light transition-all-smooth relative px-1 py-1";
                  let stateClass = "";

                  if (isActive && darkMode) {
                    stateClass = "text-blue-400";
                  } else if (isActive && !darkMode) {
                    stateClass = "text-blue-600";
                  } else if (!isActive && darkMode) {
                    stateClass = "text-gray-400 hover:text-gray-200";
                  } else {
                    stateClass = "text-gray-600 hover:text-gray-900";
                  }

                  return cn(base, stateClass);
                }}
                end={item.exact}
              >
                {({ isActive }) => (
                  <span className="relative inline-block">
                    {item.label}
                    {isActive ? (
                      <span className={cn(
                        "absolute left-0 right-0 -bottom-0.5 h-0.5 animate-fadeIn", 
                          darkMode
                          ? "bg-blue-400"
                          : "bg-blue-600"
                        )} 
                      />
                    ) : null}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Menu */}
          <UserMenu
            userName={userName}
            onLogout={handleLogout}
            nav={nav}
            includeMobileNav
          />
        </div>
      </div>
    </header>
  );
};
