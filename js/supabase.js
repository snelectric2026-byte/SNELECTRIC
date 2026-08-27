// Initialize Supabase client dynamically. Exports a global `supabase` object.
// name=js/supabase.js

(async function initSupabase(){
  try {
    let createClient;
    // Try dynamic import of ESM build
    try {
      const mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
      createClient = mod.createClient;
    } catch (e) {
      console.warn('ESM import failed, trying global createClient if available', e);
      createClient = window.createClient || null;
    }

    if (!createClient) {
      console.error('Could not load supabase client. Make sure your browser supports dynamic import and you have network access.');
      return;
    }

    const url = window.SNELECTRIC_SUPABASE_URL || (window.location.hostname.includes('localhost') ? '' : 'https://<YOUR_PROJECT_REF>.supabase.co');
    const key = window.SNELECTRIC_SUPABASE_ANON_KEY || '';
    if (!url || !key) {
      console.warn('Supabase URL or ANON KEY not found. Create js/config.js with window.SNELECTRIC_SUPABASE_URL and window.SNELECTRIC_SUPABASE_ANON_KEY');
    }

    window.supabase = createClient(url, key);
    console.info('Supabase client initialized');
  } catch (err) {
    console.error('Failed to init supabase', err);
  }
})();
