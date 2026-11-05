// A restrained preview-card tooltip inspired by the supplied Framer interaction.
document.querySelectorAll('.cv-control').forEach(control => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const reset = () => ['--tip-x','--tip-y','--tip-rotate-x','--tip-rotate-y'].forEach(name => control.style.removeProperty(name));
  control.addEventListener('pointerenter', () => control.classList.remove('tooltip-dismissed'));
  control.addEventListener('focusin', () => control.classList.remove('tooltip-dismissed'));
  control.addEventListener('pointermove', event => {
    if (!fine.matches || reduced.matches || document.body.classList.contains('motion-paused')) return;
    const box = control.querySelector('.cv-link').getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - box.left) / box.width * 2 - 1));
    const y = Math.max(-1, Math.min(1, (event.clientY - box.top) / box.height * 2 - 1));
    control.style.setProperty('--tip-x', x * 4 + 'px');
    control.style.setProperty('--tip-y', y * 3 + 'px');
    control.style.setProperty('--tip-rotate-x', -y * 4 + 'deg');
    control.style.setProperty('--tip-rotate-y', x * 5 + 'deg');
  }, { passive: true });
  control.addEventListener('pointerleave', reset);
  control.addEventListener('keydown', event => { if (event.key === 'Escape') { control.classList.add('tooltip-dismissed'); reset(); } });
});
