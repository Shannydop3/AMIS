/* ============================================
   AMIS – Operation Module: Thin Router
   operation-module.js

   All sub-view data lives in ops/*.js files.
   This file only: reads the URL, looks up the
   view in window.OP_VIEWS, and calls onLoad().
   ============================================ */

(function () {
  'use strict';

  var landing   = document.getElementById('op-landing');
  var contentCard = document.getElementById('op-content-card');
  var container   = document.getElementById('op-content-container');
  var pageTitle   = document.getElementById('op-page-title');
  var pageSub     = document.getElementById('op-page-sub');

  var currentKey  = null;

  /* ── Load a sub-view ────────────────────── */
  async function loadOp(key) {
    var view = (window.OP_VIEWS || {})[key];
    if (!view) {
      Toast.show('Operation "' + key + '" not found.', 'error');
      return;
    }

    /* Unload previous */
    if (currentKey && currentKey !== key) {
      var prev = (window.OP_VIEWS || {})[currentKey];
      if (prev && typeof prev.onUnload === 'function') prev.onUnload();
    }
    currentKey = key;

    /* Update page header */
    pageTitle.textContent = view.label;
    pageSub.textContent   = (view.group || '') + (view.group ? ' › ' : '') + view.label;
    document.title        = 'AMIS \u2013 ' + view.label + ' | DICT';

    /* Update breadcrumb in layout */
    var breadcrumb = document.getElementById('page-title');
    if (breadcrumb) breadcrumb.textContent = view.label;

    /* Show content card, hide landing */
    landing.style.display      = 'none';
    contentCard.style.display  = '';

    /* Ensure Supabase reference dropdowns are ready before rendering the form. */
    try {
      if (typeof _OP_bootstrapRefs === 'function') await _OP_bootstrapRefs();
    } catch (e) { console.warn('[op] refs bootstrap failed', e); }

    /* Clear container and call onLoad */
    container.innerHTML = '';
    try {
      if (typeof view.onLoad === 'function') view.onLoad(container);
    } catch (err) {
      console.error('[op] onLoad failed for ' + key, err);
      container.innerHTML = '<div style="padding:16px;color:#b91c1c;">Failed to render this operation: ' + (err.message || err) + '</div>';
    }

    /* Scroll to top of content */
    var pageContent = document.getElementById('page-content');
    if (pageContent) pageContent.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ── Auto-load from URL ?op=KEY ────────── */
  document.addEventListener('amis:layout-ready', function () {
    Auth.requireAuth('../login/login.html');

    var params = new URLSearchParams(window.location.search);
    var opKey  = params.get('op');
    if (opKey) {
      loadOp(opKey);
    }
  });

  /* ── Global API for programmatic switching ── */
  window.OP_LOAD = loadOp;

}());
