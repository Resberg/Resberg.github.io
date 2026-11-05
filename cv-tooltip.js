// Folder / Holo Card interaction adapted without a Framer runtime.
(() => {
  const control = document.querySelector('.cv-control');
  const trigger = control.querySelector('.cv-link');
  const dialog = document.querySelector('#cv-dialog');
  const documentPane = dialog.querySelector('.cv-document');
  const zoom = dialog.querySelector('.cv-zoom');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const resetHolo = () => {
    dialog.style.removeProperty('--holo-x');
    dialog.style.removeProperty('--holo-y');
    dialog.style.removeProperty('--holo-rx');
    dialog.style.removeProperty('--holo-ry');
  };
  trigger.addEventListener('click', () => {
    control.classList.add('tooltip-dismissed');
    dialog.showModal();
    document.body.classList.add('modal-open');
    documentPane.scrollTop = 0;
    documentPane.scrollLeft = 0;
  });
  control.addEventListener('pointerenter', () => control.classList.remove('tooltip-dismissed'));
  control.addEventListener('focusin', () => control.classList.remove('tooltip-dismissed'));
  control.addEventListener('keydown', event => {
    if (event.key === 'Escape') control.classList.add('tooltip-dismissed');
  });
  zoom.addEventListener('click', () => {
    const expanded = documentPane.classList.toggle('is-zoomed');
    zoom.setAttribute('aria-pressed', String(expanded));
    zoom.setAttribute('aria-label', expanded ? 'Sesuaikan CV ke jendela' : 'Perbesar CV');
    zoom.querySelector('span').textContent = expanded ? 'Sesuaikan' : 'Perbesar';
  });
  dialog.addEventListener('pointermove', event => {
    if (!fine.matches || reduced.matches || document.body.classList.contains('motion-paused')) return;
    const box = dialog.getBoundingClientRect();
    dialog.style.setProperty('--holo-rx', ((.5 - (event.clientY - box.top) / box.height) * 2).toFixed(2) + 'deg');
    dialog.style.setProperty('--holo-ry', (((event.clientX - box.left) / box.width - .5) * 2).toFixed(2) + 'deg');
    dialog.style.setProperty('--holo-x', ((event.clientX - box.left) / box.width * 100).toFixed(1) + '%');
    dialog.style.setProperty('--holo-y', ((event.clientY - box.top) / box.height * 100).toFixed(1) + '%');
  }, { passive: true });
  dialog.addEventListener('pointerleave', resetHolo);
  dialog.addEventListener('close', () => {
    documentPane.classList.remove('is-zoomed');
    zoom.setAttribute('aria-pressed', 'false');
    zoom.setAttribute('aria-label', 'Perbesar CV');
    zoom.querySelector('span').textContent = 'Perbesar';
    resetHolo();
    control.classList.add('tooltip-dismissed');
  });
})();
