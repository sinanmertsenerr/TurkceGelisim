import { tipForTopic } from "../data/tips.js";
import { byId } from "./dom.js";

/**
 * Tüyoyu verilen kutuya basar.
 * Soru geri bildiriminde tüyo açık durur; liste ekranlarında aynı konu
 * arka arkaya tekrarlandığı için yalnız akılda kalan başlık görünür,
 * ayrıntı istendiğinde açılır.
 */
export function renderTip(container, topic, { collapsible = false } = {}) {
  if (!container) return;
  container.replaceChildren();

  const tip = tipForTopic(topic);
  if (!tip) return;

  const node = byId("tipTemplate").content.firstElementChild.cloneNode(true);
  node.querySelector(".tip-title").textContent = tip.title;
  node.querySelector(".tip-test").textContent = tip.test;

  const list = node.querySelector(".tip-examples");
  for (const example of tip.examples) {
    const item = document.createElement("li");
    item.textContent = example;
    list.append(item);
  }

  const note = node.querySelector(".tip-note");
  if (tip.note) note.textContent = tip.note;
  else note.remove();

  if (!collapsible) {
    container.append(node);
    return;
  }

  node.querySelector(".tip-kicker").remove();
  node.querySelector(".tip-title").remove();

  const details = document.createElement("details");
  details.className = "tip-details";
  const summary = document.createElement("summary");
  summary.className = "tip-summary";
  const kicker = document.createElement("span");
  kicker.className = "tip-summary-kicker";
  kicker.textContent = "Tüyo";
  summary.append(kicker, tip.title);
  details.append(summary, node);
  container.append(details);
}
