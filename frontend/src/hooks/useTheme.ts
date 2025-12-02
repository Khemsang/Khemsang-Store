import { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

/**
 * Custom hook to use Theme context
 * @returns Theme context value
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
