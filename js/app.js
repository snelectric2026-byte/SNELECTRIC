/*==================================================
    SN ELECTRIC | app.js (المصحح وشامل الوظائف)
==================================================*/

function openForm(serviceName) {
    const modal = document.getElementById('formModal');
    const title = document.getElementById('formTitle');
    const dynamicFields = document.getElementById('dynamicFields');
    const calcSection = document.getElementById('calculatorSection');
    
    title.innerText = serviceName;
    modal.style.display = 'block';
    
    let fieldsHTML = '';
    let calcHTML = '';
    
    if (serviceName === 'تأسيس شقق') {
        fieldsHTML = `
            <label>طبيعة العمل</label>
            <select id="calcApartmentType" onchange="calculatePrice()">
                <option value="دور واحد">دور واحد</option>
                <option value="متعدد الأدوار">متعدد الأدوار</option>
            </select>
            <label>نوع المواسير المستخدمة</label>
            <select id="calcPipeType" onchange="calculatePrice()">
                <option value="PVC">PVC (باللحام البارد والتكحيل)</option>
                <option value="EMT">EMT (مواسير معدنية بتركيب الجلب)</option>
            </select>
            <label>عدد أمتار المواسير</label>
            <input type="number" id="calcPipeLength" value="50" min="0" oninput="calculatePrice()">
            <label>عدد أمتار التكحيل</label>
            <input type="number" id="calcTakhilLength" value="10" min="0" oninput="calculatePrice()">
            <label>عدد أمتار الشداد (إن وجد)</label>
            <input type="number" id="calcShedadLength" value="0" min="0" oninput="calculatePrice()">
            <label>عدد اللوحات الداخلية المراد تركيبها (اللوحة الواحدة 600 جنيه)</label>
            <input type="number" id="calcPanelsCount" value="0" min="0" oninput="calculatePrice()">
            <label>عدد علب التجميع (مقاومات 30×30 أو أكبر بالروزطة بدون الخام - العلبه 200 جنيه)</label>
            <input type="number" id="calcBoxesCount" value="0" min="0" oninput="calculatePrice()">
        `;
    } else if (serviceName === 'تأسيس سقف') {
        fieldsHTML = `
            <label>نوع المواسير المستخدمة</label>
            <select id="calcPipeType" onchange="calculatePrice()">
                <option value="PVC">PVC (سعر المتر 35 ج)</option>
                <option value="EMT">EMT (مواسير معدنية - سعر المتر 60 ج)</option>
            </select>
            <label>عدد أمتار المواسير</label>
            <input type="number" id="calcPipeLength" value="40" min="0" oninput="calculatePrice()">
            <label>عدد أمتار التكحيل أو (عدد القورب المفتوحة والمغلقة، الأسقاط أو المسار)</label>
            <input type="number" id="calcTakhilLength" value="10" min="0" oninput="calculatePrice()">
            <label>عدد أمتار الشداد (إن وجد)</label>
            <input type="number" id="calcShedadLength" value="0" min="0" oninput="calculatePrice()">
            <label>نوع التأسيس</label>
            <select id="calcInstallNature">
                <option value="داخلي">داخلي</option>
                <option value="خارجي">خارجي</option>
                <option value="الاثنين">الاثنين (مع مراعاة المسارات والرسوم الهندسية)</option>
            </select>
        `;
    } else if (serviceName === 'تشطيب إكسسوارات') {
        fieldsHTML = `
            <label>عدد النقاط المراد تركيبها</label>
            <input type="number" id="calcPoints" value="5" min="1" oninput="calculatePrice()">
            <label>عدد العلب والبرايز</label>
            <input type="number" id="calcBoxes" value="5" min="0" oninput="calculatePrice()">
            <label>عدد اللوحات الرئيسية (لوحة مفاتيح)</label>
            <input type="number" id="calcPanels" value="1" min="0" oninput="calculatePrice()">
            <label>عدد المفاتيح الأوتوماتيكية</label>
            <input type="number" id="calcAutomatic" value="3" min="0" oninput="calculatePrice()">
        `;
    } else if (serviceName === 'صيانة أجهزة منزلية') {
        fieldsHTML = `
            <label>نوع الجهاز المراد صيانته</label>
            <select id="calcAppliance" onchange="calculatePrice()">
                <option value="غسالة">غسالة أوتوماتيك</option>
                <option value="بوتاجاز">بوتاجاز</option>
                <option value="ثلاجة">ثلاجة / ديب فريزر</option>
                <option value="سخان">سخان كهربائي</option>
                <option value="ميكروويف">ميكروويف</option>
                <option value="خلاط">خلاط أو جهاز صغير</option>
            </select>
        `;
    } else if (serviceName === 'كاميرات مراقبة') {
        fieldsHTML = `
            <label>عدد الكاميرات المطلوب تركيبها</label>
            <input type="number" id="calcCameras" value="2" min="1" oninput="calculatePrice()">
            <label>طول كابلات التوصيل (متر)</label>
            <input type="number" id="calcCableLength" value="30" min="0" oninput="calculatePrice()">
            <label>نوع التمديد والتركيب</label>
            <select id="calcInstallationType" onchange="calculatePrice()">
                <option value="عادي">عادي (داخل قنوات بلاستيكية ظاهرة)</option>
                <option value="متقدم">متقدم (دفن داخل الجدران / مسافات بعيدة)</option>
            </select>
        `;
    } else if (serviceName === 'المعاينة') {
        fieldsHTML = `<p style="color:var(--accent); font-weight:bold;">زيارة معايشة فنية لتقدير المتطلبات والأحمال بالمنزل أو موقع العمل.</p>`;
    }
    
    dynamicFields.innerHTML = fieldsHTML;
    calcHTML = `
        <h4 style="color:var(--accent); margin-bottom:10px;"><i class="fa-solid fa-calculator"></i> حاسبة التكلفة التقديرية</h4>
        <div id="priceBreakdown" class="calc-breakdown"></div>
    `;
    calcSection.innerHTML = calcHTML;
    calculatePrice();
}

