/*==================================================
    SN ELECTRIC | Supabase Connection & DB
==================================================*/
const SUPABASE_URL = "https://bhqgrrjjgzikhbrzgkju.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

if (window.supabase && typeof window.supabase.createClient === 'function') {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.warn("Supabase library not loaded correctly.");
}
