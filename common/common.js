  /* ============================================
    AMIS - Common JavaScript Utilities
    ============================================ */

  'use strict';

  // ── Toast Notifications ──────────────────────
  const Toast = (() => {
    let container;

    function init() {
      container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
      }
    }

    function show(message, type = 'info', duration = 3500) {
      if (!container) init();

const icons = {
  success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em">
              <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                d="M5 13l4 4L19 7"/>
            </svg>`,
  error: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em">
            <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              d="M6 6l12 12M6 18L18 6"/>
          </svg>`,
  warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em">
              <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                d="M12 9v4M12 17h0M1 21h22L12 2 1 21z"/>
            </svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em">
           <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
             d="M12 12v4M12 8h0M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
         </svg>`
};

      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span>${message}</span>
      `;
      container.appendChild(toast);

      setTimeout(() => {
        toast.classList.add('out');
        toast.addEventListener('animationend', () => toast.remove());
      }, duration);
    }

    return { show };
  })();

  // ── Page Loader ──────────────────────────────
  const Loader = (() => {
    function hide() {
      const loader = document.getElementById('page-loader');
      if (!loader) return;
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 500);
    }

    function show(text = 'Loading...') {
      const existing = document.getElementById('page-loader');
      if (existing) return;

      const loader = document.createElement('div');
      loader.id = 'page-loader';
      loader.innerHTML = `
        <div class="loader-spinner"></div>
        <span class="loader-text">${text}</span>
      `;
      document.body.appendChild(loader);
    }

    return { show, hide };
  })();

  // ── Session / Auth Helpers ───────────────────
  const Auth = (() => {
    const SESSION_KEY = 'amis_session';

    function setSession(userData) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    }

    function getSession() {
      try {
        return JSON.parse(sessionStorage.getItem(SESSION_KEY));
      } catch {
        return null;
      }
    }

    function clearSession() {
      sessionStorage.removeItem(SESSION_KEY);
    }

    function isLoggedIn() {
      return !!getSession();
    }

    function requireAuth(redirectTo = '../login/login.html') {
      if (!isLoggedIn()) {
        window.location.href = redirectTo;
      }
    }

    function requireGuest(redirectTo = '../dashboard/dashboard.html') {
      if (isLoggedIn()) {
        window.location.href = redirectTo;
      }
    }

    return { setSession, getSession, clearSession, isLoggedIn, requireAuth, requireGuest };
  })();

  // ── Modal Helpers ────────────────────────────
  const Modal = (() => {
    function open(id) {
      const overlay = document.getElementById(id);
      if (overlay) overlay.classList.add('open');
    }

    function close(id) {
      const overlay = document.getElementById(id);
      if (overlay) overlay.classList.remove('open');
    }

    function closeOnOverlayClick(id) {
      const overlay = document.getElementById(id);
      if (!overlay) return;
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close(id);
      });
    }

    return { open, close, closeOnOverlayClick };
  })();

  // ── Form Helpers ─────────────────────────────
  const Form = (() => {
    function validate(fields) {
      // fields: [{ el, rules: ['required', 'email', 'minLength:8'] }]
      let valid = true;

      fields.forEach(({ el, rules }) => {
        const val = el.value.trim();
        let error = '';

        for (const rule of rules) {
          if (rule === 'required' && !val) {
            error = 'This field is required.'; break;
          }
          if (rule === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            error = 'Enter a valid email address.'; break;
          }
          if (rule.startsWith('minLength:')) {
            const min = parseInt(rule.split(':')[1]);
            if (val.length < min) { error = `Minimum ${min} characters required.`; break; }
          }
        }

        setFieldError(el, error);
        if (error) valid = false;
      });

      return valid;
    }

  function setFieldError(el, message) {
    const wrapper = el.closest('.field-wrapper') || el.parentElement;
    const group = wrapper.closest('.field-group') || wrapper.parentElement;
    let errEl = group.querySelector('.field-error');

    el.classList.toggle('field-invalid', !!message);

    if (message) {
      if (!errEl) {
        errEl = document.createElement('span');
        errEl.className = 'field-error';
        wrapper.insertAdjacentElement('afterend', errEl); // ✅ inserts AFTER wrapper, inside .field-group
      }
      errEl.textContent = message;
    } else {
      if (errEl) errEl.remove();
    }
  }

    function clearErrors(form) {
      form.querySelectorAll('.field-invalid').forEach(el => el.classList.remove('field-invalid'));
      form.querySelectorAll('.field-error').forEach(el => el.remove());
    }

    return { validate, setFieldError, clearErrors };
  })();

  // ── DOM Ready ────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    // Auto-hide page loader if present
    window.addEventListener('load', () => {
      setTimeout(() => Loader.hide(), 300);
    });
  });