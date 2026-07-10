/* ============================================
   AMIS – Supabase client wrapper
   Loaded on every page BEFORE common.js / layout.js.
   Exposes:
     window.AMIS_DB    – Supabase JS client (or null if not configured)
     window.AMIS_READY – Promise that resolves when the client is available
   ============================================ */
'use strict';

(function () {
  const cfg = window.AMIS_CONFIG;

  if (!cfg || !cfg.SUPABASE_URL || cfg.SUPABASE_URL.includes('YOUR-PROJECT-REF')) {
    console.warn('[amis] common/config.js is missing or unfilled. ' +
                 'Copy common/config.example.js → common/config.js and paste your Supabase URL + anon key.');
    window.AMIS_DB    = null;
    window.AMIS_READY = Promise.resolve(null);
    return;
  }

  // Dynamic ESM import of the official Supabase JS client (v2).
  window.AMIS_READY = import('https://esm.sh/@supabase/supabase-js@2')
    .then(mod => {
      const client = mod.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON, {
        auth: {
          persistSession:   true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: window.localStorage,
          storageKey: 'amis.auth'
        }
      });
      window.AMIS_DB = client;
      return client;
    })
    .catch(err => {
      console.error('[amis] Failed to load Supabase client:', err);
      window.AMIS_DB = null;
      return null;
    });
})();
