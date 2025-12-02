import { useTheme } from "../../contexts/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";

const DarkModeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full bg-gray-300 dark:bg-gray-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--root-color)] focus:ring-offset-2"
      aria-label="Toggle dark mode"
    >
      {/* Toggle Circle */}
      <div
        className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
          isDark ? "translate-x-7" : "translate-x-0"
        }`}
      >
        {isDark ? (
          <FaMoon className="w-3 h-3 text-indigo-600" />
        ) : (
          <FaSun className="w-3 h-3 text-yellow-500" />
        )}
      </div>

      {/* Background Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-1.5">
        <FaSun
          className={`w-3 h-3 transition-opacity duration-300 ${
            isDark ? "opacity-0" : "opacity-100 text-yellow-500"
          }`}
        />
        <FaMoon
          className={`w-3 h-3 transition-opacity duration-300 ${
            isDark ? "opacity-100 text-indigo-300" : "opacity-0"
          }`}
        />
      </div>
    </button>
  );
};

export default DarkModeToggle;
