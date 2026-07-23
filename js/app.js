/*==================================================
        KHALSANA ES | App JavaScript Logic
==================================================*/

// فتح نموذج طلب الخدمة
function openForm(serviceName) {
    const modal = document.getElementById("formModal");
    const title = document.getElementById("formTitle");
    const dynamicFields = document.getElementById("dynamicFields");
    
    title.innerText = `طلب خدمة: ${serviceName}`;
    dynamicFields.innerHTML = `<input type="hidden" id="serviceType" value="${serviceName}">`;
    
    modal.style.display = "flex";
    
    // زيادة عداد الطلبات أو الزيارات عند فتح النموذج
    if (window.increaseCounter) {
        window.increaseCounter("requests");
    }
}

// إغلاق نموذج طلب الخدمة
function closeForm() {
    const modal = document.getElementById("formModal");
    modal.style.display = "none";
}

// إرسال طلب الخدمة عبر واتساب وحفظه في سوبابيس
async function sendWhatsApp() {
    let name = document.getElementById("customerName").value.trim();
    let phone = document.getElementById("customerPhone").value.trim();
    let address = document.getElementById("customerAddress").value.trim();
    let service = document.getElementById("serviceType").value;
    
    if (!name || !phone || !address) {
        alert("يرجى ملء جميع الحقول المطلوبة.");
        return;
    }

    // حفظ الطلب في قاعدة البيانات Supabase
    if (window.saveServiceRequest) {
        await window.saveServiceRequest({
            name: name,
            phone: phone,
            address: address,
            service: service,
            price: 0,
            notes: "طلب عبر الموقع الإلكتروني"
        });
    }

    let adminPhone = "201287837118";
    let message = `مرحباً، أرغب في طلب خدمة:%0A` +
                  `⚡ الخدمة: ${service}%0A` +
                  `👤 الاسم: ${name}%0A` +
                  `📞 الهاتف: ${phone}%0A` +
                  `📍 العنوان: ${address}`;

    window.open(`https://wa.me/${adminPhone}?text=${message}`, "_blank");
    closeForm();
}

/*==================================================
      إدارة تسجيل الفنيين وتعدد الخبرات
==================================================*/

// إضافة حقل جديد للخبرات المتعددة وأماكن العمل
function addExperienceField() {
    const container = document.getElementById("experiencesContainer");
    const div = document.createElement("div");
    div.className = "exp-group";
    div.style.cssText = "background: rgba(255,255,255,0.03); padding: 15px; border-radius: 10px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.08); position: relative;";
    
    div.innerHTML = `
        <button type="button" onclick="this.parentElement.remove()" style="position: absolute; left: 15px; top: 10px; background: #ff4d4d; color: #fff; border: none; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">حذف</button>
        <label style="display:block; margin-bottom:5px; font-weight:700;">اسم الوظيفة / الدور</label>
        <input type="text" class="exp-title" required placeholder="مثال: كهربائي تسليمات" style="width:100%; padding:10px; background:var(--dark); border:1px solid var(--border); border-radius:8px; color:#fff; margin-bottom:10px;">

        <label style="display:block; margin-bottom:5px; font-weight:700;">اسم المكان / الشركة / المشروع</label>
        <input type="text" class="exp-workplace" required placeholder="مثال: مشروع سكنى" style="width:100%; padding:10px; background:var(--dark); border:1px solid var(--border); border-radius:8px; color:#fff; margin-bottom:10px;">

        <label style="display:block; margin-bottom:5px; font-weight:700;">المدة (الفترة الزمنية)</label>
        <input type="text" class="exp-duration" required placeholder="مثال: سنتان ونصف" style="width:100%; padding:10px; background:var(--dark); border:1px solid var(--border); border-radius:8px; color:#fff;">
    `;
    container.appendChild(div);
}

// إرسال بيانات الفني وخبراته المتعددة لقاعدة البيانات ونسخة للواتساب
async function submitTechWithExp() {
    let name = document.getElementById("tName").value.trim();
    let phone = document.getElementById("tPhone").value.trim();
    let specialty = document.getElementById("tSpecialty").value;
    let area = document.getElementById("tArea").value.trim();

    if (!name || !phone || !area) {
        alert("يرجى ملء البيانات الأساسية.");
        return;
    }

    let expGroups = document.querySelectorAll(".exp-group");
    let experiencesList = [];
    let expTextForWhatsApp = "";

    expGroups.forEach((group, index) => {
        let jobTitle = group.querySelector(".exp-title").value.trim();
        let workplace = group.querySelector(".exp-workplace").value.trim();
        let duration = group.querySelector(".exp-duration").value.trim();
        
        if (jobTitle && workplace && duration) {
            experiencesList.push({ jobTitle, workplace, duration });
            expTextForWhatsApp += `%0A- خبرة ${index + 1}: ${jobTitle} في (${workplace}) لمدة (${duration})`;
        }
    });

    if (experiencesList.length === 0) {
        alert("يرجى إدخال مكان عمل واحد على الأقل.");
        return;
    }

    // 1. الحفظ في قاعدة البيانات عبر Supabase
    if (window.registerTechnicianWithExperiences) {
        let success = await window.registerTechnicianWithExperiences(
            { name, phone, specialty, area },
            experiencesList
        );

        if (success) {
            // 2. تجهيز رسالة الواتساب للإرسال برقمك الخاص
            let adminPhone = "201287837118";
            let message = `طلب انضمام فني جديد:%0A` +
                          `👤 الاسم: ${name}%0A` +
                          `📞 الهاتف: ${phone}%0A` +
                          `⚡ التخصص: ${specialty}%0A` +
                          `📍 المنطقة: ${area}%0A` +
                          `📋 سجل الخبرات:${expTextForWhatsApp}`;

            // فتح واتساب تلقائياً بالرسالة
            window.open(`https://wa.me/${adminPhone}?text=${message}`, "_blank");

            alert("تم إرسال طلب انضمامك وخبراتك بنجاح!");
            
            // تفريغ الحقول بعد الإرسال
            document.getElementById("tName").value = "";
            document.getElementById("tPhone").value = "";
            document.getElementById("tArea").value = "";
        } else {
            alert("حدث خطأ أو أن رقم الهاتف مسجل مسبقاً.");
        }
    }
}