function closeForm() {
    document.getElementById('formModal').style.display = 'none';
}

function calculatePrice() {
    const title = document.getElementById('formTitle').innerText;
    let total = 0;
    let breakdown = '';
    
    if (title === 'تأسيس سقف' || title === 'تأسيس شقق') {
        const pipeType = document.getElementById('calcPipeType')?.value || 'PVC';
        const pipeLength = parseInt(document.getElementById('calcPipeLength')?.value || 0);
        const takhilLength = parseInt(document.getElementById('calcTakhilLength')?.value || 0);
        const shedadLength = parseInt(document.getElementById('calcShedadLength')?.value || 0);
        const panelsCount = parseInt(document.getElementById('calcPanelsCount')?.value || 0);
        const boxesCount = parseInt(document.getElementById('calcBoxesCount')?.value || 0);
        const apartmentType = document.getElementById('calcApartmentType')?.value || 'دور واحد';

        let pipeUnitPrice = 35; 
        let takhilUnitPrice = 10;
        let shedadUnitPrice = 5;

        if (title === 'تأسيس شقق' && apartmentType === 'دور واحد') {
            if (pipeType === 'PVC') {
                pipeUnitPrice = 40;
                takhilUnitPrice = 20;
                shedadUnitPrice = 5;
            } else if (pipeType === 'EMT') {
                pipeUnitPrice = 60;
                takhilUnitPrice = 25;
                shedadUnitPrice = 10;
            }
        } else if (title === 'تأسيس شقق' && apartmentType === 'متعدد الأدوار') {
            if (pipeType === 'PVC') {
                pipeUnitPrice = 40;
                takhilUnitPrice = 20;
                shedadUnitPrice = 5;
            } else if (pipeType === 'EMT') {
                pipeUnitPrice = 60;
                takhilUnitPrice = 25;
                shedadUnitPrice = 10;
            }
        } else if (title === 'تأسيس سقف') {
            if (pipeType === 'PVC') {
                pipeUnitPrice = 35;
                takhilUnitPrice = 10;
                shedadUnitPrice = 5;
            } else if (pipeType === 'EMT') {
                pipeUnitPrice = 60;
                takhilUnitPrice = 25;
                shedadUnitPrice = 10;
            }
        }

        const pipeTotal = pipeLength * pipeUnitPrice;
        const takhilTotal = takhilLength * takhilUnitPrice;
        const shedadTotal = shedadLength * shedadUnitPrice;
        const panelsTotal = panelsCount * 600;
        const boxesTotal = boxesCount * 200;

        total = pipeTotal + takhilTotal + shedadTotal + panelsTotal + boxesTotal;
        
        breakdown = `<small>
            - مواسير ${pipeType} (${pipeLength}م × ${pipeUnitPrice}ج) = ${pipeTotal} ج.م<br>
            - التكحيل / القورب والمسارات والأسقاط (${takhilLength}م × ${takhilUnitPrice}ج) = ${takhilTotal} ج.م<br>
            - الشداد (${shedadLength}م × ${shedadUnitPrice}ج) = ${shedadTotal} ج.م
            ${panelsCount > 0 ? `<br>- تركيب لوحات داخلية (${panelsCount} × 600ج) = ${panelsTotal} ج.م` : ''}
            ${boxesCount > 0 ? `<br>- علب تجميع 30×30+ بالروزطة (${boxesCount} × 200ج) = ${boxesTotal} ج.م` : ''}
        </small>`;

    } else if (title === 'تشطيب إكسسوارات') {
        const points = parseInt(document.getElementById('calcPoints')?.value || 0);
        const boxes = parseInt(document.getElementById('calcBoxes')?.value || 0);
        const panels = parseInt(document.getElementById('calcPanels')?.value || 0);
        const automatic = parseInt(document.getElementById('calcAutomatic')?.value || 0);
        
        total = (points * 50) + (boxes * 40) + (panels * 200) + (automatic * 50);
        breakdown = `<small>تجميع حساب النقاط واللوحات والإكسسوارات</small>`;
    } else if (title === 'صيانة أجهزة منزلية') {
        const appliance = document.getElementById('calcAppliance')?.value;
        const prices = { 'غسالة': 350, 'بوتاجاز': 300, 'ثلاجة': 400, 'سخان': 250, 'ميكروويف': 200, 'خلاط': 150 };
        total = appliance && prices[appliance] ? prices[appliance] : 200;
        breakdown = `<small>صيانة ${appliance}: ${total} ج.م (تقديري)</small>`;
    } else if (title === 'كاميرات مراقبة') {
        const cameras = parseInt(document.getElementById('calcCameras')?.value || 1);
        const cableLength = parseInt(document.getElementById('calcCableLength')?.value || 0);
        total = (cameras * 300) + (cableLength * 5);
        breakdown = `<small>${cameras} كاميرات مع التمديدات</small>`;
    } else if (title === 'المعاينة') {
        total = 100;
        breakdown = `<small>رسوم المعاينة الميدانية داخل النطاق</small>`;
    }
    
    let finalTotal = total;
    if (window.isVipCustomer) {
        finalTotal = Math.round(total * 0.95);
    }
    
    if (document.getElementById('priceBreakdown')) document.getElementById('priceBreakdown').innerHTML = breakdown;
    if (document.getElementById('totalPrice')) document.getElementById('totalPrice').innerText = 'السعر التقديري: ' + finalTotal + ' جنيه';
    window.finalCalculatedPrice = finalTotal;
    
    if (window.isVipCustomer && document.getElementById('vipDiscountNotice')) {
        document.getElementById('vipDiscountNotice').style.display = 'block';
        document.getElementById('vipDiscountNotice').innerText = '✓ تم تطبيق خصم 5% للعملاء المميزين (VIP)! السعر الأصلي: ' + total + ' ج.م';
    }
}

