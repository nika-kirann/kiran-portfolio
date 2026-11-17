(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  $('#year').textContent = new Date().getFullYear();

  /* ---------- nav, progress, back-to-top, parallax (one rAF scroll loop) ---------- */
  const nav = $('#nav');
  const bar = $('.progress span');
  const toTop = $('.to-top');
  const heroPhoto = $('.hero-visual .photo-frame');
  let ticking = false;
  const onScroll = () => {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('scrolled', y > 12);
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    toTop.classList.toggle('show', y > innerHeight * 0.8);
    if (heroPhoto && !reduce && y < innerHeight * 1.2) heroPhoto.style.transform = `translate3d(0, ${y * -0.08}px, 0)`;
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  /* ---------- mobile menu ---------- */
  const btn = $('.menu-btn'), menu = $('#menu');
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
  $$('a', menu).forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false');
  }));

  /* ---------- active nav link ---------- */
  const links = $$('.menu a[href^="#"]');
  const sections = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
  const navIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id && !a.classList.contains('menu-cta')));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => navIO.observe(s));

  /* ---------- staggered reveal + section numbers + counters ---------- */
  const countUp = el => {
    const target = +el.dataset.count;
    if (reduce) { el.textContent = target.toLocaleString('en-US'); return; }
    const dur = 1400, t0 = performance.now();
    const step = t => {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = '0';
    requestAnimationFrame(step);
  };
  const tickIndex = el => {
    const target = parseInt(el.textContent, 10);
    if (reduce || !target) return;
    let n = 0;
    const id = setInterval(() => {
      n++; el.firstChild.nodeValue = String(n).padStart(2, '0');
      if (n >= target) clearInterval(id);
    }, 90);
  };
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add('in');
      if (el.classList.contains('section-head')) { const i = $('.index', el); if (i) tickIndex(i); }
      $$('[data-count]', el).forEach(countUp);
      io.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  // stagger siblings within the same parent
  const groups = new Map();
  $$('.fade').forEach(el => {
    const p = el.parentElement;
    const i = groups.get(p) || 0; groups.set(p, i + 1);
    el.style.transitionDelay = reduce ? '0ms' : `${Math.min(i, 6) * 80}ms`;
    io.observe(el);
  });

  /* ---------- rotating role word ---------- */
  const rot = $('.rotator');
  if (rot && !reduce) {
    const words = rot.dataset.words.split('|');
    let w = 0, c = words[0].length, del = false;
    const tick = () => {
      const word = words[w];
      rot.textContent = word.slice(0, c);
      let delay = del ? 35 : 70;
      if (!del && c === word.length) { del = true; delay = 1800; }
      else if (del && c === 0) { del = false; w = (w + 1) % words.length; delay = 300; }
      else c += del ? -1 : 1;
      setTimeout(tick, delay);
    };
    setTimeout(tick, 1800);
  }

  /* ---------- lightbox ---------- */
  const lb = $('.lightbox'), lbImg = $('img', lb), lbCap = $('.lb-cap', lb), lbClose = $('.lb-close', lb);
  let lastFocus = null;
  const openLB = img => {
    lastFocus = document.activeElement;
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = img.alt;
    lb.hidden = false;
    requestAnimationFrame(() => lb.classList.add('open'));
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  };
  const closeLB = () => {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lb.hidden = true; }, reduce ? 0 : 300);
    lastFocus && lastFocus.focus();
  };
  $$('[data-lightbox]').forEach(img => {
    const host = img.closest('figure') || img;
    host.setAttribute('tabindex', '0');
    host.setAttribute('role', 'button');
    host.setAttribute('aria-label', 'Enlarge image: ' + img.alt);
    host.addEventListener('click', () => openLB(img));
    host.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLB(img); } });
  });
  lb.addEventListener('click', e => { if (e.target !== lbImg) closeLB(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) closeLB(); });

  /* ---------- pointer-only effects ---------- */
  if (!fine || reduce) return;

  // tilt + spotlight
  $$('[data-tilt]').forEach(el => {
    let raf = 0;
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--mx', `${x * 100}%`);
        el.style.setProperty('--my', `${y * 100}%`);
        el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 5}deg) rotateY(${(x - 0.5) * 6}deg) translateY(-3px)`;
      });
    });
    el.addEventListener('pointerleave', () => { cancelAnimationFrame(raf); el.style.transform = ''; });
  });

  // magnetic buttons
  $$('[data-magnetic]').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  // cursor follower
  document.documentElement.classList.add('has-cursor');
  const dot = $('.cursor-dot'), ring = $('.cursor-ring');
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  addEventListener('pointermove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
  }, { passive: true });
  const loop = () => {
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(loop);
  };
  loop();
  const interactive = 'a, button, [role="button"], [data-tilt]';
  document.addEventListener('pointerover', e => { if (e.target.closest(interactive)) ring.classList.add('hover'); });
  document.addEventListener('pointerout', e => { if (e.target.closest(interactive) && !e.relatedTarget?.closest?.(interactive)) ring.classList.remove('hover'); });
  addEventListener('pointerdown', () => ring.classList.add('down'));
  addEventListener('pointerup', () => ring.classList.remove('down'));
  document.addEventListener('pointerleave', () => document.documentElement.classList.remove('has-cursor'));
  document.addEventListener('pointerenter', () => document.documentElement.classList.add('has-cursor'));
})();
