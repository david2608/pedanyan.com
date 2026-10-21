/* Shared gamified-profile form (preview + nickname + avatar grid) — App.ProfileForm(root, opts)
   Used by: onboarding #s-onb-avatar (+ its state copies) and the edit sheet #o-avatar-sheet (31-avatar-sheet.js).
   The markup comes from <template id="tpl-profile-form"> and is injected into every [data-pf-part="form"].

   Nickname states (data-state on .pa-nick): default · checking · success · error  (focus is CSS :focus-within)
   Avatar tile states (data-state on .pa-av): loading · ready · failed  + .is-selected
   Onboarding modes (data-pa-mode on the section): live · empty · picked · loading · error · partial · invalid · valid */
(function () {
  const A = 'assets/';
  // No MyAmeria avatar any more: the profile starts empty and the kid picks one of these.
  const AVATARS = [
    { src: A + 'prof-av-01.png', tone: 'blue' },
    { src: A + 'prof-av-02.png', tone: 'green' },
    { src: A + 'prof-av-03.png', tone: 'blue', pt: 14 },
    { src: A + 'prof-av-04.png', tone: 'green' },
    { src: A + 'prof-av-05.png', tone: 'green' },
    { src: A + 'prof-av-06.png', tone: 'blue', pt: 10 },
    { src: A + 'prof-av-07.png', tone: 'blue' },
    { src: A + 'prof-av-08.png', tone: 'green' },
    { src: A + 'avatar-anush.png', tone: 'green' },
    { src: A + 'prof-av-10.png', tone: 'blue' },
  ];
  const PARTIAL_FAIL = [6, 9];
  const TAKEN = ['anna', 'milana', 'միլանա', 'admin', 'ameria', 'star', 'test', 'user', 'ani'];
  const MSG = {
    hint: '3–20 նիշ՝ հայերեն կամ լատինատառ, թվեր, _',
    short: 'Մականունը պետք է ունենա առնվազն 3 նիշ',
    chars: 'Օգտագործիր միայն տառեր, թվեր և _',
    mixed: 'Մի՛ խառնիր հայերեն և լատինական տառերը',
    taken: 'Այս մականունն արդեն զբաղված է․ փորձիր մեկ այլ',
    free: 'Հիանալի՛ է․ մականունն ազատ է',
    checking: 'Ստուգում ենք՝ արդյոք մականունն ազատ է…',
    same: 'Սա քո ներկայիս մականունն է',
  };
  const HY = /[Ա-Ֆա-և]/, LAT = /[A-Za-z]/, OK = /^[Ա-Ֆա-ևA-Za-z0-9_]+$/;

  function inject(root) {
    const tpl = document.getElementById('tpl-profile-form');
    root.querySelectorAll('[data-pf-part="form"]').forEach((slot) => {
      if (slot.childElementCount) return;
      slot.classList.add('pf-form');
      slot.appendChild(tpl.content.cloneNode(true));
    });
  }

  /** opts: { onChange(form), current: { name, avatar } (edit mode: unchanged name is valid) } */
  function ProfileForm(root, opts = {}) {
    inject(root);
    const $ = (s) => root.querySelector(s);
    const nick = $('.pa-nick'), input = $('.js-pa-nick'), note = $('.js-pa-note'), count = $('.js-pa-count');
    const grid = $('.js-pa-grid'), avBlock = $('.pa-avatars'), preview = $('.pa-preview:not(.pa-preview--skel)');
    const pName = $('.js-pa-name'), pPhoto = $('.js-pa-photo');
    let state = 'default', selected = null, tShort, tCheck;
    const api = {};

    /* ---------- nickname ---------- */
    function setNick(st, msg, { shake = false } = {}) {
      state = st;
      nick.dataset.state = st;
      note.textContent = msg || MSG.hint;
      if (shake) { nick.classList.remove('is-shake'); void nick.offsetWidth; nick.classList.add('is-shake'); }
      changed();
    }
    function validate(immediate) {
      clearTimeout(tShort); clearTimeout(tCheck);
      const v = input.value.trim();
      count.textContent = `${input.value.length}/20`;
      nick.classList.toggle('is-empty', !input.value);
      if (!v) return setNick('default');
      if (opts.current && v === opts.current.name) return setNick('default', MSG.same);
      if (!OK.test(v)) return setNick('error', MSG.chars, { shake: immediate });
      if (HY.test(v) && LAT.test(v)) return setNick('error', MSG.mixed, { shake: immediate });
      if (v.length < 3) {
        if (immediate) return setNick('error', MSG.short, { shake: true });
        setNick('default');
        tShort = setTimeout(() => setNick('error', MSG.short), 900);
        return;
      }
      setNick('checking', MSG.checking);
      tCheck = setTimeout(() => {
        if (input.value.trim() !== v) return;
        TAKEN.includes(v.toLowerCase()) ? setNick('error', MSG.taken, { shake: true }) : setNick('success', MSG.free);
      }, immediate ? 0 : 750);
    }
    input.addEventListener('input', () => validate(false));
    input.addEventListener('blur', () => { if (state === 'default' && input.value.trim() && !(opts.current && input.value.trim() === opts.current.name)) validate(true); });
    $('.pa-field__box').addEventListener('click', (e) => { if (!e.target.closest('.js-pa-clear')) input.focus(); });
    $('.js-pa-clear').addEventListener('mousedown', (e) => e.preventDefault());
    $('.js-pa-clear').addEventListener('click', () => { input.value = ''; validate(false); input.focus(); });

    /* ---------- avatars ---------- */
    function tile(av, i) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pa-av';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', 'false');
      b.setAttribute('aria-label', 'Կերպար ' + (i + 1));
      b.dataset.i = i;
      b.dataset.src = av.src;
      b.innerHTML = `<span class="pa-disc is-${av.tone}"></span>
        <span class="pa-av__ring"></span>
        <span class="pa-av__check"><img src="${A}onb-pa-ic-selected.svg" alt=""></span>`;
      return b;
    }
    function loadTile(b, { fail = false, delay = 0 } = {}) {
      const av = AVATARS[b.dataset.i];
      const disc = b.querySelector('.pa-disc');
      b.dataset.state = 'loading';
      disc.innerHTML = '';
      setTimeout(() => {
        if (fail) return failTile(b);
        const img = new Image();
        img.alt = '';
        img.onload = () => { disc.appendChild(img); b.dataset.state = 'ready'; changed(); };
        img.onerror = () => failTile(b);
        img.src = av.src;
      }, delay);
    }
    function failTile(b) {
      b.dataset.state = 'failed';
      b.setAttribute('aria-label', 'Վերաբեռնել');
      b.querySelector('.pa-disc').innerHTML = `<img class="pa-av__retry" src="${A}pedit-repeat.svg" alt="">`;
      if (selected === b) select(null);
      changed();
    }
    function select(b, { animate = false } = {}) {
      selected = b;
      grid.querySelectorAll('.pa-av').forEach((x) => {
        const on = x === b;
        x.classList.toggle('is-selected', on);
        x.classList.remove('is-just');
        x.setAttribute('aria-checked', String(on));
      });
      grid.classList.toggle('has-selection', !!b);
      if (b && animate) { void b.offsetWidth; b.classList.add('is-just'); }
      avBlock.classList.remove('is-missing');
      if (b) { pPhoto.src = b.dataset.src; }
      preview.dataset.filled = String(!!b);
      if (b && animate) { preview.classList.remove('is-pop'); void preview.offsetWidth; preview.classList.add('is-pop'); }
      changed();
    }
    grid.addEventListener('click', (e) => {
      const b = e.target.closest('.pa-av');
      if (!b) return;
      if (b.dataset.state === 'failed') return loadTile(b, { delay: 700 });
      if (b.dataset.state !== 'ready') return;
      select(b, { animate: true });
    });
    function buildGrid({ skeleton = false, failIdx = [], delay = 0 } = {}) {
      grid.innerHTML = '';
      AVATARS.forEach((av, i) => grid.appendChild(tile(av, i)));
      const tiles = [...grid.children];
      tiles.forEach((b) => { b.dataset.state = 'loading'; });
      if (!skeleton) tiles.forEach((b, i) => loadTile(b, { fail: failIdx.includes(i), delay }));
      return tiles;
    }
    function setAvatarsMode(m) { avBlock.dataset.mode = m; }
    $('.js-pa-reload').addEventListener('click', () => { setAvatarsMode('grid'); buildGrid({ delay: 900 }); });

    /* ---------- preview + change ---------- */
    function changed() {
      const v = input.value.trim();
      pName.textContent = v || 'Քո մականունը';
      pName.classList.toggle('is-ph', !v);
      opts.onChange && opts.onChange(api);
    }

    Object.defineProperties(api, {
      nick: { get: () => input.value.trim() },
      avatar: { get: () => (selected ? selected.dataset.src : null) },
      nickState: { get: () => state },
    });
    Object.assign(api, {
      root, AVATARS,
      nickOk() { return state === 'success' || (!!opts.current && input.value.trim() === opts.current.name); },
      avatarOk() { return !!selected && selected.dataset.state === 'ready'; },
      valid() { return api.nickOk() && api.avatarOk(); },
      setCurrent(cur) { opts.current = cur; },
      /** show what is missing (CTA tapped while disabled) */
      flagMissing() {
        if (!api.nickOk() && state !== 'checking') {
          if (!input.value.trim()) setNick('error', 'Մուտքագրիր մականուն', { shake: true }); else validate(true);
        }
        if (!api.avatarOk()) { avBlock.classList.remove('is-missing'); void avBlock.offsetWidth; avBlock.classList.add('is-missing'); }
      },
      reset({ name = '', avatar = null, nickState = null, msg = null, skeleton = false, fail = [], delay = 0, empty = false } = {}) {
        clearTimeout(tShort); clearTimeout(tCheck);
        avBlock.classList.remove('is-missing');
        input.value = name;
        count.textContent = `${name.length}/20`;
        nick.classList.toggle('is-empty', !name);
        if (nickState) setNick(nickState, msg); else if (name && !(opts.current && name === opts.current.name)) validate(true); else setNick('default', opts.current && name === opts.current.name ? MSG.same : null);
        selected = null;
        grid.classList.remove('has-selection');
        preview.dataset.filled = 'false';
        if (empty) { setAvatarsMode('empty'); grid.innerHTML = ''; changed(); return; }
        setAvatarsMode('grid');
        buildGrid({ skeleton, failIdx: fail, delay });
        if (avatar) {
          const b = [...grid.children].find((x) => x.dataset.src === avatar);
          if (b) { preview.dataset.filled = 'true'; pPhoto.src = avatar; const settle = () => (b.dataset.state === 'ready' ? select(b) : setTimeout(settle, 60)); settle(); }
        }
        changed();
      },
      loadAll(delay = 0) { [...grid.children].forEach((b) => loadTile(b, { delay })); },
    });
    return api;
  }
  window.App = window.App || {};
  App.ProfileForm = ProfileForm;
  App.PROFILE_AVATARS = AVATARS;

  /* ================= Onboarding screen + its state copies ================= */
  document.addEventListener('app:ready', () => {
    const main = document.getElementById('s-onb-avatar');
    if (!main) return;

    function mount(root) {
      const mode = root.dataset.paMode || 'live';
      const cta = root.querySelector('.js-onb-avatar-cta');
      const hint = root.querySelector('.js-pa-cta-hint');
      let wasReady = false, tLoad;
      const form = ProfileForm(root, {
        onChange(f) {
          const ok = f.valid();
          cta.setAttribute('aria-disabled', String(!ok));
          if (ok && !wasReady) { cta.classList.remove('is-ready'); void cta.offsetWidth; cta.classList.add('is-ready'); }
          wasReady = ok;
          const miss = [];
          if (!f.avatarOk()) miss.push('կերպար');
          if (!f.nickOk()) miss.push('մականուն');
          hint.textContent = miss.length ? `Ընտրիր ${miss.join(' և ')}՝ շարունակելու համար` : 'Ամեն ինչ պատրաստ է';
        },
      });
      cta.addEventListener('click', () => {
        if (!form.valid()) return form.flagMissing();
        App.state.name = form.nick;
        App.state.avatar = form.avatar;
        App.syncProfile && App.syncProfile();
        App.go('s-onb-task');
      });
      root.addEventListener('screen:enter', () => {
        clearTimeout(tLoad);
        root.dataset.paLoad = '';
        wasReady = false;
        if (mode === 'loading') { root.dataset.paLoad = 'skeleton'; form.reset({ skeleton: true }); return; }
        if (mode === 'error') return form.reset({ empty: true });
        if (mode === 'partial') return form.reset({ fail: PARTIAL_FAIL });
        if (mode === 'invalid') return form.reset({ name: 'An', nickState: 'error', msg: MSG.short });
        if (mode === 'taken') return form.reset({ name: 'Ani', nickState: 'error', msg: MSG.taken });
        if (mode === 'valid') return form.reset({ name: 'Ann_2014', avatar: AVATARS[3].src, nickState: 'success', msg: MSG.free });
        if (mode === 'picked') return form.reset({ avatar: AVATARS[1].src });
        if (mode === 'empty') return form.reset({});
        // live: a short skeleton, then the images land — nothing preselected
        root.dataset.paLoad = 'skeleton';
        form.reset({ skeleton: true, name: App.state.nick || '' });
        tLoad = setTimeout(() => { root.dataset.paLoad = ''; form.loadAll(); }, 650);
      });
      root.querySelector('.js-pa-nick').addEventListener('change', (e) => { if (mode === 'live') App.state.nick = e.target.value.trim(); });
    }

    [main, ...document.querySelectorAll('[data-pa-clone]')].forEach(mount);

    /* ---------- Components · states board ---------- */
    const board = document.getElementById('s-pa-states');
    if (board) {
      const av = (i, cls = '', state = 'ready') => `<span class="pa-av ${cls}" data-state="${state}"><span class="pa-disc is-${AVATARS[i].tone}">${state === 'ready' ? `<img src="${AVATARS[i].src}" alt="">` : state === 'failed' ? `<img class="pa-av__retry" src="${A}pedit-repeat.svg" alt="">` : ''}</span><span class="pa-av__ring"></span><span class="pa-av__check"><img src="${A}onb-pa-ic-selected.svg" alt=""></span></span>`;
      const rows = [
        [av(0), 'Default', 'Light 1.5px outline on a soft gradient disc.'],
        [av(1, 'is-pressed'), 'Pressed', 'While the finger is down the tile shrinks to 90% — instant “I felt it”.'],
        [av(2, 'is-selected is-just'), 'Selected', 'Lifts to 108%, white gap + 3px green ring + glow, check badge pops, a ring bursts once. The preview card avatar updates with the same burst.'],
        [`<span style="opacity:.5;filter:saturate(.4);transform:scale(.94);display:block;width:70px">${av(3)}</span>`, 'Not selected (after a pick)', 'Other tiles step back: 50% opacity, desaturated, 94% — the chosen one is the only colorful tile.'],
        [av(4, '', 'loading'), 'Loading', 'Neutral circle pulsing slate-50 ↔ slate-130.'],
        [av(5, '', 'failed'), 'Failed', 'Retry glyph; tap reloads only this tile.'],
      ];
      board.querySelector('.js-pst-avs').innerHTML = rows.map(([el, t, d]) => `<div class="pst-row">${el}<div><p class="pst-t">${t}</p><p class="pst-d">${d}</p></div></div>`).join('');
      const f = (st, val, msg, extra = '') => `<div class="pst-field"><span class="pst-tag">${extra || st}</span><div class="pa-nick${val ? '' : ' is-empty'}" data-state="${st}"><div class="pa-field"><div class="pa-field__box${extra === 'focus' ? ' is-focus' : ''}"><input class="pa-field__input" value="${val}" placeholder="Օր․՝ Ani_2014" tabindex="-1" readonly><span class="pa-field__trail"><span class="pa-field__spin"></span><span class="pa-field__ok">${OKSVG}</span><span class="pa-field__err">${ERRSVG}</span>${extra === 'focus' ? `<button class="pa-field__clear" style="display:block" tabindex="-1"><img src="${A}onb-pa-ic-clear.svg" width="24" height="24" alt=""></button>` : ''}</span></div><p class="pa-field__note"><span class="pa-field__note-ic"></span><span class="pa-field__msg">${msg}</span><span class="pa-field__count">${val.length}/20</span></p></div></div></div>`;
      const tpl = document.getElementById('tpl-profile-form').content;
      const OKSVG = tpl.querySelector('.pa-field__ok').innerHTML, ERRSVG = tpl.querySelector('.pa-field__err').innerHTML;
      board.querySelector('.js-pst-fields').innerHTML = [
        f('default', '', MSG.hint),
        f('default', 'Ann', MSG.hint, 'focus'),
        f('checking', 'Ann_2014', MSG.checking),
        f('success', 'Ann_2014', MSG.free),
        f('error', 'An', MSG.short),
        f('error', 'Ani', MSG.taken),
      ].join('');
    }
  });

  // state copies get the onboarding markup now, before app.js expands the includes
  const main = document.getElementById('s-onb-avatar');
  if (main) document.querySelectorAll('[data-pa-clone]').forEach((s) => { s.innerHTML = main.innerHTML; });
})();
