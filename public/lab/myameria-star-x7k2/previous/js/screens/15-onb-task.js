/* Money-math tasks that pay AMP.
   s-onb-task (onboarding): one fixed question, +50 AMP → rocket (13) → Education home.
   s-math (daily, from the home card): next question from the bank, +20 AMP → Education home.
   Education home counts any pending AMP into the profile-card pill. */
(function () {
  const ONB = { a: ['👛', '1 000 ֏'], op: '−', b: ['🍦', '400 ֏'], q: 'Ունես 1 000 ֏։ Պաղպաղակն արժե 400 ֏։', ask: 'Քանի՞ դրամ կմնա։',
    opts: ['400', '600', '1 400', '500'], right: '600', hint: 'Հանիր՝ 1 000 − 400' };
  const BANK = [
    { a: ['🧃', '300 ֏'], op: '+', b: ['🥐', '200 ֏'], q: 'Հյութն արժե 300 ֏, կրուասանը՝ 200 ֏։', ask: 'Որքա՞ն կվճարես ընդհանուրը։',
      opts: ['400', '500', '600', '100'], right: '500', hint: 'Գումարիր՝ 300 + 200' },
    { a: ['🐷', '2 000 ֏'], op: '−', b: ['🎒', '1 500 ֏'], q: 'Խոզուկում ունես 2 000 ֏։ Գնեցիր պայուսակ 1 500 ֏-ով։', ask: 'Քանի՞ դրամ մնաց։',
      opts: ['500', '1 000', '3 500', '700'], right: '500', hint: 'Հանիր՝ 2 000 − 1 500' },
    { a: ['🪙', '100 ֏'], op: '×', b: ['📅', '7 օր'], q: 'Ամեն օր խնայում ես 100 ֏։', ask: 'Որքա՞ն կխնայես մեկ շաբաթում։',
      opts: ['700', '600', '1 000', '107'], right: '700', hint: 'Բազմապատկիր՝ 100 × 7' },
    { a: ['🍎', '150 ֏'], op: '×', b: ['🛒', '4 հատ'], q: 'Մեկ խնձորն արժե 150 ֏։', ask: 'Որքա՞ն արժե 4 խնձորը։',
      opts: ['450', '600', '550', '154'], right: '600', hint: 'Բազմապատկիր՝ 150 × 4' },
  ];
  const wallet = ([ic, v], cls = '') => `<span class="ot-wallet ${cls}"><span class="ot-wallet__ic">${ic}</span><b>${v}</b></span>`;

  function mountTask(s, { reward, pick, next }) {
    const opts = s.querySelector('.js-ot-opts'), fb = s.querySelector('.js-ot-fb'), burst = s.querySelector('.js-ot-burst');
    let t, task;
    s.querySelector('.js-ot-reward').textContent = '+' + reward + ' AMP';
    s.addEventListener('screen:enter', () => {
      clearTimeout(t);
      task = pick();
      s.querySelector('.js-ot-scene').innerHTML = wallet(task.a) + `<span class="ot-minus">${task.op}</span>` + wallet(task.b, 'ot-wallet--item');
      s.querySelector('.js-ot-q').innerHTML = `${task.q}<br><b>${task.ask}</b>`;
      opts.innerHTML = task.opts.map((o) => `<button class="ot-opt" data-v="${o}">${o} ֏</button>`).join('');
      opts.classList.remove('is-done');
      fb.className = 'ot-fb js-ot-fb'; fb.textContent = '';
      burst.innerHTML = '';
    });
    opts.addEventListener('click', (e) => {
      const b = e.target.closest('.ot-opt');
      if (!b || opts.classList.contains('is-done')) return;
      if (b.dataset.v !== task.right) {
        b.classList.remove('is-wrong'); void b.offsetWidth; b.classList.add('is-wrong');
        fb.className = 'ot-fb js-ot-fb is-wrong'; fb.textContent = 'Գրեթե՛։ ' + task.hint;
        return;
      }
      opts.querySelectorAll('.is-wrong').forEach((x) => x.classList.remove('is-wrong'));
      b.classList.add('is-right'); opts.classList.add('is-done');
      fb.className = 'ot-fb js-ot-fb is-right'; fb.textContent = 'Ճիշտ է՛ +' + reward + ' AMP';
      const sr = s.getBoundingClientRect(), br = b.getBoundingClientRect(), k = sr.width / s.offsetWidth || 1;
      const x0 = (br.left + br.width / 2 - sr.left) / k - 15, y0 = (br.top - sr.top) / k;
      for (let i = 0; i < 10; i++) {
        const c = document.createElement('img');
        c.src = '../assets/amp-coin.svg'; c.className = 'ot-coin'; c.alt = '';
        c.style.left = x0 + 'px'; c.style.top = y0 + 'px';
        c.style.setProperty('--dx', (Math.random() * 220 - 110) + 'px');
        c.style.setProperty('--dy', -(120 + Math.random() * 220) + 'px');
        c.style.setProperty('--r', (Math.random() * 360 - 180) + 'deg');
        c.style.animationDelay = (i * 0.04) + 's';
        burst.appendChild(c);
      }
      App.state.pendingAmp = (App.state.pendingAmp || 0) + reward;
      next(s.id);
    });
    s._clearTimer = () => clearTimeout(t);
    s._later = (fn, ms) => { t = setTimeout(() => { if (App.current === s.id) fn(); }, ms); };
  }

  document.addEventListener('app:ready', () => {
    const onb = document.getElementById('s-onb-task');
    if (onb) mountTask(onb, { reward: 50, pick: () => ONB, next: () => onb._later(() => App.go('s-onb-start'), 1500) });

    const daily = document.getElementById('s-math');
    let qi = 0;
    if (daily) mountTask(daily, {
      reward: 20,
      pick: () => {
        const n = BANK.length, done = App.state.mathDone || 0;
        daily.querySelector('.js-ot-count').textContent = `Խնդիր ${Math.min(done + 1, n)}/${n} · լուծիր և վաստակիր AMP`;
        return BANK[qi % n];
      },
      next: () => { qi++; App.state.mathDone = (App.state.mathDone || 0) + 1; daily._later(() => App.go('s-home'), 1500); },
    });
  });

  /* Education home: daily card + count pending AMP into the profile-card pill */
  document.addEventListener('app:ready', () => {
    const home = document.getElementById('s-home');
    if (!home) return;
    if (App.state.amp == null) App.state.amp = 0;
    const text = home.querySelector('.profile-card__text');
    if (!text) return;
    text.insertAdjacentHTML('beforeend', '<span class="profile-card__amp"><img src="../assets/amp-coin.svg" alt=""><b class="js-home-amp">0</b> AMP</span>');
    const pill = text.querySelector('.profile-card__amp'), num = pill.querySelector('.js-home-amp');
    home.querySelector('.hm__profile').insertAdjacentHTML('afterend', `
      <button class="hm-daily js-hm-daily" data-go="s-math">
        <span class="hm-daily__ic">🧮</span>
        <span class="hm-daily__txt"><span class="hm-daily__t">Օրվա խնդիրը</span><span class="hm-daily__d js-hm-daily-d">Հաշվիր փողը և վաստակիր</span></span>
        <span class="hm-daily__amp"><img src="../assets/amp-coin.svg" alt=""><span class="js-hm-daily-amp">+20</span></span>
      </button>`);
    const card = home.querySelector('.js-hm-daily');
    const fmt = (n) => n.toLocaleString('de-DE');
    home.insertAdjacentHTML('beforeend', '<div class="hm-toast js-hm-toast"><img src="../assets/amp-coin.svg" alt=""><span></span></div>');
    const toast = home.querySelector('.js-hm-toast');
    let timers = [];

    home.addEventListener('screen:enter', () => {
      timers.forEach(clearTimeout); timers = [];
      if (App.state.avatar) { const im = home.querySelector('.profile-card__img img'); if (im) im.src = App.state.avatar; }
      const done = App.state.mathDone || 0;
      card.classList.toggle('is-done', done > 0);
      card.querySelector('.js-hm-daily-d').textContent = done ? `Լուծված է՝ ${done} · ևս մեկը՞` : 'Հաշվիր փողը և վաստակիր';
      num.textContent = fmt(App.state.amp);
      const add = App.state.pendingAmp || 0;
      if (!add) return;
      App.state.pendingAmp = 0;
      const from = App.state.amp, to = from + add;
      App.state.amp = to;
      const first = from === 0;
      timers.push(setTimeout(() => {
        const hr = home.getBoundingClientRect(), pr = pill.getBoundingClientRect(), k = hr.width / home.offsetWidth || 1;
        const tx = (pr.left - hr.left) / k + 2, ty = (pr.top - hr.top) / k - 6;
        for (let i = 0; i < 7; i++) {
          const c = document.createElement('img');
          c.src = '../assets/amp-coin.svg'; c.className = 'hm-fly'; c.alt = '';
          const sx = 150 + Math.random() * 90, sy = 420 + Math.random() * 120;
          c.style.left = sx + 'px'; c.style.top = sy + 'px';
          home.appendChild(c);
          setTimeout(() => { c.style.transform = `translate(${tx - sx}px, ${ty - sy}px) scale(.55)`; c.style.opacity = '0'; }, 40 + i * 70);
          setTimeout(() => c.remove(), 1400 + i * 70);
        }
      }, 450));
      timers.push(setTimeout(() => {
        const t0 = performance.now(), D = 900;
        const step = (now) => {
          const p = Math.min(1, (now - t0) / D);
          num.textContent = fmt(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        pill.classList.remove('is-bump'); void pill.offsetWidth; pill.classList.add('is-bump');
        toast.querySelector('span').textContent = first
          ? 'Քո առաջին ' + add + ' AMP-ն արդեն քոնն է։ Շարունակիր առաջադրանքները'
          : '+' + add + ' AMP։ Հիանալի՛ է, այդպես շարունակիր';
        toast.classList.add('is-on');
      }, 1150));
      timers.push(setTimeout(() => toast.classList.remove('is-on'), 4200));
    });
  });
})();
