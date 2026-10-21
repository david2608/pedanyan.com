/* Onboarding · Benefits pager — swipe or tap "Շարունակել"; dots follow the scroll position.
   Last slide: CTA becomes "Ստեղծել պրոֆիլ" → s-onb-avatar. "Բաց թողնել" jumps straight to the profile. */
(function () {
  document.addEventListener('app:ready', () => {
    const s = document.getElementById('s-onb-benefits');
    if (!s) return;
    const pager = s.querySelector('.obn-pager');
    const slides = [...s.querySelectorAll('.obn-slide')];
    const dots = [...s.querySelectorAll('.obn-dot')];
    const cta = s.querySelector('.js-obn-next');
    const label = cta.querySelector('span');
    let idx = 0;

    function set(i) {
      idx = i;
      slides.forEach((sl, k) => sl.classList.toggle('is-on', k === i));
      dots.forEach((d, k) => { d.classList.toggle('is-on', k === i); d.setAttribute('aria-current', k === i ? 'step' : 'false'); });
      const last = i === slides.length - 1;
      s.classList.toggle('is-last', last);
      label.textContent = last ? 'Ստեղծել պրոֆիլ' : 'Շարունակել';
    }
    function goTo(i, smooth = true) { pager.scrollTo({ left: i * pager.clientWidth, behavior: smooth ? 'smooth' : 'auto' }); set(i); }

    let t;
    pager.addEventListener('scroll', () => {
      clearTimeout(t);
      t = setTimeout(() => { const i = Math.round(pager.scrollLeft / pager.clientWidth); if (i !== idx) set(i); }, 60);
    });
    dots.forEach((d, k) => d.addEventListener('click', () => goTo(k)));
    cta.addEventListener('click', () => (idx < slides.length - 1 ? goTo(idx + 1) : App.go('s-onb-avatar')));
    s.querySelector('.js-obn-skip').addEventListener('click', () => App.go('s-onb-avatar'));

    // mouse drag on desktop (the prototype is mostly reviewed in a browser)
    let down = null;
    pager.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') down = { x: e.clientX, l: pager.scrollLeft }; });
    addEventListener('pointerup', (e) => {
      if (!down) return;
      const dx = e.clientX - down.x; down = null;
      if (Math.abs(dx) > 40) goTo(Math.max(0, Math.min(slides.length - 1, idx + (dx < 0 ? 1 : -1))));
    });

    s.addEventListener('screen:enter', () => {
      slides.forEach((sl) => sl.classList.remove('is-on'));
      requestAnimationFrame(() => goTo(0, false));
    });
  });
})();
