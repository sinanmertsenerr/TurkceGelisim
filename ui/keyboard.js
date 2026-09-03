const FORM_FIELDS = [HTMLInputElement, HTMLSelectElement, HTMLTextAreaElement];

// Soru ekranında 1–4 seçeneği, N sonraki soruyu tetikler. Form alanlarında devre dışıdır.
export function installKeyboardShortcuts(elements) {
  document.addEventListener("keydown", (event) => {
    if (FORM_FIELDS.some((type) => event.target instanceof type)) return;
    if (document.body.dataset.screen !== "quiz") return;

    if (/^[1-4]$/.test(event.key)) {
      const button = elements.choiceList.querySelectorAll(".choice-button")[Number(event.key) - 1];
      if (button && !button.disabled) {
        event.preventDefault();
        button.click();
      }
    } else if (event.key.toLocaleLowerCase("tr") === "n" && !elements.nextQuestionButton.hidden) {
      event.preventDefault();
      elements.nextQuestionButton.click();
    }
  });
}
