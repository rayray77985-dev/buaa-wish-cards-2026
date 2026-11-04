(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const schools = window.WISH_SCHOOLS;
  const shareUrl = new URL(window.location.href); shareUrl.hash = '';
  const canonical = shareUrl.href;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let playing = !reduced.matches, visible = false, overlay = null, returnFocus = null;
  let activeSchool = 0, activeIndex = 0, zoom = 1, rotation = 0, ownHash = false;
  const viewer = $('viewer'), stage = $('image-stage'), frame = $('image-frame'), picture = $('viewer-image');
  const states = schools.map((s, i) => ({ index: i === 0 ? 53 : 8, elapsed: i * 1800, hover: false, focus: false, version: 0 }));
  let toastTimer;
  function toast(message) { clearTimeout(toastTimer); $('toast').textContent = message; $('toast').hidden = false; toastTimer = setTimeout(() => { $('toast').hidden = true; }, 3000); }
  async function copy(text, message) {
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; } catch (_) {
      const input = document.createElement('textarea'); input.value = text; input.setAttribute('readonly', ''); input.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      (overlay || document.body).append(input); input.focus(); input.select();
      try { ok = document.execCommand('copy'); } catch (_) {} input.remove();
    }
    if (ok) toast(message); else window.prompt('请长按或选择并复制：', text);
  }
  function setBackgroundInert(value) { document.querySelectorAll('body > header, body > main, body > footer, body > .skip').forEach(el => { el.inert = value; }); }
  function openOverlay(el) { returnFocus = document.activeElement; overlay = el; el.hidden = false; document.body.classList.add('overlay-open'); setBackgroundInert(true); }
  function closeOverlay() { if (!overlay) return; overlay.hidden = true; overlay = null; document.body.classList.remove('overlay-open'); setBackgroundInert(false); returnFocus?.focus({ preventScroll: true }); }
  function updatePlay() { $('autoplay').setAttribute('aria-pressed', String(playing)); $('play-icon').textContent = playing ? 'Ⅱ' : '▷'; $('play-label').textContent = playing ? '暂停轮播' : '开启轮播'; }
  $('autoplay').onclick = () => { playing = !playing; updatePlay(); };
  reduced.addEventListener?.('change', event => { if (event.matches) { playing = false; updatePlay(); } });
  updatePlay();

  schools.forEach((school, s) => {
    const el = document.createElement('article'); el.className = 'school'; el.setAttribute('aria-labelledby', `school-${school.key}`);
    el.innerHTML = `<div class="school-header"><div><p class="school-location">宁夏 · 心愿来信</p><h3 class="school-title" id="school-${school.key}">${school.name}</h3></div><span class="school-total">${school.cards.length} 份心愿</span></div><button class="feature-card" type="button"><div class="feature-image-wrap"><img class="feature-image" alt=""><span class="enlarge-hint" aria-hidden="true">⤢ 放大看看</span></div><div class="feature-caption"><span>亲手写下的期待</span></div></button><div class="feature-controls"><span class="slide-count"></span><div class="slide-nav"><div class="progress-track" aria-hidden="true"><div class="progress-fill"></div></div><button class="round previous" type="button" aria-label="${school.name}上一张">‹</button><button class="round next" type="button" aria-label="${school.name}下一张">›</button></div></div><div class="thumbs" aria-label="${school.name}缩略图"></div><button class="browse-toggle" type="button" aria-expanded="false" aria-controls="all-${school.key}">浏览全部 ${school.cards.length} 张 <span aria-hidden="true">↓</span></button><div class="mini-gallery" id="all-${school.key}" hidden></div>`;
    $('schools').append(el); states[s].el = el;
    el.querySelector('.feature-card').onclick = () => openCard(s, states[s].index);
    el.querySelector('.previous').onclick = () => changeSlide(s, states[s].index - 1);
    el.querySelector('.next').onclick = () => changeSlide(s, states[s].index + 1);
    el.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') states[s].hover = true; }); el.addEventListener('pointerleave', () => { states[s].hover = false; });
    el.addEventListener('focusin', () => { states[s].focus = true; }); el.addEventListener('focusout', event => { if (!el.contains(event.relatedTarget)) states[s].focus = false; });
    const browse = el.querySelector('.browse-toggle'), gallery = el.querySelector('.mini-gallery');
    browse.onclick = () => {
      const expand = browse.getAttribute('aria-expanded') !== 'true'; browse.setAttribute('aria-expanded', String(expand)); gallery.hidden = !expand;
      browse.innerHTML = expand ? '收起全部心愿 <span aria-hidden="true">↑</span>' : `浏览全部 ${school.cards.length} 张 <span aria-hidden="true">↓</span>`;
      if (expand && !gallery.children.length) school.cards.forEach((card, i) => {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'mini-card'; button.setAttribute('aria-label', `放大${school.name}心愿卡`);
        button.innerHTML = `<img src="${card.thumb}" alt="" loading="lazy" decoding="async" width="150" height="200">`;
        button.onclick = () => openCard(s, i); gallery.append(button);
      });
    };
    renderSlide(s);
  });
  function changeSlide(s, index) { const state = states[s]; state.index = (index + schools[s].cards.length) % schools[s].cards.length; state.elapsed = 0; renderSlide(s); }
  function renderSlide(s) {
    const state = states[s], school = schools[s], card = school.cards[state.index], el = state.el, img = el.querySelector('.feature-image');
    const version = ++state.version;
    img.classList.add('is-loading');
    const preload = new Image(); preload.onload = () => { if (version !== state.version) return; img.src = card.thumb; img.alt = `${school.name}心愿卡`; img.classList.remove('is-loading'); };
    preload.onerror = () => { if (version !== state.version) return; img.src = card.thumb; img.alt = '图片暂未加载，请点击重试查看'; img.classList.remove('is-loading'); }; preload.src = card.thumb;
    el.querySelector('.feature-card').setAttribute('aria-label', `放大${school.name}心愿卡`);
    el.querySelector('.slide-count').textContent = '心愿轮播';
    const thumbs = el.querySelector('.thumbs'), first = Math.floor(state.index / 6) * 6;
    if (thumbs.dataset.first !== String(first)) {
      thumbs.dataset.first = String(first); thumbs.replaceChildren();
      school.cards.slice(first, first + 6).forEach((c, i) => { const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'thumb'; btn.setAttribute('aria-label', `预览${school.name}心愿卡`); btn.innerHTML = `<img src="${c.thumb}" alt="" loading="lazy" decoding="async" width="70" height="70">`; btn.onclick = () => changeSlide(s, first + i); thumbs.append(btn); });
    }
    [...thumbs.children].forEach((btn, i) => { const active = first + i === state.index; btn.classList.toggle('is-active', active); btn.setAttribute('aria-pressed', String(active)); });
    const next = new Image(); next.src = school.cards[(state.index + 1) % school.cards.length].thumb;
  }
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }, { threshold: 0.1 }); observer.observe($('schools'));
  let lastTick = performance.now();
  setInterval(() => {
    const now = performance.now(), delta = Math.min(now - lastTick, 400); lastTick = now;
    if (!playing || !visible || document.hidden || overlay) return;
    states.forEach((state, s) => { if (state.hover || state.focus) return; state.elapsed += delta; if (state.elapsed >= 6000) changeSlide(s, state.index + 1); state.el.querySelector('.progress-fill').style.width = `${state.elapsed / 60}%`; });
  }, 100);

  function currentCard() { return schools[activeSchool].cards[activeIndex]; }
  function setCardHash() { history.replaceState(null, '', `#${currentCard().id}`); }
  function openCard(s, index, fromHash = false) {
    if (overlay && overlay !== viewer) closeOverlay();
    activeSchool = s; activeIndex = index;
    if (viewer.hidden) { openOverlay(viewer); if (!fromHash) { ownHash = true; history.pushState(null, '', `#${currentCard().id}`); } }
    renderViewer(); $('viewer-close').focus({ preventScroll: true });
  }
  function renderViewer() {
    zoom = 1; rotation = 0; points.clear(); const card = currentCard();
    $('viewer-title').textContent = `${schools[activeSchool].name} · 手写心愿`;
    $('viewer-counter').textContent = '亲手制作的心愿卡';
    picture.alt = `${schools[activeSchool].name}手写心愿卡`; picture.style.opacity = '.25';
    $('image-status').textContent = '正在展开这份心愿…';
    picture.onload = () => { picture.style.opacity = '1'; $('image-status').textContent = ''; fitImage(true); };
    picture.onerror = () => { picture.style.opacity = '0'; $('image-status').textContent = '图片暂未加载成功，请点击此处重试。'; $('image-status').style.pointerEvents = 'auto'; };
    $('image-status').style.pointerEvents = 'none'; picture.src = card.src; fitImage(true);
    const next = new Image(); next.src = schools[activeSchool].cards[(activeIndex + 1) % schools[activeSchool].cards.length].src;
  }
  $('image-status').onclick = () => { const src = picture.src; picture.removeAttribute('src'); picture.src = src; };
  function fitImage(center = false) {
    if (viewer.hidden) return;
    const card = currentCard(), rotated = rotation % 180 !== 0;
    const w = rotated ? card.h : card.w, h = rotated ? card.w : card.h;
    const availableW = Math.max(100, stage.clientWidth - (innerWidth > 700 ? 140 : 24)), availableH = Math.max(100, stage.clientHeight - 24);
    const scale = Math.min(availableW / w, availableH / h) * zoom;
    const contentW = w * scale, contentH = h * scale;
    frame.style.width = `${Math.max(stage.clientWidth, contentW + 24)}px`; frame.style.height = `${Math.max(stage.clientHeight, contentH + 24)}px`;
    picture.style.width = `${card.w * scale}px`; picture.style.height = `${card.h * scale}px`;
    picture.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
    $('zoom-reset').textContent = `${Math.round(zoom * 100)}%`; $('zoom-out').disabled = zoom <= 1; $('zoom-in').disabled = zoom >= 4;
    if (center) { stage.scrollLeft = (frame.offsetWidth - stage.clientWidth) / 2; stage.scrollTop = (frame.offsetHeight - stage.clientHeight) / 2; }
  }
  function setZoom(value) { zoom = Math.max(1, Math.min(4, value)); fitImage(true); }
  function moveCard(delta) { activeIndex = (activeIndex + delta + schools[activeSchool].cards.length) % schools[activeSchool].cards.length; setCardHash(); renderViewer(); }
  function closeViewer() { closeOverlay(); if (ownHash) { ownHash = false; history.back(); } else history.replaceState(null, '', location.pathname + location.search); }
  $('viewer-close').onclick = closeViewer; $('viewer-prev').onclick = () => moveCard(-1); $('viewer-next').onclick = () => moveCard(1);
  $('zoom-out').onclick = () => setZoom(zoom - .5); $('zoom-in').onclick = () => setZoom(zoom + .5); $('zoom-reset').onclick = () => setZoom(1);
  $('rotate').onclick = () => { rotation = (rotation + 90) % 360; fitImage(true); };
  window.addEventListener('resize', () => fitImage(true));
  stage.addEventListener('dblclick', () => setZoom(zoom > 1 ? 1 : 2));
  stage.addEventListener('wheel', event => { if (event.ctrlKey) { event.preventDefault(); setZoom(zoom - event.deltaY * .01); } }, { passive: false });
  const points = new Map(); let swipeStart = null, pan = null, pinch = null, multiTouch = false;
  const distance = () => { const p = [...points.values()]; return Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y); };
  stage.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    stage.setPointerCapture(event.pointerId); points.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (points.size === 1) { multiTouch = false; swipeStart = { x: event.clientX, y: event.clientY }; pan = { x: event.clientX, y: event.clientY, left: stage.scrollLeft, top: stage.scrollTop }; }
    if (points.size === 2) { multiTouch = true; pinch = { distance: distance(), zoom }; }
  });
  stage.addEventListener('pointermove', event => {
    if (!points.has(event.pointerId)) return;
    points.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (points.size === 2 && pinch) { zoom = Math.max(1, Math.min(4, pinch.zoom * distance() / Math.max(1, pinch.distance))); fitImage(true); }
    else if (points.size === 1 && pan && zoom > 1) { stage.scrollLeft = pan.left - event.clientX + pan.x; stage.scrollTop = pan.top - event.clientY + pan.y; }
  });
  function pointerEnd(event) {
    if (!points.has(event.pointerId)) return;
    if (event.type !== 'pointercancel' && points.size === 1 && !multiTouch && zoom === 1 && swipeStart) { const dx = event.clientX - swipeStart.x, dy = event.clientY - swipeStart.y; if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) moveCard(dx > 0 ? -1 : 1); }
    points.delete(event.pointerId); if (points.size < 2) pinch = null;
    if (!points.size) { pan = null; swipeStart = null; }
    else { const p = [...points.values()][0]; pan = { x: p.x, y: p.y, left: stage.scrollLeft, top: stage.scrollTop }; }
  }
  stage.addEventListener('pointerup', pointerEnd); stage.addEventListener('pointercancel', pointerEnd);
  document.querySelectorAll('.share-trigger').forEach(btn => { btn.onclick = () => { prepareShare(); openOverlay($('share-dialog')); $('share-close').focus(); }; });
  function prepareShare() {
    const qrImage = $('share-qr');
    if (!/^https?:$/.test(location.protocol)) { qrImage.hidden = true; $('share-help').textContent = '部署到网站后，即可显示实际访问地址的二维码。'; return; }
    try { const code = qrcode(0, 'M'); code.addData(canonical); code.make(); qrImage.src = code.createDataURL(8, 4); qrImage.hidden = false; }
    catch (_) { qrImage.hidden = true; $('share-help').textContent = '请复制下方链接分享。'; }
  }
  $('share-close').onclick = closeOverlay;
  $('share-dialog').onclick = event => { if (event.target === $('share-dialog')) closeOverlay(); };
  $('copy-link').onclick = () => copy(canonical, '网页链接已复制，分享给朋友吧');
  document.addEventListener('keydown', event => {
    if (!overlay) return;
    if (event.key === 'Escape') { if (overlay === viewer) closeViewer(); else closeOverlay(); }
    if (overlay === viewer && ['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); moveCard(event.key === 'ArrowRight' ? 1 : -1); }
    if (event.key === 'Tab') { const focusable = [...overlay.querySelectorAll('button:not(:disabled),a[href],input')].filter(el => !el.hidden); const first = focusable[0], last = focusable.at(-1); if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } }
  });
  function routeHash() {
    const id = location.hash.slice(1).toUpperCase();
    for (let s = 0; s < schools.length; s++) { const index = schools[s].cards.findIndex(c => c.id === id); if (index !== -1) { openCard(s, index, true); return; } }
    if (overlay === viewer) { ownHash = false; closeOverlay(); }
  }
  window.addEventListener('hashchange', routeHash); routeHash();
})();
