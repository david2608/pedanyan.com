/* V1 · Theme 3 — monthly mini-game (v1-74) + crossword (v1-78 / v1-79) behaviour */
(function () {
  /* ---------------- Monthly mini-game (74) ----------------
     Buy / Save on the offer card → short feedback (balance changes, card slides away) → week summary (75). */
  const mg = document.getElementById('v1-74');
  if (mg) {
    const balEl = mg.querySelector('[data-mg-balance]');
    const card = mg.querySelector('[data-mg-card]');
    const fmt = (n) => n.toLocaleString('en-US') + ' ֏';
    let timer = null;
    const reset = () => {
      clearTimeout(timer);
      mg.classList.remove('is-busy');
      card.classList.remove('is-leaving');
      balEl.classList.remove('is-down');
      balEl.textContent = fmt(3200);
    };
    mg.addEventListener('screen:enter', reset);
    mg.addEventListener('click', (e) => {
      const b = e.target.closest('[data-mg-choice]');
      if (!b || mg.classList.contains('is-busy')) return;
      mg.classList.add('is-busy');
      const buy = b.dataset.mgChoice === 'buy';
      if (buy) { balEl.textContent = fmt(1200); balEl.classList.add('is-down'); }
      card.style.setProperty('--dx', buy ? '-40px' : '40px');
      card.classList.add('is-leaving');
      timer = setTimeout(() => App.go('v1-75'), 650);
    });
  }

  /* ---------------- Crossword (78 interactive, 79 static "time is up") ----------------
     Grid = 10 cols × 8 rows, 32px pitch, 30px cells. Letters: ՈՒ is one cell. */
  const WORDS = {
    1: { dir: 'down', r: 0, c: 2, a: ['Կ', 'Ա', 'Ն', 'Խ', 'Ի', 'Կ'] },
    2: { dir: 'down', r: 1, c: 5, a: ['Դ', 'Ր', 'Ա', 'Մ'], solved: true },
    3: { dir: 'down', r: 2, c: 7, a: ['Ք', 'Ա', 'Ր', 'Տ'] },
    4: { dir: 'down', r: 2, c: 0, a: ['Հ', 'Ա', 'Շ', 'Ի', 'Վ'] },
    5: { dir: 'down', r: 0, c: 3, a: ['Փ', 'Ո', 'Խ', 'Ա', 'Ն', 'Ց', 'ՈՒ', 'Մ'] },
    6: { dir: 'across', r: 3, c: 0, a: ['Ա', 'Շ', 'Խ', 'Ա', 'Տ', 'Ա', 'Վ', 'Ա', 'Ր', 'Ձ'], solved: true },
    7: { dir: 'across', r: 7, c: 0, a: ['Ե', 'Կ', 'Ա', 'Մ', 'ՈՒ', 'Տ'] },
  };
  const STARS = ['2,3', '5,3', '5,7', '7,2', '5,0']; // r,c
  const NUMS = { '0,2': 1, '0,3': 5, '1,5': 2, '2,0': 4, '2,7': 3, '3,0': 6, '7,0': 7 };
  const cellsOf = (w) => w.a.map((ch, i) => (w.dir === 'down' ? [w.r + i, w.c] : [w.r, w.c + i]));
  const key = (r, c) => r + ',' + c;

  function build(grid) {
    const map = {};
    Object.entries(WORDS).forEach(([n, w]) => {
      cellsOf(w).forEach(([r, c], i) => {
        const k = key(r, c);
        (map[k] = map[k] || { r, c, ans: w.a[i], words: [] }).words.push(+n);
      });
    });
    const tag = grid.hasAttribute('data-static') ? 'div' : 'button';
    grid.innerHTML = Object.values(map).map((m) => {
      const k = key(m.r, m.c);
      return `<${tag} class="v1t3-cell" data-k="${k}" style="left:${m.c * 32}px;top:${m.r * 32}px"${tag === 'button' ? ' type="button"' : ''}>`
        + (NUMS[k] ? `<span class="v1t3-cell__n">${NUMS[k]}</span>` : '')
        + (STARS.includes(k) ? `<img class="v1t3-cell__star" src="assets/amp-coin.svg" width="24" height="24" alt="">` : '')
        + `<span class="v1t3-cell__l"></span></${tag}>`;
    }).join('');
    return map;
  }

  function setup(screen) {
    const grid = screen.querySelector('[data-cw-grid]');
    if (!grid) return;
    const map = build(grid);
    const cellEl = (k) => grid.querySelector(`[data-k="${k}"]`);
    const interactive = !grid.hasAttribute('data-static');
    const st = { solved: new Set(), fill: {}, active: 1, cursor: 0, typing: false };

    function letterAt(k) {
      const m = map[k];
      if (m.words.some((n) => st.solved.has(n))) return m.ans;   // given by a solved crossing word
      return st.fill[k] || '';
    }
    function render() {
      grid.querySelectorAll('.v1t3-cell').forEach((el) => {
        const k = el.dataset.k, m = map[k];
        const given = m.words.some((n) => st.solved.has(n));
        const l = letterAt(k);
        el.classList.toggle('is-given', given);
        el.classList.toggle('has-letter', !!l);
        el.querySelector('.v1t3-cell__l').textContent = l;
        el.classList.toggle('is-active', m.words.includes(st.active) && !st.solved.has(st.active));
        el.classList.remove('is-cursor');
      });
      const ws = WORDS[st.active];
      if (st.typing && ws && !st.solved.has(st.active)) {
        const ks = cellsOf(ws).map(([r, c]) => key(r, c));
        const k = ks[st.cursor];
        if (k && !map[k].words.some((n) => st.solved.has(n))) cellEl(k).classList.add('is-cursor');
      }
      screen.querySelectorAll('.v1t3-clue').forEach((cl) => {
        const n = +cl.dataset.word;
        const solved = st.solved.has(n);
        cl.classList.toggle('is-solved', solved);
        cl.classList.toggle('is-active', n === st.active && !solved);
        const t = cl.textContent.replace(/\s*✓$/, '');
        cl.textContent = solved ? t + ' ✓' : t;
      });
      const sEl = screen.querySelector('[data-cw-solved]');
      if (sEl) sEl.textContent = st.solved.size;
      renderTiles();
    }

    /* ---- interactive-only below ---- */
    const input = screen.querySelector('[data-cw-input]');
    const tiles = screen.querySelector('[data-cw-tiles]');
    const timerEl = screen.querySelector('[data-cw-timer]');
    let tick = null, left = 600, used = [];

    function wordKeys(n) { return cellsOf(WORDS[n]).map(([r, c]) => key(r, c)); }
    function openKeys(n) { return wordKeys(n).filter((k) => !map[k].words.some((m) => st.solved.has(m))); }
    function firstEmpty(n) {
      const ks = wordKeys(n);
      const i = ks.findIndex((k) => !letterAt(k));
      return i < 0 ? ks.length - 1 : i;
    }
    function renderTiles() {
      if (!tiles) return;
      const w = WORDS[st.active];
      if (!w || st.solved.has(st.active)) { tiles.innerHTML = ''; return; }
      const ks = wordKeys(st.active);
      const letters = ks.filter((k) => !map[k].words.some((m) => st.solved.has(m))).map((k) => map[k].ans);
      if (!tiles.dataset.word || tiles.dataset.word !== String(st.active)) {
        // shuffle once per word (stable while typing)
        tiles.dataset.word = st.active;
        tiles.dataset.order = JSON.stringify(letters.map((l, i) => [l, i]).sort(() => Math.random() - 0.5));
        used = [];
      }
      const order = JSON.parse(tiles.dataset.order);
      tiles.innerHTML = order.map(([l, i]) => `<button type="button" class="v1t3-tile${used.includes(i) ? ' is-used' : ''}" data-tile="${i}" data-l="${l}">${l}</button>`).join('')
        + `<button type="button" class="v1t3-tile v1t3-tile--del" data-tile="del" aria-label="Ջնջել"><img src="assets/v1-kb-delete.svg" width="24" height="24" alt=""></button>`;
    }
    function select(n, focusCell) {
      if (!WORDS[n]) return;
      if (st.active !== n) { st.active = n; if (tiles) tiles.dataset.word = ''; }
      st.cursor = focusCell != null ? focusCell : firstEmpty(n);
      st.typing = !st.solved.has(n);
      screen.classList.toggle('is-typing', st.typing);
      render();
      if (input && st.typing) input.focus({ preventScroll: true });
    }
    function advance(dir) {
      const ks = wordKeys(st.active);
      let i = st.cursor + dir;
      while (i >= 0 && i < ks.length && map[ks[i]].words.some((m) => st.solved.has(m))) i += dir;
      if (i >= 0 && i < ks.length) st.cursor = i;
    }
    function put(letter, tileIdx) {
      if (st.solved.has(st.active) || letter === 'Ւ') return;   // "ՈՒ" typed as two keys → the Ո already filled the cell
      const ks = wordKeys(st.active);
      let k = ks[st.cursor];
      if (!k || map[k].words.some((m) => st.solved.has(m))) { advance(1); k = ks[st.cursor]; }
      if (!k || map[k].words.some((m) => st.solved.has(m))) return;
      const exp = map[k].ans;
      if (exp === 'ՈՒ' && (letter === 'Ո' || letter === 'ու' || letter === 'ՈՒ')) letter = 'ՈՒ';
      st.fill[k] = letter;
      if (tileIdx != null) used.push(tileIdx);
      else {   // typed on the real keyboard → grey out a matching unused tile
        const order = JSON.parse(tiles.dataset.order || '[]');
        const t = order.find(([l, i]) => l === letter && !used.includes(i));
        if (t) used.push(t[1]);
      }
      if (st.cursor < ks.length - 1) advance(1);
      render();
      if (openKeys(st.active).every((kk) => st.fill[kk])) setTimeout(checkWord, 150);
    }
    function del() {
      const ks = wordKeys(st.active);
      let k = ks[st.cursor];
      if (!st.fill[k]) { advance(-1); k = ks[st.cursor]; }
      if (k && st.fill[k] && !map[k].words.some((m) => st.solved.has(m))) {
        const l = st.fill[k]; delete st.fill[k];
        const order = JSON.parse(tiles.dataset.order || '[]');
        const t = order.find(([ll, i]) => ll === l && used.includes(i));
        if (t) used = used.filter((u) => u !== t[1]);
      }
      render();
    }
    function checkWord() {
      const n = st.active;
      const ks = openKeys(n);
      if (!ks.every((k) => st.fill[k])) return false;
      const ok = ks.every((k) => st.fill[k] === map[k].ans);
      if (ok) {
        st.solved.add(n);
        const next = Object.keys(WORDS).map(Number).find((m) => !st.solved.has(m));
        if (!next) { stop(); setTimeout(() => App.go('v1-79'), 500); render(); return true; }
        st.active = next; st.cursor = firstEmpty(next);
        if (tiles) tiles.dataset.word = '';
        render();
      } else {
        ks.forEach((k) => cellEl(k).classList.add('is-wrong'));
        setTimeout(() => { ks.forEach((k) => { delete st.fill[k]; cellEl(k).classList.remove('is-wrong'); }); used = []; st.cursor = firstEmpty(n); render(); }, 500);
      }
      return ok;
    }
    const pad = (n) => String(n).padStart(2, '0');
    function showTime() { if (timerEl) { timerEl.textContent = pad(Math.floor(left / 60)) + ':' + pad(left % 60); timerEl.parentElement.classList.toggle('is-low', left <= 30); } }
    function stop() { clearInterval(tick); tick = null; }

    function reset() {
      st.solved = new Set(Object.keys(WORDS).filter((n) => WORDS[n].solved).map(Number));
      st.fill = {}; st.active = 1; st.cursor = 0; st.typing = false; used = [];
      if (tiles) tiles.dataset.word = '';
      screen.classList.remove('is-typing');
      render();
    }
    reset();
    if (!interactive) return;

    screen.addEventListener('screen:enter', () => {
      reset(); stop(); left = 600; showTime();
      tick = setInterval(() => { left -= 1; showTime(); if (left <= 0) { stop(); App.go('v1-79'); } }, 1000);
    });
    document.addEventListener('screen:enter', (e) => { if (e.target !== screen) { stop(); input.blur(); } });

    grid.addEventListener('click', (e) => {
      const el = e.target.closest('.v1t3-cell'); if (!el) return;
      const m = map[el.dataset.k];
      // tapping the same cell again toggles direction when two words cross
      let n = m.words.find((w) => !st.solved.has(w)) || m.words[0];
      if (m.words.length > 1 && m.words.includes(st.active) && st.typing) n = m.words.find((w) => w !== st.active && !st.solved.has(w)) || st.active;
      const idx = wordKeys(n).indexOf(el.dataset.k);
      select(n, idx);
    });
    screen.querySelectorAll('.v1t3-clue').forEach((cl) => cl.addEventListener('click', () => select(+cl.dataset.word)));
    tiles.addEventListener('click', (e) => {
      const t = e.target.closest('[data-tile]'); if (!t) return;
      if (t.dataset.tile === 'del') del(); else put(t.dataset.l, +t.dataset.tile);
      input.focus({ preventScroll: true });
    });
    screen.querySelector('[data-cw-check]').addEventListener('click', () => { stop(); App.go('v1-79'); });

    // real keyboard (desktop + mobile soft keyboard through the hidden input)
    input.addEventListener('keydown', (e) => {
      if (App.current !== screen.id) return;
      if (e.key === 'Backspace') { e.preventDefault(); del(); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); advance(-1); render(); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); advance(1); render(); }
      else if (e.key === 'Enter') { e.preventDefault(); checkWord(); }
      else if (e.key === 'Escape') { st.typing = false; screen.classList.remove('is-typing'); input.blur(); render(); }
    });
    input.addEventListener('input', () => {
      const v = input.value.toUpperCase().replace(/[^Ա-Ֆ]/g, '');
      input.value = '';
      [...v].forEach((ch) => put(ch));
    });
    // desktop: typing while the screen is active but the input isn't focused
    document.addEventListener('keydown', (e) => {
      if (App.current !== screen.id || document.activeElement === input || e.ctrlKey || e.metaKey) return;
      if (/^[Ա-և]$/.test(e.key)) { if (!st.typing) select(st.active); put(e.key.toUpperCase()); e.preventDefault(); }
      else if (e.key === 'Backspace' && st.typing) { del(); e.preventDefault(); }
    });
  }

  document.querySelectorAll('.v1t3-cw').forEach(setup);
})();
