// Uygulamanın bileşim kökü: modülleri kurar, gezinmeyi ve sekmeler arası
// eşitlemeyi bağlar. Ekranların kendi olayları ilgili ui/ modülündedir.
import { NOTEBOOK_STORAGE_KEY, STORAGE_KEY } from "./core.js";
import { BANK_VERSION, QUESTIONS, SOURCES, STUDY_TOPICS } from "./questions.js";
import { getElements } from "./ui/dom.js";
import { installHome, updateResumePanel, updateSetup } from "./ui/home.js";
import { installKeyboardShortcuts } from "./ui/keyboard.js";
import { installLibrary } from "./ui/library.js";
import { loadNotebook } from "./ui/notebook.js";
import { installResult } from "./ui/result.js";
import { showScreen } from "./ui/screens.js";
import { createSessionController } from "./ui/session.js";
import { loadResumableSession } from "./ui/session-store.js";
import { installTheme } from "./ui/theme.js";

function installNavigation(elements, { showHome, openLibrary }) {
  elements.homeLogo.addEventListener("click", showHome);
  elements.navPractice.addEventListener("click", showHome);
  elements.navLibrary.addEventListener("click", openLibrary);
  elements.saveAndExitButton.addEventListener("click", showHome);
}

// Başka bir sekmede oturum ya da defter değişirse ana sayfa güncel kalır.
function installCrossTabSync(elements) {
  window.addEventListener("storage", (event) => {
    if (document.body.dataset.screen !== "home") return;
    if (event.key === STORAGE_KEY) {
      loadResumableSession();
      updateResumePanel(elements);
    }
    if (event.key === NOTEBOOK_STORAGE_KEY) {
      loadNotebook();
      updateSetup(elements);
    }
  });
}

function renderBankSummary(elements) {
  elements.bankVersion.textContent = BANK_VERSION;
  elements.metricQuestions.textContent = String(QUESTIONS.length);
  elements.metricTopics.textContent = String(STUDY_TOPICS.length);
  elements.metricSources.textContent = String(Object.keys(SOURCES).length);
}

const elements = getElements();
const controller = createSessionController(elements);

installTheme(elements);
loadNotebook();
installHome(elements, controller);
installResult(elements, controller);
installLibrary(elements);
installNavigation(elements, controller);
installCrossTabSync(elements);
installKeyboardShortcuts(elements);
renderBankSummary(elements);
loadResumableSession();
updateResumePanel(elements);
showScreen(elements, "home", { focus: false });