async function checkCustomerStatus(name) {
    if (!name || !window.supabaseClient) return;
    try {
        const { data } = await supabaseClient.from('service_requests').select('*').eq('customer_name', name);
        if (data && data.length >= 1) {
            window.isVipCustomer = true;
            const welcomeArea = document.getElementById('customerWelcomeArea');
            if (welcomeArea) {
                welcomeArea.innerHTML = `<span class="vip-badge"><i class="fa-solid fa-crown"></i> عميل مميز VIP (إجمالي طلباتك السابقة: ${data.length})</span>`;
            }
            calculatePrice();
        } else {
            window.isVipCustomer = false;
            if (document.getElementById('vipDiscountNotice')) document.getElementById('vipDiscountNotice').style.display = 'none';
        }
    } catch(err) { console.log('Error checking customer:', err); }
}

async function sendWhatsApp() {
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const address = document.getElementById('customerAddress').value;
    const serviceTitle = document.getElementById('formTitle').innerText;
    const finalPrice = window.finalCalculatedPrice || 0;
    
    if (window.supabaseClient) {
        try {
            await supabaseClient.from('service_requests').insert([
                { customer_name: name, customer_phone: phone, address: address, service_name: serviceTitle, price: finalPrice, status: 'جديد' }
            ]);
        } catch(e) { console.log('Supabase insert note:', e); }
    }
    
    let msg = `السلام عليكم، أطلب خدمة: ${serviceTitle}%0aالاسم: ${name}%0aالهاتف: ${phone}%0aالعنوان: ${address}%0aالسعر التقديري: ${finalPrice} ج.م%0a(ملاحظة: هذا السعر تقديري ويتم تأكيده بعد المعاينة)`;
    if (window.isVipCustomer) msg += `%0a✓ تم تطبيق خصم 5% للعميل المميز VIP`;
    window.open(`https://wa.me/201287837118?text=${msg}`, '_blank');
    closeForm();
}

