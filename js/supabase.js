/*==================================================
    SN ELECTRIC | Supabase Connection & DB
==================================================*/

const SUPABASE_URL = "https://kdhcoohuoferpobccpwo.supabase.co";
const SUPABASE_ANON_KEY = window.SNELECTRIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_ANON_KEY) {
    console.warn('Supabase anon key is not set. Create js/config.js and add window.SNELECTRIC_SUPABASE_ANON_KEY');
}

if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
    if (SUPABASE_ANON_KEY) {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.warn('Supabase library loaded but ANON KEY missing.');
    }
} else {
    console.error('Supabase SDK not loaded properly.');
}
