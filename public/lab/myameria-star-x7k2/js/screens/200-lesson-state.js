/* Lesson flow progress state (Figma section 3005:86275 · Module 1 "Փող").
   App.lesson = {
     themes, keys,            // static structure (see THEMES)
     done: Set<string>,       // completed element keys
     step,                    // getter: number of completed elements in order (0…keys.length)
     current,                 // getter: key of the first not-done element (the "active" one) or null
     has(key), mark(key), unmark(key), reset(), set(keys[]), state(key) → 'done'|'active'|'locked',
     themeDone(id), themeOpen(id), points(id) → 0|100
   }
   Every change dispatches `lesson:change` on document (detail: { key, step, done:[…] }).
   Elements unlock strictly in order (Figma module states 3005:91758 → 3005:138509). */
(function () {
  const THEMES = [
    { id: 't1', items: ['t1.reel', 't1.game'] },
    { id: 't2', items: ['t2.reel1', 't2.reel2', 't2.quiz'] },
    { id: 't3', items: ['t3.reel1', 't3.reel2', 't3.game'] },
    { id: 't4', items: ['t4.reel1', 't4.reel2', 't4.quiz', 't4.crossword'] },
  ];
  const KEYS = THEMES.flatMap((t) => t.items);
  const done = new Set();

  function emit(key) {
    document.dispatchEvent(new CustomEvent('lesson:change', { detail: { key, step: lesson.step, done: [...done] } }));
  }

  const lesson = {
    themes: THEMES,
    keys: KEYS,
    done,
    get step() { const i = KEYS.findIndex((k) => !done.has(k)); return i < 0 ? KEYS.length : i; },
    get current() { return KEYS.find((k) => !done.has(k)) || null; },
    has(key) { return done.has(key); },
    mark(key) {
      if (!KEYS.includes(key)) console.warn('App.lesson.mark: unknown key', key);
      if (done.has(key)) return;
      done.add(key); emit(key);
    },
    unmark(key) { if (done.delete(key)) emit(key); },
    reset() { done.clear(); emit(null); },
    /** Replace the progress, e.g. App.lesson.set(['t1.reel']) — handy for demos/tests. */
    set(keys) { done.clear(); (keys || []).forEach((k) => done.add(k)); emit(null); },
    /** 'done' | 'active' | 'locked' for one element */
    state(key) { return done.has(key) ? 'done' : key === lesson.current ? 'active' : 'locked'; },
    theme(id) { return THEMES.find((t) => t.id === id); },
    themeDone(id) { const t = lesson.theme(id); return !!t && t.items.every((k) => done.has(k)); },
    themeOpen(id) { const t = lesson.theme(id); return !!t && t.items.some((k) => lesson.state(k) !== 'locked'); },
    points(id) { return lesson.themeDone(id) ? 100 : 0; },
  };

  window.App = window.App || {};
  App.lesson = lesson;
})();
