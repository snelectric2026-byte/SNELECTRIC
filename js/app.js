document.addEventListener('DOMContentLoaded', () => {
    loadTechnicians();
});

// فتح وإغلاق نماذج الطلب
function openForm(serviceName) {
    document.getElementById('formTitle').innerText = serviceName;
    document.getElementById('formModal').style.display = 'block';
}

function closeForm() {
    document.getElementById('formModal').style.display = 'none';
}

function openTechForm() {
    document.getElementById('techModal').style.display = 'block';
}

function closeTechForm() {
    document.getElementById('techModal').style.display = 'none';
}

// 1. تقديم طلب خدمة عميل (مُصحح بالكامل بدون أخطاء)
async function handleFormSubmit(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const address = document.getElementById('customerAddress').value.trim();
    const serviceTitle = document.getElementById('formTitle').innerText;

    submitBtn.disabled = true;
    submitBtn.innerText = "جاري الحفظ...";

    try {
        const payload = {
            customer_name: name,
            customer_phone: phone,
            phone_number: phone,
            address: address,
            service_type: serviceTitle,
            status: 'قيد الانتظار'
        };

        const { data, error } = await supabaseClient
            .from('service_requests')
            .insert([payload]);

        if (error) throw error;

        alert("تم إرسال طلبك بنجاح وحفظه في لوحة التحكم!");

        const textMessage = `طلب جديد:\nالاسم: ${name}\nالهاتف: ${phone}\nالخدمة: ${serviceTitle}\nالعنوان: ${address}`;
        window.open(`https://api.whatsapp.com/send?phone=201287837118&text=${encodeURIComponent(textMessage)}`, '_blank');

        closeForm();
        document.getElementById('serviceForm').reset();

    } catch (err) {
        alert("خطأ في حفظ الطلب: " + (err.message || err));
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "تسجيل الطلب والإرسال";
    }
}

// 2. التقديم كفني
async function handleTechSubmit(event) {
    event.preventDefault();

    const btn = document.getElementById('techSubmitBtn');
    const name = document.getElementById('techName').value.trim();
    const phone = document.getElementById('techPhone').value.trim();
    const specialty = document.getElementById('techSpecialty').value.trim();
    const area = document.getElementById('techArea').value.trim();

    btn.disabled = true;

    try {
        const { error } = await supabaseClient
            .from('technicians')
            .insert([{ name, phone, specialty, area, status: 'pending' }]);

        if (error) throw error;

        alert("تم إرسال طلب انضمامك كفني بنجاح! سيتم مراجعة طلبك من قبل الإدارة.");
        closeTechForm();
        document.getElementById('techForm').reset();
    } catch (err) {
        alert("حدث خطأ أثناء التقديم: " + err.message);
    } finally {
        btn.disabled = false;
    }
}

// 3. جلب وعرض الفنيين المسجلين في الرئيسية
async function loadTechnicians() {
    const container = document.getElementById('techniciansContainer');
    if (!container || typeof supabaseClient === 'undefined') return;

    try {
        const { data, error } = await supabaseClient
            .from('technicians')
            .select('*');

        if (error || !data || data.length === 0) {
            container.innerHTML = `<div style="color:#aaa; text-align:center; grid-column:1/-1;">لا يوجد فنيون مسجلون حالياً</div>`;
            return;
        }

        container.innerHTML = '';
        data.forEach(tech => {
            const card = document.createElement('div');
            card.className = 'service-card';
            card.innerHTML = `
                <i class="fa-solid fa-user-gear" style="color:#3498db;"></i>
                <h3>${tech.name}</h3>
                <p><strong>التخصص:</strong> ${tech.specialty || 'كهربائي متكامل'}</p>
                <p><strong>المنطقة:</strong> ${tech.area || 'غير محدد'}</p>
                <a href="https://wa.me/2${tech.phone}" target="_blank" class="btn-service" style="background:#2ecc71; color:#fff; text-decoration:none; display:block; margin-top:10px;">تواصل مع الفني</a>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        container.innerHTML = `<div style="color:#aaa; text-align:center; grid-column:1/-1;">تعذر جلب الفنيين</div>`;
    }
}

// 4. المحادثة والمساعد الذكي (نواة الرد الآلي)
function toggleChat() {
    const chatBox = document.getElementById('chatBox');
    chatBox.style.display = (chatBox.style.display === 'none' || !chatBox.style.display) ? 'block' : 'none';
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;

    const chatBody = document.getElementById('chatBody');
    
    // رسالة العميل
    const userDiv = document.createElement('div');
    userDiv.style.cssText = "background:rgba(241, 196, 15, 0.2); color:#f1c40f; padding:8px; border-radius:6px; align-self:flex-end; max-width:80%;";
    userDiv.innerText = msg;
    chatBody.appendChild(userDiv);

    input.value = '';

    // رد آلي مؤقت (سندمجه مع الذكاء الاصطناعي لاحقاً)
    setTimeout(() => {
        const aiDiv = document.createElement('div');
        aiDiv.style.cssText = "background:rgba(255,255,255,0.05); padding:8px; border-radius:6px; align-self:flex-start; max-width:80%;";
        aiDiv.innerText = getAiResponse(msg);
        chatBody.appendChild(aiDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 600);
}

function getAiResponse(text) {
    if (text.includes("أسعار") || text.includes("سعر") || text.includes("تكلفة")) {
        return "تختلف التكلفة بحسب المساحة ونوع الخدمة. يمكنك تقديم طلب معاينة مجانية عبر الموقع لمعرفة التكلفة الدقيقة.";
    } else if (text.includes("شقة") || text.includes("تأسيس")) {
        return "نحن بنقدم تأسيس كهرباء الشقق بأعلى المعايير، وبتشمل تمديد المواسير، وعلب الماجيك، وشبكة الداتا والصوت.";
    } else {
        return "أهلاً بك! يمكنك اختيار إحدى الخدمات من الصفحة وتحديد طلبك، أو ترك رقمك وسيقوم المهندس المسؤول بالتواصل معك فوراً.";
    }
}
