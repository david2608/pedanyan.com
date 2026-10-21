/* Personal page — data-driven badges + reflect App.state (name / avatar) */
(function () {
  const BADGES = {
    earned: [
      { id: 'traveler', name: 'Ֆինանսների ճանապարհորդ', img: '../assets/badge-traveler.png', module: 'Մոդուլ 1 · Փող և գործարքներ',
        desc: 'Ավարտել ես առաջին մոդուլը և սովորել, թե ինչպես է աշխատում փողը։', date: 'Վաստակած' },
      { id: 'saver', name: 'Խելացի խնայող', img: '../assets/prof-badge-saver.png', module: 'Մոդուլ 2 · Եկամուտներ և ծախսեր',
        desc: 'Սովորել ես պլանավորել եկամուտներդ և ծախսերդ։', date: 'Վաստակած' },
    ],
    basic: [
      { id: 'risk', name: 'Ռիսկեր բացահայտող', img: '../assets/prof-badge-saver.png', p: 80, module: 'Մոդուլ 3 · Ֆինանսական ռիսկ',
        desc: 'Ավարտիր մոդուլը՝ սովորելու, թե ինչպես նկատել ֆինանսական ռիսկերը։' },
      { id: 'budget', name: 'Բյուջեի վարպետ', img: '../assets/badge-traveler.png', p: 40, module: 'Մոդուլ 4 · Ֆինանսական պլանավորում',
        desc: 'Ավարտիր մոդուլը՝ սովորելու կազմել քո առաջին բյուջեն։' },
      { id: 'expert', name: 'Ֆինանսական գիտակ', img: '../assets/prof-badge-saver.png', p: 0, module: 'Մոդուլ 5 · Ֆինանսական միջավայր',
        desc: 'Ավարտիր մոդուլը՝ հասկանալու, թե ինչպես է աշխատում ֆինանսական աշխարհը։' },
    ],
    adv: [
      { id: 'investor', name: 'Խելացի ներդրող', img: '../assets/badge-traveler.png', module: 'Առաջադեմ մոդուլներ' },
      { id: 'credit', name: 'Վարկերի գիտակ', img: '../assets/prof-badge-saver.png', module: 'Առաջադեմ մոդուլներ' },
      { id: 'leader', name: 'Ֆինանսական առաջնորդ', img: '../assets/badge-traveler.png', module: 'Առաջադեմ մոդուլներ' },
    ],
  };
  const item = (b, locked) => `
    <button class="pitem js-badge" data-badge="${b.id}">
      <span class="pm pm--md is-todo" style="--p:${locked ? 0 : b.p}"><img src="${b.img}" alt="">${locked ? '<span class="pm__lock">🔒</span>' : ''}</span>
      <span class="pitem__name">${b.name}</span>
      <span class="pitem__pts">${locked ? 'Փակ է' : b.p + '/100'}</span>
    </button>`;

  /* Badge image states (Figma 3010:258268): Loading → Default | Failed.
     The .pm wrapper holds the slot; JS toggles .is-img-loading / .is-img-failed. */
  function watchImg(img) {
    const pm = img.closest('.pm');
    if (!pm || img.dataset.watched) return;
    img.dataset.watched = '1';
    const retry = document.createElement('img');
    retry.className = 'pm__retry'; retry.src = '../assets/pedit-repeat.svg'; retry.alt = '';
    retry.width = 36; retry.height = 36;
    pm.appendChild(retry);
    const settle = () => {
      pm.classList.remove('is-img-loading');
      pm.classList.toggle('is-img-failed', !img.naturalWidth);
    };
    img.addEventListener('load', settle);
    img.addEventListener('error', () => { pm.classList.remove('is-img-loading'); pm.classList.add('is-img-failed'); });
    if (img.complete) settle(); else pm.classList.add('is-img-loading');
  }
  // Point a watched <img> at a (new) src and show the loading state until it lands.
  function setImg(img, src) {
    const pm = img.closest('.pm');
    if (pm) { pm.classList.remove('is-img-failed'); pm.classList.add('is-img-loading'); }
    if (img.getAttribute('src') === src && img.complete) {
      // same image already settled: retry a failed one by cache-busting, otherwise keep it
      if (!img.naturalWidth) img.src = src.split('?')[0] + '?r=' + Date.now();
      else if (pm) pm.classList.remove('is-img-loading');
      return;
    }
    img.src = src;
    if (img.complete && img.naturalWidth && pm) pm.classList.remove('is-img-loading');
  }

  /* Save-result toast on the personal page (Figma 3010:254023 success / 3010:255085 error) */
  const TOAST = {
    success: 'Փոփոխությունները հաջողությամբ կատարվեցին։',
    error: 'Փոփոխությունները չկատարվեցին, խնդրում ենք ստուգել ձեր կապը և կրկին փորձել։',
  };
  let toastTimer = null;
  App.profileToast = function (kind) {
    const t = document.querySelector('#s-profile .ptoast');
    if (!t) return;
    if (App.current !== 's-profile') App.go('s-profile');
    clearTimeout(toastTimer);
    t.classList.remove('is-shown', 'is-success', 'is-error');
    void t.offsetWidth;
    t.classList.add(kind === 'error' ? 'is-error' : 'is-success', 'is-shown');
    t.querySelector('.js-ptoast-text').textContent = TOAST[kind] || TOAST.success;
    toastTimer = setTimeout(() => t.classList.remove('is-shown'), 4000);
  };

  document.addEventListener('app:ready', () => {
    const screen = document.getElementById('s-profile');
    if (!screen) return;
    screen.querySelector('.js-earned').innerHTML = BADGES.earned
      .map((b) => `<button class="pm pearn js-badge" data-badge="${b.id}" aria-label="${b.name}"><img src="${b.img}" alt=""></button>`).join('');
    screen.querySelector('.js-next-basic').innerHTML = BADGES.basic.map((b) => item(b)).join('');
    screen.querySelector('.js-next-adv').innerHTML = BADGES.adv.map((b) => item(b, true)).join('');
    screen.querySelectorAll('.pm img').forEach(watchImg);
    screen.querySelector('.ptoast__close').addEventListener('click', () => { clearTimeout(toastTimer); screen.querySelector('.ptoast').classList.remove('is-shown'); });
    // Badge info drawer
    const all = {};
    BADGES.earned.forEach((b) => (all[b.id] = { ...b, state: 'earned' }));
    BADGES.basic.forEach((b) => (all[b.id] = { ...b, state: 'todo' }));
    BADGES.adv.forEach((b) => (all[b.id] = { ...b, state: 'locked' }));
    const sheet = document.getElementById('o-badge-info');
    const $ = (sel) => sheet.querySelector(sel);
    watchImg($('.js-bi-img'));
    // Failed image in the drawer: tap to retry
    $('.pbs__pm').addEventListener('click', () => { const i = $('.js-bi-img'); if (i.closest('.pm').classList.contains('is-img-failed')) setImg(i, i.getAttribute('src')); });
    const openBadge = (id) => {
      const b = all[id]; if (!b) return;
      sheet.classList.toggle('is-todo', b.state === 'todo');
      sheet.classList.toggle('is-locked', b.state === 'locked');
      setImg($('.js-bi-img'), b.img);
      $('.js-bi-name').textContent = '«' + b.name + '»';
      $('.js-bi-status').textContent = b.state === 'earned' ? '✓ Վաստակած' : b.state === 'todo' ? 'Ընթացքի մեջ' : '🔒 Փակ է';
      $('.js-bi-desc').textContent = b.state === 'locked' ? 'Կբացվի, երբ ավարտես բոլոր սկսնակ մոդուլները։' : b.desc;
      const pr = $('.js-bi-progress');
      pr.style.display = b.state === 'todo' ? '' : 'none';
      if (b.state === 'todo') { $('.js-bi-bar').style.width = b.p + '%'; $('.js-bi-pts').textContent = b.p + '/100'; }
      $('.js-bi-module').textContent = b.module;
      $('.js-bi-reward').textContent = b.state === 'earned' ? '+100 AMP · ստացված' : '+100 AMP';
      const cta = $('.js-bi-cta');
      cta.firstElementChild.textContent = b.state === 'todo' ? 'Շարունակել ուսումը' : 'Լավ';
      cta.dataset.target = b.state === 'todo' ? 's-l-module' : '';
      $('.pbs__pm').style.animation = 'none'; void sheet.offsetWidth; $('.pbs__pm').style.animation = '';
      App.open('o-badge-info');
    };
    screen.addEventListener('click', (e) => { const t = e.target.closest('.js-badge'); if (t) openBadge(t.dataset.badge); });
    $('.js-bi-cta').addEventListener('click', (e) => { const go = e.currentTarget.dataset.target; App.close(e.currentTarget); if (go) App.go(go); });

    screen.addEventListener('screen:enter', () => {
      screen.querySelector('.ptoast').classList.remove('is-shown');
      const { name, avatar } = App.state;
      if (name) screen.querySelectorAll('.js-user-name').forEach((n) => (n.textContent = name));
      if (avatar) screen.querySelectorAll('.js-avatar').forEach((i) => (i.src = avatar));
    });
  });
})();
