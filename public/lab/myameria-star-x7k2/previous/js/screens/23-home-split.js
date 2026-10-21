/* Education home · levels split (s-home-split): Սկսնակ / Առաջադեմ tabs over the Option 1 grid.
   Cards are rendered by 20-home.js (screen:enter); this only switches which level is shown. */
(function () {
  document.addEventListener('app:ready', () => {
    const s = document.getElementById('s-home-split');
    if (!s) return;
    const box = s.querySelector('.hm-split'), intro = s.querySelector('.js-hm-split-intro');
    function sync() {
      const lv = box.dataset.lv;
      s.querySelectorAll('.hm-seg__item').forEach((b) => b.classList.toggle('is-active', b.dataset.lv === lv));
      const levels = s.querySelectorAll('.hm-level');
      levels.forEach((l, i) => {
        const st = l.querySelector('.hm-level__status');
        const el = s.querySelector('.js-hm-seg-n' + i);
        if (st && el) el.textContent = st.textContent.replace('ավարտված է', 'ավարտված');
      });
      const l2locked = levels[1] && levels[1].classList.contains('is-locked');
      box.classList.toggle('is-l2-open', !l2locked);
      intro.innerHTML = lv === '1' && l2locked
        ? '<img src="../assets/lm-lock24.svg" alt=""><span><b>Առաջադեմ մակարդակը փակ է</b>Ավարտիր Սկսնակի մոդուլները՝ բացելու համար</span>'
        : '';
    }
    s.addEventListener('click', (e) => {
      const b = e.target.closest('.hm-seg__item');
      if (!b || b.dataset.lv === box.dataset.lv) return;
      box.dataset.lv = b.dataset.lv;
      const lv = s.querySelector('.hm__levels');
      lv.style.animation = 'none'; void lv.offsetWidth; lv.style.animation = '';
      sync();
    });
    s.addEventListener('screen:enter', () => {
      // land on the level the child is working on
      box.dataset.lv = App.state.level2Unlocked ? '1' : '0';
      sync();
    });
    document.addEventListener('lesson:change', sync);
  });
})();
