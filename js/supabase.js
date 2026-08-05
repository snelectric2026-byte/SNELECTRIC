/*==================================================
    SN ELECTRIC | Supabase Connection & DB
==================================================*/
const SUPABASE_URL = "https://bhqgrrjjgzikhbrzgkju.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaGNvb2h1b2ZlcnBvYmNjcHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTc4MDYsImV4cCI6MjEwMDM3MzgwNn0.fyNmGIH-7G1I79TzBZN1d_akborKFgsJFAdDuDt72E8";

if (window.supabase && typeof window.supabase.createClient === 'function') {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.warn("Supabase library not loaded correctly.");
}
