import { byId } from "./dom.js";

export function installKeyboardShortcuts(elements) {
  document.addEventListener("keydown", (event) => {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement) return;
    if (byId("screen-quiz").hidden) return;

    if (/^[1-4]$/.test(event.key)) {
      const buttons = [...elements.choiceList.querySelectorAll(".choice-button")];
      const button = buttons[Number(event.key) - 1];
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
