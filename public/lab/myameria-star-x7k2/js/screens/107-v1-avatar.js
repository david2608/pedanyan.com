/* V1 · 07 Avatar — selectable avatar grid + name */
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const sec = document.getElementById('v1-07');
    if (!sec) return;
    const grid = sec.querySelector('.v1o-avgrid');
    grid.addEventListener('click', (e) => {
      const b = e.target.closest('.v1o-av');
      if (!b) return;
      grid.querySelectorAll('.v1o-av').forEach((x) => { x.classList.toggle('is-selected', x === b); x.setAttribute('aria-checked', x === b ? 'true' : 'false'); });
      if (window.App) App.state.avatar = b.dataset.avatar;
    });
    const name = sec.querySelector('.v1o-name__input');
    name.addEventListener('input', () => { if (window.App) App.state.name = name.value.trim(); });
    // (no default avatar is written to App.state any more — the gamified profile starts empty)
  });
})();
