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

export function updateSessionEstimate(elements) {
  const size = selectedSessionSize();
  const minutes = Math.max(4, Math.round(size * 0.6));
  elements.sessionEstimate.textContent = `Yaklaşık ${minutes} dakika sürer. İstediğin an kaydedip çıkabilirsin.`;
}

export function renderLevelCards(elements, { onStartLevel }) {
  const fragment = document.createDocumentFragment();
  LEVELS.forEach((level, index) => {
    const card = elements.levelTemplate.content.firstElementChild.cloneNode(true);
    card.classList.add(`level-${level.id}`);
    card.querySelector(".level-number").textContent = level.eyebrow;
    card.querySelector("h3").textContent = level.label;
    card.querySelector("p").textContent = level.description;
    const button = card.querySelector("button");
    button.dataset.level = level.id;
    button.setAttribute("aria-label", `${level.label} seviyesini başlat`);
    button.addEventListener("click", () => onStartLevel(level.id, selectedSessionSize()));
    card.style.setProperty("--delay", `${index * 55}ms`);
    fragment.append(card);
  });
  elements.levelGrid.replaceChildren(fragment);
}

export function updateResumePanel(elements) {
  elements.resumePanel.hidden = !state.resumableSession;
  if (!state.resumableSession) return;
  const level = LEVEL_BY_ID.get(state.resumableSession.level);
  const counts = countResponses(state.resumableSession.responses);
  elements.resumeText.textContent = `${level.label} · ${counts.answered}/${state.resumableSession.questionIds.length} yanıtlandı · ${counts.correct} doğru, ${counts.wrong} yanlış`;
}
