// Simple auth by phone (no OTP). Creates user if missing and a session stored in localStorage
async function loginWithPhone(phone, display_name) {
  const SUPABASE = window.supabase;
  if (!SUPABASE) throw new Error('Supabase client not initialized');
  // try to find existing user
  const { data: existing, error: err1 } = await SUPABASE.from('users').select('*').eq('phone', phone).maybeSingle();
  if (err1) console.warn(err1);
  let user = existing;
  if (!user) {
    const { data, error } = await SUPABASE.from('users').insert({ phone, display_name }).select().single();
    if (error) { console.error(error); throw error; }
    user = data;
  }
  // create session id locally and upsert to sessions table
  const sessionId = Math.random().toString(36).slice(2) + Date.now();
  await SUPABASE.from('sessions').upsert({ id: sessionId, user_id: user.id, last_active: new Date().toISOString() });
  localStorage.setItem('sne_session', JSON.stringify({ sessionId, userId: user.id, phone }));
  return user;
}
