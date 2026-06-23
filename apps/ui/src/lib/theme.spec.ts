import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  LEGACY_THEME_STORAGE_KEY,
  parseTheme,
  readThemeFromStorage,
  THEME_STORAGE_KEY,
  themeInitScript,
  writeThemeCookie,
  writeThemeToStorage,
} from './theme.js';

function createStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => {
      store.clear();
    },
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
}

describe('parseTheme', () => {
  it('returns dark only for the dark value', () => {
    expect(parseTheme('dark')).toBe('dark');
    expect(parseTheme('light')).toBe('light');
    expect(parseTheme(undefined)).toBe('light');
    expect(parseTheme('system')).toBe('light');
  });
});

describe('readThemeFromStorage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns light when storage is empty', () => {
    expect(readThemeFromStorage()).toBe('light');
  });

  it('reads a stored theme from the current key', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    expect(readThemeFromStorage()).toBe('dark');
  });

  it('migrates the legacy storage key to the current key', () => {
    localStorage.setItem(LEGACY_THEME_STORAGE_KEY, 'dark');
    expect(readThemeFromStorage()).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(localStorage.getItem(LEGACY_THEME_STORAGE_KEY)).toBeNull();
  });

  it('ignores invalid stored values', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'system');
    expect(readThemeFromStorage()).toBe('light');
  });
});

describe('writeThemeToStorage', () => {
  let cookie = '';

  beforeEach(() => {
    cookie = '';
    vi.stubGlobal('localStorage', createStorage());
    vi.stubGlobal('document', {
      get cookie() {
        return cookie;
      },
      set cookie(value: string) {
        cookie = value;
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('persists theme to localStorage and cookie', () => {
    writeThemeToStorage('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(cookie).toContain(`${THEME_STORAGE_KEY}=dark`);
  });
});

describe('writeThemeCookie', () => {
  let cookie = '';

  beforeEach(() => {
    cookie = '';
    vi.stubGlobal('document', {
      get cookie() {
        return cookie;
      },
      set cookie(value: string) {
        cookie = value;
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sets a long-lived SameSite=Lax cookie', () => {
    writeThemeCookie('light');
    expect(cookie).toContain(`${THEME_STORAGE_KEY}=light`);
    expect(cookie).toContain('path=/');
    expect(cookie).toContain('SameSite=Lax');
  });
});

describe('themeInitScript', () => {
  it('references the storage key and legacy migration', () => {
    expect(themeInitScript).toContain(THEME_STORAGE_KEY);
    expect(themeInitScript).toContain(LEGACY_THEME_STORAGE_KEY);
    expect(themeInitScript).toContain("classList.toggle('dark'");
  });
});
