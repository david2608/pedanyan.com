/* V3 · Gamified concept — path, lesson with instant feedback, celebration, quests, savings jar */
(function () {
  const A = 'assets/';
  const fmt = (n) => n.toLocaleString('en-US').replace(/,/g, ' ');

  // ---- demo state ----
  const G = {
    stars: 1587, jar: 12400, goal: 40000, fromLessons: 8400,
    current: 4,                // index of the current node on the path
    week: [1, 1, 0, 0, 0, 0, 0], today: 2, weekGoal: 3, shields: 2,
    quests: [
      { ic: '🎯', t: 'Պատասխանիր 3 հարցի անսխալ', n: 2, of: 3, rw: '+50 AMP' },
      { ic: '🎬', t: 'Դիտիր 2 ռիլ', n: 1, of: 2, rw: '+30 AMP' },
      { ic: '🐷', t: 'Լցրու խոզուկը 500 AMD-ով', n: 300, of: 500, rw: '+100 AMD' },
    ],
  };
  App.g = G;

  const NODES = [
    { type: 'reel', icon: 'lvl-ic-reel.png', k: 'Ռիլ', t: 'Ի՞նչ է փողը' },
    { type: 'game', icon: 'onb-ic-game.png', k: 'Էմոջի խաղ', t: 'Գուշակիր բառը' },
    { type: 'reel', icon: 'lvl-ic-reel.png', k: 'Ռիլ', t: 'Ինչպե՞ս է առաջացել փողը' },
    { type: 'chest', k: 'Սնդուկ', t: 'Բացիր և ստացիր +100 AMD' },
    { type: 'quiz', icon: 'lvl-ic-quiz.png', k: 'Քուիզ · 3 հարց', t: 'Կանխիկ և անկանխիկ փող' },
    { type: 'reel', icon: 'lvl-ic-reel.png', k: 'Ռիլ', t: 'Ի՞նչ է կանխիկ փողը' },
    { type: 'game', icon: 'onb-ic-game.png', k: 'Խաչբառ', t: 'Փողի բառերը' },
    { type: 'trophy', k: 'Մոդուլի ավարտ', t: '«Ֆինանսների ճանապարհորդ» բեյջ' },
  ];
  const NODES2 = ['lvl-ic-reel.png', 'lvl-ic-quiz.png', 'onb-ic-game.png', 'lvl-ic-reel.png'];
  const OFFSETS = [0, -62, -92, -62, 0, 62, 92, 62];

  const QUESTIONS = [
    { q: 'Նշվածներից ո՞րն է կանխիկ գումար։', o: ['Մետաղադրամներ', 'Բանկային քարտ', 'Հեռախոս'], c: 0,
      why: 'Կանխիկն այն փողն է, որը կարող ես ձեռքով բռնել՝ մետաղադրամներ և թղթադրամներ։' },
    { q: 'Մայրիկդ քարտով 2 000 դրամ վճարեց խանութում։ Որտեղի՞ց դուրս եկավ գումարը։', o: ['Քարտի ներսից', 'Նրա բանկային հաշվից', 'Խանութի հաշվից'], c: 1,
      why: 'Քարտը բանալու պես է․ գումարը գալիս է բանկային հաշվից։' },
    { q: 'Ճի՞շտ է, թե՞ սխալ․ անկանխիկ գումարը նույնպես իսկական փող է։', o: ['Ճիշտ', 'Սխալ'], c: 0,
      why: 'Անկանխիկը նույն փողն է, պարզապես պահվում է բանկում, ոչ թե գրպանում։' },
  ];

  document.addEventListener('app:ready', () => {
    const home = document.getElementById('s-g-home');
    if (!home) return;

    /* ---------------- path home ---------------- */
    const path = home.querySelector('.js-g-path');
    const pop = home.querySelector('.js-g-pop');
    const scroller = home.querySelector('.scroll');
    let popFor = -1;

    function renderPath() {
      path.innerHTML = NODES.map((n, i) => {
        const st = i < G.current ? 'is-done' : i === G.current ? 'is-current' : 'is-locked';
        const inner = n.type === 'chest' ? '🎁' : n.type === 'trophy' ? '🏆' : `<img src="${A + n.icon}" alt="">`;
        const done = i < G.current ? '<span class="g-node__done">✓</span>' : '';
        return `<button class="g-node g-node--${n.type} ${st}" data-i="${i}" style="translate:${OFFSETS[i]}px 0">${inner}${done}</button>`;
      }).join('') + `<img class="g-mascot" src="${A}v1-star-barev.png" alt="">`;
      home.querySelector('.js-g-path2').innerHTML = NODES2.map((ic, i) =>
        `<button class="g-node is-locked" data-locked style="translate:${OFFSETS[i]}px 0"><img src="${A + ic}" alt=""></button>`).join('');
      // mascot next to the current node, on the opposite side
      const cur = path.querySelector('.is-current');
      const m = path.querySelector('.g-mascot');
      if (cur) {
        m.style.top = (cur.offsetTop - 6) + 'px';
        m.style.left = OFFSETS[G.current] > 0 ? '20px' : 'auto';
        m.style.right = OFFSETS[G.current] > 0 ? 'auto' : '20px';
      } else m.hidden = true;
      syncStats();
    }
    function syncStats() {
      const wk = G.week.filter(Boolean).length;
      document.querySelectorAll('.js-g-week').forEach((e) => (e.textContent = `${Math.min(wk, G.weekGoal)}/${G.weekGoal}`));
      document.querySelectorAll('.js-g-stars').forEach((e) => (e.textContent = fmt(G.stars)));
      document.querySelectorAll('.js-g-jar').forEach((e) => (e.textContent = fmt(G.jar)));
    }
    function hidePop() { pop.hidden = true; popFor = -1; }
    function showPop(btn, i) {
      const n = NODES[i];
      const locked = i > G.current, done = i < G.current;
      pop.classList.toggle('is-locked', locked);
      pop.querySelector('.js-g-pop-k').textContent = n.k;
      pop.querySelector('.js-g-pop-t').textContent = n.t;
      pop.querySelector('.js-g-pop-btn').textContent = locked ? '🔒 Ավարտիր նախորդ քայլը' : done ? 'Կրկնել · +5 AMP' : (n.type === 'chest' ? 'Բացել սնդուկը' : 'Սկսել · +30 AMP');
      const r = btn.getBoundingClientRect(), hr = home.getBoundingClientRect(), s = hr.width / home.offsetWidth;
      pop.style.top = ((r.bottom - hr.top) / s + 14) + 'px';
      pop.style.setProperty('--ax', ((r.left + r.width / 2 - hr.left) / s - 24) + 'px');
      pop.hidden = false; popFor = i;
    }
    path.addEventListener('click', (e) => {
      const b = e.target.closest('.g-node'); if (!b) return;
      const i = +b.dataset.i;
      if (popFor === i) return hidePop();
      showPop(b, i);
    });
    home.querySelector('.js-g-path2').addEventListener('click', (e) => {
      const b = e.target.closest('.g-node'); if (!b) return;
      b.classList.remove('is-shake'); void b.offsetWidth; b.classList.add('is-shake');
    });
    pop.querySelector('.js-g-pop-btn').addEventListener('click', () => {
      const i = popFor; hidePop();
      if (i > G.current || i < 0) return;
      const n = NODES[i];
      if (n.type === 'chest' && i === G.current) { G.jar += 100; G.current++; renderPath(); App.go('s-g-jar'); return; }
      App.go('s-g-lesson');
    });
    scroller.addEventListener('scroll', hidePop);
    home.addEventListener('click', (e) => { if (!e.target.closest('.g-node, .js-g-pop')) hidePop(); });
    home.addEventListener('screen:enter', () => {
      hidePop(); renderPath();
      requestAnimationFrame(() => { const c = path.querySelector('.is-current'); if (c) scroller.scrollTop = Math.max(0, c.offsetTop - 220); });
    });

    /* ---------------- lesson ---------------- */
    const L = document.getElementById('s-g-lesson');
    const opts = L.querySelector('.js-g-opts'), check = L.querySelector('.js-g-check'), fb = L.querySelector('.js-g-fb');
    let qi = 0, sel = -1, tries = 0, earned = 0, right = 0, state = 'pick';
    const KEYS = ['Ա', 'Բ', 'Գ'];
    function renderQ() {
      const q = QUESTIONS[qi];
      sel = -1; tries = 0; state = 'pick';
      L.querySelector('.js-g-q').textContent = q.q;
      opts.innerHTML = q.o.map((o, i) => `<button class="g-opt" data-i="${i}"><span class="g-opt__k">${KEYS[i]}</span>${o}</button>`).join('');
      check.disabled = true; fb.classList.remove('is-open');
      L.querySelector('.js-g-prog').style.width = (qi / QUESTIONS.length * 100) + '%';
      L.querySelector('.js-g-earn').textContent = earned;
    }
    opts.addEventListener('click', (e) => {
      const b = e.target.closest('.g-opt'); if (!b || state !== 'pick') return;
      opts.querySelectorAll('.g-opt').forEach((o) => o.classList.toggle('is-sel', o === b));
      sel = +b.dataset.i; check.disabled = false;
    });
    function feedback(kind) { // ok | retry | bad
      const q = QUESTIONS[qi];
      fb.classList.toggle('is-bad', kind !== 'ok');
      fb.classList.toggle('is-retry', kind === 'retry');
      fb.querySelector('.js-g-fb-ic').textContent = kind === 'ok' ? '✓' : '!';
      fb.querySelector('.js-g-fb-t').textContent = kind === 'ok' ? (tries ? 'Ճիշտ է, ապրե՛ս' : 'Ճիշտ է՛') : kind === 'retry' ? 'Գրեթե․ փորձիր ևս մեկ անգամ' : 'Ճիշտ պատասխանը՝ ' + q.o[q.c];
      fb.querySelector('.js-g-fb-xp').textContent = '+' + (tries ? 5 : 10) + ' AMP';
      const why = fb.querySelector('.js-g-fb-why'); why.textContent = q.why; why.hidden = kind !== 'bad';
      fb.querySelector('.js-g-why').hidden = kind !== 'ok';
      fb.querySelector('.js-g-next span').textContent = kind === 'retry' ? 'Փորձել նորից' : 'Շարունակել';
      fb.classList.add('is-open');
    }
    check.addEventListener('click', () => {
      const q = QUESTIONS[qi], picked = opts.querySelector(`[data-i="${sel}"]`);
      opts.querySelectorAll('.g-opt').forEach((o) => o.classList.remove('is-sel'));
      if (sel === q.c) {
        picked.classList.add('is-ok'); earned += tries ? 5 : 10; if (!tries) right++; state = 'done'; feedback('ok');
        L.querySelector('.js-g-earn').textContent = earned;
      } else if (tries === 0) {
        picked.classList.add('is-bad'); picked.disabled = true; tries = 1; state = 'retry'; feedback('retry');
      } else {
        picked.classList.add('is-bad'); opts.querySelector(`[data-i="${q.c}"]`).classList.add('is-ok'); state = 'done'; feedback('bad');
      }
      opts.querySelectorAll('.g-opt').forEach((o) => { if (state === 'done') o.disabled = true; });
      L.querySelector('.js-g-prog').style.width = ((qi + (state === 'done' ? 1 : 0)) / QUESTIONS.length * 100) + '%';
    });
    fb.querySelector('.js-g-why').addEventListener('click', (e) => { fb.querySelector('.js-g-fb-why').hidden = false; e.currentTarget.hidden = true; });
    fb.querySelector('.js-g-next').addEventListener('click', () => {
      if (state === 'retry') { state = 'pick'; sel = -1; check.disabled = true; fb.classList.remove('is-open');
        opts.querySelectorAll('.g-opt').forEach((o) => o.classList.remove('is-bad')); return; }
      if (qi < QUESTIONS.length - 1) { qi++; renderQ(); return; }
      finish();
    });
    L.addEventListener('screen:enter', () => { qi = 0; earned = 0; right = 0; renderQ(); });

    /* ---------------- celebration ---------------- */
    const D = document.getElementById('s-g-done');
    function days(el) {
      const N = ['Երկ', 'Երք', 'Չրք', 'Հնգ', 'Ուրբ', 'Շբթ', 'Կիր'];
      el.innerHTML = N.map((n, i) => `<span class="g-day ${G.week[i] ? 'is-done' : ''} ${i === G.today ? 'is-today' : ''}"><i>${G.week[i] ? '✓' : ''}</i>${n}</span>`).join('');
    }
    function finish() {
      G.stars += earned; G.jar += 300; G.fromLessons += 300; G.week[G.today] = 1;
      G.current = Math.min(G.current + 1, NODES.length - 1);
      G.quests[0].n = Math.min(G.quests[0].of, G.quests[0].n + right);
      G.quests[2].n = Math.min(G.quests[2].of, G.quests[2].n + 300);
      D.querySelector('.js-g-acc').textContent = `${right}/${QUESTIONS.length}`;
      D.querySelector('.js-g-rw-stars').textContent = '+' + earned;
      D.querySelector('.js-g-rw-acc').textContent = Math.round(right / QUESTIONS.length * 100) + '%';
      const wk = G.week.filter(Boolean).length;
      D.querySelector('.js-g-wk').textContent = `${Math.min(wk, G.weekGoal)}/${G.weekGoal}`;
      D.querySelector('.js-g-wk-hint').textContent = wk >= G.weekGoal ? 'Նպատակը կատարված է․ շաբաթվա 🎁 սնդուկը բաց է' : `Եվս ${G.weekGoal - wk} դաս՝ շաբաթվա 🎁 սնդուկի համար`;
      days(D.querySelector('.js-g-days'));
      App.go('s-g-done');
    }
    D.addEventListener('screen:enter', () => {
      const c = D.querySelector('.js-g-confetti'), colors = ['#6dce35', '#ffb847', '#84d8ff', '#ff8a80', '#9695f3', '#ffd55c'];
      c.innerHTML = Array.from({ length: 46 }, (_, i) =>
        `<i style="left:${Math.random() * 100}%;background:${colors[i % colors.length]};animation-duration:${2 + Math.random() * 2}s;animation-delay:${Math.random() * .8}s"></i>`).join('');
    });
    D.querySelector('.js-g-share').addEventListener('click', (e) => { e.currentTarget.firstElementChild.textContent = 'Ուղարկված է ✓'; });

    /* ---------------- quests ---------------- */
    const Q = document.getElementById('s-g-quests');
    Q.addEventListener('screen:enter', () => {
      const wk = Math.min(G.week.filter(Boolean).length, G.weekGoal);
      const ring = Q.querySelector('.js-g-ring'); ring.style.setProperty('--p', Math.round(wk / G.weekGoal * 100));
      Q.querySelector('.js-g-ring-n').textContent = `${wk}/${G.weekGoal}`;
      days(Q.querySelector('.js-g-days2'));
      Q.querySelector('.js-g-quests').innerHTML = G.quests.map((q) => {
        const p = Math.round(q.n / q.of * 100), done = q.n >= q.of;
        return `<div class="g-quest ${done ? 'is-done' : ''}"><span class="g-quest__ic">${done ? '✅' : q.ic}</span>
          <div class="g-quest__body"><p class="g-quest__t">${q.t}</p>
          <div class="g-quest__row"><div class="pgroup__bar"><span style="width:${p}%"></span></div>${fmt(q.n)}/${fmt(q.of)}</div></div>
          <span class="g-quest__rw">${q.rw}</span></div>`;
      }).join('');
    });

    /* ---------------- savings jar ---------------- */
    const J = document.getElementById('s-g-jar');
    J.addEventListener('screen:enter', () => {
      const p = Math.min(100, G.jar / G.goal * 100);
      const fill = J.querySelector('.js-g-fill'); fill.style.height = '0%';
      requestAnimationFrame(() => setTimeout(() => (fill.style.height = Math.max(8, p) + '%'), 60));
      J.querySelector('.js-g-bar').style.width = p + '%';
      J.querySelector('.js-g-saved').textContent = fmt(G.jar);
      J.querySelector('.js-g-src-amp').textContent = fmt(G.fromLessons);
      const left = G.goal - G.jar;
      J.querySelector('.js-g-left').textContent = left > 0 ? `Մնաց ${fmt(left)} AMD · մոտ ${Math.ceil(left / 3000)} շաբաթ` : 'Նպատակը հասանելի է 🎉';
      const jar = J.querySelector('.g-jar'); jar.classList.remove('is-drop'); void jar.offsetWidth; jar.classList.add('is-drop');
      J.querySelector('.js-g-toast').hidden = true;
    });
    J.querySelector('.js-g-ask').addEventListener('click', () => {
      const t = J.querySelector('.js-g-toast'); t.hidden = false; setTimeout(() => (t.hidden = true), 2400);
    });

    renderPath();
  });
})();
