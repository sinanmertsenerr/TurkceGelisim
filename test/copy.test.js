import test from "node:test";
import assert from "node:assert/strict";

import { ALL_LEVELS_ID, LEVELS, STUDY_TOPIC_BY_ID } from "../questions.js";
import {
  estimateText,
  eyebrowText,
  levelCardText,
  levelHintText,
  notebookCardText,
  resumeText,
  sessionSummaryLabel,
} from "../ui/copy.js";
import { ALL_LEVELS_CARD } from "../ui/helpers.js";
import { estimateMinutes } from "../ui/setup.js";

const base = { mode: "karma", level: "kolay", topicLevel: ALL_LEVELS_ID, topic: "da-de", size: 20 };

test("defter kartı dolu ve boş durumu ayrı anlatır", () => {
  const empty = notebookCardText(0);
  assert.match(empty.badge, /birikir/);
  assert.match(empty.label, /boş/);
  const filled = notebookCardText(3);
  assert.match(filled.badge, /^3 soru/);
  assert.equal(filled.label, "Yanlış defterim: 3 soru");
});

test("düzey kartı karma modda tanımı, konu modunda soru sayısını gösterir", () => {
  const [first] = LEVELS;
  assert.deepEqual(levelCardText(first.id, null), {
    badge: first.description,
    label: `${first.label}: ${first.description}`,
  });
  assert.deepEqual(levelCardText(ALL_LEVELS_ID, 12), {
    badge: "12 soru",
    label: `${ALL_LEVELS_CARD.label}: 12 soru`,
  });
});

test("düzey ipucu biçime göre değişir", () => {
  assert.notEqual(levelHintText(true), levelHintText(false));
  assert.match(levelHintText(true), /Sayılar/);
});

test("süre tahmini soru adedinden türer ve alt sınırı vardır", () => {
  assert.equal(estimateMinutes(20), 12);
  assert.equal(estimateMinutes(100), 60);
  assert.equal(estimateMinutes(1), 2, "çok kısa oturumda alt sınır uygulanır");
});

test("tahmin metni havuz durumunu anlatır", () => {
  assert.match(estimateText(base, 100), /Yaklaşık 12 dakika/);
  assert.match(estimateText({ ...base, size: 50 }, 30), /Bu seçimde 30 soru var; oturum 30 soruyla kurulur/);
  assert.match(estimateText({ ...base, mode: "konu" }, 0), /soru yok/);
  assert.match(estimateText({ ...base, mode: "defter" }, 0), /^Defter boş/);
  assert.match(estimateText({ ...base, mode: "defter" }, 5), /Defterde 5 soru var; oturum 5 soruyla kurulur/);
});

test("üst yazı adım ilerledikçe biçimi netleştirir", () => {
  assert.equal(eyebrowText(base, "mode"), "Yazım antrenmanı");
  assert.equal(eyebrowText({ ...base, mode: "defter" }, "session"), "Yanlış defteri");
  assert.equal(eyebrowText(base, "session"), "Karma çalışma");
  assert.equal(eyebrowText({ ...base, mode: "konu" }, "topic"), "Konu odaklı");
  assert.equal(eyebrowText({ ...base, mode: "konu" }, "session"), `Konu odaklı · ${STUDY_TOPIC_BY_ID.get("da-de").label}`);
});

test("oturum özeti biçim, konu ve düzeyi birleştirir", () => {
  const [level] = LEVELS;
  assert.equal(sessionSummaryLabel({ mode: "notebook", level: ALL_LEVELS_ID, topic: null }), "Yanlış defteri");
  assert.equal(sessionSummaryLabel({ mode: "normal", level: level.id, topic: null }), level.label);
  assert.equal(
    sessionSummaryLabel({ mode: "normal", level: level.id, topic: "ki" }),
    `${STUDY_TOPIC_BY_ID.get("ki").label} · ${level.label}`,
  );
});

test("devam kartı ilerlemeyi sayılarla yazar", () => {
  const session = { mode: "normal", level: LEVELS[0].id, topic: null, questionIds: [1, 2, 3, 4] };
  const text = resumeText(session, { answered: 2, correct: 1, wrong: 1 });
  assert.match(text, /2\/4 yanıtlandı · 1 doğru, 1 yanlış$/);
});
