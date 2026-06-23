export const THEME_STORAGE_KEY = 'forecast-kit-theme';

/** Previous typo key; migrated on read so existing users keep their preference. */
export const LEGACY_THEME_STORAGE_KEY = 'forcast-kit-theme';

const THEME_COOKIE_MAX_AGE_SECONDS = String(60 * 60 * 24 * 365);

export type Theme = 'light' | 'dark';

function isTheme(value: string | null | undefined): value is Theme {
  return value === 'light' || value === 'dark';
}

/** Runs before paint to apply stored dark theme and prevent a flash of light background. */
export const themeInitScript = `(function(){try{var k='${THEME_STORAGE_KEY}';var lk='${LEGACY_THEME_STORAGE_KEY}';var t=localStorage.getItem(k);if(!t||t!=='dark'&&t!=='light'){t=localStorage.getItem(lk);if(t!=='dark'&&t!=='light'){return}localStorage.setItem(k,t);localStorage.removeItem(lk)}document.documentElement.classList.toggle('dark',t==='dark');document.cookie=k+'='+t+';path=/;max-age=${THEME_COOKIE_MAX_AGE_SECONDS};SameSite=Lax'}catch(e){}})();`;

export function parseTheme(value: string | undefined): Theme {
  return value === 'dark' ? 'dark' : 'light';
}

export function readThemeFromStorage(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (isTheme(stored)) {
      return stored;
    }

    const legacy = localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
    if (isTheme(legacy)) {
      localStorage.setItem(THEME_STORAGE_KEY, legacy);
      localStorage.removeItem(LEGACY_THEME_STORAGE_KEY);
      return legacy;
    }
  } catch {
    // localStorage may be unavailable (private browsing, etc.)
  }
  return 'light';
}

export function writeThemeCookie(theme: Theme): void {
  document.cookie = `${THEME_STORAGE_KEY}=${theme};path=/;max-age=${THEME_COOKIE_MAX_AGE_SECONDS};SameSite=Lax`;
}

export function writeThemeToStorage(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage may be unavailable
  }
  writeThemeCookie(theme);
}

export function applyThemeClass(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}
