(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const strip = document.querySelector('.memory-strip');
  const cards = [...strip.querySelectorAll('.memory-card')];
  const back = document.getElementById('memory-back'), forward = document.getElementById('memory-forward');
  function scrollMemories(direction) {
    const step = cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(strip).gap);
    strip.scrollBy({left:direction * step, behavior:reduce.matches ? 'instant' : 'smooth'});
  }
  function updateArrows() { back.disabled = strip.scrollLeft < 5; forward.disabled = strip.scrollLeft >= strip.scrollWidth - strip.clientWidth - 5; }
  back.onclick = () => scrollMemories(-1); forward.onclick = () => scrollMemories(1);
  strip.addEventListener('scroll',updateArrows,{passive:true}); window.addEventListener('resize',updateArrows); updateArrows();
  strip.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();scrollMemories(e.key==='ArrowRight'?1:-1);}});
  const dialog = document.getElementById('memory-dialog');
  const img = document.getElementById('memory-image');
  let current = 0, opener = null;
  function renderMemory() {
    const card = cards[current], source = card.querySelector('img');
    img.src = card.querySelector('a').href; img.alt = source.alt;
    document.getElementById('memory-title').textContent = card.querySelector('h3').textContent;
    document.getElementById('memory-caption').textContent = card.querySelector('figcaption p').textContent;
  }
  cards.forEach((card,i)=>card.querySelector('a').addEventListener('click',e=>{
    if(typeof dialog.showModal!=='function') return;
    e.preventDefault();current=i;opener=e.currentTarget;renderMemory();dialog.showModal();document.body.classList.add('memory-open');document.getElementById('memory-close').focus();
  }));
  function move(delta) { current=(current+delta+cards.length)%cards.length;renderMemory(); }
  document.getElementById('memory-close').onclick=()=>dialog.close();
  document.getElementById('memory-prev').onclick=()=>move(-1); document.getElementById('memory-next').onclick=()=>move(1);
  dialog.addEventListener('close',()=>{document.body.classList.remove('memory-open');opener?.focus({preventScroll:true});});
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}});
  let touch=null;
  const photoStage=document.querySelector('.memory-photo-stage');
  photoStage.addEventListener('touchstart',e=>{touch=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null;},{passive:true});
  photoStage.addEventListener('touchmove',e=>{if(e.touches.length!==1)touch=null;},{passive:true});
  photoStage.addEventListener('touchend',e=>{if(touch&&e.changedTouches.length===1){const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.5)move(dx<0?1:-1);}touch=null;},{passive:true});
  photoStage.addEventListener('touchcancel',()=>{touch=null;},{passive:true});
  const dock=document.querySelector('.mobile-dock'), progress=document.querySelector('.reading-progress');
  const sections=['wishes','memories','participate'].map(id=>document.getElementById(id));
  let ticking=false;
  function updatePosition(){
    const y=window.scrollY,total=document.documentElement.scrollHeight-innerHeight;
    progress.style.transform=`scaleX(${total>0?Math.min(1,y/total):0})`;
    const show=document.querySelector('.hero').getBoundingClientRect().bottom<100;
    dock.classList.toggle('is-visible',show); dock.inert=!show||document.body.classList.contains('overlay-open')||document.body.classList.contains('memory-open');
    document.querySelector('.letter-mascot').style.animationPlayState = document.hidden || document.querySelector('.hero').getBoundingClientRect().bottom < 0 ? 'paused' : 'running';
    let active='wishes'; for(const section of sections)if(section.getBoundingClientRect().top<innerHeight*.45)active=section.id;
    dock.querySelectorAll('a').forEach(a=>{if(a.dataset.section===active)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});
    ticking=false;
  }
  window.addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(updatePosition);}},{passive:true});
  window.addEventListener('resize',updatePosition); updatePosition();
  document.addEventListener('visibilitychange',updatePosition);
  // Reveal each reading beat once; keep content readable without JS or motion support.
  if ('IntersectionObserver' in window && !reduce.matches) {
    const targets = [...document.querySelectorAll('.letter-ribbon, .section-heading .eyebrow, .section-heading h2, .section-heading .section-sub, .claim-guide, .story-label, .story-intro h2 > span, .story-intro p:not(.eyebrow), .memory-card figcaption, .participate-heading .eyebrow, .participate-heading h2, .participate-heading .section-sub, .journey li, .participate-note, .faq-section > div:first-child, .faq-list details, .closing > p, .closing > .primary, .history-links')];
    const groups = new Map();
    const reveal = el => { el.classList.remove('reveal-wait'); observer.unobserve(el); };
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
    }, { threshold: 0, rootMargin: '0px 0px -12px 0px' });
    targets.forEach(el => {
      // Never hide content already on screen, including restored scroll positions.
      if (el.getBoundingClientRect().top < innerHeight) return;
      const order = groups.get(el.parentElement) || 0;
      groups.set(el.parentElement, order + 1);
      el.style.setProperty('--reveal-delay', `${Math.min(order, 3) * 65}ms`);
      el.classList.add('scroll-reveal', 'reveal-wait');
      observer.observe(el);
    });
    document.addEventListener('focusin', event => {
      const el = event.target.closest('.reveal-wait');
      if (el) { el.style.setProperty('--reveal-delay', '0ms'); reveal(el); }
    });
    reduce.addEventListener?.('change', event => {
      if (event.matches) { targets.forEach(reveal); observer.disconnect(); }
    });
  }
})();
