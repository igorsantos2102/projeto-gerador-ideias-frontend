import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import { AppHeader } from "@/components/Header/AppHeader";
import { AppFooter } from "@/components/Footer/AppFooter";
import { cn } from "@/lib/utils";
import { isAuthenticated } from "@/lib/api";

export function PrivateLayout() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col relative",
        darkMode ? "dark bg-slate-950 text-white" : "bg-white text-gray-900"
      )}
    >

      <div
        className={cn(
          "fixed top-0 left-0 right-0 h-96 pointer-events-none z-0",
          darkMode
            ? "bg-gradient-to-b from-blue-900/10 to-transparent"
            : "bg-gradient-to-b from-blue-100/40 via-purple-100/30 to-transparent"
        )}
      />
      
      <AppHeader />

      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      
      <AppFooter />
    </div>
  );
}
