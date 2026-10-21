/* V2 keeps the original profile data and validation; only the picker navigation changes. */
(function () {
  const A = 'assets/';
  const AVATARS = [
    { file:'prof-av-01.png', tone:'blue' }, { file:'prof-av-02.png', tone:'green' },
    { file:'prof-av-03.png', tone:'blue' }, { file:'prof-av-04.png', tone:'green' },
    { file:'prof-av-05.png', tone:'green' }, { file:'prof-av-06.png', tone:'blue' },
    { file:'prof-av-07.png', tone:'blue' }, { file:'prof-av-08.png', tone:'green' },
    { file:'avatar-anush.png', tone:'green' }, { file:'prof-av-10.png', tone:'blue' },
  ].map((item, index) => ({ ...item, src:A + item.file, label:`Կերպար ${index + 1}` }));
  const TAKEN = ['anna','milana','միլանա','admin','ameria','star','test','user','ani'];
  const MSG = {
    hint:'3–20 նիշ՝ հայերեն կամ լատինատառ, թվեր, _',
    short:'Մականունը պետք է ունենա առնվազն 3 նիշ',
    chars:'Օգտագործիր միայն տառեր, թվեր և _',
    mixed:'Մի՛ խառնիր հայերեն և լատինական տառերը',
    taken:'Այս մականունն արդեն զբաղված է․ փորձիր մեկ այլ',
    free:'Հիանալի՛ է․ մականունն ազատ է',
    checking:'Ստուգում ենք՝ արդյոք մականունն ազատ է…',
  };
  const HY = /[Ա-Ֆա-և]/, LAT = /[A-Za-z]/, OK = /^[Ա-Ֆա-ևA-Za-z0-9_]+$/;

  document.addEventListener('app:ready', () => {
    const screen = document.getElementById('s-onb-avatar-v2');
    if (!screen) return;
    const $ = (s) => screen.querySelector(s);
    const portrait = $('.js-pa2-portrait'), heroName = $('.js-pa2-hero-name');
    const choices = $('.js-pa2-choices'), empty = $('.js-pa2-empty');
    const input = $('.js-pa2-username'), feedback = $('.js-pa2-feedback'), message = $('.js-pa2-message'), length = $('.js-pa2-length');
    const statusIcon = $('.js-pa2-status-icon'), suggestions = $('.js-pa2-suggestions');
    const continueBtn = $('[data-pa2-continue]'), footerNote = $('.js-pa2-footer-note');
    let selected = null, state = 'default', shortTimer, checkTimer, toastTimer;

    function showToast(text) {
      const toast = $('.pa2-toast'); toast.textContent = text; toast.classList.add('is-visible');
      clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
    }
    function updateCTA() {
      const ok = state === 'success' && !!selected;
      continueBtn.setAttribute('aria-disabled', String(!ok));
      footerNote.textContent = ok ? 'Ամեն ինչ պատրաստ է' : 'Ընտրիր կերպար և մականուն՝ շարունակելու համար';
    }
    function setNick(next, text = MSG.hint, { shake = false } = {}) {
      state = next;
      const block = $('.pa2-username');
      block.dataset.state = next;
      message.textContent = text;
      feedback.classList.toggle('is-good', next === 'success');
      feedback.classList.toggle('is-bad', next === 'error');
      statusIcon.textContent = next === 'success' ? '✓' : next === 'error' ? '!' : '';
      if (shake) { block.classList.remove('is-shake'); void block.offsetWidth; block.classList.add('is-shake'); }
      updateCTA();
    }
    function keyFor(item) { return item?.src || ''; }
    function updateSelection() {
      choices.querySelectorAll('.pa2-choice').forEach((button) => button.setAttribute('aria-checked', String(button.dataset.src === keyFor(selected))));
    }
    function setPreview(item, animate = true) {
      selected = item || null;
      portrait.replaceChildren();
      portrait.classList.toggle('is-picked', !!selected);
      portrait.classList.remove('is-pop');
      if (selected) {
        const img = document.createElement('img'); img.src = selected.src; img.alt = selected.label;
        portrait.appendChild(img);
        if (animate) { void portrait.offsetWidth; portrait.classList.add('is-pop'); }
        heroName.textContent = input.value.trim() || 'Քո մականունը';
        heroName.classList.toggle('is-ph', !input.value.trim());
      } else {
        const placeholder = document.createElement('span'); placeholder.className='pa2-avatar-placeholder'; placeholder.setAttribute('aria-hidden','true');
        placeholder.innerHTML='<svg width="38" height="38" viewBox="0 0 38 38" fill="none"><circle cx="19" cy="13" r="7" stroke="currentColor" stroke-width="2"/><path d="M5 34c1.8-7 6.5-10.5 14-10.5S31.2 27 33 34" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
        portrait.appendChild(placeholder); heroName.textContent='Քո մականունը'; heroName.classList.add('is-ph');
      }
      updateSelection(); updateCTA();
    }
    function makeChoice(item, index) {
      const b=document.createElement('button'); b.type='button'; b.className='pa2-choice'; b.setAttribute('role','radio');
      b.setAttribute('aria-label',item.label); b.setAttribute('aria-checked',String(item.src===keyFor(selected))); b.dataset.src=item.src;
      const disc=document.createElement('span'); disc.className=`pa2-choice__disc is-${item.tone}`;
      const img=document.createElement('img'); img.src=item.src; img.alt=''; disc.appendChild(img);
      const check=document.createElement('span'); check.className='pa2-choice__check'; check.setAttribute('aria-hidden','true'); check.textContent='✓';
      b.append(disc,check); b.addEventListener('click',()=>setPreview(item));
      return b;
    }
    function renderChoices() {
      choices.replaceChildren();
      const items = AVATARS;
      empty.hidden = items.length > 0;
      choices.hidden = items.length === 0;
      items.forEach((item,index)=>choices.appendChild(makeChoice(item,index)));
      updateSelection();
    }
    function validate(immediate = false) {
      clearTimeout(shortTimer); clearTimeout(checkTimer);
      const value=input.value.trim(); length.textContent=`${input.value.length}/20`;
      if (value) { heroName.textContent=value; heroName.classList.remove('is-ph'); }
      else { heroName.textContent='Քո մականունը'; heroName.classList.add('is-ph'); }
      if (!value) return setNick('default');
      if (!OK.test(value)) return setNick('error',MSG.chars,{shake:immediate});
      if (HY.test(value) && LAT.test(value)) return setNick('error',MSG.mixed,{shake:immediate});
      if (value.length<3) {
        if (immediate) return setNick('error',MSG.short,{shake:true});
        setNick('default'); shortTimer=setTimeout(()=>setNick('error',MSG.short),900); return;
      }
      setNick('checking',MSG.checking);
      checkTimer=setTimeout(()=>{
        if(input.value.trim()!==value)return;
        TAKEN.includes(value.toLowerCase()) ? setNick('error',MSG.taken,{shake:true}) : setNick('success',MSG.free);
      },immediate?0:650);
    }
    function flagMissing() {
      if(state!=='success') {
        if(!input.value.trim()) setNick('error','Մուտքագրիր մականուն',{shake:true});
        else validate(true);
      }
      if(!selected) { const block=$('.pa2-picker'); block.classList.remove('is-missing'); void block.offsetWidth; block.classList.add('is-missing'); }
    }
    function finish() {
      if (continueBtn.getAttribute('aria-disabled')==='true') { flagMissing(); return; }
      App.state.name=input.value.trim(); App.state.nick=input.value.trim(); App.state.avatar=selected.src;
      App.syncProfile?.(); App.go('s-onb-task');
    }

    screen.addEventListener('click',(event)=>{
      if(event.target.closest('[data-pa2-continue],[data-pa2-done]')) finish();
      if(event.target.closest('[data-back]')) { event.preventDefault(); App.go('s-onb-avatar'); }
    });
    input.addEventListener('input',()=>validate(false));
    input.addEventListener('blur',()=>{if(state==='default'&&input.value.trim())validate(true);});
    input.addEventListener('keydown',(event)=>{if(event.key==='Enter'){event.preventDefault();finish();}});
    screen.addEventListener('screen:enter',()=>{
      clearTimeout(shortTimer);clearTimeout(checkTimer);
      input.value='';length.textContent='0/20';
      setNick('default');setPreview(null,false);
      renderChoices();
    });
    renderChoices(); setPreview(null,false);
  });
})();
