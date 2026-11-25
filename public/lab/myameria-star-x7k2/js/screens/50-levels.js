/* Levels flow glue — theme completion → back to the Education home, demo hash entries and ?age=NN.
   The home itself (tabs, locked level, unlock modals + animation) lives in 24-home-levels.js.
   Live rules: App.state.age (default 10, ?age=12 to try the 12+ flow), App.state.l1Done, App.state.pendingUnlock. */
(function () {
  const params = new URLSearchParams(location.search);
  const age = parseInt(params.get('age'), 10);

  document.addEventListener('app:ready', () => {
    if (!isNaN(age)) App.state.age = age;

    // Demo hash entries (kept from the previous build): #o-level-locked, #o-level-new, #o-level-new-age, #o-two-levels
    const h = location.hash.slice(1);
    const map = { 'o-level-locked': 's-home-u11-l2', 'o-level-new': 's-home-u11done', 'o-level-new-age': 's-home-turned12', 'o-two-levels': 's-home-o11' };
    if (map[h]) history.replaceState(null, '', location.pathname + location.search + '#' + map[h]);

    // Theme completion "Վերադառնալ" → level 1 is finished in this demo → level 2 unlocks on the live home
    const next = document.querySelector('#s-theme-complete .js-tc-next');
    if (next) next.addEventListener('click', () => {
      const wasOpen = App.state.age >= 12;
      App.state.l1Done = true;
      App.state.level2Unlocked = true;
      if (!wasOpen) App.state.pendingUnlock = 'done';
      App.go('s-home');
    });
    const close = document.querySelector('#s-theme-complete .js-tc-close');
    if (close) close.addEventListener('click', () => App.go('s-home'));
  });
})();
