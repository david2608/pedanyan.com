/* Onboarding · Ready to start — replay the rocket launch every time the screen opens */
(function () {
  document.addEventListener('app:ready', () => {
    const s = document.getElementById('s-onb-start');
    if (!s) return;
    let t;
    s.addEventListener('screen:enter', () => {
      clearTimeout(t);
      s.classList.remove('is-launching', 'is-ready');
      void s.offsetWidth; // restart CSS animations
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) { s.classList.add('is-ready'); return; }
      // wait for the rocket image so the launch is never played with an empty stage
      const img = s.querySelector('.onb-rocket__img');
      const go = () => { if (s.classList.contains('is-active')) {
        s.classList.add('is-launching');
        t = setTimeout(() => s.classList.add('is-ready'), 1950); // rocket left the screen → it flies back and the CTA appears
      } };
      (img.decode ? img.decode() : Promise.resolve()).then(go, go);
    });
  });
})();
