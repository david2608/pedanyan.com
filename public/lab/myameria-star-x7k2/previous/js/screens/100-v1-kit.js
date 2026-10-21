/* V1 kit behaviour — see css/screens/100-v1-kit.css for the markup API.
   - expands [data-v1-include="status-bar" | "nav-handle" | "back-btn"]
   - quiz: click .v1-option → single select in that screen + enable its .v1-check
   - reel: click .v1-reel → toggle .is-playing (poster + fake progress, no real video) */
(function () {
  const A = '../assets/';
  const parts = {
    'status-bar': () => `
      <div class="v1-statusbar">
        <p class="v1-statusbar__time">9:30</p>
        <div class="v1-statusbar__icons">
          <img class="sb-wifi" src="${A}v1-sb-wifi.svg" width="17" height="17" alt="">
          <img class="sb-signal" src="${A}v1-sb-signal.svg" width="17" height="17" alt="">
          <img class="sb-battery" src="${A}v1-sb-battery.svg" width="8" height="15" alt="">
        </div>
        <img class="v1-statusbar__camera" src="${A}v1-sb-camera.svg" width="24" height="24" alt="">
      </div>`,
    'nav-handle': () => `<div class="v1-handle"></div>`,
    'back-btn': () => `<button class="v1-back" data-back aria-label="Back"><img src="${A}v1-ic-back.svg" width="24" height="24" alt=""></button>`,
  };

  // Scripts are at the end of <body>, so the DOM is parsed: expand synchronously
  document.querySelectorAll('[data-v1-include]').forEach((el) => {
    const fn = parts[el.dataset.v1Include];
    if (!fn) return;
    const tpl = document.createElement('template');
    tpl.innerHTML = fn(el).trim();
    const node = tpl.content.firstElementChild;
    if (el.className) node.classList.add(...el.className.split(/\s+/).filter(Boolean));
    el.replaceWith(node);
  });

  document.addEventListener('click', (e) => {
    const opt = e.target.closest('.v1-option');
    if (opt && !opt.closest('[data-static]')) {
      const screen = opt.closest('.screen');
      screen.querySelectorAll('.v1-option.is-selected').forEach((o) => o.classList.remove('is-selected'));
      opt.classList.add('is-selected');
      screen.querySelectorAll('.v1-check').forEach((b) => { b.disabled = false; b.classList.remove('is-disabled'); });
      return;
    }
    const reel = e.target.closest('.v1-reel');
    if (reel) reel.classList.toggle('is-playing');
  });

  // reset quiz selection + reels whenever a V1 screen is entered
  document.addEventListener('screen:enter', (e) => {
    const s = e.target;
    if (!s.classList || !s.classList.contains('v1')) return;
    s.querySelectorAll('.v1-options:not([data-static]) .v1-option.is-selected').forEach((o) => o.classList.remove('is-selected'));
    s.querySelectorAll('.v1-check').forEach((b) => { b.disabled = true; });
    s.querySelectorAll('.v1-reel.is-playing').forEach((r) => r.classList.remove('is-playing'));
  });
})();
