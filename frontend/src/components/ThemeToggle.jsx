import { Moon, Sun } from 'lucide-react';

import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`icon-btn ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? (
        <Sun className="size-4.5" aria-hidden="true" />
      ) : (
        <Moon className="size-4.5" aria-hidden="true" />
      )}
    </button>
  );
}
