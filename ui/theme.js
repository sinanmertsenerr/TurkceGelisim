import { readStorage, writeStorage } from "./local-storage.js";

const THEME_STORAGE_KEY = "turkce-gelisim:tema";
const THEME_COLORS = { dark: "#070b14", light: "#f8fafc" };

function storedTheme() {
  const value = readStorage(THEME_STORAGE_KEY);
  return value === "dark" || value === "light" ? value : null;
}

function applyTheme(elements, theme) {
  document.documentElement.dataset.theme = theme;
  const dark = theme === "dark";
  elements.themeToggle.setAttribute("aria-pressed", String(dark));
  elements.themeToggleLabel.textContent = dark ? "Açık tema" : "Koyu tema";
  elements.themeToggle.setAttribute("aria-label", dark ? "Açık temaya geç" : "Koyu temaya geç");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
  writeStorage(THEME_STORAGE_KEY, theme);
}

export function installTheme(elements) {
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  applyTheme(elements, storedTheme() ?? (prefersDark ? "dark" : "light"));
  elements.themeToggle.addEventListener("click", () => {
    applyTheme(elements, document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });
}
