// تهيئة الاتصال بقاعدة بيانات Supabase
let db = null;
if (typeof supabase !== 'undefined' && typeof SUPABASE_URL !== 'undefined' && typeof SUPABASE_KEY !== 'undefined') {
    db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

const ADMIN_WHATSAPP = "201287837118"; // رقم الواتساب الخاص بالتحويل

document.addEventListener('DOMContentLoaded', () => {
    loadApprovedTechnicians();
});

// 1. فتح وإغلاق النوافذ المنبثقة
function openTasissModal(type) {
    document.getElementById('tasissType').value = type;
    document.getElementById('tasissTitle').innerText = 'تأسيس ' + type;
    document.getElementById('tasissModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}
function closeTasissModal() {
    document.getElementById('tasissModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function openApplianceModal(appliance) {
    document.getElementById('applianceType').value = appliance;
    document.getElementById('applianceTitle').innerText = 'صيانة ' + appliance;
    document.getElementById('applianceModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}
function closeApplianceModal() {
    document.getElementById('applianceModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function openTechModal() {
    document.getElementById('techModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}
function closeTechModal() {
    document.getElementById('techModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 2. إرسال طلب التأسيس (حفظ في Supabase + تحويل للواتساب)
async function handleTasissSubmit(e) {
    e.preventDefault();
    const type = document.getElementById('tasissType').value;
    const name = document.getElementById('tName').value.trim();
    const phone = document.getElementById('tPhone').value.trim();
    const address = document.getElementById('tAddress').value.trim();
    const boxes = document.getElementById('tBoxes').value;
    const lines = document.getElementById('tLines').value;
    const panels = document.getElementById('tPanels').value;
    const supply = document.getElementById('tSupplyType').value;

    const notes = `تأسيس ${type} | علب: ${boxes} | لينيات: ${lines} | لوح: ${panels} | نظام الإمداد: ${supply}`;

    // 1. التخزين في قاعدة البيانات للأدمن
    try {
        if (db) {
            await db.from('service_requests').insert([{
                customer_name: name, customer_phone: phone, address: address, service_type: 'تأسيس ' + type, notes: notes, status: 'قيد الانتظار'
            }]);
        }
    } catch (err) {
        console.error("خطأ في قاعدة البيانات:", err);
    }

    closeTasissModal();

    // 2. التحويل المباشر للواتساب
    const msg = `🏗️ *طلب تأسيس جديد (SN ELECTRIC)*%0a` +
                `----------------------------------%0a` +
                `👤 *الاسم:* ${name}%0a` +
                `📞 *الهاتف:* ${phone}%0a` +
                `📍 *العنوان:* ${address}%0a` +
                `🛠️ *النوع:* تأسيس ${type}%0a` +
                `📦 *التفاصيل:* علب (${boxes}) - لينيات (${lines}) - لوح (${panels}) - إمداد (${supply})`;

    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${msg}`, '_blank');
}

// 3. تحويل صورة عطل الكهرباء
function processFaultImage() {
    const fileInput = document.getElementById('electricFaultImg');
    if (!fileInput.files || fileInput.files.length === 0) {
        alert('يرجى اختيار صورة العطل أولاً.');
        return;
    }

    const file = fileInput.files[0];
    const refCode = 'SN-FAULT-' + Math.floor(100000 + Math.random() * 900000);
    const msg = `⚡ *بلاغ صيانة كهرباء طارئ*%0a` +
                `----------------------------------%0a` +
                `🆔 *الكود المرجعي للصورة:* ${refCode}%0a` +
                `📁 *اسم الملف:* ${file.name}%0a` +
                `📏 *حجم الملف:* ${(file.size / 1024).toFixed(1)} KB%0a` +
                `يرجى المتابعة واستلام تفاصيل العطل.`;

    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${msg}`, '_blank');
}

// 4. إرسال طلب صيانة الأجهزة (حفظ + تحويل للواتساب)
async function handleApplianceSubmit(e) {
    e.preventDefault();
    const appliance = document.getElementById('applianceType').value;
    const name = document.getElementById('aName').value.trim();
    const phone = document.getElementById('aPhone').value.trim();
    const address = document.getElementById('aAddress').value.trim();
    const brand = document.getElementById('aBrand').value.trim();
    const desc = document.getElementById('aDesc').value.trim();

    const notes = `صيانة جهاز: ${appliance} | الماركة: ${brand} | الوصف: ${desc}`;

    try {
        if (db) {
            await db.from('service_requests').insert([{
                customer_name: name, customer_phone: phone, address: address, service_type: 'صيانة ' + appliance, notes: notes, status: 'قيد الانتظار'
            }]);
        }
    } catch (err) {
        console.error("خطأ:", err);
    }

    closeApplianceModal();

    const msg = `🔧 *طلب صيانة جهاز (SN ELECTRIC)*%0a` +
                `----------------------------------%0a` +
                `👤 *الاسم:* ${name}%0a` +
                `📞 *الهاتف:* ${phone}%0a` +
                `📍 *العنوان:* ${address}%0a` +
                `🔌 *الجهاز:* ${appliance} (${brand})%0a` +
                `📝 *وصف المشكلة:* ${desc}`;

    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${msg}`, '_blank');
}

// 5. طلب المعاينة (حفظ + تحويل للواتساب)
function toggleLocationInputs() {
    const val = document.getElementById('inspLocType').value;
    document.getElementById('govGroup').style.display = (val === 'gov') ? 'block' : 'none';
    document.getElementById('mapGroup').style.display = (val === 'map') ? 'block' : 'none';
}

function getGPSLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            const url = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
            document.getElementById('inspMapLink').value = url;
            alert('تم جلب الموقع بنجاح!');
        }, () => { alert('تعذر جلب الموقع تلقائياً، يرجى لصق الرابط يدويًا.'); });
    } else {
        alert('التحديد الجغرافي غير مدعوم في متصفحك.');
    }
}

async function handleInspectionSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('inspName').value.trim();
    const phone = document.getElementById('inspPhone').value.trim();
    const locType = document.getElementById('inspLocType').value;
    const location = (locType === 'gov') ? document.getElementById('inspGovDetails').value : document.getElementById('inspMapLink').value;

    try {
        if (db) {
            await db.from('service_requests').insert([{
                customer_name: name, customer_phone: phone, address: location, service_type: 'طلب معاينة موقع', notes: 'نوع التحديد: ' + locType, status: 'قيد الانتظار'
            }]);
        }
    } catch (err) {
        console.error("خطأ:", err);
    }

    const msg = `🔍 *طلب معاينة موقع جديدة*%0a` +
                `----------------------------------%0a` +
                `👤 *الاسم:* ${name}%0a` +
                `📞 *الهاتف:* ${phone}%0a` +
                `📍 *الموقع / التفاصيل:* ${location}`;

    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${msg}`, '_blank');
}

// 6. الاستفسارات العامة (حفظ + تحويل للواتساب)
async function handleInquirySubmit(e) {
    e.preventDefault();
    const name = document.getElementById('inqName').value.trim();
    const address = document.getElementById('inqAddress').value.trim();
    const text = document.getElementById('inqText').value.trim();

    try {
        if (db) {
            await db.from('service_requests').insert([{
                customer_name: name, customer_phone: 'غير محدد', address: address, service_type: 'استفسار عام', notes: text, status: 'تم الاستلام'
            }]);
        }
    } catch (err) {
        console.error("خطأ:", err);
    }

    const msg = `❓ *استفسار جديد من الموقع*%0a` +
                `----------------------------------%0a` +
                `👤 *الاسم:* ${name}%0a` +
                `📍 *العنوان:* ${address}%0a` +
                `💬 *السؤال:* ${text}`;

    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${msg}`, '_blank');
}

// 7. تحميل الفنيين المعتمدين
async function loadApprovedTechnicians() {
    const container = document.getElementById('techniciansContainer');
    if (!container) return;

    try {
        if (!db) throw new Error("لم يتم الاتصال بـ Supabase");

        const { data, error } = await db.from('technicians').select('*');
        if (error) throw error;

        if (!data || data.length === 0) {
            container.innerHTML = '<p style="color:#aaa; text-align:center; grid-column:1/-1;">لا يوجد فنيون مسجلون حالياً.</p>';
            return;
        }

        let html = '';
        data.forEach(tech => {
            const isApproved = tech.approved === true;
            const phoneDisplay = isApproved 
                ? `<a href="tel:${tech.phone}" style="color:#2ecc71; text-decoration:none;"><i class="fa-solid fa-phone"></i> ${tech.phone}</a>` 
                : `<span style="color:#e74c3c; font-size:12px;"><i class="fa-solid fa-lock"></i> يتطلب اعتماد الأدمن لإظهار الهاتف</span>`;
            
            const avatar = tech.photo_url || 'https://via.placeholder.com/80/1e293b/ffffff?text=SN';

            html += `
                <div class="service-card" style="text-align:center;">
                    <img src="${avatar}" style="width:70px; height:70px; border-radius:50%; object-fit:cover; margin-bottom:10px; border:2px solid #f1c40f;">
                    <h3>${tech.name}</h3>
                    <p style="color:#f1c40f; margin:4px 0;"><b>${tech.total_stars || 5}</b> ⭐</p>
                    <p style="font-size:13px; color:#ddd;">التخصص: ${tech.specialty || 'كهرباء عامة'}</p>
                    <p style="font-size:13px; color:#ddd;">المنطقة: ${tech.area || 'غير محدد'}</p>
                    <div style="margin-top:10px; font-weight:bold;">${phoneDisplay}</div>
                </div>
            `;
        });
        container.innerHTML = html;

    } catch (err) {
        container.innerHTML = `
            <div class="service-card" style="text-align:center;">
                <i class="fa-solid fa-user-gear" style="font-size:40px; color:#f1c40f; margin-bottom:10px;"></i>
                <h3>م. أحمد علي</h3>
                <p style="color:#f1c40f; margin:4px 0;"><b>5</b> ⭐</p>
                <p style="font-size:13px; color:#ddd;">التخصص: تأسيس وصيانة</p>
                <p style="font-size:13px; color:#ddd;">المنطقة: القاهرة</p>
                <div style="margin-top:10px; font-weight:bold;">
                    <a href="tel:01287837118" style="color:#2ecc71; text-decoration:none;"><i class="fa-solid fa-phone"></i> 01287837118</a>
                </div>
            </div>
        `;
    }
}

// 8. التقديم كفني (حفظ + تحويل للواتساب)
async function handleTechSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('techName').value.trim();
    const phone = document.getElementById('techPhone').value.trim();
    const spec = document.getElementById('techSpec').value.trim();
    const area = document.getElementById('techArea').value.trim();
    const imgInput = document.getElementById('techImg');

    let photoUrl = '';
    try {
        if (db && imgInput.files.length > 0) {
            const file = imgInput.files[0];
            const filePath = `techs/${Date.now()}_${file.name}`;
            const { data, error } = await db.storage.from('tech-photos').upload(filePath, file);
            if (!error && data) {
                const { data: pubData } = db.storage.from('tech-photos').getPublicUrl(filePath);
                photoUrl = pubData.publicUrl;
            }
        }

        if (db) {
            await db.from('technicians').insert([{
                name: name, phone: phone, specialty: spec, area: area, photo_url: photoUrl, total_stars: 5, approved: false
            }]);
        }
    } catch (err) {
        console.error("خطأ التقديم كفني:", err);
    }

    closeTechModal();

    const msg = `👷‍♂️ *طلب انضمام فني جديد*%0a` +
                `----------------------------------%0a` +
                `👤 *الاسم:* ${name}%0a` +
                `📞 *الهاتف:* ${phone}%0a` +
                `🛠️ *التخصص:* ${spec}%0a` +
                `📍 *المنطقة:* ${area}`;

    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${msg}`, '_blank');
}

// 9. الشات الذكي
function toggleChat() {
    const box = document.getElementById('chatBox');
    box.style.display = (box.style.display === 'none' || !box.style.display) ? 'block' : 'none';
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;

    const body = document.getElementById('chatBody');
    body.innerHTML += `<div style="background:#f1c40f; color:#07101d; padding:8px 12px; border-radius:8px; align-self:flex-end; max-width:80%; font-weight:bold;">${msg}</div>`;
    input.value = '';

    setTimeout(() => {
        let reply = "أهلاً بك! يمكننا مساعدتك في كافة أعمال التأسيس والصيانة والأجهزة المنزلية. لا تتردد في طلب المعاينة الفورية.";
        if (msg.includes("تأسيس")) reply = "خدمات التأسيس تشمل الشقق، المصانع، المحلات، والفيلل بأسعار ومواصفات معتمدة.";
        if (msg.includes("صيانة") || msg.includes("جهاز")) reply = "نوفر صيانة سريعة لجميع الأجهزة: الغسالات، البوتاجازات، التكييفات، السخانات والثلاجات.";
        body.innerHTML += `<div style="background:rgba(255,255,255,0.05); color:#fff; padding:8px 12px; border-radius:8px; align-self:flex-start; max-width:80%;">${reply}</div>`;
        body.scrollTop = body.scrollHeight;
    }, 600);
}
