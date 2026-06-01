import { createContext, useContext, useEffect, useState } from "react";
import { storage } from "../services/storage";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => storage.getTheme());

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    storage.setTheme(theme);
  }, [theme]);

  const toggleTheme = () => setThemeState((t) => (t === "dark" ? "light" : "dark"));
  const setTheme = (t) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
