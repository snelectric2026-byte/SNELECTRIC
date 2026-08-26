/*==================================================
    SN ELECTRIC | Supabase Connection & DB
==================================================*/

// NOTE: For security, do NOT commit your actual SUPABASE_ANON_KEY to a public repo.
// You can provide the anon key at runtime by creating a small file js/config.js that sets
// window.SNELECTRIC_SUPABASE_ANON_KEY = 'your_anon_key_here';

const SUPABASE_URL = "https://kdhcoohuoferpobccpwo.supabase.co";
const SUPABASE_ANON_KEY = window.SNELECTRIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_ANON_KEY) {
    console.warn('Supabase anon key is not set. Create js/config.js and add: window.SNELECTRIC_SUPABASE_ANON_KEY = "<eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaGNvb2h1b2ZlcnBvYmNjcHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTc4MDYsImV4cCI6MjEwMDM3MzgwNn0.fyNmGIH-7G1I79TzBZN1d_akborKFgsJFAdDuDt72E8>";');
}

if (window.supabase && typeof window.supabase.createClient === 'function' && SUPABASE_ANON_KEY) {
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    // expose the client under common names
    window.supabase = client;
    window.supabaseClient = client;
    var supabase = client;
} else if (!SUPABASE_ANON_KEY) {
    // library may be loaded but key missing
    console.warn('Supabase library loaded but ANON KEY missing: database calls will be disabled until key is provided.');
} else {
    console.error('Supabase library not loaded correctly or createClient is not available.');
}
