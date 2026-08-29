// فتح وإغلاق النافذة المنبثقة للنماذج
function openForm(serviceName) {
    document.getElementById('formTitle').innerText = serviceName;
    document.getElementById('formModal').style.display = 'block';
}

function closeForm() {
    document.getElementById('formModal').style.display = 'none';
}

// دالة التعامل مع تقديم النموذج وحفظ البيانات في Supabase
async function handleFormSubmit(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const address = document.getElementById('customerAddress').value.trim();
    const serviceTitle = document.getElementById('formTitle').innerText;

    if (!name || !phone || !address) {
        alert("يرجى ملء جميع البيانات المطلوبة (الاسم، رقم الهاتف، والعنوان)");
        return;
    }

    // تعطيل الزر أثناء المعالجة
    submitBtn.disabled = true;
    submitBtn.innerText = "جاري حفظ الطلب...";

    try {
        // إرسال كائن البيانات كاملاً لتغطية جميع مسميات الأعمدة المتوقعة في قاعدة البيانات
        const payload = {
            customer_name: name,
            customer_phone: phone,
            phone_number: phone,
            phone: phone,
            address: address,
            service_type: serviceTitle,
            service_name: serviceTitle,
            status: 'قيد الانتظار',
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabaseClient
            .from('service_requests')
            .insert([payload]);

        if (error) throw error;

        alert("تم تسجيل طلبك بنجاح وسيتواصل معك الفريق الفني لإتمامه!");

        // تجهيز نص رسالة الواتساب التفصيلية
        const textMessage = `طلب خدمة جديد من الموقع:\n\n` +
                            `👤 الاسم: ${name}\n` +
                            `📞 الهاتف: ${phone}\n` +
                            `🛠️ الخدمة المطلوبة: ${serviceTitle}\n` +
                            `📍 العنوان: ${address}\n` +
                            `⏰ التاريخ: ${new Date().toLocaleDateString('ar-EG')}`;

        const waUrl = `https://api.whatsapp.com/send?phone=201287837118&text=${encodeURIComponent(textMessage)}`;
        
        // فتح الواتساب في نافذة جديدة
        window.open(waUrl, '_blank');

        closeForm();
        document.getElementById('serviceForm').reset();

    } catch (err) {
        console.error("Supabase Save Error:", err);
        alert("تعذر حفظ الطلب في قاعدة البيانات: " + (err.message || err));
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "تسجيل الطلب والإرسال";
    }
}

// التبديل لعرض وإخفاء الشات
function toggleChat() {
    const chatBox = document.getElementById('chatBox');
    chatBox.style.display = (chatBox.style.display === 'none' || !chatBox.style.display) ? 'block' : 'none';
}
