/* Edit profile sheet — nickname + avatar → saving (spinner) → toast on the profile page.
   Figma: sheet 3010:246318, saving 3010:249665, success toast 3010:254023, error toast 3010:255085.
   Dev toggle: nickname "error" (or App.state.failNextSave = true) simulates a failed save. */
(function () {
  const NAME_RE = /^[A-Za-z0-9_Ա-Ֆա-և]{3,20}$/; // Armenian or Latin letters, digits, _
  const SAVE_MS = 1400;

  document.addEventListener('app:ready', () => {
    const sheet = document.getElementById('o-avatar-sheet');
    if (!sheet) return;
    const opts = Array.from(sheet.querySelectorAll('.av-opt'));
    const input = sheet.querySelector('.avs__input');
    const fld = input.closest('.avs-fld');
    const saveBtn = sheet.querySelector('.js-avs-save');
    let saving = false;

    const select = (opt) => opts.forEach((o) => {
      o.classList.toggle('is-selected', o === opt);
      o.setAttribute('aria-pressed', o === opt ? 'true' : 'false');
    });
    const curName = () => App.state.name || document.querySelector('#s-profile .js-user-name')?.textContent.trim() || '';
    const curAvatar = () => App.state.avatar || document.querySelector('#s-profile .js-avatar')?.getAttribute('src');

    // Sync the sheet with current state every time it opens
    function sync() {
      const av = curAvatar();
      const m = opts.find((o) => o.dataset.avatar === av);
      select(m || null);
      { const i = sheet.querySelector('.js-avs-cur-img'); if (i) i.src = av || '../assets/avatar-anush.png'; }
      { const n = sheet.querySelector('.js-avs-cur-name'); if (n) n.textContent = curName(); }
      const amp = document.querySelector('#s-profile .pstat--amp .pstat__v');
      if (amp && sheet.querySelector('.js-avs-cur-amp')) sheet.querySelector('.js-avs-cur-amp').textContent = amp.textContent.trim();
      input.value = curName();
      fld.classList.remove('is-error');
      sheet.classList.remove('is-saving');
      saving = false;
      sheet.querySelector('.avs__body').scrollTop = 0;
    }
    document.addEventListener('click', (e) => { if (e.target.closest('[data-open="o-avatar-sheet"]')) sync(); }, true);

    sheet.addEventListener('click', (e) => {
      const opt = e.target.closest('.av-opt');
      if (opt && !saving) {
        select(opt);
        { const i = sheet.querySelector('.js-avs-cur-img'); if (i) i.src = opt.dataset.avatar; } // live preview in the card
      }
    });
    input.addEventListener('input', () => {
      fld.classList.remove('is-error');
      { const n = sheet.querySelector('.js-avs-cur-name'); if (n) n.textContent = input.value.trim() || curName(); }
    });
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); saveBtn.click(); } });

    // While saving the sheet can't be dismissed by the backdrop / close button
    sheet.addEventListener('click', (e) => {
      if (saving && (e.target === sheet || e.target.closest('[data-close]'))) { e.stopImmediatePropagation(); e.preventDefault(); }
    }, true);

    saveBtn.addEventListener('click', () => {
      if (saving) return;
      const name = input.value.trim();
      const fail = App.state.failNextSave || name.toLowerCase() === 'error';
      if (!fail && !NAME_RE.test(name)) { fld.classList.add('is-error'); input.focus(); return; }
      const opt = sheet.querySelector('.av-opt.is-selected');
      const avatar = opt ? opt.dataset.avatar : curAvatar();

      saving = true;
      sheet.classList.add('is-saving');
      saveBtn.querySelector('.avs__btn-label').textContent = 'Պահպանվում է';
      input.blur();

      setTimeout(() => {
        saving = false;
        sheet.classList.remove('is-saving');
        saveBtn.querySelector('.avs__btn-label').textContent = 'Պահպանել';
        App.close(sheet);
        if (fail) { App.state.failNextSave = false; App.profileToast && App.profileToast('error'); return; }
        App.state.name = name;
        if (avatar) App.state.avatar = avatar;
        if (avatar) document.querySelectorAll('#s-profile .js-avatar, #s-home .profile-card__img img').forEach((img) => (img.src = avatar));
        document.querySelectorAll('#s-profile .js-user-name, #s-home .js-user-name').forEach((n) => (n.textContent = name));
        App.profileToast && App.profileToast('success');
      }, SAVE_MS);
    });
  });
})();
