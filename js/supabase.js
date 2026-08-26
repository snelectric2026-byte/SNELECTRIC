/*==================================================
    SN ELECTRIC | Supabase Connection & DB
==================================================*/

// NOTE: For security, do NOT commit your actual SUPABASE_ANON_KEY to a public repo.
// Provide the anon key at runtime by creating js/config.js that sets:
//   window.SNELECTRIC_SUPABASE_ANON_KEY = 'your_anon_key_here';
// and add js/config.js to .gitignore

const SUPABASE_URL = "https://kdhcoohuoferpobccpwo.supabase.co";
const SUPABASE_ANON_KEY = window.SNELECTRIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_ANON_KEY) {
    console.warn('Supabase anon key is not set. Create js/config.js and add: window.SNELECTRIC_SUPABASE_ANON_KEY = "<YOUR_ANON_KEY_HERE>"; (do NOT commit keys to the repo)');
}

if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
    if (SUPABASE_ANON_KEY) {
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        // expose the client under common names
        window.supabase = client;
        window.supabaseClient = client;
        // local reference if needed
        const supabaseClientLocal = client;
    } else {
        // library loaded but key missing
        console.warn('Supabase library loaded but ANON KEY missing: database calls will be disabled until key is provided.');
    }
} else {
    // library not available
    if (SUPABASE_ANON_KEY) {
        console.error('Supabase library not loaded correctly or createClient is not available.');
    } else {
        console.error('Supabase library not loaded and ANON KEY missing. Load the supabase script and provide the anon key.');
    }
}
