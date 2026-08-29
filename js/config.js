// إعدادات الاتصال بـ Supabase الخاصة بمشروع SN ELECTRIC
const SUPABASE_URL = "https://kdhcoohuoferpobccpwo.supabase.co";
const SUPABASE_ANON_KEY = "EyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaGNvb2h1b2ZlcnBvYmNjcHdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTc4MDYsImV4cCI6MjEwMDM3MzgwNn0.fyNmGIH-7G1I79TzBZN1d_akborKFgsJFAdDuDt72E8";

// تهيئة العميل للاتصال بقاعدة البيانات
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
