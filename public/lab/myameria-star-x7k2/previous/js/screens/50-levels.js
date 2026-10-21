/* Levels flow — overlays (o-level-locked / o-level-new / o-two-levels), theme completion,
   demo hash entry points and ?age=12 flow. The home screens themselves (all options and states)
   are rendered by 20-home.js from App.state.level2Unlocked; App.state.homeOpt = last home option. */
(function () {
  const OVERLAYS = ['o-level-locked', 'o-level-new', 'o-two-levels'];

  function unlockLevel2() {
    App.state.level2Unlocked = true;
    App.go(App.state.homeOpt || 's-home');
  }

  // Read entry params *before* app.js routes on location.hash (app:ready fires first).
  const params = new URLSearchParams(location.search);
  const age = parseInt(params.get('age'), 10);
  let pendingOverlay = null;
  let pendingAgeVariant = false;

  document.addEventListener('app:ready', () => {
    if (!isNaN(age)) App.state.age = age;

    // Demo hash: #o-level-locked, #o-level-new, #o-level-new-age, #o-two-levels → s-home + overlay
    const h = location.hash.slice(1);
    if (h === 'o-level-new-age') { pendingOverlay = 'o-level-new'; pendingAgeVariant = true; }
    else if (OVERLAYS.includes(h)) pendingOverlay = h;
    if (pendingOverlay) history.replaceState(null, '', location.pathname + location.search + '#s-home');

    // CTA "Լավ" in o-level-new / o-two-levels
    document.querySelectorAll('.js-lvl-unlock').forEach((b) => b.addEventListener('click', unlockLevel2));

    // Theme completion CTA → home + "new level" modal
    const next = document.querySelector('#s-theme-complete .js-tc-next');
    if (next) next.addEventListener('click', () => {
      App.go(App.state.homeOpt || 's-home');
      document.getElementById('o-level-new').classList.remove('is-age');
      App.open('o-level-new');
    });

    // Theme completion close (✕) → back to the home option the user came from
    const close = document.querySelector('#s-theme-complete .js-tc-close');
    if (close) close.addEventListener('click', () => App.go(App.state.homeOpt || 's-home'));

    const screen = document.getElementById('s-home');
    if (!screen) return;

    let ageShown = false;
    screen.addEventListener('screen:enter', () => {
      if (pendingOverlay) {
        const id = pendingOverlay; pendingOverlay = null;
        document.getElementById('o-level-new').classList.toggle('is-age', pendingAgeVariant);
        setTimeout(() => App.open(id), 0);
      } else if (!ageShown && App.state.age > 11 && !App.state.level2Unlocked) {
        setTimeout(() => App.open('o-two-levels'), 0);
      }
      if (App.state.age > 11) ageShown = true;
    });
  });
})();