function addExperienceField() {
    const container = document.getElementById('experiencesContainer');
    const div = document.createElement('div');
    div.className = 'exp-group';
    div.style.cssText = 'background: rgba(255,255,255,0.03); padding: 15px; border-radius: 10px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.08);';
    div.innerHTML = `
        <label style="display:block; margin-bottom:5px; font-weight:700;">اسم الوظيفة / الدور</label>
        <input type="text" class="exp-title" required placeholder="مثال: فني تنفيذ رئيسي" style="width:100%; padding:10px; background:var(--dark); border:1px solid var(--border); border-radius:8px; color:#fff; font-size:15px;">
        <label style="display:block; margin-bottom:5px; font-weight:700;">اسم المكان / الشركة / المشروع</label>
        <input type="text" class="exp-workplace" required placeholder="مثال: شركة النور" style="width:100%; padding:10px; background:var(--dark); border:1px solid var(--border); border-radius:8px; color:#fff; font-size:15px;">
        <label style="display:block; margin-bottom:5px; font-weight:700;">المدة (الفترة الزمنية)</label>
        <input type="text" class="exp-duration" required placeholder="مثال: من 2021 إلى 2024" style="width:100%; padding:10px; background:var(--dark); border:1px solid var(--border); border-radius:8px; color:#fff; font-size:15px;">
    `;
    container.appendChild(div);
}

async function submitTechWithExp() {
    const name = document.getElementById('tName').value;
    const phone = document.getElementById('tPhone').value;
    const specialty = document.getElementById('tSpecialty').value;
    const area = document.getElementById('tArea').value;
    
    if (window.supabaseClient) {
        try {
            const { data: techData } = await supabaseClient.from('technicians').insert([
                { name: name, phone: phone, specialty: specialty, area: area, total_stars: 0 }
            ]).select();
            if (techData && techData.length > 0) {
                const techId = techData[0].id;
                for (let group of document.querySelectorAll('.exp-group')) {
                    await supabaseClient.from('technician_experiences').insert([{
                        technician_id: techId,
                        job_title: group.querySelector('.exp-title').value,
                        workplace: group.querySelector('.exp-workplace').value,
                        duration: group.querySelector('.exp-duration').value
                    }]);
                }
            }
        } catch(e) { console.log('Tech submit error:', e); }
    }
    alert('تم إرسال طلب انضمامك كفني بنجاح!');
    document.getElementById('tName').value = '';
    document.getElementById('tPhone').value = '';
    document.getElementById('tArea').value = '';
    loadTechnicians();
}

