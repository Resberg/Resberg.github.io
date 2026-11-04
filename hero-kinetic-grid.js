// A local canvas implementation of the kinetic-grid interaction; no Framer runtime.
(() => {
  const hero = document.querySelector('.hero-centered');
  const canvas = hero?.querySelector('.hero-kinetic-grid');
  const context = canvas?.getContext('2d');
  if (!context) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let width = 0, height = 0, columns = 0, spacing = 56;
  let points = [], pointer = null, visible = false, frame = 0, lastTime = 0;
  const allowed = () => !reducedMotion.matches && !document.body.classList.contains('motion-paused');

  function paint() {
    context.clearRect(0, 0, width, height);
    const radius = 240;
    for (const point of points) {
      point.light = pointer ? Math.pow(Math.max(0, 1 - Math.hypot(point.x - pointer.x, point.y - pointer.y) / radius), 2) : 0;
    }
    for (let index = 0; index < points.length; index++) {
      const point = points[index];
      for (const next of [index % columns < columns - 1 ? points[index + 1] : null, points[index + columns]]) {
        if (!next) continue;
        const light = (point.light + next.light) / 2;
        context.strokeStyle = `rgba(36,85,245,${0.085 + light * 0.52})`;
        context.lineWidth = 0.65 + light * 0.9;
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(next.x, next.y);
        context.stroke();
      }
      context.fillStyle = `rgba(36,85,245,${0.16 + point.light * 0.65})`;
      context.beginPath();
      context.arc(point.x, point.y, 1 + point.light * 1.5, 0, Math.PI * 2);
      context.fill();
    }
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
  }

  function settle() {
    stop();
    pointer = null;
    for (const point of points) {
      point.x = point.baseX;
      point.y = point.baseY;
      point.vx = point.vy = 0;
    }
    paint();
  }

  function requestPaint() {
    if (!frame && visible && !document.hidden && allowed()) frame = requestAnimationFrame(animate);
  }

  function animate(time) {
    frame = 0;
    const step = Math.min(2, Math.max(0.25, (time - (lastTime || time - 16.67)) / 16.67));
    lastTime = time;
    let moving = false;
    for (const point of points) {
      let targetX = point.baseX, targetY = point.baseY;
      if (pointer) {
        const dx = point.baseX - pointer.x, dy = point.baseY - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 0 && distance < 260) {
          const pull = -32 * Math.pow(1 - distance / 260, 2);
          targetX += dx / distance * pull;
          targetY += dy / distance * pull;
        }
      }
      point.vx = (point.vx + (targetX - point.x) * 0.075 * step) * Math.pow(0.72, step);
      point.vy = (point.vy + (targetY - point.y) * 0.075 * step) * Math.pow(0.72, step);
      point.x += point.vx * step;
      point.y += point.vy * step;
      if (Math.abs(targetX - point.x) + Math.abs(targetY - point.y) + Math.abs(point.vx) + Math.abs(point.vy) > 0.025) moving = true;
      else { point.x = targetX; point.y = targetY; point.vx = point.vy = 0; }
    }
    paint();
    if (moving) requestPaint();
    else lastTime = 0;
  }

  function resize() {
    stop();
    width = hero.clientWidth;
    height = hero.clientHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    spacing = width <= 750 ? 44 : 56;
    columns = Math.ceil(width / spacing) + 3;
    const rows = Math.ceil(height / spacing) + 3;
    points = Array.from({ length: columns * rows }, (_, index) => {
      const x = (index % columns - 1) * spacing, y = (Math.floor(index / columns) - 1) * spacing;
      return { x, y, baseX: x, baseY: y, vx: 0, vy: 0, light: 0 };
    });
    pointer = null;
    paint();
  }

  hero.addEventListener('pointermove', event => {
    if (!finePointer.matches || event.pointerType === 'touch' || !allowed()) return;
    const rect = hero.getBoundingClientRect();
    pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    requestPaint();
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { pointer = null; requestPaint(); });
  hero.addEventListener('pointercancel', settle);
  new ResizeObserver(resize).observe(hero);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (!visible) settle();
  }).observe(hero);
  new MutationObserver(() => { if (!allowed()) settle(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  reducedMotion.addEventListener('change', settle);
  finePointer.addEventListener('change', settle);
  document.addEventListener('visibilitychange', () => { if (document.hidden) settle(); });
})();
