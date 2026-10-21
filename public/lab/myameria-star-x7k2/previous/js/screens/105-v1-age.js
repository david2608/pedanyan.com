/* V1 · 05/06 Age input — working numeric keypad */
(function () {
  const MAX = 2;

  function setup(sec) {
    let value = sec.dataset.age || '';
    const kb = sec.querySelector('.v1o-kb');
    const out = sec.querySelector('.v1o-age__value');
    const cta = sec.querySelector('.v1o-cta');

    function render() {
      out.textContent = value;
      sec.classList.toggle('is-filled', value.length > 0);
      cta.disabled = value.length === 0;
      if (value && window.App) App.state.age = Number(value);
    }
    function openKb(on) {
      sec.classList.toggle('is-kb', on);
      kb.classList.toggle('is-open', on);
      kb.setAttribute('aria-hidden', on ? 'false' : 'true');
    }
    function press(k) {
      if (/^\d$/.test(k)) {
        if (value.length >= MAX) return;
        if (value === '' && k === '0') return;   // no leading zero
        value += k;
      } else if (k === 'del') {
        value = value.slice(0, -1);
      } else if (k === 'done') {
        if (value) openKb(false);
        return;
      } else {
        return; // , . − space: not valid for an age
      }
      render();
    }

    sec.querySelector('.v1o-age__field').addEventListener('click', (e) => { e.stopPropagation(); openKb(true); });
    kb.addEventListener('click', (e) => {
      e.stopPropagation();
      const b = e.target.closest('[data-key]');
      if (b) press(b.dataset.key);
    });
    // tap elsewhere on the screen closes the keypad
    sec.addEventListener('click', (e) => {
      if (kb.classList.contains('is-open') && !e.target.closest('.v1o-kb,.v1o-age__field,.v1o-cta')) openKb(false);
    });
    // hardware keyboard support while this screen is active
    document.addEventListener('keydown', (e) => {
      if (!sec.classList.contains('is-active')) return;
      if (/^\d$/.test(e.key)) { openKb(true); press(e.key); }
      else if (e.key === 'Backspace') press('del');
      else if (e.key === 'Enter') { if (kb.classList.contains('is-open')) press('done'); else if (value) App.go('v1-07'); }
      else if (e.key === 'Escape') openKb(false);
    });
    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.v1o-age').forEach(setup);
  });
})();
