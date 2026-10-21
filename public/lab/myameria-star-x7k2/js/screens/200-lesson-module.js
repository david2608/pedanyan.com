/* Lesson · Module page (s-l-module) — renders theme cards 01–04 from App.lesson.
   Figma states: 3005:91758 (initial), 3005:94068, 3005:92916, 3005:135565, 3005:139396,
   3005:136634, 3005:137611, 3005:138509. */
(function () {
  const A = 'assets/';
  const DESC = 'Փողը համընդհանուր ճանաչման արժանացած փոխանակության միջոց է: ';

  // Theme copy + number artwork (wrapper = rotated bounding box, img = natural svg size)
  const THEMES = {
    t1: { n: 1, title: 'Ի՞նչ է փողը',
      num:    { w: 45.272, h: 28.363, src: 'lm-n01.svg', iw: 42.999, ih: 23.9999, rot: 6 },
      numSm:  { w: 30.181, h: 18.908, src: 'lm-n01-sm.svg', iw: 28.6658, ih: 15.9999, rot: 6 },
      star: 'sprite' },
    t2: { n: 2, title: 'Ինչպե՞ս է առաջացել փողը',
      num:    { w: 48.262, h: 28.677, src: 'lm-n02.svg', iw: 46.0053, ih: 24, rot: -6 },
      numLk:  { w: 48.262, h: 28.677, src: 'lm-n02-locked.svg', iw: 46.0053, ih: 24, rot: -6 },
      numSm:  { w: 40.218, h: 23.898, src: 'lm-n02-sm.svg', iw: 38.3377, ih: 20, rot: -6 } },
    t3: { n: 3, title: 'Ի՞նչ է կանխիկ փողը',
      num:    { w: 45.075, h: 26.48, src: 'lm-n03.svg', iw: 43, ih: 22.1061, rot: 6 },
      numLk:  { w: 45.075, h: 26.48, src: 'lm-n03-locked.svg', iw: 43, ih: 22.1061, rot: 6 },
      numSm:  { w: 40.781, h: 23.957, src: 'lm-n03-sm.svg', iw: 38.9032, ih: 20, rot: 6 },
      numSmLk:{ w: 40.781, h: 23.957, src: 'lm-n03-sm-locked.svg', iw: 38.9032, ih: 20, rot: 6 } },
    t4: { n: 4, title: 'Ինչո՞վ է անկանխիկ փողը տարբերվում կանխիկից',
      num:    { w: 45.976, h: 28.831, src: 'lm-n04.svg', iw: 43, ih: 22.6029, rot: -9.03 },
      // Figma has no faded / small "04" artwork (it reuses "03"); derive it from the active one.
      numLk:  { w: 45.976, h: 28.831, src: 'lm-n04.svg', iw: 43, ih: 22.6029, rot: -9.03, op: .4 },
      numSm:  { w: 40.781, h: 23.957, src: 'lm-n04.svg', iw: 38.05, ih: 20, rot: -9.03 },
      numSmLk:{ w: 40.781, h: 23.957, src: 'lm-n04.svg', iw: 38.05, ih: 20, rot: -9.03, op: .4 } },
  };
  const EL = {
    reel:      { label: 'Ռիլ',       img: 'lvl-ic-reel.png', lk: 'lm-ic-reel-locked.png' },
    game:      { label: 'Էմոջի խաղ', img: 'onb-ic-game.png', lk: 'lm-ic-game-locked.png' },
    quiz:      { label: 'Քուիզ',     img: 'lvl-ic-quiz.png', lk: 'lm-ic-quiz-locked.png' },
    crossword: { label: 'Խաչբառ',    img: 'onb-ic-game.png', lk: 'lm-ic-cw-locked.png' },
  };
  const typeOf = (key) => key.split('.')[1].replace(/\d+$/, '');

  const num = (d) => `<span class="lm-num" style="width:${d.w}px;height:${d.h}px"><img src="${A}${d.src}" width="${d.iw}" height="${d.ih}" style="transform:rotate(${d.rot}deg)${d.op ? `;opacity:${d.op}` : ''}" alt=""></span>`;
  const desc = (cls = '') => `<p class="lm-card__desc ${cls}">${DESC}</p>`;

  function element(key) {
    const L = App.lesson, st = L.state(key), e = EL[typeOf(key)];
    const badge = st === 'done' ? 'lm-check.svg' : st === 'active' ? 'lm-unlock.svg' : 'lm-lock18.svg';
    return `
      <button class="lm-el is-${st}" data-key="${key}" ${st === 'locked' ? 'disabled' : ''}>
        <span class="lm-el__icon">
          <span class="lm-el__box"><span class="lm-el__img"><img src="${A}${st === 'locked' ? e.lk : e.img}" alt=""></span></span>
          <span class="lm-el__badge"><img src="${A}${badge}" width="18" height="18" alt=""></span>
        </span>
        <span class="lm-el__label">${e.label}</span>
      </button>`;
  }

  function card(t, mode) {
    const d = THEMES[t.id], L = App.lesson;
    const els = `<div class="lm-els">${t.items.map(element).join('')}</div>`;
    if (mode === 'compact') {
      const star = d.star === 'sprite'
        ? `<span class="lm-done-pill__star lm-done-pill__star--img"><img src="${A}amp-coin.svg" alt=""></span>`
        : `<span class="lm-done-pill__star lm-done-pill__star--img"><img src="${A}amp-coin.svg" alt=""></span>`;
      return `
        <div class="lm-card is-compact" data-theme="${t.id}">
          <div class="lm-card__top">
            <div class="lm-card__body">
              <div class="lm-card__inline">${num(d.numSm)}<p class="lm-card__title">${d.title}</p></div>
              ${desc()}
            </div>
            <span class="lm-done-pill">${star}<span class="lm-done-pill__txt">100</span></span>
          </div>
          ${els}
        </div>`;
    }
    if (mode === 'open') {
      return `
        <div class="lm-card is-open" data-theme="${t.id}">
          <div class="lm-card__head">
            <div class="lm-card__row">
              ${num(d.num)}
              <span class="lm-pts"><span class="lm-pts__star"><img src="${A}amp-coin.svg" alt=""></span><span class="lm-pts__txt">${L.points(t.id)}•<span>100</span></span></span>
            </div>
            <div class="lm-card__text"><p class="lm-card__title">${d.title}</p>${desc()}</div>
          </div>
          ${els}
        </div>`;
    }
    const lock = (s) => `<span class="lm-lock"><img src="${A}lm-lock24.svg" width="24" height="24" alt=""></span>`;
    if (mode === 'locked-inline') {
      return `
        <div class="lm-card is-locked is-inline" data-theme="${t.id}">
          <div class="lm-card__body">
            <div class="lm-card__inline">${num(d.numSmLk || d.numSm)}<p class="lm-card__title">${d.title}</p></div>
            ${desc()}
          </div>
          ${lock()}
        </div>`;
    }
    return `
      <div class="lm-card is-locked is-stacked" data-theme="${t.id}">
        <div class="lm-card__body">
          <div class="lm-card__lockrow">${num(d.numLk || d.num)}${lock()}</div>
          <div class="lm-card__text" style="width:auto"><p class="lm-card__title">${d.title}</p>${desc()}</div>
        </div>
      </div>`;
  }

  function render(screen) {
    const L = App.lesson;
    if (!L) return;
    const keys = L.keys;
    const compactDone = L.step >= keys.indexOf('t4.crossword');   // 3005:138509
    const inlineLocked = L.themeDone('t1');                        // 3005:135565+
    const host = screen.querySelector('.js-lm-themes');
    host.innerHTML = L.themes.map((t, i) => {
      const mode = L.themeDone(t.id) ? (compactDone ? 'compact' : 'open')
        : L.themeOpen(t.id) ? 'open'
        : inlineLocked ? 'locked-inline' : 'locked-stacked';
      return card(t, mode).replace('class="lm-card', `style="z-index:${L.themes.length - i}" class="lm-card`);
    }).join('');
  }

  function scrollToActive(screen) {
    const sc = screen.querySelector('.lm__scroll');
    const L = App.lesson;
    const key = L.current;
    const cardEl = key && screen.querySelector(`.lm-card[data-theme="${key.split('.')[0]}"]`);
    if (!cardEl) { sc.scrollTop = 0; screen.dataset.scroll = 0; screen.classList.remove('is-scrolled'); return; }
    const bottom = cardEl.offsetTop + cardEl.offsetHeight + cardEl.offsetParent.offsetTop;
    let target = bottom - 818; if (target < 12) target = 0;   // keep the active theme card fully visible (Figma states 136634 / 138509)
    sc.scrollTop = Math.min(target, sc.scrollHeight - sc.clientHeight);
    screen.classList.toggle('is-scrolled', sc.scrollTop > 4);
    screen.dataset.scroll = sc.scrollTop;
  }

  function open(key) {
    const type = typeOf(key);
    App.state.lessonKey = key;
    if (type === 'reel') { App.state.reel = { key, title: 'Ռիլ' }; App.go('s-l-reel'); }
    else if (type === 'game') { App.state.emojiTheme = key.startsWith('t3') ? 3 : 1; App.go('s-l-emoji-intro'); }
    else if (type === 'quiz') { App.state.quizKey = key; App.go('s-l-quiz'); }
    else if (type === 'crossword') App.go('s-l-cw-intro');
  }

  document.addEventListener('app:ready', () => {
    const screen = document.getElementById('s-l-module');
    if (!screen) return;
    screen.addEventListener('click', (e) => {
      const el = e.target.closest('.lm-el');
      if (!el || el.classList.contains('is-locked')) return;
      open(el.dataset.key);
    });
    screen.addEventListener('screen:enter', () => { render(screen); requestAnimationFrame(() => scrollToActive(screen)); });
    const sc = screen.querySelector('.lm__scroll');
    sc.addEventListener('scroll', () => { screen.classList.toggle('is-scrolled', sc.scrollTop > 4); screen.dataset.scroll = sc.scrollTop; }, { passive: true });
    document.addEventListener('lesson:change', () => { if (App.current === 's-l-module') render(screen); });
    render(screen);
  });
})();
