import { byId } from "./dom.js";

const CRUMBS = {
  home: "Antrenman / Oturum kur",
  quiz: "Antrenman / Oturum",
  result: "Antrenman / Sonuç",
  library: "Kural bankası / Kaynaklı arama",
};

export function showScreen(elements, name, { focus = true } = {}) {
  const target = byId(`screen-${name}`);
  for (const screen of elements.screens) screen.hidden = screen !== target;
  document.body.dataset.screen = name;
  document.title = `${target.dataset.title} — Türkçe Gelişim`;
  elements.navPractice.setAttribute("aria-pressed", String(name === "home" || name === "quiz" || name === "result"));
  elements.navLibrary.setAttribute("aria-pressed", String(name === "library"));
  elements.crumb.textContent = CRUMBS[name] ?? "Antrenman";
  window.scrollTo({ top: 0, behavior: "instant" });

  if (focus) {
    requestAnimationFrame(() => target.querySelector("h1")?.focus({ preventScroll: true }));
  }
}