async function loadTechnicians() {
    const container = document.getElementById('techniciansContainer');
    if (!container) return;
    
    let techs = [
        { id: 1, name: 'محمد إبراهيم', specialty: 'تأسيس شقق وصيانة', area: 'القاهرة والجيزة', total_stars: 9 },
        { id: 2, name: 'محمود عبد الفتاح', specialty: 'تأسيس سقف وكاميرات مراقبة', area: 'الإسكندرية', total_stars: 10 },
        { id: 3, name: 'محمد علي', specialty: 'صيانة أجهزة منزلية', area: 'الإسكندرية / العجمي', total_stars: 8 },
        { id: 4, name: 'أحمد رزق', specialty: 'كاميرات مراقبة وإكسسوارات', area: 'الجيزة', total_stars: 8 }
    ];
    
    if (window.supabaseClient) {
        try {
            const { data } = await supabaseClient.from('technicians').select('*');
            if (data && data.length > 0) techs = data;
        } catch(e) {}
    }
    
    container.innerHTML = '';
    techs.forEach(tech => {
        let stars = tech.total_stars || 0;
        let bonusBadge = stars >= 10 ? `<div style="color: #2ecc71; font-weight: bold; margin-top: 5px;"><i class="fa-solid fa-award"></i> مؤهل لحافز 3% أجر إضافي (تجاوز 10 نجوم)</div>` : '';
        
        let card = document.createElement('div');
        card.className = 'tech-card';
        card.innerHTML = `
            <h3 style="color: var(--accent); margin-bottom: 5px;">${tech.name}</h3>
            <p style="margin-bottom: 5px;"><strong>التخصص:</strong> ${tech.specialty}</p>
            <p style="margin-bottom: 10px;"><strong>المنطقة:</strong> ${tech.area}</p>
            <p><strong>النجوم:</strong> <span>${stars}</span> ⭐</p>
            ${bonusBadge}
            <div class="rating-stars">
                <i class="fa-star fa-solid" onclick="rateTech(${tech.id}, 1)"></i>
                <i class="fa-star fa-solid" onclick="rateTech(${tech.id}, 3)"></i>
                <i class="fa-star fa-solid" onclick="rateTech(${tech.id}, 5)"></i>
            </div>
        `;
        container.appendChild(card);
    });
}

async function rateTech(techId, starsGiven) {
    alert(`شكراً لتقييمك! تم منح الفني ${starsGiven} نجوم.`);
    if (window.supabaseClient) {
        try {
            const { data } = await supabaseClient.from('technicians').select('total_stars').eq('id', techId).single();
            let newTotal = (data ? (data.total_stars || 0) : 0) + starsGiven;
            await supabaseClient.from('technicians').update({ total_stars: newTotal }).eq('id', techId);
        } catch(e) {}
    }
    loadTechnicians();
}

function toggleChat() {
    const chat = document.getElementById('chatBox');
    chat.style.display = chat.style.display === 'flex' ? 'none' : 'flex';
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    appendMessage(text, 'outgoing');
    input.value = '';
    setTimeout(() => {
        appendMessage("شكراً لتواصلك مع إدارة SN ELECTRIC. لقد تلقينا رسالتك وسنتابع طلبك فوراً.", 'incoming');
    }, 800);
}

function appendMessage(text, sender) {
    const body = document.getElementById('chatBody');
    const div = document.createElement('div');
    div.className = `chat-message ${sender}`;
    div.innerText = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
}

window.addEventListener('DOMContentLoaded', () => {
    loadTechnicians();
    window.isVipCustomer = false;
});
