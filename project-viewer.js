// Load the self-hosted viewer only when a project with a 3D model is opened.
(() => {
  let library, attempts = 0;
  function loadLibrary() {
    if (customElements.get('model-viewer')) return Promise.resolve();
    if (!library) {
      const suffix = attempts++ ? '?attempt=' + attempts : '';
      library = import('./assets/vendor/model-viewer-4.4.0.min.js' + suffix)
        .then(async () => { await customElements.whenDefined('model-viewer'); customElements.get('model-viewer').meshoptDecoderLocation = './assets/vendor/meshopt-decoder-1.3.0.js'; })
        .catch(error => { library = null; throw error; });
    }
    return library;
  }

  window.ProjectModelViewer = {
    async mount(host, models) {
      let disposed = false, viewer, selected = models[0];
      host.className = 'project-model-preview';
      host.innerHTML = `<div class="model-toolbar"><div><h3>Preview 3D</h3><span class="model-current-name"></span></div><div class="model-actions"><select aria-label="Pilih model 3D"></select><button type="button" class="model-reset">Atur ulang</button></div></div><div class="model-stage" aria-busy="true"><div class="model-message" role="status" aria-live="polite"><span>Menyiapkan preview 3D…</span><button type="button" class="model-retry" hidden>Coba lagi</button></div><div class="model-zoom" role="group" aria-label="Zoom model"><button type="button" aria-label="Perbesar model"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg></button><button type="button" aria-label="Perkecil model">−</button></div></div><p class="model-help"><span>Seret untuk memutar · Gulir atau cubit untuk zoom.</span><span>Shift + seret atau dua jari untuk menggeser.</span></p>`;
      const stage = host.querySelector('.model-stage'), message = host.querySelector('.model-message');
      const select = host.querySelector('select'), retry = host.querySelector('.model-retry');
      const reset = host.querySelector('.model-reset'), zoom = [...host.querySelectorAll('.model-zoom button')];
      for (const model of models) {
        const option = document.createElement('option'); option.textContent = model.label; option.value = model.src; select.append(option);
      }
      select.hidden = models.length < 2;
      host.closest('dialog').addEventListener('close', () => { disposed = true; host.replaceChildren(); }, { once: true });
      function state(value, text) {
        host.dataset.viewerState = value;
        stage.setAttribute('aria-busy', String(value === 'loading'));
        message.hidden = value === 'ready';
        message.querySelector('span').textContent = text || '';
        retry.hidden = value !== 'error';
        reset.disabled = value !== 'ready'; zoom.forEach(button => button.disabled = value !== 'ready');
      }
      function resetCamera() {
        viewer.setAttribute('camera-target', 'auto auto auto');
        viewer.setAttribute('camera-orbit', '45deg 65deg auto');
        viewer.setAttribute('field-of-view', '35deg');
      }
      function choose(bust = false) {
        selected = models.find(model => model.src === select.value) || models[0];
        host.querySelector('.model-current-name').textContent = selected.label;
        state('loading', 'Memuat ' + selected.label + '…');
        if (!viewer) return;
        viewer.alt = 'Model 3D ' + selected.label + '. Seret untuk memutar dan cubit atau gulir untuk zoom.';
        resetCamera();
        viewer.setAttribute('src', selected.src + (bust ? '?retry=' + Date.now() : ''));
      }
      async function initialize(reload = false) {
        state('loading', 'Menyiapkan preview 3D…');
        try {
          await loadLibrary();
          if (disposed || !host.isConnected) return;
          if (!viewer) {
            viewer = document.createElement('model-viewer');
            for (const [key, value] of Object.entries({ 'camera-controls': '', 'touch-action': 'pan-y', 'shadow-intensity': '0.7', 'shadow-softness': '1', exposure: '0.85', 'interaction-prompt': 'none', 'interpolation-decay': matchMedia('(prefers-reduced-motion: reduce)').matches ? '0' : '100' })) viewer.setAttribute(key, value);
            viewer.addEventListener('load', () => { if (!disposed) state('ready'); });
            viewer.addEventListener('error', () => { if (!disposed) state('error', 'Preview 3D belum bisa ditampilkan. Coba muat kembali.'); });
            viewer.addEventListener('progress', event => {
              if (host.dataset.viewerState === 'loading') message.querySelector('span').textContent = 'Memuat model… ' + Math.round(event.detail.totalProgress * 100) + '%';
            });
            stage.prepend(viewer);
          }
          choose(reload);
        } catch (error) { if (!disposed) state('error', 'Viewer belum berhasil dimuat. Periksa koneksi lalu coba lagi.'); }
      }
      select.addEventListener('change', () => choose());
      reset.addEventListener('click', resetCamera);
      zoom.forEach((button, index) => button.addEventListener('click', () => {
        const orbit = viewer.getCameraOrbit();
        viewer.setAttribute('camera-orbit', `${orbit.theta}rad ${orbit.phi}rad ${orbit.radius * (index ? 1.25 : 0.8)}m`);
      }));
      retry.addEventListener('click', () => initialize(true));
      host.querySelector('.model-current-name').textContent = selected.label;
      initialize();
    }
  };
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-project]').forEach(card => {
      if (!projects[card.dataset.project]?.models) return;
      const badge = document.createElement('span');
      badge.className = 'project-model-badge';
      badge.textContent = '3D interaktif';
      card.querySelector('.project-art').append(badge);
    });
  }, { once: true });
})();
