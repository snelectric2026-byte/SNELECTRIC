// تهيئة الاتصال بقاعدة بيانات Supabase
let db = null;
if (typeof supabase !== 'undefined' && typeof SUPABASE_URL !== 'undefined' && typeof SUPABASE_KEY !== 'undefined') {
    db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

const ADMIN_WHATSAPP = "201287837118";

document.addEventListener('DOMContentLoaded', () => {
    loadApprovedTechnicians();
});

// 1. إدارة النوافذ المنبثقة
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

// 2. إرسال طلب التأسيس (حفظ في قاعدة البيانات + توجيه للواتساب)
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

    try {
        if (db) {
            await db.from('service_requests').insert([{
                customer_name: name, customer_phone: phone, address: address, service_type: 'تأسيس ' + type, notes: notes, status: 'قيد الانتظار'
            }]);
        }
    } catch (err) {
        console.error("خطأ قاعدة البيانات:", err);
    }

    closeTasissModal();

    const msg = `🏗️ *طلب تأسيس جديد (SN ELECTRIC)*%0a` +
                `----------------------------------%0a` +
                `👤 *الاسم:* ${name}%0a` +
                `📞 *الهاتف:* ${phone}%0a` +
                `📍 *العنوان:* ${address}%0a` +
                `🛠️ *النوع:* تأسيس ${type}%0a` +
                `📦 *التفاصيل:* علب (${boxes}) - لينيات (${lines}) - لوح (${panels}) - إمداد (${supply})`;

    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${msg}`, '_blank');
}

// 3. تحويل بلاغ عطل الكهرباء المصور للواتساب
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

// 4. إرسال طلب صيانة الجهاز (حفظ + توجيه للواتساب)
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

// 5. طلب المعاينة
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

// 6. الاستفسارات العامة
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

// 8. التقديم كفني
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

// 9. وحدة "ارسم بيتك" للحساب التلقائي
function startDrawing() {
    document.getElementById('drawInfoNotice').style.display = 'none';
    document.getElementById('drawCanvasArea').style.display = 'block';
    generateRoomLayout();
}

function generateRoomLayout() {
    const w = parseFloat(document.getElementById('roomWidth').value) || 4;
    const h = parseFloat(document.getElementById('roomHeight').value) || 5;

    const area = w * h;
    const perimeter = 2 * (w + h);

    const socketsCount = Math.max(4, Math.ceil(perimeter / 2));
    const switchesCount = Math.max(1, Math.ceil(area / 15));
    const lightsCount = Math.max(1, Math.ceil(area / 10));

    document.getElementById('outDetails').innerHTML = `
        المساحة: <b>${area}</b> م² | المحيط: <b>${perimeter}</b> م<br>
        🔌 عدد البرايز المقترحة: <b style="color:#f1c40f;">${socketsCount}</b> | 
        💡 نقاط الإضاءة: <b style="color:#f1c40f;">${lightsCount}</b> | 
        🔘 المفاتيح الرئيسية: <b style="color:#f1c40f;">${switchesCount}</b>
    `;

    const canvas = document.getElementById('roomCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pad = 40;
    const cWidth = canvas.width - (pad * 2);
    const cHeight = canvas.height - (pad * 2);

    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 4;
    ctx.strokeRect(pad, pad, cWidth, cHeight);

    ctx.fillStyle = '#2ecc71';
    for (let i = 0; i < socketsCount; i++) {
        let x, y;
        const step = i % 4;
        if (step === 0) { x = pad + (i * 20) % cWidth; y = pad; }
        else if (step === 1) { x = pad + cWidth; y = pad + (i * 20) % cHeight; }
        else if (step === 2) { x = pad + (i * 20) % cWidth; y = pad + cHeight; }
        else { x = pad; y = pad + (i * 20) % cHeight; }

        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 10, 0, Math.PI * 2);
    ctx.fill();
}

// 10. الشات الذكي
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
