/* ============================================
   AMIS – Login Page Script
   ============================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ── Redirect if already logged in ──────────
  Auth.requireGuest('../dashboard/dashboard.html');

  // ── Element references ──────────────────────
  const loginForm      = document.getElementById('login-form');
  const usernameInput  = document.getElementById('username');
  const passwordInput  = document.getElementById('password');
  const togglePwdBtn   = document.getElementById('toggle-password');
  const eyeShow        = document.getElementById('eye-show');
  const eyeHide        = document.getElementById('eye-hide');
  const signinBtn      = document.getElementById('signin-btn');
  const signinText     = signinBtn.querySelector('.btn-text');
  const signinSpinner  = signinBtn.querySelector('.btn-spinner');

  const forgotLink     = document.getElementById('forgot-link');
  const forgotModal    = document.getElementById('forgot-modal');
  const forgotClose    = document.getElementById('forgot-modal-close');
  const forgotCancel   = document.getElementById('forgot-cancel');
  const forgotForm     = document.getElementById('forgot-form');
  const resetEmail     = document.getElementById('reset-email');

  const googleBtn      = document.getElementById('google-btn');

// ── Password visibility toggle ──────────────
const EYE_OPEN   = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
const EYE_CLOSED = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;

togglePwdBtn.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  document.getElementById('eye-icon').innerHTML = isPassword ? EYE_CLOSED : EYE_OPEN;
  passwordInput.focus();
});

  // ── Clear errors on input ───────────────────
  [usernameInput, passwordInput].forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('field-invalid');
      const err = input.closest('.field-wrapper')?.parentElement?.querySelector('.field-error');
      if (err) err.remove();
    });
  });

  // ── Login Form Submit ───────────────────────
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    Form.clearErrors(loginForm);

    const isValid = Form.validate([
      { el: usernameInput, rules: ['required'] },
      { el: passwordInput, rules: ['required', 'minLength:6'] },
    ]);

    if (!isValid) return;

    // Show loading state
    setSigninLoading(true);

    try {
      // Simulate API call (replace with real endpoint)
      const result = await mockLogin(usernameInput.value.trim(), passwordInput.value);

      if (result.success) {
        Auth.setSession(result.user);
        Toast.show('Sign in successful! Redirecting...', 'success', 2000);
        Loader.show('Entering AMIS Portal...');

        setTimeout(() => {
          window.location.href = '../dashboard/dashboard.html';
        }, 1200);
      } else {
        setSigninLoading(false);
        Toast.show(result.message || 'Invalid username or password.', 'error');
        Form.setFieldError(passwordInput, 'Incorrect credentials. Please try again.');
        passwordInput.value = '';
        passwordInput.focus();
      }
    } catch (err) {
      setSigninLoading(false);
      Toast.show('Connection error. Please check your network.', 'error');
    }
  });

  function setSigninLoading(loading) {
    signinBtn.disabled = loading;
    signinText.classList.toggle('hidden', loading);
    signinSpinner.classList.toggle('hidden', !loading);
  }

  // ── Mock Login Function ─────────────────────
  // Replace this with your actual API call:
  // const res = await fetch('/api/auth/login', { method: 'POST', ... })
  async function mockLogin(username, password) {
    await delay(1200); // simulate network

    // Demo credentials (remove in production)
    const DEMO_USERS = [
      { username: 'admin',         password: 'admin123', name: 'Admin User',   role: 'Administrator', email: 'admin@dict.gov.ph' },
      { username: 'dict.user',     password: 'dict1234', name: 'DICT Staff',   role: 'Staff',         email: 'staff@dict.gov.ph' },
      { username: 'admin@dict.gov.ph', password: 'admin123', name: 'Admin User', role: 'Administrator', email: 'admin@dict.gov.ph' },
    ];

    const match = DEMO_USERS.find(
      u => (u.username === username || u.email === username) && u.password === password
    );

    if (match) {
      return {
        success: true,
        user: {
          id:       'usr_' + Date.now(),
          name:     match.name,
          email:    match.email,
          role:     match.role,
          loginAt:  new Date().toISOString(),
        }
      };
    }

    return { success: false, message: 'Invalid username or password.' };
  }

  // ── Forgot Password ─────────────────────────
  forgotLink.addEventListener('click', (e) => {
    e.preventDefault();
    Modal.open('forgot-modal');
    Modal.closeOnOverlayClick('forgot-modal');
    setTimeout(() => resetEmail.focus(), 200);
  });

  [forgotClose, forgotCancel].forEach(btn => {
    btn.addEventListener('click', () => Modal.close('forgot-modal'));
  });

  forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    Form.clearErrors(forgotForm);

    const isValid = Form.validate([
      { el: resetEmail, rules: ['required', 'email'] }
    ]);
    if (!isValid) return;

    const submitBtn = forgotForm.querySelector('.btn-signin');
    const btnText   = submitBtn.querySelector('.btn-text');
    const spinner   = submitBtn.querySelector('.btn-spinner');

    submitBtn.disabled = true;
    btnText.classList.add('hidden');
    spinner.classList.remove('hidden');

    await delay(1500); // simulate API

    submitBtn.disabled = false;
    btnText.classList.remove('hidden');
    spinner.classList.add('hidden');

    Modal.close('forgot-modal');
    Toast.show(`Password reset link sent to ${resetEmail.value}`, 'success', 4000);
    resetEmail.value = '';
  });

  // ── Google Sign In ──────────────────────────
  googleBtn.addEventListener('click', () => {
    Toast.show('Google sign-in is coming soon. Use your AMIS credentials.', 'info', 4000);

    // When ready, integrate Google Identity Services:
    // google.accounts.id.initialize({ client_id: 'YOUR_CLIENT_ID', callback: handleCredentialResponse });
    // google.accounts.id.prompt();
  });

  // ── Utility ─────────────────────────────────
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

});