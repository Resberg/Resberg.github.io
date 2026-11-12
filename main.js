/* Fahrez Bukhori — motion portfolio
   Motion grammar: arrivals decelerate (expo.out) from oversize or from below a mask,
   exits accelerate (power3.in); nothing grows from zero; one accent (blue) = "current is flowing". */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const G = window.gsap, ST = window.ScrollTrigger;
  const motion = !!(G && ST) && !reduced;

  /* ---------- basics (work without GSAP) ---------- */
  const clockEl = $('#clock');
  const tick = () => { clockEl.textContent = new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()); };
  tick(); setInterval(tick, 30000);
  $('#year').textContent = new Date().getFullYear();

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new Lenis({ lerp: 0.095, smoothWheel: true, wheelMultiplier: 0.95 });
    lenis.on('scroll', ST.update);
    G.ticker.add(t => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
  }
  const scrollToHash = hash => {
    const target = hash === '#home' ? 0 : $(hash);
    if (target === null) return;
    if (lenis) lenis.scrollTo(target, { duration: 1.4, easing: t => 1 - Math.pow(1 - t, 4) });
    else (target === 0 ? document.body : target).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  };
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const hash = a.getAttribute('href');
    if (hash.length < 2) return;
    e.preventDefault(); closeMenu(); scrollToHash(hash);
    history.replaceState(null, '', hash);
  }));

  /* ---------- mobile menu ---------- */
  const menuBtn = $('.menu-button'), menu = $('#mobile-menu');
  function closeMenu() { if (menu.hidden) return; menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Buka menu'); lenis && lenis.start(); }
  menuBtn.addEventListener('click', () => {
    if (!menu.hidden) return closeMenu();
    menu.hidden = false; menuBtn.setAttribute('aria-expanded', 'true'); menuBtn.setAttribute('aria-label', 'Tutup menu'); lenis && lenis.stop();
    if (motion) G.from($$('a', menu), { yPercent: 60, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.05 });
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- dialogs ---------- */
  function openDialog(d) { d.showModal(); document.body.classList.add('modal-open'); lenis && lenis.stop(); }
  $$('dialog').forEach(d => {
    $('.dialog-close', d).addEventListener('click', () => d.close());
    d.addEventListener('close', () => { document.body.classList.remove('modal-open'); lenis && lenis.start(); });
    d.addEventListener('click', e => {
      if (e.target !== d) return;
      const r = d.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
    });
  });
  $('.cv-button').addEventListener('click', () => { openDialog($('#cv-dialog')); $('.cv-doc').scrollTop = 0; });
  $$('[data-photo]').forEach(b => b.addEventListener('click', () => {
    const img = $('#photo-full'); img.src = b.dataset.photo; img.alt = b.dataset.caption;
    $('#photo-description').textContent = b.dataset.caption; openDialog($('#photo-dialog'));
  }));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  $$('[data-project]').forEach(card => card.addEventListener('click', () => {
    const p = window.projects && projects[card.dataset.project]; if (!p) return;
    $('#project-detail').innerHTML =
      `<span class="eyebrow">${esc(p.category)}</span><h2>${esc(p.title)}<em>.</em></h2><span class="detail-status">${esc(p.status)}</span>` +
      (p.models ? '<section class="project-model-slot" aria-label="Preview model 3D"></section>' : '') +
      (p.image ? `<figure class="detail-figure"><img src="${esc(p.image)}" alt="${esc(p.imageAlt)}"><figcaption>${esc(p.caption)}</figcaption></figure>` : `<div class="detail-photo">Dokumentasi menyusul</div>`) +
      `<p>${esc(p.intro)}</p>` + p.sections.map(([h, t]) => `<h3>${esc(h)}</h3><p>${esc(t)}</p>`).join('') +
      `<div class="interest-list">${p.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>`;
    const d = $('#project-dialog'); d.classList.toggle('has-model', !!p.models); openDialog(d); d.scrollTop = 0;
    if (p.models && window.ProjectModelViewer) ProjectModelViewer.mount($('.project-model-slot'), p.models);
  }));

  /* ---------- PCB signal field (canvas) ---------- */
  function PCB(canvas, opts = {}) {
    const ctx = canvas.getContext('2d');
    const base = document.createElement('canvas'), bctx = base.getContext('2d');
    const GRID = opts.grid || 26, DIRS = [[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
    let w = 0, h = 0, dpr = 1, traces = [], pulses = [], running = false, visible = true;
    const mouse = { x: -1e4, y: -1e4, active: false };

    function build() {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 2); w = r.width; h = r.height;
      if (!w || !h) return;
      for (const c of [canvas, base]) { c.width = w * dpr; c.height = h * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.ceil(w / GRID) + 1, rows = Math.ceil(h / GRID) + 1, used = new Set();
      const count = Math.round(cols * rows / (opts.sparse || 9));
      traces = [];
      for (let n = 0; n < count * 3 && traces.length < count; n++) {
        let cx = Math.floor(Math.random() * cols), cy = Math.floor(Math.random() * rows);
        if (used.has(cx + ',' + cy)) continue;
        let d = Math.floor(Math.random() * 8), pts = [[cx * GRID, cy * GRID]], len = 4 + Math.floor(Math.random() * 14);
        used.add(cx + ',' + cy);
        for (let i = 0; i < len; i++) {
          if (Math.random() < 0.22) d = (d + (Math.random() < 0.5 ? 1 : 7)) % 8;
          const nx = cx + DIRS[d][0], ny = cy + DIRS[d][1], key = nx + ',' + ny;
          if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || used.has(key)) break;
          used.add(key); cx = nx; cy = ny;
          const last = pts[pts.length - 1], prev = pts[pts.length - 2];
          const p = [cx * GRID, cy * GRID];
          // merge collinear points
          if (prev && (last[0] - prev[0]) * (p[1] - last[1]) === (last[1] - prev[1]) * (p[0] - last[0])) pts[pts.length - 1] = p; else pts.push(p);
        }
        if (pts.length < 2) continue;
        const cum = [0];
        for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
        if (cum[cum.length - 1] < GRID * 3) continue;
        let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
        for (const [x, y] of pts) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
        traces.push({ pts, cum, len: cum[cum.length - 1], box: [minX, minY, maxX, maxY], glow: 0 });
      }
      bctx.clearRect(0, 0, w, h);
      bctx.lineWidth = 1.3; bctx.lineJoin = 'round'; bctx.lineCap = 'round';
      for (const t of traces) {
        bctx.strokeStyle = 'rgba(111,149,255,0.13)'; path(bctx, t.pts); bctx.stroke();
        for (const end of [t.pts[0], t.pts[t.pts.length - 1]]) {
          bctx.beginPath(); bctx.arc(end[0], end[1], 2.6, 0, Math.PI * 2);
          bctx.fillStyle = '#07090d'; bctx.fill(); bctx.strokeStyle = 'rgba(111,149,255,0.3)'; bctx.stroke();
        }
      }
      pulses = [];
      draw(0);
    }
    function path(c, pts) { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); }
    function at(t, s) {
      s = Math.max(0, Math.min(t.len, s));
      let i = 1; while (i < t.cum.length - 1 && t.cum[i] < s) i++;
      const a = t.pts[i - 1], b = t.pts[i], k = (s - t.cum[i - 1]) / ((t.cum[i] - t.cum[i - 1]) || 1);
      return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, i];
    }
    function spawn(t, speed) { if (t && pulses.length < 70) pulses.push({ t, s: 0, v: speed || 2.2 + Math.random() * 2.6, tail: 46 + Math.random() * 50 }); }
    function nearest(x, y, k) {
      return traces.map(t => { let m = 1e9; for (const p of t.pts) m = Math.min(m, Math.hypot(p[0] - x, p[1] - y)); return [m, t]; })
        .sort((a, b) => a[0] - b[0]).slice(0, k).map(r => r[1]);
    }
    function draw(dt) {
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(base, 0, 0, w, h);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      // cursor proximity: traces near the pointer warm up
      const R = 150;
      for (const t of traces) {
        let target = 0;
        if (mouse.active && mouse.x > t.box[0] - R && mouse.x < t.box[2] + R && mouse.y > t.box[1] - R && mouse.y < t.box[3] + R) {
          let m = 1e9; for (const p of t.pts) m = Math.min(m, Math.hypot(p[0] - mouse.x, p[1] - mouse.y));
          target = Math.max(0, 1 - m / R);
        }
        t.glow += (target - t.glow) * 0.12;
        if (t.glow > 0.02) {
          ctx.strokeStyle = `rgba(111,149,255,${0.6 * t.glow})`; ctx.lineWidth = 1.6; path(ctx, t.pts); ctx.stroke();
          if (target > 0.6 && Math.random() < 0.02) spawn(t);
        }
      }
      if (dt && Math.random() < (opts.rate || 0.12)) spawn(traces[Math.floor(Math.random() * traces.length)]);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i]; p.s += p.v * (dt || 0) * 0.06;
        if (p.s - p.tail > p.t.len) { pulses.splice(i, 1); continue; }
        const head = at(p.t, p.s), tail = at(p.t, p.s - p.tail);
        const g = ctx.createLinearGradient(tail[0], tail[1], head[0], head[1]);
        g.addColorStop(0, 'rgba(47,99,255,0)'); g.addColorStop(1, 'rgba(140,175,255,0.95)');
        ctx.strokeStyle = g; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(tail[0], tail[1]);
        for (let k = tail[2]; k < head[2]; k++) ctx.lineTo(p.t.pts[k][0], p.t.pts[k][1]);
        ctx.lineTo(head[0], head[1]); ctx.stroke();
        if (p.s <= p.t.len) {
          ctx.fillStyle = 'rgba(47,99,255,0.35)'; ctx.beginPath(); ctx.arc(head[0], head[1], 6, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#dfe8ff'; ctx.beginPath(); ctx.arc(head[0], head[1], 1.8, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    let last = 0;
    function loop(now) {
      if (!running) return;
      const dt = Math.min(48, now - (last || now)); last = now;
      draw(dt); requestAnimationFrame(loop);
    }
    function setRun() {
      const should = visible && !document.hidden && !reduced;
      if (should && !running) { running = true; last = 0; requestAnimationFrame(loop); }
      if (!should) running = false;
    }
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; setRun(); }).observe(canvas);
    document.addEventListener('visibilitychange', setRun);
    const host = canvas.parentElement;
    host.addEventListener('pointermove', e => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.active = true; }, { passive: true });
    host.addEventListener('pointerleave', () => { mouse.active = false; });
    host.addEventListener('pointerdown', e => {
      if (e.target.closest('a,button')) return;
      const r = canvas.getBoundingClientRect();
      nearest(e.clientX - r.left, e.clientY - r.top, 9).forEach((t, i) => setTimeout(() => spawn(t, 4 + Math.random() * 3), i * 40));
    });
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 200); });
    build(); setRun();
    return { burst(n = 14) { for (let i = 0; i < n; i++) setTimeout(() => spawn(traces[Math.floor(Math.random() * traces.length)], 3 + Math.random() * 3), i * 35); } };
  }
  const heroPCB = PCB($('.hero .pcb'), { sparse: innerWidth < 700 ? 14 : 9, rate: 0.14 });
  PCB($('.pcb-contact'), { sparse: 11, rate: 0.08 });

  /* ---------- education: study progress from real dates (Aug 2024 -> Aug 2028) ---------- */
  const eduStart = new Date(2024, 7, 1), eduEnd = new Date(2028, 7, 1), now = new Date();
  const eduPct = Math.min(1, Math.max(0, (now - eduStart) / (eduEnd - eduStart)));
  const eduMonths = (now.getFullYear() - 2024) * 12 + (now.getMonth() - 7);
  const semester = Math.min(8, Math.max(1, Math.floor(eduMonths / 6) + 1));
  $('#edu-semester').textContent = eduPct >= 1 ? 'Tahap akhir' : 'Semester ' + semester;
  const stops = $$('.edu-stop'), stopX = stops.map(s => parseFloat(s.style.getPropertyValue('--x')) / 100);
  const nowFrac = stopX[2] + (stopX[3] - stopX[2]) * eduPct;
  const rail = $('.edu-rail'), railFill = $('.edu-rail-line > i');
  const setRail = f => { railFill.style.transform = `scaleX(${f})`; stops.forEach((s, i) => s.classList.toggle('is-on', stopX[i] <= f + 0.001 && !s.classList.contains('is-future'))); };
  rail.style.setProperty('--now', nowFrac * 100 + '%');
  setRail(nowFrac); $('.edu-bar').style.setProperty('--pct', eduPct);

  /* ---------- video: load the TikTok player only when it is near the screen ---------- */
  const tk = $('.tiktok-frame');
  new IntersectionObserver((entries, io) => entries.forEach(e => { if (e.isIntersecting) { tk.src = tk.dataset.src; io.disconnect(); } }), { rootMargin: '600px 0px' }).observe(tk);

  /* ---------- no GSAP / reduced motion: stop here ---------- */
  const loader = $('.loader');
  if (!motion) { loader && loader.remove(); return; }
  G.registerPlugin(ST);

  /* ---------- text splitting ---------- */
  function splitChars(el) {
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        for (const ch of n.textContent) {
          if (ch === ' ') { frag.append(' '); continue; }
          const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; frag.append(s);
        }
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.classList.contains('spark')) walk(n);
    });
    walk(el); return $$('.ch', el);
  }
  function splitWords(el) {
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(' '); return; }
          const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.append(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(el); return $$('.w', el);
  }
  function splitLines(el) {
    el.innerHTML = el.innerHTML.split(/<br\s*\/?>/i).map(h => `<span class="line-mask"><span>${h}</span></span>`).join('');
    return $$('.line-mask > span', el);
  }

  /* ---------- intro ---------- */
  const nameChars = $$('.name-part').flatMap(splitChars);
  const intro = G.timeline({ paused: true, defaults: { ease: 'expo.out' } });
  const trace = $('.loader-trace path'), tl = trace.getTotalLength();
  G.set(trace, { strokeDasharray: tl, strokeDashoffset: tl });
  G.set(nameChars, { opacity: 0, scale: 2.4, filter: 'blur(14px)' });
  G.set('.hero-portrait', { yPercent: 28, opacity: 0 });
  G.set(['.hero-meta', '.hero-bottom > *', '.nav'], { opacity: 0, y: 24 });
  const scopeWave = $('.scope-wave'), swl = scopeWave.getTotalLength();
  G.set(scopeWave, { strokeDasharray: swl, strokeDashoffset: swl });
  G.set('.scope-ring', { scale: 0.85, opacity: 0, transformOrigin: '50% 50%' });

  intro
    .from('.loader-mark', { scale: 3.2, opacity: 0, duration: 0.9 })
    .to(trace, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, 0.1)
    .to('.loader-mark', { yPercent: -40, opacity: 0, duration: 0.45, ease: 'power3.in' }, 1.0)
    .to('.loader', { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'power4.inOut' }, 1.1)
    .add(() => heroPCB.burst(22), 1.35)
    .to(nameChars, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.2, stagger: { each: 0.045, from: 'center' } }, 1.45)
    .to('.hero-portrait', { yPercent: 0, opacity: 1, duration: 1.5 }, 1.6)
    .to('.scope-ring', { scale: 1, opacity: 1, duration: 1.4, stagger: 0.1 }, 1.75)
    .to(scopeWave, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, 1.9)
    .to(['.nav', '.hero-meta', '.hero-bottom > *'], { opacity: 1, y: 0, duration: 1, stagger: 0.08 }, 2.0)
    .add(() => { loader.remove(); startHeroLoops(); }, 2.2);

  const go = () => intro.play();
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(go, 80));
  setTimeout(() => { if (!intro.isActive() && intro.progress() === 0) go(); }, 2500);

  function startHeroLoops() {
    G.to('.scope-ring.dashed', { rotation: 360, duration: 60, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
    // oscilloscope: the wave re-traces itself every few seconds
    G.timeline({ repeat: -1, repeatDelay: 2.2 })
      .to(scopeWave, { strokeDashoffset: -swl, duration: 1.2, ease: 'power2.in' })
      .set(scopeWave, { strokeDashoffset: swl })
      .to(scopeWave, { strokeDashoffset: 0, duration: 1.1, ease: 'power3.out' });
  }

  /* rotating word */
  const words = ['curiosity.', 'circuits.', 'robots.', 'possibility.'];
  let wi = 0; const wordEl = $('#rotating-word');
  setInterval(() => {
    if (document.hidden) return;
    G.timeline()
      .to(wordEl, { yPercent: -110, duration: 0.35, ease: 'power3.in' })
      .add(() => { wordEl.textContent = words[++wi % words.length]; })
      .fromTo(wordEl, { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: 'expo.out' });
  }, 2800);

  /* hero scroll: name pulls apart, portrait sinks, field dims */
  G.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 } })
    .to('.name-first', { xPercent: -38, ease: 'none' }, 0)
    .to('.name-last', { xPercent: 38, ease: 'none' }, 0)
    .to('.hero-portrait', { yPercent: 18, scale: 1.06, ease: 'none' }, 0)
    .to('.hero-glow', { opacity: 0.2, scale: 1.3, ease: 'none' }, 0)
    .to('.hero-bottom, .hero-meta', { y: -60, opacity: 0, ease: 'none' }, 0)
    .to('.hero .pcb', { opacity: 0.3, ease: 'none' }, 0);

  /* ---------- nav: hide on scroll down, current section ---------- */
  const nav = $('.nav'); let lastY = 0;
  ST.create({ start: 0, end: 'max', onUpdate: self => {
    const y = self.scroll(); nav.classList.toggle('is-hidden', y > 300 && y > lastY && !document.body.classList.contains('modal-open')); lastY = y;
  } });
  $$('.nav-links a').forEach(a => {
    const sec = $(a.getAttribute('href')); if (!sec) return;
    ST.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onToggle: s => a.classList.toggle('is-current', s.isActive) });
  });

  /* ---------- marquee driven by scroll velocity ---------- */
  $$('.marquee-row').forEach(row => {
    const track = $('.marquee-track', row), dir = +row.dataset.dir;
    track.innerHTML += track.innerHTML + track.innerHTML;
    let x = 0, width = track.scrollWidth / 3, boost = 0;
    addEventListener('resize', () => { width = track.scrollWidth / 3; });
    const wrap = G.utils.wrap(-width, 0);
    G.ticker.add((t, dt) => {
      const v = lenis ? lenis.velocity : 0;
      boost += (Math.abs(v) * 0.6 - boost) * 0.08;
      x += dir * (0.045 * dt + boost) * (v < 0 ? -1 : 1);
      G.set(track, { x: G.utils.wrap(-width, 0, x), skewX: G.utils.clamp(-8, 8, -v * 0.25) * dir });
    });
  });

  /* ---------- headings & manifesto ---------- */
  $$('[data-lines]').forEach(el => {
    const lines = splitLines(el);
    G.from(lines, { yPercent: 110, rotate: 3, duration: 1.2, ease: 'expo.out', stagger: 0.09, scrollTrigger: { trigger: el, start: 'top 85%' } });
  });
  const mega = $('.display.mega');
  const megaChars = splitChars(mega);
  const manifestoWords = splitWords($('.manifesto'));
  G.fromTo(manifestoWords, { opacity: 0.12 }, { opacity: 1, ease: 'none', stagger: 0.05, scrollTrigger: { trigger: '.manifesto', start: 'top 78%', end: 'bottom 45%', scrub: 0.5 } });

  /* generic arrivals: rise from below, decelerate */
  const rise = sel => ST.batch(sel, {
    start: 'top 88%', end: 'max', once: true,
    onEnter: els => G.fromTo(els, { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out', stagger: 0.08, overwrite: true })
  });
  G.set('.eyebrow:not(.hero .eyebrow), .split-head > p, .edu-card, .about .interest-list, .tool, .hw-row, .tl-item, .arena-list li, .journey-head p, .contact-row, .contact-email, .socials', { opacity: 0 });
  rise('.eyebrow, .split-head > p, .journey-head p');
  rise('.about .interest-list'); rise('.edu-card');
  rise('.tool'); rise('.hw-row'); rise('.tl-item'); rise('.arena-list li');
  rise('.contact-row, .contact-email, .socials');

  /* skill rules charge up like a progress of current */
  $$('.hw-row').forEach(row => G.fromTo(row, { '--p': 0 }, { '--p': 1, ease: 'none', scrollTrigger: { trigger: row, start: 'top 85%', end: 'top 45%', scrub: 0.6 } }));

  /* education: the rail charges up to "now", then the study bar fills */
  const eduProg = { f: 0 };
  setRail(0); G.set('.edu-now', { opacity: 0, scale: 2.4 });
  G.to(eduProg, { f: nowFrac, ease: 'none', onUpdate: () => setRail(eduProg.f), scrollTrigger: { trigger: '.edu-rail', start: 'top 85%', end: 'top 45%', scrub: 0.6,
    onLeave: () => G.to('.edu-now', { opacity: 1, scale: 1, duration: 0.8, ease: 'expo.out' }),
    onEnterBack: () => G.to('.edu-now', { opacity: 0, scale: 2.4, duration: 0.3, ease: 'power3.in' }) } });
  const bar = $('.edu-bar'); bar.style.setProperty('--pct', 0);
  ST.create({ trigger: '.edu-main', start: 'top 75%', end: 'max', once: true, onEnter: () => G.to(bar, { '--pct': eduPct, duration: 1.8, ease: 'power2.inOut', delay: 0.3 }) });

  /* ---------- projects: pinned horizontal travel (desktop) ---------- */
  const mm = G.matchMedia();
  mm.add('(min-width: 1001px)', () => {
    const track = $('.projects-track');
    const dist = () => track.scrollWidth - innerWidth;
    const travel = G.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: {
      trigger: '.projects-pin', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
      onUpdate: s => G.set('.projects-rail i', { scaleX: s.progress })
    } });
    G.from(megaChars, { yPercent: 100, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: '.projects', start: 'top 70%' } });
    $$('.pcard').forEach(card => {
      G.from(card, { y: 140, rotate: 5, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: travel, start: 'left 105%', end: 'left 55%', scrub: true } });
      const img = $('.pcard-art.photo img', card);
      if (img) G.fromTo(img, { xPercent: -7 }, { xPercent: 7, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: travel, start: 'left right', end: 'right left', scrub: true } });
    });
  });
  mm.add('(max-width: 1000px)', () => {
    G.from(megaChars, { yPercent: 100, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: '.projects', start: 'top 80%' } });
    $$('.pcard').forEach(card => G.from(card, { y: 80, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 90%' } }));
  });

  /* project illustrations: each concept performs its own idea */
  (function illustrations() {
    // AGV follows its route
    const route = $('#agv-route'), bot = $('.agv-bot'), rl = route.getTotalLength(), agv = { s: 0 };
    G.to(route, { strokeDashoffset: -40, duration: 1.2, ease: 'none', repeat: -1 });
    const place = () => { const a = route.getPointAtLength(agv.s), b = route.getPointAtLength(Math.min(rl, agv.s + 1)); bot.setAttribute('transform', `translate(${a.x} ${a.y}) rotate(${Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI})`); };
    G.to(agv, { s: rl - 1, duration: 4.5, ease: 'power1.inOut', repeat: -1, yoyo: true, repeatDelay: 0.4, onUpdate: place }); place();
    // EMI: noise travels, shield breathes
    G.to('.emi-wave.w1', { x: -80, duration: 2, ease: 'none', repeat: -1 });
    G.to('.emi-wave.w2', { x: 80, duration: 2.4, ease: 'none', repeat: -1 });
    G.to('.emi-shield', { strokeDashoffset: -24, duration: 1, ease: 'none', repeat: -1 });
    G.to('.chip-body', { attr: { 'stroke': '#6f95ff' }, duration: 0.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    // Anotara: a box is drawn around the object, then labelled
    const bbox = $('.bbox'), bl = bbox.getTotalLength();
    G.set(bbox, { strokeDasharray: bl });
    G.timeline({ repeat: -1, repeatDelay: 1.4 })
      .fromTo(bbox, { strokeDashoffset: bl, fillOpacity: 0 }, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' })
      .to(bbox, { fillOpacity: 1, duration: 0.3 })
      .fromTo('.handles rect', { scale: 2.4, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, duration: 0.5, ease: 'expo.out', stagger: 0.06 }, '-=0.2')
      .fromTo('.bbox-label', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }, '-=0.3')
      .to(['.bbox', '.handles rect', '.bbox-label'], { opacity: 0, duration: 0.35, ease: 'power3.in' }, '+=1.6')
      .set(['.bbox', '.handles rect', '.bbox-label'], { opacity: 1 });
    // Rangkai Lab: electrons flow around the circuit
    const circ = $('#circuit'), cl = circ.getTotalLength();
    $$('.electron').forEach((e, i) => {
      const o = { s: (cl / 3) * i };
      G.to(o, { s: '+=' + cl, duration: 5, ease: 'none', repeat: -1, onUpdate: () => { const p = circ.getPointAtLength(o.s % cl); e.setAttribute('cx', p.x); e.setAttribute('cy', p.y); } });
    });
  })();

  /* ---------- video: the phone rises and settles upright ---------- */
  G.fromTo('.phone', { y: 160, rotate: -8 }, { y: 0, rotate: 0, ease: 'none', scrollTrigger: { trigger: '.video', start: 'top bottom', end: 'center center', scrub: 0.8 } });
  G.fromTo('.video-ring', { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: '.video', start: 'top 80%', end: 'center center', scrub: 0.8 } });
  G.set('.video-copy p, .video-copy .chip', { opacity: 0 }); rise('.video-copy p, .video-copy .chip');

  /* ---------- journey: the trace charges as you read ---------- */
  G.fromTo('.tl-line i', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 60%', end: 'bottom 60%', scrub: 0.4 } });
  $$('.tl-item').forEach(item => ST.create({ trigger: item, start: 'top 60%', onToggle: s => item.classList.toggle('is-on', s.isActive || s.progress > 0), end: 'max' }));

  /* ---------- arena: hover preview follows the cursor ---------- */
  if (fine) {
    const prev = $('.arena-preview'), pimg = $('img', prev);
    const px = G.quickTo(prev, 'x', { duration: 0.6, ease: 'power3' }), py = G.quickTo(prev, 'y', { duration: 0.6, ease: 'power3' });
    const pr = G.quickTo(prev, 'rotation', { duration: 0.8, ease: 'power3' });
    let lx = 0;
    $('.arena-list').addEventListener('pointermove', e => { px(e.clientX + 30); py(e.clientY - 120); pr(G.utils.clamp(-12, 12, (e.clientX - lx) * 0.8)); lx = e.clientX; });
    $$('.arena-list li').forEach(li => li.addEventListener('pointerenter', () => {
      if (!pimg.src.endsWith(li.dataset.img)) pimg.src = li.dataset.img;
      G.to(prev, { opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out', overwrite: 'auto' });
    }));
    $('.arena-list').addEventListener('pointerleave', () => G.to(prev, { opacity: 0, scale: 0.6, duration: 0.35, ease: 'power3.in', overwrite: 'auto' }));
  }

  /* ---------- certificates: stack and recede ---------- */
  const certs = $$('.cert');
  certs.forEach((c, i) => {
    const next = certs[i + 1]; if (!next) return;
    G.to($('.cert-inner', c), { scale: 0.9 + i * 0.025, filter: 'brightness(0.5)', ease: 'none', scrollTrigger: { trigger: next, start: 'top 95%', end: 'top 30%', scrub: true } });
  });
  G.from('.cert-inner', { y: 120, rotate: 2, duration: 1.2, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.cert-stack', start: 'top 85%' } });

  /* ---------- contact ---------- */
  const ctChars = $$('.ct-line').flatMap(splitChars);
  G.from(ctChars, { yPercent: 115, rotate: 8, duration: 1.2, ease: 'expo.out', stagger: 0.025, scrollTrigger: { trigger: '.contact-title', start: 'top 80%' } });
  G.to('.spark', { rotation: 360, duration: 8, repeat: -1, ease: 'none' });

  /* ---------- pointer interactions ---------- */
  if (fine) {
    const cur = $('.cursor'), dot = $('.cursor-dot'), ring = $('.cursor-ring'), label = $('.cursor-label');
    const dx = G.quickTo(dot, 'x', { duration: 0.08 }), dy = G.quickTo(dot, 'y', { duration: 0.08 });
    const rx = G.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' }), ry = G.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
    addEventListener('pointermove', e => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); }, { passive: true });
    document.addEventListener('pointerover', e => {
      const lab = e.target.closest('[data-cursor]'), hit = e.target.closest('a,button,.arena-list li');
      cur.classList.toggle('is-label', !!lab); if (lab) label.textContent = lab.dataset.cursor;
      cur.classList.toggle('is-hover', !!hit && !lab);
    });
    document.addEventListener('pointerleave', () => G.to(cur, { opacity: 0, duration: 0.2 }));
    document.addEventListener('pointerenter', () => G.to(cur, { opacity: 1, duration: 0.2 }));

    $$('.magnetic').forEach(el => {
      const mx = G.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1,0.4)' }), my = G.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1,0.4)' });
      el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * 0.3); my((e.clientY - r.top - r.height / 2) * 0.35); });
      el.addEventListener('pointerleave', () => { mx(0); my(0); });
    });
    $$('.tilt, .pcard, .cert-inner').forEach(el => {
      const tx = G.quickTo(el, 'rotationY', { duration: 0.8, ease: 'power3' }), ty = G.quickTo(el, 'rotationX', { duration: 0.8, ease: 'power3' });
      const amt = el.classList.contains('cert-inner') ? 3 : 7;
      G.set(el, { transformPerspective: 1100 });
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        tx((x - 0.5) * amt); ty((0.5 - y) * amt);
        el.style.setProperty('--mx', x * 100 + '%'); el.style.setProperty('--my', y * 100 + '%');
      });
      el.addEventListener('pointerleave', () => { tx(0); ty(0); });
    });
  }

  ST.sort(); ST.refresh();
  addEventListener('load', () => { ST.sort(); ST.refresh(); });
})();
