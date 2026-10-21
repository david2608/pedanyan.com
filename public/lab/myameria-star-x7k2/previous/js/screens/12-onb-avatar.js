/* Onboarding · Profile setup (Figma 3010:259846) — nickname validation + avatar grid states.
   Modes (data-pa-mode on the section): live | loading | error | partial | invalid | valid.
   State copies (screens/14-onb-states.html, data-pa-clone) get #s-onb-avatar's markup before includes expand. */
(function () {
  const main = document.getElementById('s-onb-avatar');
  if (!main) return;
  document.querySelectorAll('[data-pa-clone]').forEach((s) => { s.innerHTML = main.innerHTML; });

  const A = '../assets/';
  // First option = MyAmeria default avatar (preselected). Then the 10 avatars of the Figma grid, in order.
  const AVATARS = [
    { src: A + 'ameria-avatar-default.svg', ameria: true },
    { src: A + 'prof-av-01.png', tone: 'blue',  w: 75, h: 74 },
    { src: A + 'prof-av-02.png', tone: 'green', w: 76, h: 76 },
    { src: A + 'prof-av-03.png', tone: 'blue',  w: 76, h: 67, pt: 16 },
    { src: A + 'prof-av-04.png', tone: 'green', w: 77, h: 76 },
    { src: A + 'prof-av-05.png', tone: 'blue',  w: 76, h: 76 },
    { src: A + 'prof-av-06.png', tone: 'green', w: 76, h: 76, pt: 10 },
    { src: A + 'prof-av-07.png', tone: 'blue',  w: 76, h: 76 },
    { src: A + 'prof-av-08.png', tone: 'blue',  w: 77, h: 76 },
    { src: A + 'avatar-anush.png', tone: 'green', w: 76, h: 77 },
    { src: A + 'prof-av-10.png', tone: 'green', w: 76, h: 77 },
  ];
  const PARTIAL_FAIL = [7, 10];                 // Figma "Partly uploaded case": 7th and 10th design avatars
  const TAKEN = ['anna', 'milana', 'միլանա', 'admin', 'ameria', 'star', 'test', 'user'];
  const MSG = {
    hint: '3–20 նիշ՝ հայերեն կամ լատինատառ, թվեր, _',
    short: 'Առնվազն 3 նիշ',
    mixed: 'Մի խառնիր այբուբենները',
    taken: 'Այս անունն զբաղված է',
    free: 'Այս անունն ազատ է',
    checking: 'Ստուգվում է՝ արդյոք մականունը ազատ է',
  };
  const HY = /[Ա-Ֆա-և]/, LAT = /[A-Za-z]/, OK = /^[Ա-Ֆա-ևA-Za-z0-9_]+$/;

  let picked = false; // until the user picks, keep the MyAmeria profile avatar (shared by all copies)

  function mount(root) {
    const mode = root.dataset.paMode || 'live';
    const nick = root.querySelector('.pa-nick');
    const input = root.querySelector('.js-pa-nick');
    const note = root.querySelector('.js-pa-note');
    const grid = root.querySelector('.js-pa-grid');
    const avBlock = root.querySelector('.pa-avatars');
    const cta = root.querySelector('.js-onb-avatar-cta');
    let nickState = 'default', selected = null, tShort, tCheck, tLoad;

    /* ---------- nickname ---------- */
    function setNick(state, msg) {
      nickState = state;
      nick.dataset.state = state;
      note.textContent = msg || MSG.hint;
      update();
    }
    function validate(immediate) {
      clearTimeout(tShort); clearTimeout(tCheck);
      const v = input.value.trim();
      if (!v) return setNick('default');
      if (!OK.test(v)) return setNick('error', MSG.hint);
      if (HY.test(v) && LAT.test(v)) return setNick('error', MSG.mixed);
      if (v.length < 3) {
        if (immediate) return setNick('error', MSG.short);
        setNick('default');
        tShort = setTimeout(() => setNick('error', MSG.short), 600);
        return;
      }
      setNick('checking', MSG.checking);
      tCheck = setTimeout(() => {
        if (input.value.trim() !== v) return;
        TAKEN.includes(v.toLowerCase()) ? setNick('error', MSG.taken) : setNick('success', MSG.free);
      }, immediate ? 0 : 800);
    }
    input.addEventListener('input', () => { validate(false); update(); });
    input.addEventListener('blur', () => { if (nickState === 'default' && input.value.trim()) validate(true); });
    root.querySelector('.pa-field__box').addEventListener('click', (e) => { if (!e.target.closest('.js-pa-clear')) input.focus(); });
    root.querySelector('.js-pa-clear').addEventListener('click', () => { input.value = ''; validate(false); input.focus(); });

    /* ---------- avatars ---------- */
    function tile(av, i) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pa-av' + (av.ameria ? ' pa-av--ameria' : '');
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', 'false');
      b.dataset.i = i;
      b.dataset.src = av.src;
      b.innerHTML = `<span class="pa-disc ${av.tone ? 'is-' + av.tone : ''}"${av.pt ? ` style="padding-top:${av.pt}px"` : ''}></span>
        <span class="pa-av__check"><img src="${A}onb-pa-ic-selected.svg" width="20" height="20" alt=""></span>
        ${av.ameria ? '<span class="pa-av__tag">MyAmeria</span>' : ''}`;
      return b;
    }
    function loadTile(b, { fail = false, delay = 0 } = {}) {
      const av = AVATARS[b.dataset.i];
      const disc = b.querySelector('.pa-disc');
      b.dataset.state = 'loading';
      b.setAttribute('aria-label', 'Loading');
      disc.innerHTML = '';
      setTimeout(() => {
        if (fail) return failTile(b);
        const img = new Image();
        img.alt = '';
        if (!av.ameria) { img.width = av.w; img.height = av.h; }
        img.onload = () => { disc.appendChild(img); b.dataset.state = 'ready'; b.removeAttribute('aria-label'); update(); };
        img.onerror = () => failTile(b);
        img.src = av.src;
      }, delay);
    }
    function failTile(b) {
      const disc = b.querySelector('.pa-disc');
      b.dataset.state = 'failed';
      b.setAttribute('aria-label', 'Վերաբեռնել');
      disc.innerHTML = `<img class="pa-av__retry" src="${A}pedit-repeat.svg" width="36" height="36" alt="">`;
      if (selected === b) select(null);
      update();
    }
    function select(b) {
      selected = b;
      grid.querySelectorAll('.pa-av').forEach((x) => { const on = x === b; x.classList.toggle('is-selected', on); x.setAttribute('aria-checked', on); });
      grid.classList.toggle('has-selection', !!b);
      if (b) App.state.avatar = b.dataset.src;
      const ph = root.querySelector('.js-pa-photo'); if (ph && b) ph.src = b.dataset.src;
      update();
    }
    grid.addEventListener('click', (e) => {
      const b = e.target.closest('.pa-av');
      if (!b) return;
      if (b.dataset.state === 'failed') return loadTile(b, { delay: 700 });
      if (b.dataset.state !== 'ready') return;
      picked = true;
      select(b);
    });
    function buildGrid({ skeleton = false, failIdx = [], delay = 0 } = {}) {
      clearTimeout(tLoad);
      grid.innerHTML = '';
      AVATARS.forEach((av, i) => grid.appendChild(tile(av, i)));
      const tiles = [...grid.children];
      tiles.forEach((b) => { b.dataset.state = 'loading'; });
      if (!skeleton) tiles.forEach((b, i) => loadTile(b, { fail: failIdx.includes(i), delay }));
      return tiles;
    }
    function setAvatarsMode(m) { avBlock.dataset.mode = m; root.dataset.paLoad = m; }
    root.querySelector('.js-pa-reload').addEventListener('click', () => {
      setAvatarsMode('grid');
      buildGrid({ delay: 900 });
      preselect();
    });

    function preselect() {
      // MyAmeria avatar is the default; a user pick (in any copy) is kept.
      const want = picked && App.state.avatar ? App.state.avatar : AVATARS[0].src;
      const b = [...grid.children].find((x) => x.dataset.src === want) || grid.children[0];
      if (b) select(b);
    }

    /* ---------- CTA ---------- */
    let tried = false;
    function update() {
      const nm = root.querySelector('.js-pa-name'); if (nm) nm.textContent = input.value.trim() || 'MyAmeria';
      const nickOk = nickState === 'success';
      const avOk = !!selected && selected.dataset.state === 'ready';
      cta.setAttribute('aria-disabled', String(!(nickOk && avOk)));
      root.querySelector('.pa-avatars .pa-label').classList.toggle('is-error', tried && !avOk);
    }
    cta.addEventListener('click', () => {
      const nickOk = nickState === 'success';
      const avOk = !!selected && selected.dataset.state === 'ready';
      if (nickOk && avOk) {
        App.state.name = input.value.trim();
        App.state.avatar = selected.dataset.src;
        return App.go('s-onb-task');
      }
      tried = true;
      if (!nickOk && nickState !== 'checking') {
        if (!input.value.trim()) setNick('error', MSG.short); else validate(true);
      }
      update();
    });

    /* ---------- enter: set up the mode ---------- */
    root.addEventListener('screen:enter', () => {
      clearTimeout(tShort); clearTimeout(tCheck);
      tried = false;
      selected = null;
      grid.classList.remove('has-selection');
      root.dataset.paLoad = '';
      if (mode === 'loading') {
        setAvatarsMode('grid'); root.dataset.paLoad = 'skeleton';
        buildGrid({ skeleton: true });
        input.value = ''; setNick('default');
        return;
      }
      if (mode === 'error') {
        setAvatarsMode('empty'); grid.innerHTML = '';
        input.value = ''; setNick('default');
        return;
      }
      setAvatarsMode('grid');
      if (mode === 'partial') { buildGrid({ failIdx: PARTIAL_FAIL }); input.value = ''; setNick('default'); return; }
      if (mode === 'invalid') {
        buildGrid();
        input.value = 'An'; setNick('error', MSG.short);
        tried = true; update();
        return;
      }
      if (mode === 'valid') {
        buildGrid(); preselect();
        input.value = 'Ann'; setNick('success', MSG.free);
        return;
      }
      // live: short skeleton, then the images land; MyAmeria avatar preselected
      root.dataset.paLoad = 'skeleton';
      buildGrid({ skeleton: true });
      tLoad = setTimeout(() => {
        root.dataset.paLoad = '';
        [...grid.children].forEach((b) => loadTile(b));
        preselect();
      }, 700);
      if (App.state.nick) { input.value = App.state.nick; validate(true); } else if (!input.value) setNick('default');
    });
    input.addEventListener('change', () => { if (mode === 'live') App.state.nick = input.value.trim(); });
  }

  [main, ...document.querySelectorAll('[data-pa-clone]')].forEach(mount);
})();
