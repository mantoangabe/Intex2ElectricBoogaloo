import { useEffect, useState } from 'react';
import { applyThemePreference, readThemePreference, writeThemePreference, type ThemePreference } from '../utils/themeCookie';
import '../styles/ThemeToggle.css';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemePreference>('light');

  useEffect(() => {
    setTheme(readThemePreference());
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemePreference = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    writeThemePreference(nextTheme);
    applyThemePreference(nextTheme);
  };

  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme}>
      Theme: {theme === 'light' ? 'Light' : 'Dark'}
    </button>
  );
}
