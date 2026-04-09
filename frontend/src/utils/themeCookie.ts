export type ThemePreference = 'light' | 'dark';

const themeCookieName = 'themePreference';
const oneYearInSeconds = 60 * 60 * 24 * 365;

export function readThemePreference(): ThemePreference {
  if (typeof document === 'undefined') return 'light';

  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${themeCookieName}=`));

  const value = cookie?.split('=')[1];
  return value === 'dark' ? 'dark' : 'light';
}

export function writeThemePreference(theme: ThemePreference) {
  if (typeof document === 'undefined') return;
  document.cookie = `${themeCookieName}=${theme}; Path=/; Max-Age=${oneYearInSeconds}; SameSite=Lax`;
}

export function applyThemePreference(theme: ThemePreference) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
}
