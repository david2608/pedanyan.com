/* V1 · Emoji riddle (v1-25 … v1-32) — see css/screens/124-v1-riddle.css
   - expands .v1r-kb[data-kb] into the Android keyboard (Figma "Keyboard / Default")
     pages: "abc" = Armenian letters (for typing), "sym" = numbers/symbols page as drawn in Figma
   - "empty" riddle screens (section.v1r[data-answer], no data-static):
       tap the slots → keyboard slides up; letter keys fill the next slot (green if right, red if wrong);
       ⌫ removes the last letter; when every slot is filled the CTA enables; ↵ (return) = CTA.
       Tapping outside the keyboard closes it (reveals the CTA).
   - "answered" screens (data-static, .is-kb): keyboard open on the symbols page; ↵ = CTA. */
(function () {
  const A = 'assets/';
  const LETTERS = [
    ['Ա', 'Բ', 'Գ', 'Դ', 'Ե', 'Զ', 'Է', 'Ը', 'Թ', 'Ժ'],
    ['Ի', 'Լ', 'Խ', 'Ծ', 'Կ', 'Հ', 'Ձ', 'Ղ', 'Ճ', 'Մ'],
    ['Յ', 'Ն', 'Շ', 'Ո', 'Չ', 'Պ', 'Ջ', 'Ռ', 'Ս', 'Վ'],
    ['Տ', 'Ր', 'Ց', 'Ւ', 'Փ', 'Ք', 'Օ', 'Ֆ', 'ՈՒ'],
  ];
  const esc = (c) => c.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const key = (c, cls = '') => `<button type="button" class="v1r-key ${cls}" data-ch="${esc(c)}">${esc(c)}</button>`;
  const del = `<button type="button" class="v1r-key v1r-key--fn" data-act="del" aria-label="Delete"><img src="${A}v1-rkb-delete.svg" width="24" height="24" alt=""></button>`;

  const kbHTML = () => `
    <div class="v1r-kb__bar">
      <button type="button" class="v1r-kb__bar-back" data-act="hide" aria-label="Hide keyboard"><img src="${A}v1-rkb-back.svg" width="24" height="24" alt=""></button>
      <img src="${A}v1-rkb-sticker.svg" width="24" height="24" alt="">
      <span class="v1r-kb__gif"><img src="${A}v1-rkb-gif.svg" width="21" height="9" alt=""></span>
      <img src="${A}v1-rkb-paste.svg" width="24" height="24" alt="">
      <img src="${A}v1-rkb-settings.svg" width="24" height="24" alt="">
      <span class="v1r-kb__divider"></span>
      <img src="${A}v1-rkb-more.svg" width="24" height="24" alt="">
      <img src="${A}v1-rkb-voice.svg" width="24" height="24" alt="">
    </div>
    <div class="v1r-kb__page v1r-kb__page--abc">
      ${LETTERS.slice(0, 3).map((r) => `<div class="v1r-kb__row">${r.map((c) => key(c, 'v1r-key--hy')).join('')}</div>`).join('')}
      <div class="v1r-kb__row">${LETTERS[3].map((c) => key(c, 'v1r-key--hy')).join('')}${del}</div>
    </div>
    <div class="v1r-kb__page v1r-kb__page--sym">
      <div class="v1r-kb__row">${'1234567890'.split('').map((c) => key(c)).join('')}</div>
      <div class="v1r-kb__row">${key('@', 'v1r-key--at')}${'#$_&-+()/'.split('').map((c) => key(c)).join('')}</div>
      <div class="v1r-kb__row">
        <button type="button" class="v1r-key v1r-key--fn" aria-label="More symbols"><img src="${A}v1-rkb-chars.svg" width="24" height="24" alt=""></button>
        ${['*', '“', '‘', ':', ';', '!', '?'].map((c) => key(c)).join('')}
        ${del}
      </div>
    </div>
    <div class="v1r-kb__row v1r-kb__row--fn">
      <button type="button" class="v1r-key v1r-key--pill" data-act="page"><span class="v1r-pill-sym">ABC</span><span class="v1r-pill-abc">?123</span></button>
      ${key(',', 'v1r-key--narrow v1r-key--dim')}
      <button type="button" class="v1r-key v1r-key--narrow" aria-label="Emoji"><img src="${A}v1-rkb-numbers.svg" width="15.1705" height="20.96" alt=""></button>
      <button type="button" class="v1r-key v1r-key--space" data-act="space" aria-label="Space"></button>
      ${key('.', 'v1r-key--narrow v1r-key--dim')}
      <button type="button" class="v1r-key v1r-key--return" data-act="ret" aria-label="Enter"><img src="${A}v1-rkb-return.svg" width="24" height="24" alt=""></button>
    </div>`;

  document.querySelectorAll('.v1r-kb[data-kb]').forEach((kb) => {
    kb.innerHTML = kbHTML();
    if (!kb.dataset.page) kb.dataset.page = 'abc';
    kb.dataset.initPage = kb.dataset.page;
  });
  // pill label depends on page
  const style = document.createElement('style');
  style.textContent = '.v1r-kb[data-page="abc"] .v1r-pill-sym,.v1r-kb[data-page="sym"] .v1r-pill-abc{display:none}';
  document.head.appendChild(style);

  const answerOf = (s) => (s.dataset.answer || '').trim().split(/\s+/);
  const slotsOf = (s) => [...s.querySelectorAll('.v1r-slot')];
  const isInteractive = (s) => s && s.classList.contains('v1r') && s.dataset.answer && !s.hasAttribute('data-static');
  const cta = (s) => s.querySelector('.v1r-cta') || s.querySelector('.v1-footer .v1-btn');

  function refresh(s) {
    const slots = slotsOf(s);
    const ans = answerOf(s);
    let filled = 0;
    slots.forEach((el, i) => {
      const v = el.dataset.v || '';
      el.textContent = v;
      el.classList.toggle('is-ok', !!v && v === ans[i]);
      el.classList.toggle('is-bad', !!v && v !== ans[i]);
      if (v) filled++;
    });
    const nextIdx = filled < slots.length ? filled : -1;
    slots.forEach((el, i) => el.classList.toggle('is-next', s.classList.contains('is-kb') && i === nextIdx));
    const b = cta(s);
    if (b) b.disabled = filled < slots.length;
  }

  function type(s, ch) {
    const slot = slotsOf(s).find((el) => !el.dataset.v);
    if (!slot) return;
    slot.dataset.v = ch;
    refresh(s);
  }
  function backspace(s) {
    const filled = slotsOf(s).filter((el) => el.dataset.v);
    const last = filled[filled.length - 1];
    if (last) delete last.dataset.v;
    refresh(s);
  }
  function setKb(s, open) {
    s.classList.toggle('is-kb', open);
    if (isInteractive(s)) refresh(s);
  }

  document.addEventListener('click', (e) => {
    const s = e.target.closest('.screen.v1r');
    if (!s) return;
    const k = e.target.closest('.v1r-key, .v1r-kb__bar-back');
    if (k) {
      const kb = k.closest('.v1r-kb');
      const act = k.dataset.act;
      if (act === 'page') { kb.dataset.page = kb.dataset.page === 'abc' ? 'sym' : 'abc'; return; }
      if (act === 'hide') { setKb(s, false); return; }
      if (act === 'ret') {
        const b = cta(s);
        if (b && !b.disabled && b.dataset.go) App.go(b.dataset.go);
        return;
      }
      if (!isInteractive(s)) return;
      if (act === 'del') backspace(s);
      else if (k.dataset.ch) type(s, k.dataset.ch);
      return;
    }
    if (e.target.closest('.v1r-kb')) return;
    if (e.target.closest('.v1r-slots')) { if (isInteractive(s)) setKb(s, true); return; }
    if (e.target.closest('.v1-btn, .v1-back')) return;
    if (s.classList.contains('is-kb')) setKb(s, false);
  });

  // physical keyboard (desktop preview)
  document.addEventListener('keydown', (e) => {
    const s = document.querySelector('.screen.v1r.is-active');
    if (!isInteractive(s) || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'Backspace') { backspace(s); e.preventDefault(); return; }
    if (e.key === 'Enter') { const b = cta(s); if (b && !b.disabled) App.go(b.dataset.go); return; }
    if (/^[Ա-և]$/.test(e.key)) {
      let ch = e.key.toUpperCase();
      if (e.key === 'և') ch = 'Ե';
      // "Ո" + "Ւ" typed separately → merge into one "ՈՒ" slot when the answer expects it
      const filled = slotsOf(s).filter((el) => el.dataset.v);
      const prev = filled[filled.length - 1];
      if (ch === 'Ւ' && prev && prev.dataset.v === 'Ո' && answerOf(s)[filled.length - 1] === 'ՈՒ') {
        prev.dataset.v = 'ՈՒ'; refresh(s); return;
      }
      if (!s.classList.contains('is-kb')) setKb(s, true);
      type(s, ch);
    }
  });

  // reset on enter
  document.addEventListener('screen:enter', (e) => {
    const s = e.target;
    if (!s.classList || !s.classList.contains('v1r')) return;
    s.querySelectorAll('.v1r-kb').forEach((kb) => { kb.dataset.page = kb.dataset.initPage || 'abc'; });
    if (isInteractive(s)) {
      slotsOf(s).forEach((el) => delete el.dataset.v);
      s.classList.remove('is-kb');
      refresh(s);
    } else if (s.hasAttribute('data-static')) {
      s.classList.add('is-kb');
    }
  });
})();
