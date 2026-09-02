import { STORAGE_KEY } from "./core.js";
import { BANK_VERSION } from "./questions.js";
import { getElements } from "./ui/dom.js";
import { renderLevelCards, selectedLevel, selectedSessionSize, updateSessionEstimate } from "./ui/home.js";
import { installKeyboardShortcuts } from "./ui/keyboard.js";
import { closeLibraryDetail, openLibraryDetail, populateTopics, renderLibrary, syncLibraryDetailState } from "./ui/library.js";
import { createSessionController } from "./ui/session.js";
import { showScreen } from "./ui/screens.js";
import { loadResumableSession } from "./ui/storage.js";
import { state } from "./ui/state.js";
import { installTheme } from "./ui/theme.js";

const elements = getElements();
const controller = createSessionController({ elements });

installTheme(elements);
renderLevelCards(elements);
elements.startSessionButton.addEventListener("click", () => controller.startNewSession(selectedLevel(), selectedSessionSize()));
updateSessionEstimate(elements);

for (const input of document.querySelectorAll('input[name="session-size"]')) {
  input.addEventListener("change", () => updateSessionEstimate(elements));
}

elements.homeLogo.addEventListener("click", controller.showHome);
elements.navPractice.addEventListener("click", controller.showHome);
elements.navLibrary.addEventListener("click", controller.openLibrary);
elements.saveAndExitButton.addEventListener("click", controller.showHome);
elements.nextQuestionButton.addEventListener("click", controller.goToNextQuestion);

elements.resumeButton.addEventListener("click", controller.resumeSession);
elements.discardResumeButton.addEventListener("click", controller.discardResume);

elements.retryWrongButton.addEventListener("click", controller.retryWrong);
elements.newSessionButton.addEventListener("click", controller.startNewFromLastSettings);
elements.resultHomeButton.addEventListener("click", controller.showHome);
elements.reviewMoreButton.addEventListener("click", controller.showMoreReviews);

for (const control of [elements.librarySearch, elements.libraryLevel, elements.libraryTopic]) {
  control.addEventListener(control === elements.librarySearch ? "input" : "change", () => {
    state.libraryLimit = 24;
    renderLibrary(elements);
  });
}

elements.libraryMoreButton.addEventListener("click", () => {
  state.libraryLimit += 24;
  renderLibrary(elements);
});

elements.libraryList.addEventListener("click", (event) => {
  const card = event.target.closest(".library-card");
  if (card) openLibraryDetail(elements, card.dataset.questionId);
});
elements.libraryDialogClose.addEventListener("click", () => closeLibraryDetail(elements));
elements.libraryDialog.addEventListener("click", (event) => {
  if (event.target === elements.libraryDialog) closeLibraryDetail(elements);
});
elements.libraryDialog.addEventListener("close", () => syncLibraryDetailState(elements));

// Geniş ekranda kural detayı listenin yanında sabit panel olarak, dar ekranda
// modal olarak açılır. Genişlik değişirse açık detay uygun biçime taşınır.
const wideLibraryLayout = window.matchMedia("(min-width: 1081px)");
wideLibraryLayout.addEventListener("change", () => {
  if (elements.libraryDialog.open) {
    const questionId = elements.libraryDialog.dataset.questionId;
    closeLibraryDetail(elements);
    if (questionId) openLibraryDetail(elements, questionId);
  } else {
    syncLibraryDetailState(elements);
  }
});
syncLibraryDetailState(elements);

window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY && document.body.dataset.screen === "home") loadResumableSession(elements);
});

installKeyboardShortcuts(elements);

elements.bankVersion.textContent = BANK_VERSION;
populateTopics(elements);
loadResumableSession(elements);
showScreen(elements, "home", { focus: false });
