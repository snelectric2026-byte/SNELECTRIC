// عند تحميل الصفحة، يتم فحص ما إذا كان العميل قادماً عبر رابط واتساب أو مسجلاً مسبقاً
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    let phoneFromURL = urlParams.get('phone');

    if (phoneFromURL) {
        // حفظ رقم الهاتف تلقائياً دون الحاجة لتسجيل حساب مسبق
        localStorage.setItem('client_phone', phoneFromURL);
        checkClientChatAccess(phoneFromURL);
    } else {
        let savedPhone = localStorage.getItem('client_phone');
        if (savedPhone) {
            checkClientChatAccess(savedPhone);
        }
    }
});

// التحقق من حالة الطلب في قاعدة البيانات (Supabase)
async function checkClientChatAccess(customerPhone) {
    if (!window.supabaseClient || !customerPhone) return;

    try {
        const { data, error } = await window.supabaseClient
            .from('service_requests')
            .select('status')
            .eq('customer_phone', customerPhone)
            .single();

        // إذا كانت الحالة "موافقة"، يتم إظهار زر محادثة المشروع الآمنة وجلب الأرشيف
        if (data && data.status === 'موافقة') {
            showSecureChatButton();
            loadChatMessages(customerPhone);
        }
    } catch (err) {
        console.log('Access check note:', err);
    }
}

// إظهار زر محادثة الموقع الحصري للعميل المعتمد
function showSecureChatButton() {
    let container = document.getElementById('floatingSecureChatContainer');
    if (container && !document.getElementById('secureChatToggleBtn')) {
        container.innerHTML = `<button id="secureChatToggleBtn" onclick="toggleApprovedChat()" style="position: fixed; bottom: 25px; left: 25px; background: var(--accent); color: var(--dark); border: none; padding: 12px 20px; border-radius: 30px; font-weight: 800; cursor: pointer; box-shadow: 0 5px 20px rgba(0,0,0,0.5); z-index: 999;"><i class="fa-solid fa-lock"></i> محادثة المشروع الآمنة</button>`;
    }
}

// إرسال وحفظ رسالة العميل في قاعدة البيانات مباشرة
async function sendApprovedMessage() {
    const input = document.getElementById('approvedChatInput');
    const text = input.value.trim();
    const customerPhone = localStorage.getItem('client_phone');

    if (!text || !customerPhone) return;

    appendApprovedMessage(text, 'outgoing');
    input.value = '';

    if (window.supabaseClient) {
        try {
            await window.supabaseClient.from('project_messages').insert([
                {
                    customer_phone: customerPhone,
                    message_text: text,
                    sender_type: 'client',
                    sent_at: new Date().toISOString()
                }
            ]);
        } catch (e) {
            console.log('Error saving message to DB:', e);
        }
    }
}

// جلب رسائل المشروع السابقة وعرضها داخل الدردشة
async function loadChatMessages(customerPhone) {
    if (!window.supabaseClient) return;

    try {
        const { data } = await window.supabaseClient
            .from('project_messages')
            .select('*')
            .eq('customer_phone', customerPhone)
            .order('sent_at', { ascending: true });

        const body = document.getElementById('approvedChatBody');
        if (data && data.length > 0 && body) {
            body.innerHTML = '';
            data.forEach(msg => {
                let senderClass = msg.sender_type === 'client' ? 'outgoing' : 'incoming';
                appendApprovedMessage(msg.message_text, senderClass);
            });
        }
    } catch (err) {
        console.log('Error loading messages:', err);
    }
}

// رسم الرسالة في الواجهة (صندوق الدردشة)
function appendApprovedMessage(text, sender) {
    const body = document.getElementById('approvedChatBody');
    if (!body) return;
    const div = document.createElement('div');
    div.className = `chat-message ${sender}`;
    div.style.cssText = sender === 'outgoing' 
        ? 'background: var(--accent); color: var(--dark); padding: 8px 12px; border-radius: 8px; max-width: 80%; align-self: flex-end; font-weight: 600;' 
        : 'background: rgba(255,255,255,0.1); color: #fff; padding: 8px 12px; border-radius: 8px; max-width: 80%; align-self: flex-start;';
    div.innerText = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
}

// تبديل إظهار وإخفاء صندوق المحادثة
function toggleApprovedChat() {
    const chat = document.getElementById('approvedChatWidget');
    if (chat) {
        chat.style.display = chat.style.display === 'flex' ? 'none' : 'flex';
    }
}

// دالة لوحة التحكم (لاعتماد الطلب وإرسال رابط المحادثة الآمنة عبر واتساب)
async function approveClientRequest(requestId, clientPhone) {
    if (!window.supabaseClient) return;

    try {
        const { error } = await window.supabaseClient
            .from('service_requests')
            .update({ status: 'موافقة' })
            .eq('id', requestId);

        if (error) {
            alert('حدث خطأ أثناء تحديث حالة الطلب: ' + error.message);
            return;
        }

        alert('✓ تم اعتماد الطلب بنجاح وتفعيل نظام المحادثة الآمنة للعميل!');
        
        let secureChatLink = `${window.location.origin}/index.html?phone=${clientPhone}`;
        let whatsappMsg = `مرحباً بك في SN ELECTRIC! تم اعتماد اتفاقنا رسمياً. حفاظاً على سرية وخصوصية المشروع، يمكنك الآن متابعة كافة تفاصيل العمل والمحادثات حصرياً من هنا: ${secureChatLink}`;
        
        window.open(`https://wa.me/${clientPhone}?text=${encodeURIComponent(whatsappMsg)}`, '_blank');

        if (typeof loadRequestsData === 'function') loadRequestsData();

    } catch (err) {
        console.error('Approval error:', err);
    }
}
