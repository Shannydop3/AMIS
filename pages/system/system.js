  /* ============================================
    AMIS – System / Data Upload Page Script
    ============================================ */
  'use strict';

  document.addEventListener('amis:layout-ready', () => {

    /* ── Auth ─────────────────────────────────── */
    Auth.requireAuth('../login/login.html');

    /* ══════════════════════════════════════════
      UPLOAD SECTIONS
    ══════════════════════════════════════════ */

    const SECTIONS = [
      { id: 'property', label: 'Property' },
      { id: 'stock',    label: 'Stock'    },
      { id: 'goods',    label: 'Goods Receive' },
    ];

    const files = {};

    SECTIONS.forEach(({ id, label }) => {
      const fileInput  = document.getElementById(`file-${id}`);
      const dropzone   = document.getElementById(`dropzone-${id}`);
      const uploadBtn  = document.getElementById(`upload-${id}`);
      const preview    = document.getElementById(`preview-${id}`);
      const previewName = document.getElementById(`preview-${id}-name`);
      const previewSize = document.getElementById(`preview-${id}-size`);
      const removeBtn  = document.getElementById(`remove-${id}`);
      const progressEl = document.getElementById(`progress-${id}`);
      const progressFill = document.getElementById(`progress-${id}-fill`);
      const progressLbl  = document.getElementById(`progress-${id}-label`);
      const logEl      = document.getElementById(`log-${id}`);
      const dlBtn      = document.getElementById(`dl-${id}-template`);

      /* ── Collapsible Cards ────────────────────── */
document.querySelectorAll('.du-card__head.du-collapsible').forEach(head => {
  head.closest('.du-card').classList.add('collapsed');   // ← collapsed by default
  head.addEventListener('click', () => {
    head.closest('.du-card').classList.toggle('collapsed');
  });
});

      /* ── Download Template ── */
      if (dlBtn) {
        dlBtn.addEventListener('click', () => {
          Toast.show(`Downloading ${label} template…`, 'info', 2500);
          // In production: window.location.href = `/templates/${id}-template.xlsx`;
        });
      }

      /* ── File selection ── */
      function handleFile(file) {
        if (!file) return;
        if (!file.name.match(/\.(xlsx|xls)$/i)) {
          Toast.show('Only .xlsx or .xls files are accepted.', 'error');
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          Toast.show('File exceeds 10 MB limit.', 'error');
          return;
        }
        files[id] = file;
        if (previewName) previewName.textContent = file.name;
        if (previewSize) previewSize.textContent = formatBytes(file.size);
        preview?.classList.remove('hidden');
        if (uploadBtn) uploadBtn.disabled = false;
      }

      fileInput?.addEventListener('change', e => handleFile(e.target.files[0]));

      /* ── Drag & drop ── */
      dropzone?.addEventListener('dragover', e => {
        e.preventDefault();
        dropzone.classList.add('drag-over');
      });
      dropzone?.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
      dropzone?.addEventListener('drop', e => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        handleFile(e.dataTransfer.files[0]);
      });

      /* ── Remove file ── */
      removeBtn?.addEventListener('click', () => {
        files[id] = null;
        if (fileInput) fileInput.value = '';
        preview?.classList.add('hidden');
        if (uploadBtn) uploadBtn.disabled = true;
        logEl?.classList.add('hidden');
        logEl && (logEl.innerHTML = '');
        progressEl?.classList.add('hidden');
      });

      /* ── Upload ── */
      uploadBtn?.addEventListener('click', async () => {
        const file = files[id];
        if (!file) return;

        // For "goods" section, get selected radio value
        let typeLabel = label;
        if (id === 'goods') {
          const checked = document.querySelector('input[name="goods-type"]:checked');
          typeLabel = `Goods Receive (${checked ? checked.value.charAt(0).toUpperCase() + checked.value.slice(1) : 'Property'})`;
        }

        uploadBtn.disabled = true;
        progressEl?.classList.remove('hidden');
        logEl?.classList.add('hidden');
        logEl && (logEl.innerHTML = '');

        // Simulate upload progress
        await animateProgress(progressFill, progressLbl, typeLabel);

        // Simulate response
        progressEl?.classList.add('hidden');
        showLog(logEl, typeLabel, file.name);

        // Reset
        files[id] = null;
        if (fileInput) fileInput.value = '';
        preview?.classList.add('hidden');
        uploadBtn.disabled = true;
      });
    });

    /* ── Animate progress bar ─────────────────── */
    function animateProgress(fill, label, title) {
      return new Promise(resolve => {
        let pct = 0;
        const steps = [
          { to: 30,  ms: 400,  msg: 'Validating file…' },
          { to: 60,  ms: 600,  msg: 'Processing rows…' },
          { to: 85,  ms: 500,  msg: 'Saving records…' },
          { to: 100, ms: 400,  msg: 'Done!' },
        ];
        let i = 0;
        function step() {
          if (i >= steps.length) { setTimeout(resolve, 300); return; }
          const s = steps[i++];
          pct = s.to;
          if (fill) fill.style.width = pct + '%';
          if (label) label.textContent = s.msg;
          setTimeout(step, s.ms);
        }
        step();
      });
    }

    /* ── Show upload log ──────────────────────── */
    function showLog(logEl, title, filename) {
      if (!logEl) return;
      logEl.classList.remove('hidden');

      const entries = [
        { type: 'success', text: `File "${filename}" uploaded successfully.` },
        { type: 'info',    text: 'Parsing spreadsheet headers…' },
        { type: 'success', text: '150 records processed.' },
        { type: 'success', text: '148 records imported without errors.' },
        { type: 'error',   text: 'Row 24: Missing required field "Property No."' },
        { type: 'error',   text: 'Row 67: Invalid date format in "Acquired Date"' },
        { type: 'info',    text: 'Upload complete. Review errors and re-upload if needed.' },
      ];

      const icons = {
        success: `<svg class="du-log-entry__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
        error:   `<svg class="du-log-entry__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
        info:    `<svg class="du-log-entry__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
      };

      entries.forEach(e => {
        const div = document.createElement('div');
        div.className = `du-log-entry du-log-entry--${e.type}`;
        div.innerHTML = `${icons[e.type]}<span class="du-log-entry__text">${e.text}</span>`;
        logEl.appendChild(div);
      });

      Toast.show(`${title} upload completed with 2 warnings.`, 'warning', 4000);
    }

    /* ── Helpers ──────────────────────────────── */
    function setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }
    function getInitials(n = '') { return n.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase() || '?'; }
    function formatBytes(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

  }); 