/* ==========================================================
   MyAmeria Star — tiny router + shared partials
   Markup API (used by every screen fragment):
     <section class="screen" id="s-xyz" data-title="Name" data-group="Group">…</section>
     data-go="s-xyz"        navigate forward to a screen
     data-back              go back in history
     data-open="o-xyz"      open overlay (modal / bottom sheet) by id
     data-close             close the closest open overlay
     <div data-include="status-bar"></div>
     <div data-include="tabbar" data-active="education"></div>
     <div data-include="home-indicator"></div>
   ========================================================== */
(function () {
  const A = '../assets/';

  const partials = {
    'status-bar': () => `
      <div class="status-bar">
        <p class="sb-time">9:41</p>
        <div class="sb-island"></div>
        <div class="sb-levels">
          <img class="sb-cell" src="${A}sb-cellular.svg" alt="">
          <img class="sb-wifi" src="${A}sb-wifi.svg" alt="">
          <div class="sb-batt"></div><div class="sb-batt-fill"></div>
          <img class="sb-cap" src="${A}sb-battery-cap.svg" alt="">
        </div>
      </div>`,
    'home-indicator': () => `<div class="home-indicator"></div>`,
    'back-btn': () => `
      <button class="icon-btn" data-back aria-label="Back">
        <span class="ic24"><img src="${A}ic-arrow-left-shape.svg" width="7.10276" height="12.0916" alt=""></span>
      </button>`,
    'tabbar': (el) => {
      const active = el.dataset.active || 'education';
      const tab = (key, label, icon, extra = '') => `
        <button class="tab tab--${key} ${active === key ? 'is-active' : ''}" ${extra}>
          <span class="tab__icon">${icon}</span>
          <span class="tab__label">${label}</span>
        </button>`;
      return `
      <nav class="tabbar">
        <div class="tabbar__bar">
          <img class="tabbar__bg" src="${A}tabbar-bg.svg" alt="">
          <div class="tabbar__group">
            <div class="tabbar__half">
              ${tab('home', 'Home', `<img src="${A}tab-home.svg" width="20" height="20" alt="">`)}
              ${tab('services', 'Services', `<img src="${A}tab-services.svg" width="24" height="24" alt="">`)}
            </div>
            <div class="tabbar__half">
              ${tab('education', 'Education', `<img src="${A}tab-education-active.svg" width="24" height="24" alt="">`, 'data-go="s-home"')}
              ${tab('history', 'History', `<img src="${A}tab-history.svg" width="18" height="20.499" alt="">`)}
            </div>
            <button class="tabbar__qr" aria-label="Scan QR"><img src="${A}tab-qr-button.svg" alt=""></button>
          </div>
        </div>
        <div class="home-indicator"></div>
      </nav>`;
    },
  };

  function expandIncludes(root) {
    root.querySelectorAll('[data-include]').forEach((el) => {
      const fn = partials[el.dataset.include];
      if (!fn) return;
      const tpl = document.createElement('template');
      tpl.innerHTML = fn(el).trim();
      const node = tpl.content.firstElementChild;
      // keep extra classes / style from placeholder
      if (el.className) node.classList.add(...el.className.split(/\s+/).filter(Boolean));
      if (el.getAttribute('style')) node.setAttribute('style', el.getAttribute('style'));
      el.replaceWith(node);
    });
  }

  // Phone (touch, narrow) → full-screen app mode, no device mockup.
  const isApp = /[?&#]app\b/.test(location.search) ||
    (matchMedia('(pointer: coarse)').matches && Math.min(screen.width, innerWidth) <= 600);
  if (isApp) document.documentElement.classList.add('is-app');
  function fitDevice() {
    const dev = document.getElementById('device');
    if (!dev) return;
    const w = +dev.dataset.w || 393, h = +dev.dataset.h || 852;
    if (!isApp) { dev.style.width = w + 'px'; dev.style.height = h + 'px'; dev.style.transform = ''; return; }
    const vw = window.visualViewport ? visualViewport.width : innerWidth;
    const vh = window.visualViewport ? visualViewport.height : innerHeight;
    const s = vw / w;
    dev.style.width = w + 'px';
    dev.style.height = Math.round(vh / s) + 'px';
    dev.style.transform = 'scale(' + s + ')';
  }
  addEventListener('resize', fitDevice);
  addEventListener('hashchange', () => { const id = location.hash.slice(1); if (id && id !== App.current && document.getElementById(id)?.classList.contains('screen')) App.go(id); });
  addEventListener('orientationchange', () => setTimeout(fitDevice, 200));

  const stack = [];
  const App = (window.App = {
    state: { name: '', avatar: null, age: 10, level2Unlocked: false },
    current: null,
    go(id, { back = false, replace = false } = {}) {
      const next = document.getElementById(id);
      if (!next) return console.warn('No screen', id);
      const prev = App.current && document.getElementById(App.current);
      if (prev) prev.classList.remove('is-active', 'is-back');
      document.querySelectorAll('.overlay.is-open').forEach((o) => o.classList.remove('is-open'));
      if (!back && App.current && !replace) stack.push(App.current);
      const dev = document.getElementById('device');
      if (dev) { dev.dataset.w = next.dataset.w || 393; dev.dataset.h = next.dataset.h || 852; fitDevice(); }
      next.classList.add('is-active');
      next.classList.toggle('is-back', back);
      next.querySelectorAll('.scroll').forEach((s) => (s.scrollTop = 0));
      App.current = id;
      if (location.hash.slice(1) !== id) history.replaceState(null, '', '#' + id);
      document.querySelectorAll('.flow-nav button').forEach((b) => b.classList.toggle('is-current', b.dataset.go === id));
      next.dispatchEvent(new CustomEvent('screen:enter', { bubbles: true }));
    },
    back() { const id = stack.pop(); if (id) App.go(id, { back: true }); },
    open(id) { const o = document.getElementById(id); if (o) o.classList.add('is-open'); },
    close(el) { (el.closest('.overlay.is-open') || document.querySelector('.overlay.is-open'))?.classList.remove('is-open'); },
  });

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-go],[data-back],[data-open],[data-close]');
    if (!t) return;
    if (t.hasAttribute('data-close')) App.close(t);
    if (t.dataset.open) { e.preventDefault(); App.open(t.dataset.open); }
    if (t.hasAttribute('data-back')) { e.preventDefault(); App.back(); }
    if (t.dataset.go) { e.preventDefault(); App.go(t.dataset.go); }
  });
  // tap on the dim overlay backdrop closes it
  document.addEventListener('click', (e) => {
    if (e.target.classList && e.target.classList.contains('overlay') && !e.target.hasAttribute('data-static')) e.target.classList.remove('is-open');
  });

  function buildFlowNav() {
    const nav = document.querySelector('.flow-nav');
    if (!nav) return;
    let group = null, html = '<h3 style="color:#fff">Previous version</h3><button data-ext="../index.html" style="color:#93ec60">← Back to the new version</button>';
    document.querySelectorAll('.screen').forEach((s) => {
      if (s.dataset.group !== group) { group = s.dataset.group; html += `<h3>${group}</h3>`; }
      html += `<button data-go="${s.id}">${s.dataset.title || s.id}</button>`;
    });
    nav.innerHTML = html;
    nav.addEventListener('click', (e) => { const x = e.target.closest('[data-ext]'); if (x) location.href = x.dataset.ext + (App.current ? '#' + App.current : ''); });
    if (isApp) {
      // Phone: the screen list becomes a full-screen sheet opened by a small floating button.
      nav.insertAdjacentHTML('afterbegin', '<button class="flow-nav__close" aria-label="Close">✕</button>');
      const btn = document.createElement('button');
      btn.className = 'app-menu-btn'; btn.setAttribute('aria-label', 'All screens'); btn.textContent = '☰';
      document.body.appendChild(btn);
      const open = () => { nav.classList.add('is-open'); nav.querySelector('.is-current')?.scrollIntoView({ block: 'center' }); };
      const close = () => nav.classList.remove('is-open');
      btn.addEventListener('click', open);
      nav.addEventListener('click', (e) => { if (e.target.closest('.flow-nav__close, [data-go]')) close(); });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    expandIncludes(document);
    buildFlowNav();
    document.dispatchEvent(new Event('app:ready'));
    const first = location.hash.slice(1) || document.querySelector('.screen')?.id;
    if (first) App.go(first, { replace: true });
  });
})();
