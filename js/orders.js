// Orders: save to Supabase then open wa.me with prefilled message
const ADMIN_WA_NUMBER = '201287837118'; // الإدارة (صيغة دولية: بدون +)

async function submitOrder({ items, total, phone }) {
  const SUPABASE = window.supabase;
  if (!SUPABASE) return alert('Supabase client not initialized');
  const session = JSON.parse(localStorage.getItem('sne_session') || '{}');
  const insert = {
    user_id: session.userId || null,
    phone: phone || session.phone || null,
    items: items || {},
    total: total || 0
  };
  const { data, error } = await SUPABASE.from('orders').insert(insert).select().single();
  if (error) {
    console.error('Insert order error', error);
    alert('حدث خطأ أثناء حفظ الطلب');
    return;
  }
  // build WhatsApp link and open
  const text = encodeURIComponent(`طلب جديد\nالعميل: ${insert.phone}\nالتفاصيل: ${JSON.stringify(insert.items)}\nالاجمالي: ${insert.total}`);
  const waLink = `https://wa.me/${ADMIN_WA_NUMBER}?text=${text}`;
  window.open(waLink, '_blank');
}
