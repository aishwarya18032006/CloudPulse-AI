import { useTheme } from "../context/ThemeContext";

export const useChartTheme = () => {
  const { isDark } = useTheme();
  return {
    grid: "var(--chart-grid)",
    text: "var(--chart-text)",
    tooltip: {
      background: isDark ? "#18181b" : "#ffffff",
      border: `1px solid var(--border)`,
      borderRadius: 12,
      boxShadow: "var(--shadow-md)",
      color: "var(--text-primary)",
    },
  };
};
