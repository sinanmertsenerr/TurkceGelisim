import { countResponses } from "../core.js";
import { LEVELS } from "../questions.js";
import { LEVEL_BY_ID } from "./helpers.js";
import { state } from "./state.js";

export function selectedSessionSize() {
  return Number(document.querySelector('input[name="session-size"]:checked')?.value ?? 20);
}

export function setSelectedSessionSize(size) {
  const input = document.querySelector(`input[name="session-size"][value="${size}"]`);
  if (input) input.checked = true;
}

export function selectedLevel() {
  return document.querySelector('.level-card[aria-checked="true"]')?.dataset.level ?? state.lastSettings.level;
}

export function setSelectedLevel(levelId) {
  for (const card of document.querySelectorAll(".level-card")) {
    const selected = card.dataset.level === levelId;
    card.setAttribute("aria-checked", String(selected));
    card.classList.toggle("selected", selected);
    card.tabIndex = selected ? 0 : -1;
  }
}

export function updateSessionEstimate(elements) {
  const size = selectedSessionSize();
  const minutes = Math.max(4, Math.round(size * 0.6));
  elements.sessionEstimate.textContent = `Yaklaşık ${minutes} dakika sürer. İstediğin an kaydedip çıkabilirsin.`;
}

export function renderLevelCards(elements) {
  const fragment = document.createDocumentFragment();
  LEVELS.forEach((level, index) => {
    const card = elements.levelTemplate.content.firstElementChild.cloneNode(true);
    card.classList.add(`level-${level.id}`);
    card.dataset.level = level.id;
    card.querySelector(".level-name").textContent = level.label;
    card.querySelector(".badge-sub").textContent = level.description;
    card.setAttribute("aria-label", `${level.label}: ${level.description}`);
    card.addEventListener("click", () => setSelectedLevel(level.id));
    card.addEventListener("keydown", (event) => {
      const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
      if (!delta) return;
      event.preventDefault();
      const next = LEVELS[(index + delta + LEVELS.length) % LEVELS.length];
      setSelectedLevel(next.id);
      elements.levelGrid.querySelector(`[data-level="${next.id}"]`)?.focus();
    });
    card.style.setProperty("--delay", `${index * 55}ms`);
    fragment.append(card);
  });
  elements.levelGrid.replaceChildren(fragment);
  setSelectedLevel(state.lastSettings.level);
}

export function updateResumePanel(elements) {
  elements.resumePanel.hidden = !state.resumableSession;
  if (!state.resumableSession) return;
  const level = LEVEL_BY_ID.get(state.resumableSession.level);
  const counts = countResponses(state.resumableSession.responses);
  elements.resumeText.textContent = `${level.label} · ${counts.answered}/${state.resumableSession.questionIds.length} yanıtlandı · ${counts.correct} doğru, ${counts.wrong} yanlış`;
}
