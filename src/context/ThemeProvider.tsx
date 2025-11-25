// src/context/ThemeProvider.tsx
import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { ThemeContext } from "./ThemeContext";

const STORAGE_KEY = "darkMode";

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: Readonly<ThemeProviderProps>) {
  const [darkMode, setDarkMode] = useState(false);

  // load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "true") setDarkMode(true);
    } catch {
      // ignore
    }
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ darkMode, toggleDarkMode }),
    [darkMode, toggleDarkMode]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
