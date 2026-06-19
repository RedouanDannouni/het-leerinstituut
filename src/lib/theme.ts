export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "hl-theme";

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "dark" || stored === "light" ? stored : null;
}

export function resolveTheme(): Theme {
  const stored = getStoredTheme();
  if (stored) return stored;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export const themeInitScript = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var t=localStorage.getItem(k);if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.dataset.theme="dark";document.documentElement.style.colorScheme="dark";}}catch(e){}})();`;
