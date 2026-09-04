// Arayüz metinleri: saf metin üreticileri, DOM yok, birim testli. Ekran
// modülleri bu metinleri yalnız yerleştirir; bir cümleyi değiştirmek için
// yansıtma mantığına dokunmak gerekmez.
import { STUDY_TOPIC_BY_ID } from "../questions.js";
import { levelMeta } from "./helpers.js";
import { estimateMinutes, setupTopic } from "./setup.js";

// Kartların hem görünen alt yazısı hem ekran okuyucu etiketi birlikte üretilir.
export function notebookCardText(count) {
  return count
    ? {
      badge: `${count} soru seni bekliyor · iki kez doğru cevaplayınca defterden çıkar`,
      label: `Yanlış defterim: ${count} soru`,
    }
    : {
      badge: "Yanlışladığın sorular burada birikir",
      label: "Yanlış defterim: henüz boş",
    };
}

// Konu modunda düzey kartı o konudaki soru sayısını, karma modda düzeyin
// tanımını gösterir; sayı yoksa (karma mod) tanım kullanılır.
export function levelCardText(levelId, count) {
  const { label, description } = levelMeta(levelId);
  if (count === null) return { badge: description, label: `${label}: ${description}` };
  return { badge: `${count} soru`, label: `${label}: ${count} soru` };
}

export function levelHintText(topicMode) {
  return topicMode
    ? "Konudaki sorular düzeylere göre dağılır. Sayılar bu konudaki soru adedini gösterir."
    : "Çalışmak istediğin derinliği seç. Her düzeyde 100 soru var.";
}

export function topicCardLabel(topic, total) {
  return `${topic.label}: ${topic.description}. ${total} soru`;
}

// Seçili kurulumun ne getireceğini anlatır: havuz seçimden küçükse oturumun
// kaç soruyla kurulacağını, havuz boşsa ne yapılacağını söyler.
export function estimateText(setup, pool) {
  const size = Math.min(setup.size, pool);
  const minutes = estimateMinutes(size);
  if (setup.mode === "defter") {
    return pool
      ? `Defterde ${pool} soru var; oturum ${size} soruyla kurulur. Üst üste iki kez doğru cevapladığın soru defterden çıkar. Yaklaşık ${minutes} dakika sürer.`
      : "Defter boş. Karma veya konu odaklı bir oturum çöz; yanlışladığın sorular burada birikir.";
  }
  if (!pool) return "Bu konu ve düzey için soru yok. Başka bir düzey seç veya tüm düzeyleri dene.";
  if (size < setup.size) return `Bu seçimde ${pool} soru var; oturum ${size} soruyla kurulur. Yaklaşık ${minutes} dakika sürer.`;
  return `Yaklaşık ${minutes} dakika sürer. İstediğin an kaydedip çıkabilirsin.`;
}

// Hero'nun üst yazısı: hangi biçimde çalışıldığı adım ilerledikçe netleşir.
export function eyebrowText(setup, step) {
  const topic = setupTopic(setup);
  if (step === "mode") return "Yazım antrenmanı";
  if (setup.mode === "defter") return "Yanlış defteri";
  if (!topic) return "Karma çalışma";
  return step === "session" ? `Konu odaklı · ${STUDY_TOPIC_BY_ID.get(topic).label}` : "Konu odaklı";
}

// Özet çipleri tamamlanmış adımlara geri götürür.
export const STEP_CHIP_LABEL = Object.freeze({
  mode: "Biçimi değiştir",
  topic: "Konuyu değiştir",
});

export function sessionSummaryLabel(session) {
  if (session.mode === "notebook") return "Yanlış defteri";
  const level = levelMeta(session.level);
  const topic = session.topic ? STUDY_TOPIC_BY_ID.get(session.topic) : null;
  return topic ? `${topic.label} · ${level.label}` : level.label;
}

export function resumeText(session, counts) {
  return `${sessionSummaryLabel(session)} · ${counts.answered}/${session.questionIds.length} yanıtlandı · ${counts.correct} doğru, ${counts.wrong} yanlış`;
}
