/* Profile skeleton: auto-advance to the loaded profile after 1.2s */
(function () {
  let timer = null;
  document.addEventListener('screen:enter', (e) => {
    clearTimeout(timer);
    if (e.target.id !== 's-profile-loading') return;
    timer = setTimeout(() => {
      if (window.App && App.current === 's-profile-loading') App.go('s-profile', { replace: true });
    }, 1200);
  });
})();
