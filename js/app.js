/*==================================================
    SN ELECTRIC | app.js
==================================================*/

let currentService = "";
let totalPrice = 0;

const prices = {
    point: 90,
    switch: 40,
    socket: 40,
    lamp: 35,
    spot: 45,
    camera: 250
};

function openForm(service) {
    currentService = service;
    document.getElementById("formTitle").innerText = service;
    document.getElementById("formModal").style.display = "block";
    
    let html = `<label>ملاحظات إضافية</label><textarea id="notes" placeholder="اكتب أي تفاصيل إضافية هنا..."></textarea>`;
    document.getElementById("dynamicFields").innerHTML = html;
}

function closeForm() {
    document.getElementById("formModal").style.display = "none";
    document.getElementById("serviceForm").reset();
}

function sendWhatsApp() {
    let name = document.getElementById("customerName").value.trim();
    let phone = document.getElementById("customerPhone").value.trim();
    let address = document.getElementById("customerAddress").value.trim();
    let notes = document.getElementById("notes") ? document.getElementById("notes").value.trim() : "";

    if (!name || !phone || !address) {
        alert("يرجى استكمال البيانات الأساسية.");
        return;
    }

    let message = "*طلب خدمة جديد*%0A--------------------%0A";
    message += "👤 الاسم: " + name + "%0A";
    message += "📱 الهاتف: " + phone + "%0A";
    message += "📍 العنوان: " + address + "%0A";
    message += "🛠 الخدمة: " + currentService + "%0A";
    if (notes) message += "📝 ملاحظات: " + notes + "%0A";

    window.open("https://wa.me/201287837118?text=" + message, "_blank");
    closeForm();
}

document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.querySelector(".menu");
    const nav = document.querySelector("nav");
    if (menuBtn && nav) {
        menuBtn.addEventListener("click", () => {
            nav.classList.toggle("active");
        });
    }
});

// إضافة حقل جديد للخبرات المتعددة
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

// إرسال بيانات الفني وخبراته المتعددة
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

    expGroups.forEach(group => {
        let jobTitle = group.querySelector(".exp-title").value.trim();
        let workplace = group.querySelector(".exp-workplace").value.trim();
        let duration = group.querySelector(".exp-duration").value.trim();
        
        if (jobTitle && workplace && duration) {
            experiencesList.push({ jobTitle, workplace, duration });
        }
    });

    if (experiencesList.length === 0) {
        alert("يرجى إدخال مكان عمل واحد على الأقل.");
        return;
    }

    if (window.registerTechnicianWithExperiences) {
        let success = await window.registerTechnicianWithExperiences(
            { name, phone, specialty, area },
            experiencesList
        );

        if (success) {
            alert("تم إرسال طلب انضمامك وخبراتك بنجاح!");
            document.getElementById("tName").value = "";
            document.getElementById("tPhone").value = "";
            document.getElementById("tArea").value = "";
        } else {
            alert("حدث خطأ أو أن رقم الهاتف مسجل مسبقاً.");
        }
    }
}
