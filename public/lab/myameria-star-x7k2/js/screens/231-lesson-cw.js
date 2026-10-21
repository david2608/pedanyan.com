/* ==========================================================
   Lesson · Crossword (s-l-cw) + crossword done / result + module done
   Figma: 3005:122245 … 3005:131975, annotations in Section 2 (3005:140476)
   - tap a tile group → select word, clue bar + keyboard
   - arrows → prev/next word of the same direction, skipping fully answered words
   - tabs → filter clue list (All / Down / Across) with answered counters
   - typing fills tiles, skips revealed/locked tiles; last letter → auto validation (green / red)
   - tap a star tile → reveals the correct letter
   ========================================================== */
(function () {
  const $ = (r, s) => r.querySelector(s);
  const $$ = (r, s) => Array.from(r.querySelectorAll(s));
  const mark = (k) => { try { if (window.App && App.lesson && typeof App.lesson.mark === 'function') App.lesson.mark(k); } catch (e) { /* lesson state not ready */ } };

  /* ---------- data (answers in Armenian capitals, ՈՒ is one tile) ---------- */
  const WORDS = [
    { n: 1, dir: 'down',   c: 0, r: 0, ans: ['Կ','Ա','Ն','Խ','Ի','Կ'], clue: 'Փողի տեսակ, որը գոյություն ունի ֆիզիկական տեսքով՝ մետաղադրամների և թղթադրամների տեսքով։', a: true },
    { n: 2, dir: 'down',   c: 1, r: 0, ans: ['Դ','Ր','Ա','Մ'],          clue: 'Հայաստանի Հանրապետության ազգային արժույթը։' },
    { n: 3, dir: 'down',   c: 7, r: 3, ans: ['Գ','Ի','Ն'],              clue: 'Ապրանքի կամ ծառայության համար վճարվող գումարի չափը։' },
    { n: 4, dir: 'across', c: 0, r: 1, ans: ['Ա','Ր','Ժ','ՈՒ','Յ','Թ'], clue: 'Պետության պաշտոնական դրամական միավորը։' },
    { n: 5, dir: 'across', c: 3, r: 5, ans: ['Ա','Պ','Ր','Ա','Ն','Ք'], clue: 'Մարդկանց կարիքները բավարարելու համար ստեղծված և վաճառքի կամ փոխանակման ենթակա իրերը։', a: true },
  ];
  const STARS = ['0,4', '3,1', '6,5'];   // hint tiles
  const ORDER = { all: [1, 2, 3, 4, 5], down: [1, 2, 3], across: [4, 5] };
  const TOTAL_SEC = 600;

  /* keyboard: latin (phonetic) layer + Armenian layer (shift / 123) */
  const LAT = { q:'Ք', w:'Ո', e:'Ե', r:'Ր', t:'Տ', y:'Յ', u:'ՈՒ', i:'Ի', o:'Օ', p:'Պ', a:'Ա', s:'Ս', d:'Դ', f:'Ֆ', g:'Գ', h:'Հ', j:'Ջ', k:'Կ', l:'Լ', z:'Զ', x:'Խ', c:'Ց', v:'Վ', b:'Բ', n:'Ն', m:'Մ' };
  const HY = { q:'Ճ', w:'Փ', e:'Է', r:'Ռ', t:'Թ', y:'Ը', u:'Ւ', i:'Ծ', o:'Ձ', p:'Շ', a:'Ա', s:'Ղ', d:'Ժ', f:'Ֆ', g:'Չ', h:'Հ', j:'Ջ', k:'Կ', l:'Լ', z:'Զ', x:'Խ', c:'Ց', v:'Վ', b:'Բ', n:'Ն', m:'Մ' };

  const PITCH = 38, OX = 12, OY = 16;
  const key = (c, r) => c + ',' + r;
  const cellsOf = (w) => w.ans.map((_, i) => (w.dir === 'down' ? key(w.c, w.r + i) : key(w.c + i, w.r)));

  let S = null;       // game state
  let timerId = null;

  function newState() {
    const cells = {};
    WORDS.forEach((w) => cellsOf(w).forEach((k, i) => {
      if (!cells[k]) cells[k] = { k, ans: w.ans[i], val: '', revealed: false, star: STARS.includes(k), words: [] };
      cells[k].words.push(w.n);
    }));
    return { cells, word: {}, active: null, cur: null, tab: 'all', hy: false, left: TOTAL_SEC - 1, finished: false };
  }
  const W = (n) => WORDS.find((w) => w.n === n);
  const wordState = (n) => S.word[n] || '';                       // '', 'ok', 'wrong'
  const isFilled = (n) => cellsOf(W(n)).every((k) => S.cells[k].val);
  const isLocked = (k) => S.cells[k].revealed || S.cells[k].words.some((n) => wordState(n) === 'ok');
  const answered = (n) => !!wordState(n);

  /* ---------- render ---------- */
  function buildBoard(sec) {
    const board = $(sec, '.js-lx-board');
    const heads = {};
    WORDS.forEach((w) => { heads[key(w.c, w.r)] = w; });
    board.innerHTML = Object.values(S.cells).map((cell) => {
      const [c, r] = cell.k.split(',').map(Number);
      const h = heads[cell.k];
      const num = h ? `<span class="lx-num"><span>${h.n}</span><img class="lx-dir ${h.dir === 'down' ? 'lx-dir--d' : 'lx-dir--r'}" src="assets/lx-union-a.svg" width="4.41627" height="5.78418" alt=""></span>` : '';
      return `<button class="lx-tile" data-k="${cell.k}" style="left:${OX + c * PITCH}px;top:${OY + r * PITCH}px">${num}<span class="lx-tile__ch"></span></button>`;
    }).join('');
  }
  function buildClues(sec) {
    const item = (w) => `
      <button class="lx-clue ${w.a ? 'lx-clue--a' : ''}" data-n="${w.n}">
        <img class="lx-clue__ic" src="assets/lx-num-${w.n}.svg" width="40" height="40" alt="">
        <span class="lx-clue__txt">${w.clue}</span>
        <img class="lx-clue__state lx-clue__state--ok" src="assets/lx-state-ok.svg" width="20" height="20" alt="">
        <img class="lx-clue__state lx-clue__state--err" src="assets/lx-state-err.svg" width="20" height="20" alt="">
      </button>`;
    $(sec, '.js-lx-list-down').innerHTML = WORDS.filter((w) => w.dir === 'down').map(item).join('');
    $(sec, '.js-lx-list-across').innerHTML = WORDS.filter((w) => w.dir === 'across').map(item).join('');
  }

  function render(sec) {
    const act = S.active ? cellsOf(W(S.active)) : [];
    $$(sec, '.lx-tile').forEach((el) => {
      const cell = S.cells[el.dataset.k];
      const ok = cell.words.some((n) => wordState(n) === 'ok');
      const inAct = act.includes(cell.k);
      const wrongAct = inAct && wordState(S.active) === 'wrong';
      const wrongAny = cell.words.some((n) => wordState(n) === 'wrong');
      el.classList.toggle('is-ok', ok);
      el.classList.toggle('is-wrong', !ok && (wrongAct || (!inAct && wrongAny)));
      el.classList.toggle('is-word', !ok && inAct && !wrongAct);
      el.classList.toggle('has-ch', !!cell.val);
      $(el, '.lx-tile__ch').textContent = cell.val;
      // star hint visible while the tile is still empty
      let star = $(el, '.lx-tile__star');
      if (cell.star && !cell.val) { if (!star) el.insertAdjacentHTML('beforeend', '<img class="lx-tile__star" src="assets/amp-coin.svg" alt="">'); }
      else if (star) star.remove();
      const caret = $(el, '.lx-tile__caret');
      const showCaret = S.cur === cell.k && !(cell.star && !cell.val) && wordState(S.active) !== 'wrong';
      if (showCaret && !caret) el.insertAdjacentHTML('beforeend', '<span class="lx-tile__caret"></span>');
      else if (!showCaret && caret) caret.remove();
    });
    // clue list states
    $$(sec, '.lx-clue').forEach((el) => {
      const st = wordState(+el.dataset.n);
      el.classList.toggle('is-ok', st === 'ok');
      el.classList.toggle('is-wrong', st === 'wrong');
    });
    // counters (solved words, as in Figma: wrong answers keep 0/5)
    const cnt = (list) => list.filter((n) => wordState(n) === 'ok').length;
    $(sec, '.js-lx-cnt-all').textContent = cnt(ORDER.all);
    $(sec, '.js-lx-cnt-down').textContent = cnt(ORDER.down);
    $(sec, '.js-lx-cnt-across').textContent = cnt(ORDER.across);
    // tabs
    sec.dataset.tab = S.tab;
    $$(sec, '.lx-seg__item').forEach((b) => b.classList.toggle('is-active', b.dataset.tab === S.tab));
    moveThumb(sec);
    // keyboard mode + clue bar
    sec.classList.toggle('is-kb', !!S.active);
    sec.classList.toggle('is-hy', S.hy);
    $$(sec, '.lx-key[data-k]').forEach((b) => { b.textContent = S.hy ? HY[b.dataset.k] : b.dataset.k; });
    $$(sec, '[data-fn="shift"]').forEach((b) => b.classList.toggle('is-on', S.hy));
    if (S.active) {
      const w = W(S.active);
      $(sec, '.js-lx-bar-ic').src = `assets/lx-num-${w.n}.svg`;
      $(sec, '.js-lx-bar-txt').textContent = w.clue;
      $(sec, '.js-lx-prev').disabled = step(-1) == null;
      $(sec, '.js-lx-next').disabled = step(1) == null;
      // long clues grow the bar upwards → lift the board so the bottom row stays visible
      const extra = Math.min(Math.max($(sec, '.lx-cluebar').offsetHeight - 60, 0), 30);
      $(sec, '.js-lx-board').style.transform = extra ? `translateY(${-extra}px)` : '';
    } else {
      $(sec, '.js-lx-board').style.transform = '';
    }
    // finish button: enabled once every word is answered
    $(sec, '.js-lx-finish').disabled = !ORDER.all.every(answered);
  }
  function moveThumb(sec) {
    const b = $(sec, `.lx-seg__item[data-tab="${S.tab}"]`), th = $(sec, '.lx-seg__thumb');
    if (!b || !b.offsetWidth) return;
    th.style.left = b.offsetLeft + 'px';
    th.style.width = b.offsetWidth + 'px';
  }

  /* ---------- selection / navigation ---------- */
  function select(n, k) {
    S.active = n;
    const ks = cellsOf(W(n)).filter((x) => !isLocked(x));
    if (k && ks.includes(k)) S.cur = k;
    else S.cur = ks.find((x) => !S.cells[x].val) || ks[0] || null;
  }
  function step(d) {
    if (!S.active) return null;
    const list = ORDER[W(S.active).dir];
    for (let i = list.indexOf(S.active) + d; i >= 0 && i < list.length; i += d) if (!isFilled(list[i])) return list[i];
    return null;
  }
  function closeKb() { S.active = null; S.cur = null; }

  /* ---------- input ---------- */
  function editable(n) { return cellsOf(W(n)).filter((x) => !isLocked(x)); }
  function input(ch) {
    if (!S.active || !S.cur || S.finished) return;
    const n = S.active, ks = editable(n), k = S.cur;
    const wasEmpty = !S.cells[k].val, wasFull = isFilled(n);
    S.cells[k].words.forEach((x) => { if (wordState(x) === 'wrong') S.word[x] = ''; });   // correcting a red word
    S.cells[k].val = ch;
    pulse(k, 'is-pop');
    const i = ks.indexOf(k);
    const next = ks.slice(i + 1).find((x) => !S.cells[x].val) || (wasFull ? ks[i + 1] : undefined);
    if (next) S.cur = next;
    // auto validation once the word is complete: on filling its last empty tile, or on retyping its last tile
    if (isFilled(n) && (wasEmpty || i === ks.length - 1)) validate(n);
    else validate(null);
  }
  function backspace() {
    if (!S.active || !S.cur) return;
    const n = S.active, ks = editable(n);
    if (wordState(n) === 'wrong') S.word[n] = '';
    if (S.cells[S.cur].val) { S.cells[S.cur].val = ''; return; }
    const i = ks.indexOf(S.cur);
    if (i > 0) { S.cur = ks[i - 1]; S.cells[S.cur].val = ''; }
  }
  function validate(n) {
    WORDS.forEach((w) => {
      if (wordState(w.n) === 'ok' || !isFilled(w.n)) return;
      if (w.n !== n && wordState(w.n)) return;               // keep other words' existing verdicts
      if (n == null && w.n === S.active) return;             // mid-word correction: wait for the last tile
      const ok = cellsOf(w).every((k) => S.cells[k].val === S.cells[k].ans);
      S.word[w.n] = ok ? 'ok' : 'wrong';
      if (!ok && w.n === n) setTimeout(() => cellsOf(w).forEach((k) => pulse(k, 'is-shake')), 0);
    });
    if (S.active && wordState(S.active) === 'ok') {
      // word solved → jump to the next open word of the same direction (or close keyboard)
      const nx = step(1) || step(-1);
      if (nx) select(nx); else closeKb();
    } else if (n != null && S.active === n && wordState(n) === 'wrong') {
      S.cur = editable(n)[0] || S.cur;                       // red word: retype from its first tile (overwrite)
    }
    if (ORDER.all.every((x) => wordState(x) === 'ok')) finish();
  }
  function reveal(k) {
    const cell = S.cells[k];
    cell.val = cell.ans; cell.revealed = true;
    const n = (S.active && cell.words.includes(S.active)) ? S.active : cell.words[0];
    select(n);
    pulse(k, 'is-pop');
    validate(n);
  }
  let secRef = null;
  function pulse(k, cls) {
    const el = secRef && $(secRef, `.lx-tile[data-k="${k}"]`);
    if (!el) return;
    el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), 400);
  }

  /* ---------- end of game ---------- */
  function score() { return ORDER.all.filter((n) => wordState(n) === 'ok').length * 20; }
  function finish(force) {
    if (S.finished) return;
    S.finished = true;
    clearInterval(timerId);
    const sc = score();
    App.state.cwScore = sc;
    App.state.cwRight = sc / 20;
    App.state.cwBest = Math.max(App.state.cwBest || 0, sc);
    setTimeout(() => App.go(sc === 100 ? 's-l-cw-done' : 's-l-cw-result'), force ? 0 : 650);
  }
  function tick(sec) {
    const t = $(sec, '.js-lx-time');
    const m = Math.floor(Math.max(S.left, 0) / 60), s = Math.max(S.left, 0) % 60;
    t.textContent = `${m}:${String(s).padStart(2, '0')}`;
    $(sec, '.lx-timer').classList.toggle('is-low', S.left <= 30);
  }

  /* ---------- wiring ---------- */
  function init() {
    const sec = document.getElementById('s-l-cw');
    if (!sec) return;
    secRef = sec;
    S = newState();
    buildBoard(sec); buildClues(sec);

    sec.addEventListener('screen:enter', () => {
      S = newState();
      clearInterval(timerId);
      render(sec); tick(sec);
      timerId = setInterval(() => {
        if (App.current !== 's-l-cw') { clearInterval(timerId); return; }
        S.left -= 1; tick(sec);
        if (S.left <= 0) { closeKb(); render(sec); finish(true); }
      }, 1000);
    });

    sec.addEventListener('click', (e) => {
      if (!S || S.finished) return;
      const tile = e.target.closest('.lx-tile');
      if (tile) {
        const k = tile.dataset.k, cell = S.cells[k];
        if (cell.star && !cell.val) { reveal(k); render(sec); return; }
        if (cell.words.every((n) => wordState(n) === 'ok')) return;
        // pick the word: keep the active one if it contains the tile (tap again on a crossing toggles direction)
        let n = cell.words.find((x) => wordState(x) !== 'ok');
        if (S.active && cell.words.includes(S.active)) {
          n = (S.cur === k && cell.words.length > 1) ? (cell.words.find((x) => x !== S.active && wordState(x) !== 'ok') || S.active) : S.active;
        } else {
          const head = cell.words.find((x) => key(W(x).c, W(x).r) === k && wordState(x) !== 'ok');
          if (head) n = head;
        }
        select(n, k); render(sec); return;
      }
      const clue = e.target.closest('.lx-clue');
      if (clue) { const n = +clue.dataset.n; if (wordState(n) !== 'ok') { select(n); render(sec); } return; }
      const tab = e.target.closest('.lx-seg__item');
      if (tab) { S.tab = tab.dataset.tab; closeKb(); render(sec); return; }
      if (e.target.closest('.js-lx-prev')) { const n = step(-1); if (n) select(n); render(sec); return; }
      if (e.target.closest('.js-lx-next')) { const n = step(1); if (n) select(n); render(sec); return; }
      if (e.target.closest('.js-lx-finish')) { finish(true); return; }
      const k = e.target.closest('.lx-key');
      if (k) {
        if (k.dataset.k) input(S.hy ? HY[k.dataset.k] : LAT[k.dataset.k]);
        else if (k.dataset.fn === 'del') backspace();
        else if (k.dataset.fn === 'shift') S.hy = !S.hy;
        else if (k.dataset.fn === 'done') closeKb();
        render(sec); return;
      }
      // tap on the empty board / sheet area closes the keyboard (Done)
      if (S.active && e.target.closest('.lx-scroll') && !e.target.closest('.lx-tile')) { closeKb(); render(sec); }
    });

    // real keyboard
    document.addEventListener('keydown', (e) => {
      if (App.current !== 's-l-cw' || !S || S.finished || e.metaKey || e.ctrlKey || e.altKey) return;
      if (!S.active) {
        if (e.key === 'Enter') { e.preventDefault(); const n = ORDER[S.tab].find((x) => !answered(x)); if (n) { select(n); render(sec); } }
        return;
      }
      let ch = null;
      if (e.key === 'Backspace') { backspace(); e.preventDefault(); }
      else if (e.key === 'Enter' || e.key === 'Escape') { closeKb(); e.preventDefault(); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { const n = step(1); if (n) select(n); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { const n = step(-1); if (n) select(n); }
      else if (e.key.length === 1) {
        const c = e.key;
        if (/[a-zA-Z]/.test(c)) ch = (e.shiftKey ? HY : LAT)[c.toLowerCase()];
        else if (/[Ա-և]/.test(c)) ch = c === 'ու' || c === 'Ու' ? 'ՈՒ' : c.toUpperCase();
        if (ch === 'Ւ' && S.cur) {                               // Ո + Ւ → ՈՒ
          const ks = editable(S.active), i = ks.indexOf(S.cur), prev = ks[i - 1];
          if (prev && S.cells[prev].val === 'Ո' && S.cells[prev].ans === 'ՈՒ') { S.cur = prev; ch = 'ՈՒ'; }
        }
        if (ch) { input(ch); e.preventDefault(); }
      } else return;
      render(sec);
    });
    window.addEventListener('resize', () => App.current === 's-l-cw' && moveThumb(sec));
  }

  /* ---------- done / result / module done ---------- */
  function initEnds() {
    const done = document.getElementById('s-l-cw-done');
    if (done) $(done, '.js-lx-done-cta').addEventListener('click', () => { mark('t4.crossword'); App.go('s-l-module-done'); });

    const res = document.getElementById('s-l-cw-result');
    if (res) {
      res.addEventListener('screen:enter', () => {
        const sc = App.state.cwScore != null ? App.state.cwScore : 80;
        const right = sc / 20;
        $(res, '.js-lxr-title').textContent = sc >= 60 ? 'Լավ արդյունք' : 'Դեռ կարելի է ավելին';
        $(res, '.js-lxr-sub').textContent = `5 բառից ${right}-ը ճիշտ են`;
        $(res, '.js-lxr-score').textContent = sc;
        $(res, '.js-lxr-best').textContent = Math.max(App.state.cwBest || 0, sc);
      });
      $(res, '.js-lxr-cta').addEventListener('click', () => { mark('t4.crossword'); App.go('s-l-module-done'); });
    }

    const md = document.getElementById('s-l-module-done');
    if (md) $(md, '.js-lx-md-cta').addEventListener('click', () => { App.state.level2Unlocked = true; App.go('s-home'); });
  }

  document.addEventListener('app:ready', () => { init(); initEnds(); });
})();
