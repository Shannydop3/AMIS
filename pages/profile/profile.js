/* ============================================
   AMIS – Profile Page Script
   ============================================ */
'use strict';

/* ── Security questions — alphabetical ───────── */
const SECURITY_QUESTIONS = [
  'In what town or city did you meet your spouse?',
  'In what town or city was your first full time job?',
  'On what street did you grow up?',
  'What are the last four digits of your contact no.?',
  'What are the last three digits of your ID?',
  'What is your closest siblings name?',
  'What is your favorite food?',
  'What is your favorite sports team?',
  'What is your favorite teachers name?',
  'What is your name?',
  'What primary school did you attend?',
  'What was the name of your first pet?',
  'What was your first job?',
  'What\'s your favorite color?',
  'Where did you meet your spouse?',
  'Where did you spend your honeymoon?',
];

document.addEventListener('amis:layout-ready', () => {

  /* ── Auth guard ──────────────────────────── */
  Auth.requireAuth('../login/login.html');

  /* ── Load session data ───────────────────── */
  const session  = Auth.getSession() || {};
  const name     = session.name  || 'Admin User';
  const role     = session.role  || 'Staff';
  const email    = session.email || '';
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';

  /* ── Populate Identity Panel ─────────────── */
  const avatarEl = document.getElementById('profile-avatar-display');
  avatarEl.textContent = initials;

  document.getElementById('profile-name-display').textContent = name;
  document.getElementById('meta-position').textContent        = role;

  const rawId = (session.id || 'USR0001').replace(/\D/g, '').slice(-6).padStart(6, '0');
  document.getElementById('meta-idnumber').textContent = 'DICT-' + rawId.toUpperCase();

  const joinedDate = session.loginAt ? new Date(session.loginAt) : new Date();
  document.getElementById('meta-joined').textContent = joinedDate.toLocaleString('en-PH', {
    year:   'numeric',
    month:  'long',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });

  /* Pre-fill account form fields */
  document.getElementById('pf-email').value    = email;
  document.getElementById('pf-fullname').value = name;

  /* ── Avatar Upload ───────────────────────── */
  document.getElementById('avatar-upload').addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      Toast.show('Image must be under 5MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      avatarEl.innerHTML = '';
      const img = document.createElement('img');
      img.src = e.target.result;
      img.alt = 'Profile photo';
      avatarEl.appendChild(img);
      Toast.show('Profile photo updated.', 'success');
    };
    reader.readAsDataURL(file);
  });

  /* ── Password eye toggles ────────────────── */
  const EYE_OPEN   = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
  const EYE_CLOSED = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;

  document.querySelectorAll('.pf-eye').forEach(btn => {
    btn.addEventListener('click', () => {
      const input  = document.getElementById(btn.dataset.target);
      const isPass = input.type === 'password';
      input.type   = isPass ? 'text' : 'password';
      document.getElementById('eye-' + btn.dataset.target).innerHTML = isPass ? EYE_CLOSED : EYE_OPEN;
    });
  });

  /* ── Password match live check ───────────── */
  const pfPassword = document.getElementById('pf-password');
  const pfConfirm  = document.getElementById('pf-confirm');
  const pfHint     = document.getElementById('pf-match-hint');

  function checkPasswordMatch() {
    const pw  = pfPassword.value;
    const cfm = pfConfirm.value;
    if (!cfm) {
      pfHint.textContent = '';
      pfHint.className   = 'pf-hint';
      pfConfirm.classList.remove('pf-invalid', 'pf-valid');
      return;
    }
    if (pw === cfm) {
      pfHint.textContent = '✓ Passwords match';
      pfHint.className   = 'pf-hint match';
      pfConfirm.classList.remove('pf-invalid');
      pfConfirm.classList.add('pf-valid');
    } else {
      pfHint.textContent = '✗ Passwords do not match';
      pfHint.className   = 'pf-hint no-match';
      pfConfirm.classList.remove('pf-valid');
      pfConfirm.classList.add('pf-invalid');
    }
  }

  pfPassword.addEventListener('input', checkPasswordMatch);
  pfConfirm.addEventListener('input',  checkPasswordMatch);

  /* ── Account Form Submit ─────────────────── */
  document.getElementById('account-form').addEventListener('submit', async e => {
    e.preventDefault();

    const fullNameVal = document.getElementById('pf-fullname').value.trim();
    const emailVal    = document.getElementById('pf-email').value.trim();
    const pwVal       = pfPassword.value;
    const cfmVal      = pfConfirm.value;

    if (!fullNameVal) {
      Toast.show('Please enter your full name.', 'error');
      document.getElementById('pf-fullname').focus();
      return;
    }
    if (!emailVal) {
      Toast.show('Please enter your email address.', 'error');
      document.getElementById('pf-email').focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      Toast.show('Please enter a valid email address.', 'error');
      document.getElementById('pf-email').focus();
      return;
    }
    if (pwVal) {
      if (pwVal.length < 6) {
        Toast.show('Password must be at least 6 characters.', 'error');
        pfPassword.focus();
        return;
      }
      if (pwVal !== cfmVal) {
        Toast.show('Passwords do not match.', 'error');
        pfConfirm.focus();
        return;
      }
    }

    const btn = document.getElementById('account-save-btn');
    setLoading(btn, true);

    try {
      const db = await window.AMIS_READY;
      if (!db) throw new Error('Database is not configured.');

      // 1. Update profile row.
      const { error: pErr } = await db
        .from('profiles')
        .update({ full_name: fullNameVal, email: emailVal })
        .eq('id', session.id);
      if (pErr) throw pErr;

      // 2. Update auth email + optional password.
      const authPatch = {};
      if (emailVal && emailVal !== email) authPatch.email = emailVal;
      if (pwVal) authPatch.password = pwVal;
      if (Object.keys(authPatch).length) {
        const { error: aErr } = await db.auth.updateUser(authPatch);
        if (aErr) throw aErr;
      }

      // 3. Refresh cached profile so layout header updates too.
      await Auth.loadProfile();

      // Refresh in-page identity display.
      document.getElementById('profile-name-display').textContent = fullNameVal;
      const newInitials = fullNameVal.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
      if (!avatarEl.querySelector('img')) avatarEl.textContent = newInitials;

      pfPassword.value = '';
      pfConfirm.value  = '';
      Toast.show('Account information saved successfully.', 'success', 3000);
    } catch (err) {
      console.error('[profile] save failed', err);
      Toast.show(err.message || 'Failed to save profile.', 'error');
    } finally {
      setLoading(btn, false);
    }
  });

  /* ── Build Security Question rows ─────────────
     6 questions. Grid is 2-column, 3-row.
     To achieve reading order 1,2,3 (left col)
     and 4,5,6 (right col), we insert in DOM order:
       1, 4, 2, 5, 3, 6
     so CSS grid auto-placement fills:
       [1][4]
       [2][5]
       [3][6]
  ─────────────────────────────────────────────── */
  const sqList     = document.getElementById('sq-list');
  const TOTAL_Q    = 6;

  // Logical indices in the visual reading order: left col first, then right
  // DOM insertion order for correct grid fill: 1,4,2,5,3,6 → indices 1,4,2,5,3,6
  const domOrder = [1, 4, 2, 5, 3, 6];

  // Create all sq-item elements keyed by logical number, then insert in domOrder
  const sqItems = {};

  for (let i = 1; i <= TOTAL_Q; i++) {
    const div = document.createElement('div');
    div.className  = 'sq-item';
    div.id         = `sq-item-${i}`;
    div.dataset.qn = i;
    div.innerHTML  = `
      <span class="sq-item__badge">Question ${i}</span>

      <div class="pf-field-group">
        <label class="pf-label" for="sq-q${i}">Security Question</label>
        <select class="sq-select" id="sq-q${i}" data-sq-index="${i}">
          ${buildQOptions()}
        </select>
      </div>

      <div class="pf-field-group">
        <label class="pf-label" for="sq-a${i}">Your Answer</label>
        <input
          type="text"
          id="sq-a${i}"
          class="pf-input"
          placeholder="Enter your answer"
          autocomplete="off"
        />
      </div>
    `;
    sqItems[i] = div;
  }

  // Append in DOM order to get correct grid column placement
  domOrder.forEach(n => sqList.appendChild(sqItems[n]));

  /* Build <option> HTML for each question select */
  function buildQOptions(selectedValue = '') {
    let html = '<option value="">— Select a question —</option>';
    SECURITY_QUESTIONS.forEach(q => {
      html += `<option value="${escHtml(q)}"${q === selectedValue ? ' selected' : ''}>${escHtml(q)}</option>`;
    });
    return html;
  }

  /* Prevent duplicates across all 6 dropdowns */
  sqList.addEventListener('change', e => {
    if (!e.target.classList.contains('sq-select')) return;
    refreshDuplicatePrevention();
  });

  function refreshDuplicatePrevention() {
    const allSelects = [...sqList.querySelectorAll('.sq-select')];
    const chosen     = allSelects.map(s => s.value).filter(Boolean);
    allSelects.forEach(sel => {
      [...sel.options].forEach(opt => {
        if (!opt.value) return;
        opt.disabled = chosen.includes(opt.value) && opt.value !== sel.value;
      });
    });
  }

  /* ── Security Questions Form Submit ──────── */
  document.getElementById('security-form').addEventListener('submit', async e => {
    e.preventDefault();

    const pairs    = [];
    let hasError   = false;

    // Validate in logical order 1→6
    for (let i = 1; i <= TOTAL_Q; i++) {
      const qEl = document.getElementById(`sq-q${i}`);
      const aEl = document.getElementById(`sq-a${i}`);
      const q   = qEl.value;
      const a   = aEl.value.trim();

      if (q && !a) {
        Toast.show(`Please provide an answer for Question ${i}.`, 'error');
        aEl.focus();
        hasError = true;
        break;
      }
      if (!q && a) {
        Toast.show(`Please select a question for row ${i}.`, 'error');
        qEl.focus();
        hasError = true;
        break;
      }
      if (q && a) pairs.push({ question: q, answer: a });
    }

    if (hasError) return;

    if (!pairs.length) {
      Toast.show('Please fill in at least one security question.', 'warning');
      return;
    }

    const btn = document.getElementById('security-save-btn');
    setLoading(btn, true);
    await delay(1000);
    setLoading(btn, false);
    Toast.show(`${pairs.length} security question${pairs.length > 1 ? 's' : ''} saved successfully.`, 'success', 3000);
  });

  /* ── Helpers ────────────────────────────── */
  function setLoading(btn, loading) {
    btn.disabled = loading;
    btn.querySelector('.btn-text').classList.toggle('hidden', loading);
    btn.querySelector('.btn-spinner').classList.toggle('hidden', !loading);
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function escHtml(str) {
    return str
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;');
  }

});