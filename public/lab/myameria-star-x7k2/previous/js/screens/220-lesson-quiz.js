/* ==========================================================
   Lesson · Quiz — s-l-quiz (interactive), o-l-quiz-exit,
   s-l-quiz-done, s-l-quiz-result
   Questions/answers/explanations copied from Figma
   (Q1 3005:99733, Q2 3005:100885, Q3 3005:102037 + their correct/wrong states).
   ========================================================== */
(function () {
  const A = '../assets/';
  const ICONS = [ // Ա / Բ / Գ option badges (normal + faded "dim" variant)
    { norm: 'lq-opt-a.svg', dim: 'lq-opt-a.svg' },
    { norm: 'lq-opt-b.svg', dim: 'lq-opt-b-dim.svg' },
    { norm: 'lq-opt-g.svg', dim: 'lq-opt-g-dim.svg' },
  ];
  const OK_TITLE = 'Ճիշտ պատասխան';
  const ERR_TITLE = 'Պատասխանը սխալ է:';

  // correct = index of the right option (Figma marks option 1 as the right answer in every state frame)
  const QUESTIONS = [
    {
      text: 'Նշվածներից ո՞րն է կանխիկ գումար:',
      options: ['Մետաղադրամներ', 'Բանկային քարտ', 'Հեռախոս'],
      correct: 0,
      okText: 'Անկանխիկ գումարը պահվում է բանկային հաշվում',
      errText: 'Անկանխիկ գումարը պահվում է բանկային հաշվում։',
    },
    {
      text: 'Մայրիկդ քարտով 2,000 դրամ վճարեց խանութում։ Որտեղի՞ց դուրս եկավ այդ գումարը։',
      options: ['Քարտում պահված կանխիկից', 'Նրա բանկային հաշվից', 'Խանութի հաշվից'],
      correct: 0,
      okText: 'Անկանխիկ գումարը պահվում է բանկային հաշվում',
      errText: 'Անկանխիկ գումարը պահվում է բանկային հաշվում։',
    },
    {
      text: 'Ճի՞շտ է, թե՞ սխալ․ անկանխիկ գումարը նույնպես գումար է։',
      options: ['Ճիշտ', 'Սխալ'],
      correct: 0,
      okText: 'Անկանխիկ գումարը պահվում է բանկային հաշվում',
      errText: 'Անկանխիկ գումարը պահվում է բանկային հաշվում։',
    },
  ];

  let idx = 0, correctCount = 0, answered = false;

  const $ = (root, sel) => root.querySelector(sel);

  /* ---------- counter ring (segments = number of questions) ---------- */
  function ringSVG(n, done) {
    const cx = 24, cy = 24, r = 19.86, gap = 18, step = 360 / n;
    const pt = (deg) => {
      const a = (deg * Math.PI) / 180;
      return [(cx + r * Math.cos(a)).toFixed(3), (cy + r * Math.sin(a)).toFixed(3)];
    };
    let out = '';
    for (let i = 0; i < n; i++) {
      const a0 = -90 + i * step + gap / 2, a1 = -90 + (i + 1) * step - gap / 2;
      const [x0, y0] = pt(a0), [x1, y1] = pt(a1);
      const large = a1 - a0 > 180 ? 1 : 0;
      out += `<path d="M${x0} ${y0} A${r} ${r} 0 ${large} 1 ${x1} ${y1}" fill="none" stroke-width="3.2" stroke-linecap="round" stroke="${i < done ? '#FFB847' : '#FFE6BE'}"/>`;
    }
    return out;
  }

  function setState(scr, s) { scr.dataset.state = s; }

  function render(scr) {
    const q = QUESTIONS[idx];
    answered = false;
    setState(scr, 'idle');
    $(scr, '.js-lq-text').textContent = q.text;
    $(scr, '.js-lq-num').textContent = idx + 1;
    $(scr, '.js-lq-total').textContent = QUESTIONS.length;
    $(scr, '.js-lq-ring').innerHTML = ringSVG(QUESTIONS.length, idx + 1);
    const list = $(scr, '.js-lq-options');
    list.innerHTML = q.options.map((label, i) => {
      const ic = ICONS[i % ICONS.length];
      return `
      <button class="lq-opt" role="listitem" data-i="${i}" style="z-index:${q.options.length - i}">
        <span class="lq-opt__row">
          <span class="lq-opt__ic">
            <img class="is-norm" src="${A}${ic.norm}" width="48" height="48" alt="">
            <img class="is-dim" src="${A}${ic.dim}" width="48" height="48" alt="">
          </span>
          <span class="lq-opt__texts">
            <span class="lq-opt__label">${label}</span>
            <span class="lq-opt__hint">${OK_TITLE}</span>
          </span>
          <img class="lq-opt__state" src="" width="24" height="24" alt="">
        </span>
      </button>`;
    }).join('');
    const cta = $(scr, '.js-lq-cta');
    cta.disabled = true;
    $(scr, '.js-lq-cta-label').textContent = idx === QUESTIONS.length - 1 ? 'Ավարտել Քուիզը' : 'Հաջորդ Քուիզը';
    const sc = $(scr, '.lq-sheet__scroll'); if (sc) sc.scrollTop = 0;
  }

  function pick(scr, i) {
    if (answered) return;
    answered = true;
    const q = QUESTIONS[idx];
    const ok = i === q.correct;
    if (ok) correctCount++;
    setState(scr, ok ? 'correct' : 'wrong');
    scr.querySelectorAll('.lq-opt').forEach((el) => {
      const j = +el.dataset.i;
      el.disabled = true;
      if (j === i) {
        el.classList.add('is-picked');
        el.querySelector('.lq-opt__state').src = A + (ok ? 'lq-state-ok.svg' : 'lq-state-err.svg');
        const t = document.createElement('div');
        t.className = 'lq-toast' + (ok ? '' : ' is-wrong');
        t.innerHTML = `<p class="lq-toast__title">${ok ? OK_TITLE : ERR_TITLE}</p><p class="lq-toast__text">${ok ? q.okText : q.errText}</p>`;
        el.appendChild(t);
      } else if (!ok && j === q.correct) {
        el.classList.add('is-answer');
      } else {
        el.classList.add('is-dim');
      }
    });
    $(scr, '.js-lq-cta').disabled = false;
  }

  function finish() {
    const total = QUESTIONS.length;
    const score = Math.round((correctCount / total) * 100);
    App.state.quizScore = score;
    App.state.quizCorrect = correctCount;
    App.state.quizTotal = total;
    App.state.quizBest = Math.max(App.state.quizBest || 0, score);
    App.go(score === 100 ? 's-l-quiz-done' : 's-l-quiz-result');
  }

  function markDone() {
    try { if (App.lesson && typeof App.lesson.mark === 'function') App.lesson.mark(App.state.quizKey || 't2.quiz'); } catch (e) { /* lesson state not ready */ }
  }

  // after the quiz: theme 2 quiz → theme-2 complete; theme 4 quiz → back to the module page
  document.addEventListener('click', (e) => {
    const b = e.target.closest('#s-l-quiz-done .lq-cta, #s-l-quiz-result .lq-cta');
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    markDone();
    App.go((App.state.quizKey || 't2.quiz') === 't2.quiz' ? 's-l-theme2-done' : 's-l-module');
  }, true);

  document.addEventListener('app:ready', () => {
    const scr = document.getElementById('s-l-quiz');
    if (scr) {
      scr.addEventListener('screen:enter', () => { idx = 0; correctCount = 0; render(scr); });
      scr.addEventListener('click', (e) => {
        const opt = e.target.closest('.lq-opt');
        if (opt) return pick(scr, +opt.dataset.i);
        if (e.target.closest('.js-lq-cta')) {
          if (!answered) return;
          if (idx < QUESTIONS.length - 1) { idx++; render(scr); } else finish();
        }
      });
      render(scr);
    }

    const done = document.getElementById('s-l-quiz-done');
    if (done) done.addEventListener('screen:enter', () => {
      App.state.quizBest = Math.max(App.state.quizBest || 0, 100);
      markDone();
    });

    const res = document.getElementById('s-l-quiz-result');
    if (res) res.addEventListener('screen:enter', () => {
      const score = App.state.quizScore != null ? App.state.quizScore : 80;
      const total = App.state.quizTotal || 5;
      const right = App.state.quizCorrect != null ? App.state.quizCorrect : Math.round((score / 100) * total);
      const best = Math.max(App.state.quizBest || 0, score);
      $(res, '.js-lqr-title').textContent = score >= 65 ? 'Լավ արդյունք' : 'Դեռ կարելի է ավելին';
      $(res, '.js-lqr-sub').textContent = `${total} հարցից ${right}-ը ճիշտ են`;
      $(res, '.js-lqr-score').textContent = score;
      $(res, '.js-lqr-best').textContent = best;
      markDone();
    });
  });
})();
