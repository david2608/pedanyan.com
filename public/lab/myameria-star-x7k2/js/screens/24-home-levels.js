/* Education home · levels with tabs (one option kept: tilted cards). Rules:
     A  under 11                     → level 1 open, level 2 locked (tab shows a lock + how to unlock)
     B  12 or older                  → both levels open (first visit: "two levels" modal, start from level 1 is recommended)
     C  under 11 and passed level 1  → level 2 unlocks ("new level" modal → tab unlock animation → level 2 tab)
     D  turned 12, level 1 not done  → level 2 unlocks (age variant of the modal), level 1 progress is kept
   Screens: <section class="lv-screen" data-lv="live|u11|o11|u11done|turned12" [data-lv-tab="1"]>.
   Live state: App.state.age, App.state.l1Done, App.state.pendingUnlock ('done' | 'age'), App.lesson (module 1 progress). */
(function () {
  const A = 'assets/';
  const NUM = { '01': [35.832, 20], '02': [38.338, 20], '03': [38.903, 20], '04': [43.358, 21.936] };
  const LEVELS = [
    { name: 'Սկսնակ', mods: [
      { c: 'orange', n: '01', t: 'Փող', d: 'Ի՞նչ է փողը, ինչպես է այն առաջացել և ինչու ենք օգտագործում։', plain: true, rot: 6, side: 'left' },
      { c: 'blue', n: '02', t: 'Եկամուտներ և ծախսեր', d: 'Որտեղի՞ց է գալիս գումարը և ինչպես պլանավորել ծախսերը։', rot: -6, side: 'right' },
      { c: 'red', n: '03', t: 'Ֆինանսական ռիսկ', d: 'Յուրաքանչյուր ընտրություն ունի իր ռիսկը։ Սովորիր նկատել այն։', rot: 6, side: 'left' },
      { c: 'green', n: '04', t: 'Ֆինանսական միջավայր', d: 'Բանկեր, քարտեր և հավելվածներ՝ ինչպես են դրանք աշխատում։', rot: -6, side: 'right' },
    ] },
    { name: 'Առաջադեմ', mods: [
      { c: 'orange', n: '01', t: 'Խնայողություն', d: 'Ինչպես կուտակել գումար մեծ նպատակի համար։', plain: true, rot: 6, side: 'left' },
      { c: 'blue', n: '02', t: 'Բյուջե և պլան', d: 'Կազմիր քո առաջին ամսական բյուջեն։', rot: -6, side: 'right' },
      { c: 'red', n: '03', t: 'Վարկեր և տոկոսներ', d: 'Ինչ է վարկը և ինչու է այն ունենում գին։', rot: 6, side: 'left' },
      { c: 'green', n: '04', t: 'Ներդրումներ', d: 'Ինչպես կարող է փողը «աշխատել» քեզ համար։', rot: -6, side: 'right' },
    ] },
  ];
  const LOCK = (s = 14) => `<svg width="${s}" height="${s}" viewBox="0 0 19 19" fill="none"><path class="shackle" d="M5.5 8V6a4 4 0 0 1 8 0v2" stroke="#4a5058" stroke-width="1.8" stroke-linecap="round"/><rect x="3.5" y="8" width="12" height="9" rx="2.6" fill="#4a5058"/><circle cx="9.5" cy="12.4" r="1.4" fill="#fff"/></svg>`;
  const CHECK = `<svg class="lv-done" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#93EC60"/><path d="M7 12.4l3 3 6.5-6.6" stroke="#0A1C00" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const SCN = {
    u11: { age: 10, l1Done: false, p: 1 },
    o11: { age: 13, l1Done: false, p: 0, first: 'two' },
    u11done: { age: 10, l1Done: true, p: 4, pending: 'done' },
    turned12: { age: 12, l1Done: false, p: 2, pending: 'age' },
  };

  function liveCtx() {
    const L = App.lesson;
    const st = App.state;
    const p = st.l1Done ? 4 : (L && L.step >= L.keys.length ? 1 : 0);
    return { age: st.age || 10, l1Done: !!st.l1Done, p, pending: st.pendingUnlock || null, first: st.age >= 12 && !st.twoSeen ? 'two' : null, live: true };
  }

  /* ---------- markup ---------- */
  function card(def, st, li, i) {
    const dim = st === 'locked' || st === 'lvl';
    const num = NUM[def.n];
    const pts = st === 'done' ? 100 : 0;
    return `<button class="hm-card hm-card--${def.c} is-${st}${def.plain ? ' is-plain' : ''}" data-card="${li}-${i}" data-st="${st}" style="transform:rotate(${def.rot}deg)">
      ${st === 'active' ? `<span class="lv-start">${li === 0 && i === 0 ? 'Սկսիր այստեղից' : 'Հաջորդը'}</span>` : ''}${st === 'done' ? CHECK : ''}
      <span class="hm-card__head">
        <span class="hm-card__icon"><img src="${A}h1-module-icon.png" alt=""></span>
        <span class="hm-card__meta">
          <span class="hm-card__num${st === 'lvl' && def.n === '01' ? ' is-dim' : ''}"><img src="${A}h1-num-${def.n}${dim ? '' : '-on'}.svg" width="${num[0]}" height="${num[1]}" alt="${def.n}"></span>
          <span class="hm-card__pts"><img src="${A}h1-currency.svg" width="13.996" height="13.9993" alt=""><span class="hm-card__pts-txt"><span>${pts}•</span><span class="hm-card__pts-max">100</span></span></span>
        </span>
      </span>
      <span class="hm-card__body"><span class="hm-card__title">${def.t}</span><span class="hm-card__desc">${def.d}</span></span>
    </button>`;
  }
  const PATHS = `
    <span class="hm2-path hm2-path--14" style="top:119px"><img src="${A}path-vector14.svg" width="258.895" height="255.967" alt=""></span>
    <span class="hm2-path hm2-path--12" style="top:481.25px"><img src="${A}path-vector12.svg" width="219.573" height="171.037" alt=""></span>
    <span class="hm2-path hm2-path--13" style="top:634.1px"><img src="${A}path-vector13.svg" width="248.956" height="180.502" alt=""></span>`;

  function states(c, li, open) {
    const arr = [0, 1, 2, 3].map(() => 'locked');
    if (li === 0) { for (let i = 0; i < 4; i++) arr[i] = i < c.p ? 'done' : i === c.p ? 'active' : 'locked'; return arr; }
    if (!open) return arr.map(() => 'lvl');
    arr[0] = 'active';
    return arr;
  }

  function note(c, li, open) {
    const bar = '';
    if (li === 0) {
      if (c.l1Done) return ['', `<img src="${A}lc-party.png" alt="">`, 'Սկսնակն ավարտված է', 'Հիանալի՛ աշխատանք։ Կարող ես կրկնել մոդուլները ցանկացած պահի կամ անցնել Առաջադեմին։', ''];
      if (c.reason === 'age') return ['', `<img src="${A}lvl-book.png" alt="">`, 'Քո առաջընթացը պահպանված է', 'Շարունակիր Սկսնակը կամ անցիր Առաջադեմին՝ երկուսն էլ բաց են։', bar];
      if (c.age >= 12) return ['', `<img src="${A}onb-ic-bulb.png" alt="">`, 'Խորհուրդ ենք տալիս սկսել այստեղից', 'Սկսնակը կամրապնդի հիմքերը, իսկ Առաջադեմն արդեն բաց է քեզ համար։', bar];
      return ['', `<img src="${A}v1-star-barev.png" alt="">`, 'Սա քո մակարդակն է', 'Ավարտիր 4 մոդուլները, և կբացվի Առաջադեմ մակարդակը։', bar];
    }
    if (!open) return null;
    if (c.reason === 'done') return ['', `<img src="${A}lc-trophy.png" alt="">`, 'Բացվեց, քանի որ ավարտեցիր Սկսնակը', 'Այստեղ թեմաներն ավելի խորն են։ Սկսիր առաջին մոդուլից։', ''];
    if (c.reason === 'age') return ['', `<img src="${A}lc-party.png" alt="">`, 'Բացվեց, քանի որ դարձար 12', 'Այժմ հասանելի են երկու մակարդակները։ Ընտրիր՝ որտեղից շարունակել։', ''];
    return ['', `<img src="${A}onb-start-rocket.png" alt="">`, 'Ավելի խորը թեմաներ', 'Այս մակարդակը քո տարիքի համար է։ Սկսիր առաջին մոդուլից։', ''];
  }
  const noteHtml = (n) => n ? `<div class="lv-note lv-note--${n[0]}"><span class="lv-note__ic">${n[1]}</span><div class="lv-note__body"><p class="lv-note__t">${n[2]}</p><p class="lv-note__d">${n[3]}</p>${n[4]}</div></div>` : '';

  function lockHtml(c) {
    return `<div class="lv-lock">
      <div class="lv-lock__head"><span class="lv-lock__ic">${LOCK(26)}</span>
        <div><p class="lv-lock__t">Առաջադեմը դեռ փակ է</p><p class="lv-lock__d">Այն կբացվի, երբ ավարտես Սկսնակ մակարդակի 4 մոդուլները</p></div></div>
      <div class="lv-steps">${[0, 1, 2, 3].map((i) => `<span class="lv-step${i < c.p ? ' is-done' : i === c.p ? ' is-cur' : ''}"><b>0${i + 1}</b></span>`).join('<i></i>')}</div>
      <p class="lv-lock__p">Սկսնակ՝ ${c.p}/4 մոդուլ ավարտված</p>
      <button class="btn btn--primary js-lv-go1"><span>Շարունակել Սկսնակը</span></button>
    </div>`;
  }

  function panel(c, li, open) {
    const lv = LEVELS[li];
    const sts = states(c, li, open);
    const done = sts.filter((s) => s === 'done').length;
    const locked = li === 1 && !open;
    const cards = lv.mods.map((d, i) => `<div class="hm2-mod hm2-mod--${d.side}"><div class="hm2-mod__box">${card(d, sts[i], li, i)}</div></div>`).join('');
    return `<div class="lv-panel${locked ? ' is-locked' : ''}" data-panel="${li}">
      ${locked ? '' : noteHtml(note(c, li, open))}
      <div class="hm-level${locked ? ' is-locked' : ''}">
        <div class="hm-level__head">
          <div class="hm-level__row"><span class="hm-level__name">${lv.name} · 4 մոդուլ</span><span class="hm-level__status">${locked ? 'Փակ է' : `4-ից ${done}-ն ավարտված է`}</span></div>
          <div class="hm-track">${sts.map((s) => `<i style="${s === 'done' ? '' : 'opacity:.2'}"></i>`).join('')}</div>
        </div>
        <div class="hm-level__cards">${PATHS}${cards}</div>
      </div>
    </div>`;
  }

  function tab(c, li, open) {
    const lv = LEVELS[li];
    const locked = li === 1 && !open;
    let sub;
    if (li === 0) sub = c.l1Done ? 'Ավարտված' : `${c.p}/4 մոդուլ`;
    else sub = locked ? 'Փակ է' : 'Բաց է';
    return `<button class="lv-tab${locked ? ' is-locked' : ''}" data-tab="${li}" role="tab">
      <span class="lv-tab__row"><span class="lv-tab__num"><span class="lv-tab__n">0${li + 1}</span><span class="lv-tab__lock">${LOCK(12)}</span></span><span class="lv-tab__t">${lv.name}</span></span>
      <span class="lv-tab__s">${sub}</span>
      <span class="lv-tab__new">ՆՈՐ</span>
    </button>`;
  }

  function shell(screen) {
    screen.innerHTML = `
      <div class="grid-bg"></div>
      <div class="scroll hm hm--o2 lv">
        <div class="lv-pin">
          <button class="lv-me" data-go="s-profile">
            <span class="lv-me__av"><img class="js-user-avatar" src="${A}avatar-anush.png" alt=""></span>
            <span class="lv-me__id"><span class="lv-me__name js-user-name">Անուշ</span>
              <span class="lv-me__amp"><img src="${A}prof-amp-20.svg" width="20" height="20" alt=""><b class="js-lv-amp">0</b><span> AMP</span></span></span>
            <img class="lv-me__chev" src="${A}ic-arrow-right.svg" width="24" height="24" alt="">
          </button>
          <div class="lv-tabs js-lv-tabs" role="tablist" data-active="0"></div>
        </div>
        <div class="lv-panels js-lv-panels"></div>
      </div>
      <div class="page-heading is-gradient">
        <div data-include="status-bar"></div>
        <div class="nav-bar is-fixed-sides">
          <div class="nav-bar__left"></div>
          <div class="nav-bar__center"><span class="nav-bar__title">Education</span></div>
          <div class="nav-bar__right"></div>
        </div>
      </div>
      <div data-include="tabbar" data-active="education"></div>
      <div class="lv-toast" role="status"><span class="lv-toast__ic">${LOCK(16).replace(/#4a5058/g, '#fff')}</span><span class="js-lv-toast"></span></div>`;
  }

  /* ---------- behaviour ---------- */
  function mount(screen) {
    let c = null, open = false, active = 0, toastT;
    const tabs = () => screen.querySelector('.js-lv-tabs');
    const panels = () => screen.querySelector('.js-lv-panels');

    function render() {
      tabs().innerHTML = tab(c, 0, open) + tab(c, 1, open);
      screen.querySelector('.js-lv-amp').textContent = c.p * 100;
      panels().innerHTML = panel(c, 0, open) + panel(c, 1, open);
      setTab(active, { silent: true });
      const name = App.state.name, av = App.state.avatar;
      if (name) screen.querySelectorAll('.js-user-name').forEach((n) => (n.textContent = name));
      if (av) screen.querySelectorAll('.js-user-avatar').forEach((i) => (i.src = av));
    }
    function setTab(i, { silent = false } = {}) {
      const dir = i < active ? 'back' : 'fwd';
      active = i;
      tabs().dataset.active = i;
      tabs().querySelectorAll('.lv-tab').forEach((t) => { const on = +t.dataset.tab === i; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', on); });
      panels().dataset.dir = dir;
      panels().querySelectorAll('.lv-panel').forEach((p) => { p.classList.remove('is-active'); if (+p.dataset.panel === i) { void p.offsetWidth; p.classList.add('is-active'); } });
      if (!silent) { const sc = screen.querySelector('.scroll'); if (sc.scrollTop > 0) sc.scrollTo({ top: 0, behavior: 'smooth' }); }
    }
    function toast(msg) {
      const t = screen.querySelector('.lv-toast');
      screen.querySelector('.js-lv-toast').textContent = msg;
      t.classList.add('is-shown'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-shown'), 2400);
    }
    function shake(el) { el.classList.remove('is-shake'); void el.offsetWidth; el.classList.add('is-shake'); }

    screen.addEventListener('click', (e) => {
      const t = e.target.closest('.lv-tab');
      if (t) {
        const i = +t.dataset.tab;
        if (t.classList.contains('is-locked')) shake(t);
        t.classList.remove('has-new');
        if (i !== active) setTab(i);
        return;
      }
      if (e.target.closest('.js-lv-go1')) return setTab(0);
      const cd = e.target.closest('.hm-card[data-card]');
      if (!cd) return;
      const [li, i] = cd.dataset.card.split('-').map(Number);
      const st = cd.dataset.st;
      if (st === 'lvl') { shake(cd.parentElement); return App.open('o-level-locked'); }
      if (st === 'locked') { shake(cd.parentElement); return toast(`Նախ ավարտիր ${LEVELS[li].mods[i - 1].n}-րդ մոդուլը`); }
      if (st === 'active' && li === 0 && i > 0 && c.live) return App.go('s-theme-complete');
      App.go('s-l-module');
    });

    /** unlock moment: modal → (ack) → tab animation → switch to level 2 */
    function playUnlock() {
      open = true;
      c.reason = c.pending;
      render();
      const t = tabs().querySelector('.lv-tab[data-tab="1"]');
      t.classList.add('is-unlocking', 'has-new');
      setTimeout(() => { t.classList.remove('is-unlocking'); setTab(1); }, 1500);
    }
    screen.__lvAck = (id) => {
      if (id === 'o-level-new') { if (c.live) App.state.pendingUnlock = null; c.pendingDone = true; playUnlock(); }
      if (id === 'o-two-levels') { if (c.live) App.state.twoSeen = true; setTab(0); }
    };

    /* collapse the pinned profile + tabs while scrolling down, expand again when scrolling up */
    let collapseOn = false;
    function bindCollapse() {
      if (collapseOn) return; collapseOn = true;
      const sc = screen.querySelector('.scroll'), pin = screen.querySelector('.lv-pin');
      if (!sc || !pin) return;
      let last = 0, acc = 0, lockT = 0;
      sc.addEventListener('scroll', () => {
        const y = sc.scrollTop, d = y - last; last = y;
        if (Date.now() < lockT) return;
        if (y < 24) { acc = 0; if (pin.classList.contains('is-mini')) { pin.classList.remove('is-mini'); lockT = Date.now() + 320; } return; }
        acc = (Math.sign(d) === Math.sign(acc)) ? acc + d : d;
        const mini = pin.classList.contains('is-mini');
        if (!mini && acc > 16) { pin.classList.add('is-mini'); acc = 0; lockT = Date.now() + 320; }
        else if (mini && acc < -16) { pin.classList.remove('is-mini'); acc = 0; lockT = Date.now() + 320; }
      }, { passive: true });
    }

    screen.addEventListener('screen:enter', () => {
      bindCollapse();
      screen.querySelector('.lv-pin')?.classList.remove('is-mini');
      const scn = screen.dataset.lv;
      c = scn === 'live' ? liveCtx() : { ...SCN[scn] };
      c.reason = c.pending ? null : (c.l1Done ? 'done' : null);
      // a pending unlock is shown as still locked until the kid acknowledges the modal
      open = c.pending ? false : (c.l1Done || c.age >= 12);
      active = +(screen.dataset.lvTab || 0);
      render();
      
      App.state.homeOpt = screen.id;
      if (screen.dataset.lvTab === '1') setTimeout(() => shake(tabs().querySelector('.lv-tab[data-tab="1"]')), 450);
      if (c.pending) {
        const dlg = document.getElementById('o-level-new');
        dlg.classList.toggle('is-age', c.pending === 'age');
        setTimeout(() => { if (App.current === screen.id) { App.__lvScreen = screen; App.open('o-level-new'); } }, 650);
      } else if (c.first === 'two') {
        setTimeout(() => { if (App.current === screen.id) { App.__lvScreen = screen; App.open('o-two-levels'); } }, 650);
      }
    });
  }

  // build the shells now (before app.js expands the includes), wire on app:ready
  const screens = [...document.querySelectorAll('.lv-screen')];
  screens.forEach(shell);
  document.addEventListener('app:ready', () => {
    screens.forEach(mount);
    // modal buttons
    document.querySelectorAll('#o-level-new .js-lvl-unlock, #o-two-levels .js-lvl-unlock').forEach((b) => b.addEventListener('click', (e) => {
      const ov = e.currentTarget.closest('.overlay');
      ov.classList.remove('is-open');
      const s = App.__lvScreen;
      if (s && s.__lvAck) s.__lvAck(ov.id);
    }));
    document.querySelectorAll('#o-level-new .js-lvl-later').forEach((b) => b.addEventListener('click', (e) => {
      e.currentTarget.closest('.overlay').classList.remove('is-open');
      const s = App.__lvScreen;
      if (s && s.__lvAck) { s.__lvAck('o-level-new'); }
    }));
  });
})();
