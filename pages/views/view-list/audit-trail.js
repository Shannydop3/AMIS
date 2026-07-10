/* ── Audit Trail ─────────────────────────────── */
(function () {
  'use strict';
  window.VIEW_VIEWS = window.VIEW_VIEWS || {};

  const HOST = '_at_host';
  const allData = [
    { user: 'BERNA JOY MONTEMAYOR', activity: 'Log In Successful',     date: '5/7/2026 2:49:12 PM',  ip: '162.158.249.165' },
    { user: 'BERNA JOY MONTEMAYOR', activity: 'Session Time out',       date: '5/7/2026 2:48:50 PM',  ip: '126.209.58.10' },
    { user: 'BERNA JOY MONTEMAYOR', activity: 'Log In Successful',     date: '5/7/2026 2:14:51 PM',  ip: '126.209.58.10' },
    { user: 'BERNA JOY MONTEMAYOR', activity: 'Log out Successful',    date: '5/7/2026 2:05:21 PM',  ip: '126.209.58.10' },
    { user: 'BERNA JOY MONTEMAYOR', activity: 'Log In Successful',     date: '5/7/2026 1:23:35 PM',  ip: '126.209.58.10' },
    { user: 'BERNA JOY MONTEMAYOR', activity: 'Login attempt failed.', date: '5/7/2026 1:23:11 PM',  ip: '126.209.58.10' },
    { user: 'Christian Lugue',       activity: 'Log out Successful',    date: '5/7/2026 11:11:26 AM', ip: '126.209.58.10' },
    { user: 'BERNA JOY MONTEMAYOR', activity: 'Log out Successful',    date: '5/7/2026 9:35:25 AM',  ip: '126.209.58.10' },
    { user: 'BERNA JOY MONTEMAYOR', activity: 'Log In Successful',     date: '5/7/2026 9:00:24 AM',  ip: '126.209.58.10' },
    { user: 'BERNA JOY MONTEMAYOR', activity: 'Log out Successful',    date: '5/7/2026 8:59:39 AM',  ip: '126.209.58.10' },
    { user: 'BERNA JOY MONTEMAYOR', activity: 'Log In Successful',     date: '5/7/2026 8:53:05 AM',  ip: '126.209.58.10' },
    { user: 'BERNA JOY MONTEMAYOR', activity: 'Log out Successful',    date: '5/7/2026 8:52:02 AM',  ip: '126.209.58.10' },
    { user: 'Christian Lugue',       activity: 'Log In Successful',     date: '5/7/2026 8:39:17 AM',  ip: '126.209.58.10' },
    { user: 'Christian Lugue',       activity: 'Login attempt failed.', date: '5/7/2026 8:39:10 AM',  ip: '126.209.58.10' },
    { user: 'BERNA JOY MONTEMAYOR', activity: 'Log In Successful',     date: '5/7/2026 8:22:10 AM',  ip: '126.209.58.10' },
  ];

  let filtered = [], page = 1;
  const PAGE = 15;
  let _listeners = [];
  function on(el, evt, fn) { el.addEventListener(evt, fn); _listeners.push({ el, evt, fn }); }

  function activityBadge(activity) {
    if (activity.includes('failed'))   return `<span class="v-pill" style="background:#fee2e2;color:#b91c1c;">${activity}</span>`;
    if (activity.includes('out'))      return `<span class="v-pill" style="background:#fef3c7;color:#92400e;">${activity}</span>`;
    if (activity.includes('In'))       return `<span class="v-pill" style="background:#dcfce7;color:#15803d;">${activity}</span>`;
    return `<span class="v-pill" style="background:#f3f4f6;color:#374151;">${activity}</span>`;
  }

  function renderTable() {
    const tbody = document.getElementById('views-tbody');
    if (!tbody) return;
    const start = (page - 1) * PAGE;
    const slice = filtered.slice(start, start + PAGE);
    if (!slice.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="dash-empty">No data available in table</td></tr>`;
      VH.updateShowing([], 1, PAGE); return;
    }
    tbody.innerHTML = slice.map(r => `<tr>
      <td>${VH.idBadge(r.user)}</td>
      <td>${activityBadge(r.activity)}</td>
      <td style="font-size:12px;color:var(--text-secondary);white-space:nowrap;">${r.date}</td>
      <td style="font-family:monospace;font-size:12px;">${r.ip}</td>
    </tr>`).join('');
    VH.updateShowing(filtered, page, PAGE);
  }

  function onLoad() {
    filtered = [...allData]; page = 1;
    const df = document.getElementById('views-date-from');
    const dt = document.getElementById('views-date-to');
    if (df) df.value = '2026-05-07'; if (dt) dt.value = '2026-05-07';
    const thead = document.getElementById('views-thead');
    if (thead) thead.innerHTML = `<tr>
      <th>USER</th><th>ACTIVITY</th><th>DATE</th><th>IP ADDRESS</th>
    </tr>`;
    renderTable();
    const searchEl = document.getElementById('views-search');
    if (searchEl) on(searchEl, 'input', () => {
      const q = searchEl.value.toLowerCase();
      filtered = q ? allData.filter(r => Object.values(r).join(' ').toLowerCase().includes(q)) : [...allData];
      page = 1; renderTable();
    });
  }

  function onUnload() {
    _listeners.forEach(({ el, evt, fn }) => el.removeEventListener(evt, fn));
    _listeners = []; filtered = [];
    const h = document.getElementById(HOST); if (h) h.remove();
  }

  window.VIEW_VIEWS['audit-trail'] = {
    label: 'Audit Trail', group: 'Reports', hasDateBar: true,
    filterFields: ['UserName', 'Activity', 'Date', 'IPAddress'],
    columns: ['User', 'Activity', 'Date', 'IP Address'],
    onLoad, onUnload,
  };
}());
