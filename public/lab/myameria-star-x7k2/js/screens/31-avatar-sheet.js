/* Edit profile sheet — the same gamified profile form as onboarding (App.ProfileForm, 12-onb-avatar.js),
   so avatar selection feedback and nickname states are identical. Saving → spinner → toast on the personal page.
   "Պահպանել" is enabled only when something changed and everything is valid.
   Dev: nickname "error" (or App.state.failNextSave = true) simulates a failed save. */
(function () {
  const SAVE_MS = 1400;
  document.addEventListener('app:ready', () => {
    const sheet = document.getElementById('o-avatar-sheet');
    if (!sheet || !App.ProfileForm) return;
    const saveBtn = sheet.querySelector('.js-avs-save');
    const hint = sheet.querySelector('.js-avs-hint');
    let saving = false, cur = { name: '', avatar: null }, wasReady = false;

    const curName = () => App.state.name || 'Անուշ';
    const curAvatar = () => App.state.avatar || 'assets/avatar-anush.png';

    const form = App.ProfileForm(sheet.querySelector('.avs__body'), {
      onChange(f) {
        const changed = (f.nick !== cur.name) || (f.avatar !== cur.avatar);
        const ok = changed && f.valid() && f.nickState !== 'checking';
        saveBtn.setAttribute('aria-disabled', String(!ok));
        if (ok && !wasReady) { saveBtn.classList.remove('is-ready'); void saveBtn.offsetWidth; saveBtn.classList.add('is-ready'); }
        wasReady = ok;
        hint.textContent = !changed ? 'Փոխիր կերպարը կամ մականունը' : ok ? 'Պատրաստ է պահպանելու' : f.nickState === 'checking' ? 'Ստուգում ենք մականունը…' : 'Ուղղիր նշված դաշտը';
      },
    });

    function open() {
      cur = { name: curName(), avatar: curAvatar() };
      form.setCurrent(cur);
      wasReady = false;
      const body = sheet.querySelector('.avs__body');
      if (App.__sheetMode === 'loading') {
        // skeleton state: preview, field and avatar grid hold their place while data loads
        body.dataset.paLoad = 'skeleton';
        form.reset({ name: '', skeleton: true });
        sheet.querySelector('.js-pa-nick').disabled = true;
        hint.textContent = 'Բեռնվում է…';
      } else {
        body.dataset.paLoad = '';
        sheet.querySelector('.js-pa-nick').disabled = false;
        form.reset({ name: cur.name, avatar: cur.avatar });
      }
      App.__sheetMode = null;
      sheet.classList.remove('is-saving');
      saving = false;
      sheet.querySelector('.avs__body').scrollTop = 0;
    }
    document.addEventListener('click', (e) => { if (e.target.closest('[data-open="o-avatar-sheet"]')) open(); }, true);

    // While saving the sheet can't be dismissed by the backdrop / close button
    sheet.addEventListener('click', (e) => {
      if (saving && (e.target === sheet || e.target.closest('[data-close]'))) { e.stopImmediatePropagation(); e.preventDefault(); }
    }, true);
    sheet.querySelector('.js-pa-nick').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); saveBtn.click(); } });

    saveBtn.addEventListener('click', () => {
      if (saving) return;
      const name = form.nick;
      const fail = App.state.failNextSave || name.toLowerCase() === 'error';
      if (saveBtn.getAttribute('aria-disabled') === 'true' && !fail) { form.flagMissing(); return; }
      const avatar = form.avatar || cur.avatar;
      saving = true;
      sheet.classList.add('is-saving');
      saveBtn.querySelector('.avs__btn-label').textContent = 'Պահպանվում է';
      sheet.querySelector('.js-pa-nick').blur();
      setTimeout(() => {
        saving = false;
        sheet.classList.remove('is-saving');
        saveBtn.querySelector('.avs__btn-label').textContent = 'Պահպանել';
        App.close(sheet);
        if (fail) { App.state.failNextSave = false; App.profileToast && App.profileToast('error'); return; }
        App.state.name = name;
        App.state.avatar = avatar;
        App.syncProfile && App.syncProfile();
        document.dispatchEvent(new Event('profile:saved'));
        App.profileToast && App.profileToast('success');
      }, SAVE_MS);
    });
  });
})();
