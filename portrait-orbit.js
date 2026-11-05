// Two canvas layers let the typography pass behind and in front of the portrait.
(() => {
  const hero = document.querySelector('.hero-centered');
  const canvases = [...hero.querySelectorAll('.body-ribbon')];
  const contexts = canvases.map(canvas => canvas.getContext('2d'));
  if (contexts.some(context => !context)) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const label = 'HARDWARE ENGINEERING  ·  ROBOTICS  ·  3D DESIGN  ·  EMBEDDED SYSTEMS  ·  ';
  let width = 0, height = 0, radius = 0, rise = 0, band = 0, font = 16;
  let glyphs = [], paths = [], phase = -1.3, frame = 0, lastTime = 0, visible = false;
  const tilt = -0.1, cos = Math.cos(tilt), sin = Math.sin(tilt);
  const allowed = () => visible && !document.hidden && !preference.matches && !document.body.classList.contains('motion-paused');

  function project(angle, offset = 0) {
    const x = radius * Math.sin(angle), y = rise * Math.cos(angle) + offset;
    return { x: width / 2 + x * cos - y * sin, y: height / 2 + x * sin + y * cos };
  }

  function bandPath(front) {
    const path = new Path2D(), start = front ? -Math.PI / 2 : Math.PI / 2;
    for (let edge = 0; edge < 2; edge++) {
      for (let i = 0; i <= 100; i++) {
        const fraction = edge ? 1 - i / 100 : i / 100;
        const point = project(start + fraction * Math.PI, (edge ? 1 : -1) * band / 2);
        if (!edge && !i) path.moveTo(point.x, point.y);
        else path.lineTo(point.x, point.y);
      }
    }
    path.closePath();
    return path;
  }

  function paint() {
    contexts.forEach((context, index) => {
      context.clearRect(0, 0, width, height);
      context.fillStyle = index ? '#2455f5' : '#1c40ba';
      context.fill(paths[index]);
      context.save();
      context.clip(paths[index]);
      context.fillStyle = '#ffffff';
      context.font = `500 ${font}px "Space Grotesk", sans-serif`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      for (const glyph of glyphs) {
        const angle = glyph.angle + phase, depth = Math.cos(angle);
        if ((depth >= 0) !== Boolean(index)) continue;
        const point = project(angle);
        context.save();
        context.globalAlpha = Math.min(1, Math.abs(depth) * 5);
        context.translate(point.x, point.y);
        context.rotate(tilt);
        context.transform(depth, -rise / radius * Math.sin(angle), 0, 1, 0, 0);
        context.fillText(glyph.character, 0, 0);
        context.restore();
      }
      context.restore();
    });
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
  }

  function tick(time) {
    frame = 0;
    if (!allowed()) return;
    const elapsed = lastTime ? time - lastTime : 0;
    if (!lastTime || elapsed >= 1000 / 60 - 0.5) {
      phase = (phase + Math.min(elapsed, 50) * Math.PI * 2 / 32000) % (Math.PI * 2);
      lastTime = time;
      paint();
    }
    frame = requestAnimationFrame(tick);
  }

  function sync() {
    if (!allowed()) stop();
    else if (!frame) frame = requestAnimationFrame(tick);
  }

  function resize() {
    width = canvases[0].clientWidth;
    height = canvases[0].clientHeight;
    if (!width || !height) return;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    font = Math.min(18, Math.max(12, width / 36));
    radius = width * 0.44;
    rise = height * 0.2;
    band = font * 1.9;
    contexts.forEach((context, index) => {
      canvases[index].width = Math.round(width * ratio);
      canvases[index].height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.font = `500 ${font}px "Space Grotesk", sans-serif`;
    });
    const context = contexts[0], circumference = Math.PI * 2 * radius;
    const repeats = Math.max(1, Math.round(circumference / context.measureText(label).width));
    const characters = [...label.repeat(repeats)];
    const advances = characters.map(character => context.measureText(character).width + font * 0.04);
    const total = advances.reduce((sum, value) => sum + value, 0);
    let distance = 0;
    glyphs = characters.map((character, index) => {
      const angle = (distance + advances[index] / 2) / total * Math.PI * 2;
      distance += advances[index];
      return { character, angle };
    });
    paths = [bandPath(false), bandPath(true)];
    paint();
  }

  new ResizeObserver(resize).observe(canvases[0]);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(hero);
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  preference.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  document.fonts?.ready.then(resize);

  // Decorative CSS loops elsewhere also rest when their section leaves the viewport.
  const sections = new IntersectionObserver(entries => entries.forEach(entry => {
    entry.target.dataset.motionVisible = String(entry.isIntersecting);
  }), { rootMargin: '120px 0px' });
  document.querySelectorAll('main > section').forEach(section => sections.observe(section));
  document.addEventListener('visibilitychange', () => document.body.classList.toggle('page-hidden', document.hidden));
})();
