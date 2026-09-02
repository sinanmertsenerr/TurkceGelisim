const STORAGE_KEY = "turkce-gelisim:tema";

function readStoredTheme() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Depolama kapalıysa tema yalnız bu sekmede geçerli olur.
  }
}

export function applyTheme(elements, theme) {
  document.documentElement.dataset.theme = theme;
  const dark = theme === "dark";
  elements.themeToggle.setAttribute("aria-pressed", String(dark));
  elements.themeToggleLabel.textContent = dark ? "Açık tema" : "Koyu tema";
  elements.themeToggle.setAttribute("aria-label", dark ? "Açık temaya geç" : "Koyu temaya geç");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#070b14" : "#f8fafc");
  storeTheme(theme);
}

export function installTheme(elements) {
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  applyTheme(elements, readStoredTheme() ?? (prefersDark ? "dark" : "light"));
  elements.themeToggle.addEventListener("click", () => {
    applyTheme(elements, document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });
}
