// Admin JS: simple list, delete, toggle status
async function loadOrders() {
  const SUPABASE = window.supabase;
  if (!SUPABASE) return document.getElementById('status').innerText = 'Supabase client not initialized';
  const { data, error } = await SUPABASE.from('orders').select('*').order('created_at', { ascending: false }).limit(200);
  if (error) { document.getElementById('status').innerText = 'خطأ في جلب الطلبات'; console.error(error); return; }
  const tbody = document.querySelector('#orders-table tbody');
  tbody.innerHTML = '';
  data.forEach((o, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i+1}</td><td>${o.phone || ''}</td><td><pre>${JSON.stringify(o.items)}</pre></td><td>${o.total}</td><td>${o.status}</td><td>${o.whatsapp_sent}</td><td>
      <button data-id="${o.id}" class="del">حذف</button>
      <button data-id="${o.id}" class="toggle">تبديل حالة</button>
    </td>`;
    tbody.appendChild(tr);
  });
  document.querySelectorAll('.del').forEach(b=>b.addEventListener('click', async (e)=>{
    const id = e.target.dataset.id; if(!confirm('حذف الطلب؟')) return;
    await SUPABASE.from('orders').delete().eq('id', id);
    await loadOrders();
  }));
  document.querySelectorAll('.toggle').forEach(b=>b.addEventListener('click', async (e)=>{
    const id = e.target.dataset.id;
    const row = data.find(r=>r.id===id);
    const newStatus = row.status === 'new' ? 'handled' : 'new';
    await SUPABASE.from('orders').update({ status: newStatus }).eq('id', id);
    await loadOrders();
  }));
}
