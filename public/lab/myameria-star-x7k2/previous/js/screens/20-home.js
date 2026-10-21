/* Education home — Figma section 3010:209237 ("Module page"), three layout options.
   Every home screen is a <section class="hm-screen" data-hm-opt="1|2|3" [data-hm-stage]>.
   Stages (Figma frames):
     initial  — module 01 open, rest locked, level 2 locked   (O1 3010:216592 · O2 3010:209238 · O3 3010:235574)
     progress — module 01 done, module 02 open                (O1 3010:233390 · O2 3010:212316 · O3 3010:238742)
     unlocked — level 1 done, level 2 module 01 open          (O1 3010:224315 · O2 3010:214454 · O3 3010:240925)
   Live screens (no data-hm-stage) derive the stage from App.state.level2Unlocked and App.lesson.
   Taps: level-1 card 01 → s-l-module; the open card 02+ → s-theme-complete (finishing the level);
   level-2 cards while locked → o-level-locked; level-2 card 01 when open → s-l-module.
   App.state.homeOpt remembers the last home option (used by 50-levels.js to return there). */
(function () {
  const A = '../assets/';
  const TITLE = 'Եկամուտներ & ծախսեր';
  const RISK = 'Յուրաքանչյուր դրամական ընտրություն ունի իր ռիսկը։ Սովորեք, թե ինչպես նկատել այն։';
  const PLAN = 'Որոշեք, թե ինչի վրա կգործի ձեր փողը հաջորդիվ։ Սովորեք, թե ինչպես պլան կազմել։';
  const NUM = { '01': [35.832, 20], '02': [38.338, 20], '03': [38.903, 20], '04': [43.358, 21.936] };

  // Option 1 / 3: six cards per level
  const GRID = [
    { c: 'orange', n: '01', t: TITLE, d: RISK, plain: true },
    { c: 'blue', n: '02', t: TITLE, d: PLAN },
    { c: 'red', n: '03', t: TITLE, d: PLAN },
    { c: 'green', n: '04', t: TITLE, d: PLAN },
    { c: 'red', n: '03', t: TITLE, d: PLAN },
    { c: 'green', n: '04', t: TITLE, d: PLAN },
  ];
  // Option 2: four tilted cards per level (locked 03/04 show the English placeholder copy)
  const TILT = [
    { c: 'orange', n: '01', t: 'Փող', d: RISK, plain: true, rot: 6, side: 'left' },
    { c: 'blue', n: '02', t: TITLE, d: PLAN, rot: -6, side: 'right' },
    { c: 'red', n: '03', t: TITLE, d: PLAN, rot: 6, side: 'left',
      ph: { t: 'Money & Transactions', d: 'Money moves every time you spend or save. Learn how to follow it.' } },
    { c: 'green', n: '04', t: TITLE, d: PLAN, rot: -6, side: 'right',
      ph: { t: 'Financial environment', d: 'Your money lives in a bigger world. Learn how it works.' } },
  ];
  const LEVELS = ['Սկսնակ', 'Առաջադեմ'];
  const BASE = { 1: 's-home', 2: 's-home-o2', 3: 's-home-o3' };

  function liveStage() {
    if (App.state.level2Unlocked) return 'unlocked';
    const L = App.lesson;
    if (App.state.level1Done || (L && L.step >= L.keys.length)) return 'progress';
    return 'initial';
  }

  // state per card: done | active | locked | lvl (whole level locked)
  function states(stage, level, count) {
    const arr = Array.from({ length: count }, () => 'locked');
    if (level === 0) {
      if (stage === 'initial') arr[0] = 'active';
      else if (stage === 'progress') { arr[0] = 'done'; arr[1] = 'active'; }
      else arr.fill('done');
    } else if (stage === 'unlocked') arr[0] = 'active';
    else arr.fill('lvl');
    return arr;
  }

  function card(def, st, i, level, live) {
    const dim = st === 'locked' || st === 'lvl';
    const ph = dim && def.ph;
    const num = NUM[def.n];
    const numSrc = `${A}h1-num-${def.n}${dim ? '' : '-on'}.svg`;
    const numDim = st === 'lvl' && def.n === '01'; // 01 has no baked-in dim variant → wrapper opacity (3010:218692)
    const pts = st === 'done' ? 100 : 0;
    const exp1 = live && level === 0 && i === 0 ? ' js-home-exp1' : '';
    let act = '';
    if (st === 'lvl') act = 'data-open="o-level-locked"';
    else if (i === 0 && st !== 'locked') act = 'data-go="s-l-module"';
    else if (st === 'active' && level === 0) act = 'data-go="s-theme-complete"';
    const tag = act ? 'button' : 'div';
    const title = ph ? ph.t : def.t;
    const desc = ph ? ph.d : def.d;
    return `<${tag} class="hm-card hm-card--${def.c} is-${st}${ph ? ' is-ph' : ''}${def.plain ? ' is-plain' : ''}" ${act}${def.rot ? ` style="transform:rotate(${def.rot}deg)"` : ''}>
      <span class="hm-card__head">
        <span class="hm-card__icon"><img src="${A}h1-module-icon.png" alt=""></span>
        <span class="hm-card__meta">
          <span class="hm-card__num${numDim ? ' is-dim' : ''}"><img src="${numSrc}" width="${num[0]}" height="${num[1]}" alt="${def.n}"></span>
          <span class="hm-card__pts"><img src="${A}h1-currency.svg" width="13.996" height="13.9993" alt=""><span class="hm-card__pts-txt"><span class="js-pts${exp1}">${pts}•</span><span class="hm-card__pts-max">100</span></span></span>
        </span>
      </span>
      <span class="hm-card__body">
        <span class="hm-card__title">${title}</span>
        <span class="hm-card__desc">${desc}</span>
      </span>
    </${tag}>`;
  }

  function level(opt, stage, li, live) {
    const defs = opt === 2 ? TILT : GRID;
    const sts = states(stage, li, defs.length);
    const done = sts.filter((s) => s === 'done').length;
    const locked = sts[0] === 'lvl';
    const status = locked && !done ? 'Սկսված չէ' : `${defs.length === 6 ? 6 : defs.length}-ից ${done}-ն ավարտված է`;
    const cards = defs.map((d, i) => {
      const c = card(d, sts[i], i, li, live);
      return opt === 2 ? `<div class="hm2-mod hm2-mod--${d.side}"><div class="hm2-mod__box">${c}</div></div>` : c;
    }).join('');
    return `<div class="hm-level${locked ? ' is-locked' : ''}">
      <div class="hm-level__head">
        <div class="hm-level__row"><span class="hm-level__name">${LEVELS[li]}</span><span class="hm-level__status">${status}</span></div>
        <div class="hm-track"><i></i><i></i><i></i><i></i><i></i></div>
      </div>
      <div class="hm-level__cards">${cards}</div>
    </div>`;
  }

  // Option 2 dashed path (Vectors 12/13/14 · 3010:211173–211178), positioned in the 393×2328 frame (top −42)
  const PATHS = `
    <span class="hm2-path hm2-path--14" style="top:451px"><img src="${A}path-vector14.svg" width="258.895" height="255.967" alt=""></span>
    <span class="hm2-path hm2-path--12" style="top:813.25px"><img src="${A}path-vector12.svg" width="219.573" height="171.037" alt=""></span>
    <span class="hm2-path hm2-path--13" style="top:966.1px"><img src="${A}path-vector13.svg" width="248.956" height="180.502" alt=""></span>
    <span class="hm2-path hm2-path--14" style="top:1431.75px"><img src="${A}path-vector14.svg" width="258.895" height="255.967" alt=""></span>
    <span class="hm2-path hm2-path--12" style="top:1794px"><img src="${A}path-vector12.svg" width="219.573" height="171.037" alt=""></span>
    <span class="hm2-path hm2-path--13" style="top:1946.85px"><img src="${A}path-vector13.svg" width="248.956" height="180.502" alt=""></span>`;

  function render(screen) {
    const opt = +screen.dataset.hmOpt;
    const live = !screen.dataset.hmStage;
    const stage = screen.dataset.hmStage || liveStage();
    screen.dataset.stage = stage;
    const box = screen.querySelector('.js-hm-levels');
    box.innerHTML = (opt === 2 ? PATHS : '') + level(opt, stage, 0, live) + level(opt, stage, 1, live);
    // Module 01 points, driven by the lesson flow (25 per completed theme of App.lesson, 200-lesson-state.js)
    const exp1 = box.querySelector('.js-home-exp1');
    if (exp1 && App.lesson && stage === 'initial') {
      const t = App.lesson.themes;
      exp1.textContent = Math.round(t.filter((x) => App.lesson.themeDone(x.id)).length / t.length * 100) + '•';
    }
    // user name / avatar (31-avatar-sheet.js updates #s-home; mirror to the other home screens)
    const name = App.state.name;
    if (name) screen.querySelectorAll('.js-user-name').forEach((n) => (n.textContent = name));
    const src = document.querySelector('#s-home .profile-card__img img');
    if (src && screen.id !== 's-home') screen.querySelector('.profile-card__img img').src = src.src;
  }

  document.addEventListener('app:ready', () => {
    const screens = [...document.querySelectorAll('.hm-screen')];
    screens.forEach((s) => {
      render(s);
      s.addEventListener('screen:enter', () => {
        App.state.homeOpt = BASE[s.dataset.hmOpt];
        render(s);
      });
    });
    document.addEventListener('lesson:change', () => screens.forEach(render));
    // tapping the open module 02+ "finishes" level 1 (Figma flow: progress → theme completion → new level)
    document.addEventListener('click', (e) => {
      if (e.target.closest('.hm-card[data-go="s-theme-complete"]')) App.state.level1Done = true;
    }, true);
  });

  App.home = { render, liveStage };
})();
