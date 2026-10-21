/* Education home (copy's level layout, 24-home-levels.js): the AMP earned in money-math tasks
   is added to the profile counter (.js-lv-amp) with flying coins + count-up, and a "Օրվա խնդիրը" card
   opens the daily task (s-math). Runs after 24-home-levels.js re-renders on screen:enter. */
(function () {
  const fmt = (n) => n.toLocaleString('de-DE');
  document.addEventListener('app:ready', () => {
    if (App.state.amp == null) App.state.amp = 0;
    document.querySelectorAll('.lv-screen').forEach((home) => {
      let timers = [];
      home.addEventListener('screen:enter', () => {
        timers.forEach(clearTimeout); timers = [];
        const num = home.querySelector('.js-lv-amp'), pill = home.querySelector('.lv-me__amp');
        if (!num || !pill) return;
        const base = parseInt(num.textContent, 10) || 0;   // module progress points set by 24-home-levels.js
        // daily task card (once per screen)
        let card = home.querySelector('.js-hm-daily');
        if (!card) {
          home.querySelector('.lv-pin').insertAdjacentHTML('afterend', `
            <button class="hm-daily js-hm-daily" data-go="s-math">
              <span class="hm-daily__ic">🧮</span>
              <span class="hm-daily__txt"><span class="hm-daily__t">Օրվա խնդիրը</span><span class="hm-daily__d js-hm-daily-d">Հաշվիր փողը և վաստակիր</span></span>
              <span class="hm-daily__amp"><img src="assets/amp-coin.svg" alt=""><span>+20</span></span>
            </button>`);
          home.insertAdjacentHTML('beforeend', '<div class="hm-toast js-hm-toast"><img src="assets/amp-coin.svg" alt=""><span></span></div>');
          card = home.querySelector('.js-hm-daily');
        }
        const done = App.state.mathDone || 0;
        card.classList.toggle('is-done', done > 0);
        card.querySelector('.js-hm-daily-d').textContent = done ? `Լուծված է՝ ${done} · ևս մեկը՞` : 'Հաշվիր փողը և վաստակիր';
        const add = home.id === 's-home' ? (App.state.pendingAmp || 0) : 0;
        const from = base + App.state.amp;
        num.textContent = fmt(from);
        if (!add) return;
        App.state.pendingAmp = 0;
        const first = App.state.amp === 0;
        App.state.amp += add;
        const to = from + add;
        const toast = home.querySelector('.js-hm-toast');
        timers.push(setTimeout(() => {
          const hr = home.getBoundingClientRect(), pr = pill.getBoundingClientRect(), k = hr.width / home.offsetWidth || 1;
          const tx = (pr.left - hr.left) / k + 2, ty = (pr.top - hr.top) / k - 6;
          for (let i = 0; i < 7; i++) {
            const c = document.createElement('img');
            c.src = 'assets/amp-coin.svg'; c.className = 'hm-fly'; c.alt = '';
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
  });
})();
