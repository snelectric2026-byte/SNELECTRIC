// فتح وإغلاق النافذة المنبثقة للنماذج
function openForm(serviceName) {
    document.getElementById('formTitle').innerText = serviceName;
    document.getElementById('formModal').style.display = 'block';
}

function closeForm() {
    document.getElementById('formModal').style.display = 'none';
}

// دالة التحكم بإرسال النموذج، الحفظ بالفيسباس أولاً ثم تحويل الواتساب
async function handleFormSubmit(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const address = document.getElementById('customerAddress').value;
    const serviceTitle = document.getElementById('formTitle').innerText;

    if (!name || !phone || !address) {
        alert("يرجى ملء جميع البيانات المطلوبة");
        return;
    }

    // تعطيل الزر لمنع الإرسال المكرر
    submitBtn.disabled = true;
    submitBtn.innerText = "جاري حفظ الطلب...";

    try {
        // 1. الحفظ في قاعدة البيانات Supabase أولاً
        const { data, error } = await supabaseClient
            .from('service_requests')
            .insert([
                { 
                    customer_name: name, 
                    phone_number: phone, 
                    address: address, 
                    service_type: serviceTitle,
                    status: 'pending' 
                }
            ]);

        if (error) throw error;

        alert("تم تسجيل طلبك بنجاح وسيتواصل معك المسؤول لإتمامه!");

        // 2. تحويل اختياري إلى الواتساب عبر رابط متصفح آمن دون إجبار التطبيق
        const textMessage = `طلب جديد:\nالاسم: ${name}\nالهاتف: ${phone}\nالخدمة: ${serviceTitle}\nالعنوان: ${address}`;
        const waUrl = `https://web.whatsapp.com/send?phone=201287837118&text=${encodeURIComponent(textMessage)}`;
        
        // فتح الواتساب في نافذة جديدة
        window.open(waUrl, '_blank');

        closeForm();
        document.getElementById('serviceForm').reset();

    } catch (err) {
        console.error("Supabase Save Error:", err);
        alert("تعذر حفظ الطلب في قاعدة البيانات. التأكد من الاتصال أو إعدادات Supabase: " + (err.message || err));
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "تسجيل الطلب والإرسال";
    }
}

// التبديل لعرض الشات
function toggleChat() {
    const chatBox = document.getElementById('chatBox');
    chatBox.style.display = (chatBox.style.display === 'none' || !chatBox.style.display) ? 'block' : 'none';
}
