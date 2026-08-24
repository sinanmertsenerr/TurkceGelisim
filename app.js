/* Türkçe Gelişim — Uygulama Motoru */
const $ = (s) => document.querySelector(s);

const state = { level: null, order: [], idx: 0, score: 0, answers: [], lastLevel: null };

function show(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(`#screen-${name}`).classList.add('active');
  window.scrollTo(0, 0);
}

/* ---------- TEST AKIŞI ---------- */
function startQuiz(level) {
  const pool = QUESTIONS[level];
  state.level = level;
  state.lastLevel = level;
  // karıştır
  state.order = pool.map((_, i) => i).sort(() => Math.random() - .5);
  state.idx = 0; state.score = 0; state.answers = [];
  show('quiz');
  renderQ();
}

function renderQ() {
  const q = QUESTIONS[state.level][state.order[state.idx]];
  const card = $('#qCard');
  card.innerHTML = `
    <span class="q-tag">${state.level} · soru ${state.idx + 1}</span>
    <p class="q-text">${q.q}</p>
    <div id="opts">
      ${q.opts.map((o, i) => `
        <button class="opt" data-i="${i}">
          <span class="key">${'ABCD'[i]}</span><span>${o}</span>
        </button>`).join('')}
    </div>
    <div id="fb"></div>`;
  $('#qCount').textContent = `${state.idx + 1}/${state.order.length}`;
  $('#progressBar').style.width = `${(state.idx / state.order.length) * 100}%`;
  card.querySelectorAll('.opt').forEach(btn =>
    btn.addEventListener('click', () => answer(parseInt(btn.dataset.i)))
  );
}

function answer(i) {
  const q = QUESTIONS[state.level][state.order[state.idx]];
  const correct = i === q.a;
  if (correct) state.score++;
  state.answers.push({ ...q, chosen: i });
  // seçenekleri kilitle + işaretle
  document.querySelectorAll('.opt').forEach(b => {
    b.disabled = true;
    if (parseInt(b.dataset.i) === q.a) b.classList.add('correct');
    else if (parseInt(b.dataset.i) === i) b.classList.add('wrong');
  });
  const fb = $('#fb');
  fb.innerHTML = `
    <div class="feedback ${correct ? 'ok' : 'bad'}">
      <div class="fb-head">${correct ? '✅ Doğru!' : '❌ Yanlış — cevap: ' + q.opts[q.a]}</div>
      <div class="trick-box"><b>💡 Püf noktası:</b> ${q.trick}</div>
      <button class="next-btn" id="nextBtn">${state.idx + 1 >= state.order.length ? 'Sonuçlar 🏁' : 'Sonraki →'}</button>
      <button class="link-btn" id="libBtn">💡 Kütüphanede ara</button>
    </div>`;
  $('#nextBtn').addEventListener('click', () => {
    state.idx++;
    if (state.idx >= state.order.length) finish(); else renderQ();
  });
  const lb = $('#libBtn');
  if (lb) lb.addEventListener('click', () => {
    if (['kolay', 'orta'].includes(state.level)) openLibrary();
    else alert('Zor ve Expert testlerinde kütüphane kilidi 🔒\nTest bitince tüm trickleri görebilirsin.');
  });
}

/* ---------- SONUÇ ---------- */
function finish() {
  show('result');
  const pct = Math.round(state.score / state.order.length * 100);
  $('#resScore').textContent = `${state.score}/${state.order.length}`;
  $('.score-ring').style.setProperty('--pct', pct);
  $('#resEmoji').textContent = pct >= 80 ? '🏆' : pct >= 50 ? '💪' : '🌱';
  $('#resTitle').textContent =
    pct >= 80 ? 'Harikasın!' : pct >= 50 ? 'İyi gidiyorsun!' : 'Temel sağlamlaştırma zamanı';
  $('#resMsg').textContent = `${LEVEL_LABELS[state.level]} seviyesinde %${pct} başarı.`;
  // trick tekrarı: testteki sorular + verilen cevaplar
  const reviewHtml = state.answers.map((a, i) => `
    <div class="trick-card" style="animation-delay:${i * 40}ms">
      <span class="t-lv t-${state.level}">${LEVEL_LABELS[state.level]}</span>
      <h3>${a.chosen === a.a ? '✅' : '❌'} ${a.q}</h3>
      <p><b>Senin cevabın:</b> ${a.opts[a.chosen] ?? '—'} · <b>Doğru:</b> ${a.opts[a.a]}</p>
      <p style="margin-top:8px"><b>💡 Trick:</b> ${a.trick}</p>
    </div>`).join('');
  $('#trickReviewBtn').onclick = () => {
    $('#trickList').innerHTML = reviewHtml;
    $('#trickSearch').value = '';
    setFilter('all'); show('tricks');
  };
}

/* ---------- KÜTÜPHANE ---------- */
let activeFilter = 'all';
function setFilter(f) {
  if (f !== undefined) activeFilter = f;
  document.querySelectorAll('#levelFilters .chip').forEach(c =>
    c.classList.toggle('on', c.dataset.f === activeFilter));
}
const LEVELS = ['kolay', 'orta', 'zor', 'expert'];
const LEVEL_LABELS = { kolay: 'Kolay', orta: 'Orta', zor: 'Zor', expert: 'Expert' };

function buildLibrary() {
  const list = [];
  for (const lv of LEVELS) QUESTIONS[lv].forEach(q => list.push({ level: lv, q }));
  return list;
}

function renderTricks() {
  const query = $('#trickSearch').value.trim().toLocaleLowerCase('tr');
  const listEl = $('#trickList');
  const items = buildLibrary().filter(({ level, q }) => {
    const okLv = activeFilter === 'all' || level === activeFilter;
    const hay = (q.q + ' ' + q.trick + ' ' + q.opts.join(' ')).toLocaleLowerCase('tr');
    return okLv && (!query || hay.includes(query));
  });
  $('#trickEmpty').hidden = items.length > 0;
  listEl.innerHTML = items.map(({ level, q }, i) => `
    <article class="trick-card" style="animation-delay:${Math.min(i,10)*35}ms">
      <span class="t-lv t-${level}">${LEVEL_LABELS[level]}</span>
      <h3>${q.q}</h3>
      <p><b>Doğru:</b> ${q.opts[q.a]}</p>
      <p style="margin-top:8px"><b>💡 Trick:</b> ${q.trick}</p>
    </article>`).join('');
}

function openLibrary() {
  $('#trickSearch').value = '';
  setFilter('all');
  renderTricks();
  show('tricks');
}

/* ---------- OLAYLAR ---------- */
document.querySelectorAll('.level-card').forEach(c =>
  c.addEventListener('click', () => startQuiz(c.dataset.level)));
$('#navTest').addEventListener('click', () => show('home'));
$('#logoLink').addEventListener('click', e => { e.preventDefault(); show('home'); });
$('#navTricks').addEventListener('click', () => openLibrary());
$('#quitQuiz').addEventListener('click', () => { if (confirm('Testten çıkılsın mı?')) show('home'); });
$('#againBtn').addEventListener('click', () => startQuiz(state.lastLevel || 'kolay'));
$('#homeBtn').addEventListener('click', () => show('home'));
$('#modalClose').addEventListener('click', () => { $('#modal').hidden = true; });
$('#trickReviewBtn').onclick = null; /* sonuç ekranında dinamik atanır */

$('#trickSearch').addEventListener('input', renderTricks);
document.querySelectorAll('.chip').forEach(ch =>
  ch.addEventListener('click', () => { setFilter(ch.dataset.f); renderTricks(); }));

renderTricks();
