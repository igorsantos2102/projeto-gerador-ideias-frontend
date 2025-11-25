// src/context/ThemeContext.ts
import { createContext } from "react";

export type ThemeContextValue = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
