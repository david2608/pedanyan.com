/* Personal page v2 — Figma header/navigation + badge layouts (A grid · B showcase shelf · C path) + states.
   A badge is earned, not earned yet, or locked (level closed) — no per-badge progress is shown.
   <section class="screen pv-screen" data-pv="a|b|c|skel" [data-pv-toast="success|error"] [data-pv-sheet="ready|loading"] [data-pv-badge="id"]>
   Badge taps open the badge drawer #o-badge-info; the pencil opens #o-avatar-sheet.
   App.syncProfile() pushes App.state.name / avatar to every home + personal page. */
(function () {
  const A = 'assets/';
  const T = A + 'badge-traveler.png', S = A + 'prof-badge-saver.png';
  const BADGES = [
    { id: 'traveler', lv: 0, m: 1, name: 'Ֆինանսների ճանապարհորդ', img: T, earned: true, module: 'Մոդուլ 1 · Փող',
      learn: 'Փողի էությունը, առաջացման պատճառները և դերը ֆինանսական կյանքում։' },
    { id: 'saver', lv: 0, m: 2, name: 'Խելացի խնայող', img: S, module: 'Մոդուլ 2 · Եկամուտներ և ծախսեր', learn: 'Ինչպես պլանավորել եկամուտներն ու ծախսերը։' },
    { id: 'risk', lv: 0, m: 3, name: 'Ռիսկեր բացահայտող', img: T, module: 'Մոդուլ 3 · Ֆինանսական ռիսկ', learn: 'Ինչպես նկատել ֆինանսական ռիսկերը։' },
    { id: 'guide', lv: 0, m: 4, name: 'Ֆինանսական ուղեցույց', img: S, module: 'Մոդուլ 4 · Ֆինանսական միջավայր', learn: 'Ինչպես են աշխատում բանկերը, քարտերն ու հավելվածները։' },
    { id: 'keeper', lv: 1, m: 1, name: 'Խնայողության վարպետ', img: S, module: 'Առաջադեմ · Մոդուլ 1', learn: 'Ինչպես կուտակել գումար մեծ նպատակի համար։' },
    { id: 'planner', lv: 1, m: 2, name: 'Բյուջեի պլանավորող', img: T, module: 'Առաջադեմ · Մոդուլ 2', learn: 'Ինչպես կազմել ամսական բյուջե։' },
    { id: 'credit', lv: 1, m: 3, name: 'Վարկերի գիտակ', img: S, module: 'Առաջադեմ · Մոդուլ 3', learn: 'Ինչ է վարկը և ինչու է այն ունենում գին։' },
    { id: 'investor', lv: 1, m: 4, name: 'Խելացի ներդրող', img: T, module: 'Առաջադեմ · Մոդուլ 4', learn: 'Ինչպես կարող է փողը «աշխատել» քեզ համար։' },
  ];
  const LV = ['Սկսնակ մոդուլներ', 'Առաջադեմ մոդուլներ'];
  const LOCKSVG = (s = 13, c = '#4a5058') => `<svg width="${s}" height="${s}" viewBox="0 0 19 19" fill="none"><path d="M5.5 8V6a4 4 0 0 1 8 0v2" stroke="${c}" stroke-width="2" stroke-linecap="round"/><rect x="3.5" y="8" width="12" height="9" rx="2.6" fill="${c}"/></svg>`;
  const CHECK = `<svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="#93EC60"/><path d="M3.8 7.2l2 2 4.4-4.4" stroke="#123200" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const ampIc = (s = 14) => `<img src="${A}prof-amp-${s}.svg" width="${s}" height="${s}" alt="">`;

  const l2Open = () => !!App.state.l1Done || (App.state.age || 10) >= 12;
  function state(b) {
    if (b.lv === 1 && !l2Open()) return 'locked';
    return b.earned || (b.lv === 0 && App.state.l1Done) ? 'earned' : 'todo';
  }
  const STAT = { earned: 'Վաստակած', todo: 'Դեռ չես վաստակել', locked: 'Փակ է' };
  const stat = (st) => `<span class="pv-stat${st === 'earned' ? ' pv-stat--earned' : ''}">${st === 'earned' ? CHECK : st === 'locked' ? LOCKSVG(11) : ''}${STAT[st]}</span>`;
  const nextId = () => (BADGES.find((b) => state(b) === 'todo') || {}).id;
  function medal(b, s = 76) {
    const st = state(b);
    return `<span class="bm is-${st}" style="--s:${s}px"><img src="${b.img}" alt="">${st === 'locked' ? `<span class="bm__lock">${LOCKSVG()}</span>` : ''}</span>`;
  }
  const lvAmp = (lv) => BADGES.filter((b) => b.lv === lv && state(b) === 'earned').length * 100;
  const earned = () => BADGES.filter((b) => state(b) === 'earned').length;
  const lockNote = `<p class="pv-group__lock">${LOCKSVG(12, 'rgba(15,15,16,.5)')}<span>Կբացվի Սկսնակ մակարդակն ավարտելուց հետո</span></p>`;
  const groupHead = (lv) => `<div class="pv-group__head"><p class="pv-group__t">${LV[lv]}</p><span class="pv-group__amp">${ampIc(18)}${lvAmp(lv)}<span>•400</span></span></div>`;

  function header() {
    const total = lvAmp(0) + lvAmp(1);
    return `<div class="pv-me">
      <span class="pv-me__av"><img class="js-avatar" src="${App.state.avatar || A + 'avatar-anush.png'}" alt=""></span>
      <div class="pv-me__id">
        <p class="pv-me__name js-user-name">${App.state.name || 'Անուշ'}</p>
        <span class="pv-me__amp">${ampIc(20)}<b>${total}</b><span>.00</span></span>
        <div class="pv-me__chips"><span class="pv-chip pv-chip--g"><img src="${A}onb-ic-badge.png" width="16" height="16" alt="">${earned()}/8 բեյջ</span><span class="pv-chip">${l2Open() ? '2 մակարդակ' : 'Սկսնակ'}</span></div>
      </div>
      <button class="pv-me__edit" data-open="o-avatar-sheet" aria-label="Խմբագրել պրոֆիլը"><img src="${A}prof-ic-edit.svg" width="22" height="22" alt=""></button>
    </div>`;
  }
  const tileAmp = (st) => `<span class="pv-amp${st === 'earned' ? '' : ' is-off'}">${ampIc(14)}${st === 'earned' ? '+100' : '100'}</span>`;

  /* ---------- A · latest achievement + 2×2 grid per level ---------- */
  function viewA() {
    const last = [...BADGES].reverse().find((b) => state(b) === 'earned');
    const lastHtml = last ? `<button class="pv-last js-badge" data-badge="${last.id}"><span style="position:relative;isolation:isolate"><span class="pv-last__glow"></span>${medal(last, 72)}</span>
      <span class="pv-last__b"><span class="pv-last__k">Վերջին նվաճումը</span><span class="pv-last__t">«${last.name}»</span><span class="pv-last__d">${last.module} · +100 AMP</span></span>
      <img src="${A}ic-arrow-right.svg" width="24" height="24" alt=""></button>` : '';
    const groups = [0, 1].map((lv) => {
      const list = BADGES.filter((b) => b.lv === lv);
      const locked = lv === 1 && !l2Open();
      return `<div class="pv-card pv-group">${groupHead(lv)}${locked ? lockNote : ''}
        <div class="pv-grid">${list.map((b) => { const st = state(b); return `<button class="pv-tile is-${st} js-badge" data-badge="${b.id}">${medal(b, 76)}<span class="pv-tile__n">${b.name}</span>${st === 'locked' ? stat('locked') : tileAmp(st)}</button>`; }).join('')}</div></div>`;
    }).join('');
    return header() + lastHtml + `<div class="pv-h"><p class="pv-h__t">Բեյջեր</p><p class="pv-h__s">${earned()}/8 վաստակած</p></div>` + groups;
  }

  /* ---------- B · showcase + shelves ---------- */
  function showcase(b) {
    const st = state(b);
    return `<span class="pv-show__rays"></span>${medal(b, 132)}<p class="pv-show__t">«${b.name}»</p>
      <p class="pv-show__d">${st === 'locked' ? 'Կբացվի Սկսնակ մակարդակն ավարտելուց հետո' : st === 'earned' ? `Վաստակել ես՝ ավարտելով «${b.module}»-ը` : `Ավարտիր «${b.module}»-ը՝ այս բեյջը ստանալու համար`}</p>
      <div class="pv-show__row">${stat(st)}${st === 'locked' ? '' : tileAmp(st)}</div>
      <button class="chip js-badge" data-badge="${b.id}" style="position:relative;margin-top:6px">Մանրամասն</button>`;
  }
  function viewB(sel) {
    const cur = BADGES.find((b) => b.id === sel) || BADGES[0];
    const shelves = [0, 1].map((lv) => `<div class="pv-group">${groupHead(lv)}${lv === 1 && !l2Open() ? lockNote : ''}
      <div class="pv-shelf"><div class="pv-shelf__row">${BADGES.filter((b) => b.lv === lv).map((b) => `<button class="pv-slot js-pick${b.id === cur.id ? ' is-sel' : ''}" data-badge="${b.id}" aria-label="${b.name}">${medal(b, 64)}</button>`).join('')}</div><div class="pv-shelf__board"></div></div></div>`).join('');
    return header() + `<div class="pv-show js-show">${showcase(cur)}</div>` + `<div class="pv-h"><p class="pv-h__t">Իմ դարակը</p><p class="pv-h__s">Հպիր բեյջին</p></div>` + shelves;
  }

  /* ---------- C · path (echoes the Education home path) ---------- */
  function pathSvg(n) {
    const W = 361, H = n * 96, xs = (i) => (i % 2 ? W - 39 : 39), ys = (i) => i * 96 + 48;
    let d = `M${xs(0)} ${ys(0)}`;
    for (let i = 1; i < n; i++) d += ` C${xs(i - 1)} ${ys(i - 1) + 60}, ${xs(i)} ${ys(i) - 60}, ${xs(i)} ${ys(i)}`;
    return `<svg class="pv-path__line" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><path d="${d}" fill="none" stroke="#c9d2c2" stroke-width="2" stroke-dasharray="6 7"/></svg>`;
  }
  function viewC() {
    const nid = nextId();
    const lvl = (lv) => {
      const list = BADGES.filter((b) => b.lv === lv);
      return `<div class="pv-group">${groupHead(lv)}<div class="pv-path">${pathSvg(list.length)}${list.map((b, i) => { const st = state(b); return `<button class="pv-node js-badge is-${st}${i % 2 ? ' is-right' : ''}" data-badge="${b.id}"><span style="position:relative">${b.id === nid ? '<span class="pv-next">Հաջորդը</span>' : ''}${medal(b, 78)}</span><span class="pv-node__b"><span class="pv-node__t">${b.name}</span><span class="pv-node__m">${b.module}</span>${stat(st)}</span></button>`; }).join('')}</div></div>`;
    };
    const gate = l2Open() ? '' : `<div class="pv-gate"><span class="pv-gate__ic">${LOCKSVG(18)}</span><span><b>Առաջադեմ մակարդակ</b><br>Կբացվի Սկսնակ մակարդակն ավարտելուց հետո</span></div>`;
    return header() + `<div class="pv-h"><p class="pv-h__t">Բեյջերի ճանապարհ</p><p class="pv-h__s">${earned()}/8</p></div>` + lvl(0) + gate + lvl(1);
  }

  /* ---------- Skeleton (matches layout A) ---------- */
  function viewSkel() {
    const tile = '<span class="sk-tile"><i class="sk sk-c76"></i><i class="sk sk-l90"></i><i class="sk sk-l50"></i></span>';
    const group = `<div class="pv-card pv-group"><div class="pv-group__head"><i class="sk sk-l140 sk-h16"></i><i class="sk sk-l70 sk-h16"></i></div><div class="pv-grid">${tile.repeat(4)}</div></div>`;
    return `<div class="pv-me"><i class="sk sk-c88"></i><div class="pv-me__id"><i class="sk sk-l120 sk-h20"></i><i class="sk sk-l80"></i><span style="display:flex;gap:6px"><i class="sk sk-chip"></i><i class="sk sk-chip"></i></span></div></div>
      <div class="pv-last"><i class="sk sk-c72"></i><span class="pv-last__b"><i class="sk sk-l80"></i><i class="sk sk-l160 sk-h16"></i><i class="sk sk-l120"></i></span></div>
      <div class="pv-h"><i class="sk sk-l70 sk-h20"></i><i class="sk sk-l70"></i></div>${group}${group}`;
  }

  /* ---------- Badge drawer (merged "Badge" + "Badge · details list") ---------- */
  // only the big badge in the center — no small background badges (every state)
  const hero = (img, st) => `<span class="bd-hero__main is-${st}"><img src="${img}" alt="">${st === 'locked' ? `<span class="bm__lock">${LOCKSVG(16)}</span>` : ''}</span>`;
  const row = (ic, t, d) => `<div class="bd-row"><span class="bd-row__ic"><img src="${A}${ic}" alt=""></span><span class="bd-row__txt"><span class="bd-row__t">${t}</span><span class="bd-row__d">${d}</span></span></div>`;
  function openBadge(id) {
    const b = BADGES.find((x) => x.id === id); if (!b) return;
    const st = state(b);
    const sheet = document.getElementById('o-badge-info');
    const $ = (s) => sheet.querySelector(s);
    sheet.dataset.st = st;
    $('.js-bd-hero').innerHTML = hero(b.img, st);
    $('.js-bd-kicker').textContent = (b.lv ? 'ԱՌԱՋԱԴԵՄ · ' : '') + `ՄՈԴՈՒԼ ${b.m} ԲԵՅՋ`;
    $('.js-bd-name').textContent = '«' + b.name + '»';
    const s = $('.js-bd-status');
    s.className = 'chip chip--s js-bd-status' + (st === 'earned' ? ' is-selected' : '');
    s.innerHTML = (st === 'earned' ? CHECK : st === 'locked' ? LOCKSVG(11) : '') + STAT[st];
    $('.js-bd-rows').innerHTML = [
      row('onb-ic-badge.png', 'Ինչպես վաստակել', st === 'locked' ? 'Բեյջը կբացվի Սկսնակ մակարդակն ավարտելուց հետո։' : `Ավարտիր «${b.module}»-ի բոլոր ռիլերը, քուիզները և խաղերը։`),
      row('onb-ic-bulb.png', 'Ինչ ես սովորում', b.learn),
      row('lvl-ic-quiz.png', 'Պարգև', st === 'earned' ? '+100 AMP · ստացված է' : '+100 AMP՝ մոդուլն ավարտելուց հետո'),
    ].join('');
    $('.js-bd-text').innerHTML = '';
    const cta = $('.js-bd-cta');
    cta.firstElementChild.textContent = st === 'todo' ? 'Անցնել մոդուլին' : 'Լավ';
    cta.dataset.target = st === 'todo' ? 's-l-module' : '';
    sheet.querySelector('.bd__body').scrollTop = 0;
    App.open('o-badge-info');
  }
  App.openBadge = openBadge;

  /* ---------- screens ---------- */
  const screens = [...document.querySelectorAll('.pv-screen')];
  screens.forEach((s) => {
    s.innerHTML = `<div class="grid-bg"></div>
      <div class="scroll"><div class="pv js-pv"></div></div>
      <div class="page-heading is-gradient">
        <div data-include="status-bar"></div>
        <div class="nav-bar is-fixed-sides">
          <div class="nav-bar__left"><div data-include="back-btn"></div></div>
          <div class="nav-bar__center"><span class="nav-bar__title">Անձնական էջ</span></div>
          <div class="nav-bar__right"></div>
        </div>
      </div>
      <div data-include="tabbar" data-active="education"></div>
      <div class="ptoast" role="status" aria-live="polite">
        <div class="ptoast__label">
          <img class="ptoast__ic ptoast__ic--ok" src="${A}pedit-toast-ok.svg" width="24" height="24" alt="">
          <img class="ptoast__ic ptoast__ic--err" src="${A}pedit-toast-err.svg" width="24" height="24" alt="">
          <p class="ptoast__text js-ptoast-text"></p>
        </div>
        <button class="ptoast__close" aria-label="Փակել"><img src="${A}pedit-toast-x.svg" width="24" height="24" alt=""></button>
      </div>`;
  });

  function render(s) {
    const v = s.dataset.pv;
    const box = s.querySelector('.js-pv');
    s.__sel = s.__sel || 'traveler';
    box.classList.toggle('is-skel', v === 'skel');
    box.innerHTML = v === 'b' ? viewB(s.__sel) : v === 'c' ? viewC() : v === 'skel' ? viewSkel() : viewA();
  }

  App.syncProfile = function () {
    const { name, avatar } = App.state;
    document.querySelectorAll('.js-user-name').forEach((n) => { if (name) n.textContent = name; });
    document.querySelectorAll('.js-avatar, .js-user-avatar, #s-home-o1 .profile-card__img img').forEach((i) => { if (avatar) i.src = avatar; });
  };

  /* Save-result toast (Figma 1870:76112 success / 1870:77174 error) on whichever personal page is open */
  const TOAST = { success: 'Փոփոխությունները հաջողությամբ կատարվեցին։', error: 'Փոփոխությունները չկատարվեցին, խնդրում ենք ստուգել ձեր կապը և կրկին փորձել։' };
  let toastT;
  function showToast(s, kind, sticky) {
    const t = s.querySelector('.ptoast');
    clearTimeout(toastT);
    t.classList.remove('is-shown', 'is-success', 'is-error'); void t.offsetWidth;
    t.classList.add(kind === 'error' ? 'is-error' : 'is-success', 'is-shown');
    t.querySelector('.js-ptoast-text').textContent = TOAST[kind] || TOAST.success;
    if (!sticky) toastT = setTimeout(() => t.classList.remove('is-shown'), 4000);
  }
  App.profileToast = function (kind) {
    let s = document.getElementById(App.current);
    if (!s || !s.classList.contains('pv-screen')) { App.go('s-profile'); s = document.getElementById('s-profile'); }
    showToast(s, kind);
  };

  document.addEventListener('app:ready', () => {
    screens.forEach((s) => {
      s.addEventListener('screen:enter', () => {
        s.querySelector('.ptoast').classList.remove('is-shown');
        render(s);
        const d = s.dataset;
        if (d.pvToast) setTimeout(() => showToast(s, d.pvToast, true), 350);
        if (d.pvBadge) setTimeout(() => openBadge(d.pvBadge), 350);
        if (d.pvSheet) setTimeout(() => { App.__sheetMode = d.pvSheet; s.querySelector('.pv-me__edit').click(); }, 350);
      });
      s.addEventListener('click', (e) => {
        const pick = e.target.closest('.js-pick');
        if (pick) {
          s.__sel = pick.dataset.badge;
          s.querySelectorAll('.pv-slot').forEach((x) => x.classList.toggle('is-sel', x === pick));
          const show = s.querySelector('.js-show');
          show.innerHTML = showcase(BADGES.find((b) => b.id === s.__sel));
          show.classList.remove('is-swap'); void show.offsetWidth; show.classList.add('is-swap');
          return;
        }
        if (e.target.closest('.ptoast__close')) { s.querySelector('.ptoast').classList.remove('is-shown'); return; }
        const b = e.target.closest('.js-badge');
        if (b) openBadge(b.dataset.badge);
      });
    });
    const cta = document.querySelector('#o-badge-info .js-bd-cta');
    if (cta) cta.addEventListener('click', (e) => { const go = e.currentTarget.dataset.target; App.close(e.currentTarget); if (go) App.go(go); });
    document.addEventListener('profile:saved', () => screens.forEach((s) => { if (s.classList.contains('is-active')) render(s); }));
  });
})();
