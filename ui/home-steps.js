// Ana sayfanın adımlı kurulumu: hangi adım görünür, gösterge nasıl işaretlenir,
// özet çipleri ve tarayıcı geçmişi. Kurulum verisini değiştirmez; yalnız
// adımlar arasında gezinir (yazma tarafı ui/home.js'teki updateSetup'tadır).
import { STEP_CHIP_LABEL, eyebrowText } from "./copy.js";
import { homeSteps } from "./setup.js";
import { state } from "./state.js";

// Üst satırdaki çipler hem seçimi özetler hem de ilgili adıma geri götürür;
// ayrı bir geri düğmesi yoktur. Seçilen biçim hero'daki üst yazıya işlenir.
export function renderStepSummary(elements) {
  const steps = homeSteps(state.setup);
  const done = steps.slice(0, steps.indexOf(state.homeStep));
  elements.stepSummary.replaceChildren(...done.map((step) => stepChip(elements, step)));
  elements.homeEyebrow.textContent = eyebrowText(state.setup, state.homeStep);
}

function stepChip(elements, step) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "summary-chip";
  button.dataset.step = step;
  button.textContent = `← ${STEP_CHIP_LABEL[step]}`;
  button.addEventListener("click", () => goToStep(elements, step));
  return button;
}

export function goToStep(elements, step, { push = true, focus = true } = {}) {
  const steps = homeSteps(state.setup);
  const target = steps.includes(step) ? step : steps[0];
  state.homeStep = target;
  // Biçim seçildikten sonra hero başlığı ve tanıtım metni çekilir; üst yazı kalır.
  elements.homeHero.classList.toggle("is-compact", target !== "mode");

  for (const section of elements.setupSteps.querySelectorAll(".setup-step")) {
    section.hidden = section.dataset.step !== target;
  }
  renderStepIndicator(elements, steps, steps.indexOf(target));
  renderStepSummary(elements);

  if (push && document.body.dataset.screen === "home") {
    history.pushState({ homeStep: target }, "");
  }
  if (focus) focusStep(elements, target);
}

// Gösterge yalnız o biçimde geçerli adımları numaralar; geçilenler işaretlenir.
function renderStepIndicator(elements, steps, position) {
  for (const item of elements.stepIndicator.querySelectorAll("li")) {
    const index = steps.indexOf(item.dataset.step);
    item.hidden = index === -1;
    item.querySelector(".step-num").textContent = String(index + 1);
    item.classList.toggle("is-done", index !== -1 && index < position);
    if (index === position) item.setAttribute("aria-current", "step");
    else item.removeAttribute("aria-current");
  }
}

function focusStep(elements, step) {
  requestAnimationFrame(() => {
    elements.setupSteps.querySelector(`#step-${step} h2`)?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  });
}

export function goToNextStep(elements) {
  const steps = homeSteps(state.setup);
  goToStep(elements, steps[Math.min(steps.indexOf(state.homeStep) + 1, steps.length - 1)]);
}

// Tarayıcı geri tuşu adımı geri alır.
export function installStepHistory(elements) {
  history.replaceState({ homeStep: "mode" }, "");
  window.addEventListener("popstate", (event) => {
    if (document.body.dataset.screen !== "home" || !event.state?.homeStep) return;
    goToStep(elements, event.state.homeStep, { push: false });
  });
}
