/* ============================================
   AMIS – Supabase configuration (LOCAL)
   ============================================
   1. Copy this file to  common/config.js
   2. Fill in your project URL and anon key from
      Supabase Dashboard → Project Settings → API.
   3. common/config.js is git-ignored so real keys
      never end up in the repo. The anon key is
      safe to expose in the browser as long as
      Row-Level Security is enabled (see db/02_rls.sql).
   ============================================ */
window.AMIS_CONFIG = {
  SUPABASE_URL:  'https://YOUR-PROJECT-REF.supabase.co',
  SUPABASE_ANON: 'YOUR-ANON-PUBLIC-KEY'
};
