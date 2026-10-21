/* Lesson · Reel player (s-l-reel) + exit dialog (o-l-reel-exit).
   Reads App.state.reel = { key, title }. Playback is simulated: the 01:00 reel plays in ~6s.
   States (data-state on .lr__sheet): idle (3005:96354) → playing (3005:95226) ⇄ paused → ended (3005:97477). */
(function () {
  const DURATION_MS = 6000;   // simulated playback length
  const REEL_SECONDS = 60;    // label length shown in the player (01:00)

  document.addEventListener('app:ready', () => {
    const screen = document.getElementById('s-l-reel');
    if (!screen) return;
    const sheet = screen.querySelector('.lr__sheet');
    const fill = screen.querySelector('.js-lr-fill');
    const time = screen.querySelector('.js-lr-time');
    const cta = screen.querySelector('.js-lr-done');
    const bg = screen.querySelector('.js-lr-bg');
    const dialog = document.getElementById('o-l-reel-exit');

    let elapsed = 0, startedAt = 0, raf = 0, watched = false;
    const reel = () => App.state.reel || { key: 't1.reel', title: 'Ռիլ' };
    const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

    function setState(s) { sheet.dataset.state = s; }
    function paint() {
      const p = Math.min(1, elapsed / DURATION_MS);
      fill.style.width = Math.max(2, p * 321) + 'px';
      time.textContent = fmt(Math.ceil(REEL_SECONDS * (1 - p)));
    }
    function tick(now) {
      elapsed = Math.min(DURATION_MS, elapsed + (now - startedAt)); startedAt = now;
      paint();
      if (elapsed >= DURATION_MS) return end();
      raf = requestAnimationFrame(tick);
    }
    function play() {
      if (sheet.dataset.state === 'ended' || sheet.dataset.state === 'idle') elapsed = 0;
      setState('playing'); startedAt = performance.now(); raf = requestAnimationFrame(tick);
    }
    function pause() { cancelAnimationFrame(raf); setState('paused'); }
    function end() {
      cancelAnimationFrame(raf); watched = true; elapsed = 0;
      setState('ended'); paint(); time.textContent = fmt(REEL_SECONDS);
      cta.disabled = false;
    }
    function reset() {
      cancelAnimationFrame(raf); elapsed = 0; watched = false;
      setState('idle'); paint(); time.textContent = fmt(REEL_SECONDS);
      cta.disabled = true;
    }
    function finish() {
      cancelAnimationFrame(raf);
      if (App.lesson) App.lesson.mark(reel().key);
      App.go('s-l-module');
    }
    function leave() { cancelAnimationFrame(raf); App.go('s-l-module'); }

    screen.querySelector('.js-lr-play').addEventListener('click', () => (sheet.dataset.state === 'playing' ? pause() : play()));
    cta.addEventListener('click', finish);
    screen.querySelector('.js-lr-close').addEventListener('click', () => {
      const saved = App.lesson && App.lesson.has(reel().key);
      if (watched && !saved) { if (sheet.dataset.state === 'playing') pause(); App.open('o-l-reel-exit'); }
      else leave();
    });
    dialog.querySelector('.js-lr-exit-nosave').addEventListener('click', () => { App.close(dialog); leave(); });
    dialog.querySelector('.js-lr-exit-save').addEventListener('click', () => { App.close(dialog); finish(); });

    screen.addEventListener('screen:enter', () => {
      reset();
      screen.querySelector('.js-lr-title').textContent = reel().title || 'Ռիլ';
      // Dimmed module page behind the sheet (as in Figma)
      const mod = document.getElementById('s-l-module');
      bg.innerHTML = '';
      if (mod) {
        const clone = document.createElement('div');
        clone.className = 'screen-clone';
        clone.innerHTML = mod.innerHTML;
        bg.appendChild(clone);
        const sc = clone.querySelector('.scroll');
        if (sc) sc.scrollTop = +(mod.dataset.scroll || 0);
        bg.classList.toggle('is-scrolled', mod.classList.contains('is-scrolled'));
      }
    });
    // stop the simulated playback when leaving the screen any other way
    document.addEventListener('screen:enter', (e) => { if (e.target !== screen) cancelAnimationFrame(raf); });
  });
})();
