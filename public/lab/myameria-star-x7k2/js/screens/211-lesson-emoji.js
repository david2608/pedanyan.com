/* Emoji game (s-l-emoji) + game-complete (s-l-emoji-done) · prefix le- */
(function () {
  const ANSWER = ['Կ', 'Ա', 'Ն', 'Խ', 'Ի', 'Կ']; // «Կանխիկ»
  // Letter tray (Figma order). img = asset with tile background + glyph.
  const KEYS = [
    { ch: 'Մ', img: 'le-key-1' }, { ch: 'Ն', img: 'le-key-2' }, { ch: 'Ի', img: 'le-key-3' },
    { ch: 'Խ', img: 'le-key-4' }, { ch: 'Ր', img: 'le-key-5' }, { ch: 'Տ', img: 'le-key-6' },
    { ch: 'Կ', img: 'le-key-7' }, { ch: 'Ա', img: 'le-key-8' }, { ch: 'Կ', img: 'le-key-7' },
  ];

  let slots, cursor, picked, root, slotsEl, keysEl;

  function reset() {
    slots = ANSWER.map(() => null); // key index per slot
    cursor = 0; picked = false;
    root.dataset.state = 'typing';
    render();
  }

  function render(popIdx) {
    slotsEl.innerHTML = slots.map((k, i) => {
      const cls = ['le-slot'];
      const typing = root.dataset.state === 'typing';
      if (typing && i === cursor && k === null) cls.push('is-active');
      if (typing && i === cursor && picked) cls.push('is-picked');
      if (i === popIdx) cls.push('is-pop');
      return `<button class="${cls.join(' ')}" data-slot="${i}">${k === null ? '' : KEYS[k].ch}</button>`;
    }).join('');
    keysEl.querySelectorAll('.le-key').forEach((b) => b.classList.toggle('is-used', slots.includes(+b.dataset.key)));
  }

  function nextEmpty(from) {
    for (let n = 0; n < slots.length; n++) {
      const i = (from + n) % slots.length;
      if (slots[i] === null) return i;
    }
    return -1;
  }

  function typeKey(k) {
    if (root.dataset.state !== 'typing' || slots.includes(k)) return;
    let i = slots[cursor] === null ? cursor : nextEmpty(cursor);
    if (i < 0) return;
    slots[i] = k; picked = false;
    const nx = nextEmpty(i + 1);
    if (nx < 0) { cursor = -1; validate(i); return; }
    cursor = nx;
    render(i);
  }

  function tapSlot(i) {
    if (slots[i] !== null) {
      slots[i] = null;           // delete the letter, tile becomes active
      root.dataset.state = 'typing';
      cursor = i; picked = true;
    } else if (root.dataset.state === 'typing') {
      cursor = i; picked = true;
    }
    render();
  }

  function validate(lastIdx) {
    const ok = slots.every((k, i) => KEYS[k].ch === ANSWER[i]);
    root.dataset.state = ok ? 'right' : 'wrong';
    render(lastIdx);
  }

  document.addEventListener('app:ready', () => {
    root = document.getElementById('s-l-emoji');
    if (!root) return;
    slotsEl = root.querySelector('.js-le-slots');
    keysEl = root.querySelector('.js-le-keys');
    keysEl.innerHTML = KEYS.map((k, i) =>
      `<button class="le-key" data-key="${i}" aria-label="${k.ch}"><img src="assets/${k.img}.svg" width="44" height="48" alt=""></button>`).join('');

    keysEl.addEventListener('click', (e) => { const b = e.target.closest('.le-key'); if (b) typeKey(+b.dataset.key); });
    slotsEl.addEventListener('click', (e) => { const b = e.target.closest('.le-slot'); if (b) tapSlot(+b.dataset.slot); });
    root.querySelector('.js-le-reset').addEventListener('click', reset);
    root.querySelector('.js-le-finish').addEventListener('click', () => App.go('s-l-emoji-done'));
    root.addEventListener('screen:enter', reset);
    reset();

    // dev/test hook: App.leEmoji.fill('ԿԱՆԽԻԿ')
    App.leEmoji = {
      reset,
      fill(word) { reset(); [...word].forEach((ch) => { const k = KEYS.findIndex((x, i) => x.ch === ch && !slots.includes(i)); if (k >= 0) typeKey(k); }); },
      tap: tapSlot,
    };

    // ----- Emoji game complete -----
    const done = document.getElementById('s-l-emoji-done');
    if (!done) return;
    const theme = () => (App.state && +App.state.emojiTheme === 3 ? 3 : 1);
    done.addEventListener('screen:enter', () => {
      const t3 = theme() === 3;
      done.querySelector('.js-le-done-pts').textContent = t3 ? '100' : '+100';
      done.querySelector('.js-le-done-star1').hidden = t3;
      done.querySelector('.js-le-done-star3').hidden = !t3;
    });
    done.querySelector('.js-le-done-cta').addEventListener('click', () => {
      const t = theme();
      if (App.lesson && App.lesson.mark) App.lesson.mark(t === 3 ? 't3.game' : 't1.game');
      App.go(t === 3 ? 's-l-theme3-done' : 's-l-theme1-done');
    });
  });
})();
