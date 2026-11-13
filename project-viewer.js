/* 3D model viewer for project case studies.
   - Shows a static CAD render (poster) first; nothing heavy loads until the visitor asks.
   - Loads the self-hosted <model-viewer> (~1 MB) and the .glb only on request.
   - Falls back to the poster with a clear message if WebGL or the download fails.
   - touch-action: pan-y keeps vertical page scrolling working on phones. */
(() => {
  let library = null;
  const hasWebGL = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
  function loadLibrary() {
    if (customElements.get('model-viewer')) return Promise.resolve();
    if (!library) {
      library = import('./assets/vendor/model-viewer-4.4.0.min.js')
        .then(async () => { await customElements.whenDefined('model-viewer'); customElements.get('model-viewer').meshoptDecoderLocation = './assets/vendor/meshopt-decoder-1.3.0.js'; })
        .catch(err => { library = null; throw err; });
    }
    return library;
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  window.ProjectModelViewer = {
    mount(host, models) {
      let selected = models[0], viewer = null, disposed = false;
      host.className = 'project-model-preview';
      host.innerHTML = `
        <div class="model-toolbar">
          <div><h3>Model CAD</h3><p class="model-help">Seret untuk memutar · cubit atau gulir untuk zoom · dua jari untuk menggeser</p></div>
          <div class="model-actions">
            ${models.length > 1 ? `<label class="vh" for="model-pick">Pilih model</label><select id="model-pick">${models.map(m => `<option value="${esc(m.src)}">${esc(m.label)}</option>`).join('')}</select>` : ''}
            <button type="button" class="model-reset" hidden>Atur ulang</button>
          </div>
        </div>
        <div class="model-stage">
          <img class="model-poster" alt="" width="1000" height="1000">
          <div class="model-overlay">
            <button type="button" class="chip chip-solid model-load"></button>
            <p class="model-msg" role="status" aria-live="polite"></p>
          </div>
        </div>`;
      const stage = host.querySelector('.model-stage'), poster = host.querySelector('.model-poster');
      const loadBtn = host.querySelector('.model-load'), msg = host.querySelector('.model-msg');
      const select = host.querySelector('select'), reset = host.querySelector('.model-reset');
      host.closest('dialog').addEventListener('close', () => { disposed = true; host.replaceChildren(); }, { once: true });

      function showPoster() {
        poster.src = selected.poster;
        poster.alt = 'Render statis model CAD ' + selected.label;
        loadBtn.textContent = `Putar model 3D (${selected.size})`;
      }
      function state(s, text) {
        host.dataset.state = s;
        msg.textContent = text || '';
        loadBtn.hidden = s === 'loading' || s === 'ready' || s === 'nowebgl';
        stage.setAttribute('aria-busy', String(s === 'loading'));
        reset.hidden = s !== 'ready';
      }
      function resetCamera() {
        viewer.setAttribute('camera-orbit', '35deg 68deg auto');
        viewer.setAttribute('camera-target', 'auto auto auto');
        viewer.setAttribute('field-of-view', '30deg');
      }
      async function start() {
        state('loading', 'Memuat viewer 3D…');
        try {
          await loadLibrary();
          if (disposed) return;
          if (!viewer) {
            viewer = document.createElement('model-viewer');
            const attrs = { 'camera-controls': '', 'touch-action': 'pan-y', 'interaction-prompt': 'none', 'shadow-intensity': '0.8', exposure: '0.9',
              'interpolation-decay': matchMedia('(prefers-reduced-motion: reduce)').matches ? '0' : '120' };
            for (const [k, v] of Object.entries(attrs)) viewer.setAttribute(k, v);
            viewer.addEventListener('load', () => { if (!disposed) { stage.classList.add('is-3d'); state('ready'); } });
            viewer.addEventListener('error', () => { if (!disposed) { stage.classList.remove('is-3d'); state('error', 'Model 3D gagal dimuat. Render statis tetap ditampilkan — coba lagi.'); } });
            viewer.addEventListener('progress', e => { if (host.dataset.state === 'loading') msg.textContent = 'Memuat model… ' + Math.round(e.detail.totalProgress * 100) + '%'; });
            stage.prepend(viewer);
          }
          // model-viewer does not always emit "error" for a missing file, so check it first
          const head = await fetch(selected.src, { method: 'HEAD' }).catch(() => null);
          if (disposed) return;
          if (!head || !head.ok) throw new Error('model missing');
          viewer.setAttribute('poster', selected.poster);
          viewer.alt = 'Model 3D ' + selected.label + ' yang dapat diputar';
          resetCamera();
          viewer.setAttribute('src', selected.src);
          const want = selected.src;
          setTimeout(() => {
            if (!disposed && host.dataset.state === 'loading' && selected.src === want) {
              stage.classList.remove('is-3d');
              state('error', 'Model 3D terlalu lama dimuat. Render statis tetap ditampilkan — coba lagi.');
            }
          }, 45000);
        } catch {
          if (!disposed) { stage.classList.remove('is-3d'); state('error', 'Model 3D belum bisa dimuat. Render statis tetap ditampilkan — periksa koneksi lalu coba lagi.'); }
        }
      }
      loadBtn.addEventListener('click', start);
      reset.addEventListener('click', resetCamera);
      if (select) select.addEventListener('change', () => {
        selected = models.find(m => m.src === select.value) || models[0];
        showPoster();
        if (viewer) { stage.classList.remove('is-3d'); start(); } else state('idle');
      });
      showPoster();
      if (!hasWebGL) state('nowebgl', 'Perangkat ini tidak mendukung WebGL, jadi model ditampilkan sebagai render statis.');
      else state('idle');
    }
  };
})();
