document.addEventListener('DOMContentLoaded', () => {
    loadTechnicians();
    checkApprovedChats();
});

// فتح وإغلاق النواذج
function openForm(serviceName) {
    document.getElementById('formTitle').innerText = serviceName;
    document.getElementById('formModal').style.display = 'block';
    calculateTotal();
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

// دالة حساب الأسعار والحسابات التلقائية لحظياً
function calculateTotal() {
    const projectTypeSelect = document.getElementById('projectType');
    if (!projectTypeSelect) return 0;

    const projectType = projectTypeSelect.value;
    
    // إظهار نوع مواسير MTK للمصانع فقط
    const mtkOption = document.getElementById('mtkOption');
    if (projectType === 'factory') {
        mtkOption.style.display = 'inline-block';
    } else {
        mtkOption.style.display = 'none';
        document.getElementById('pipeMTK').checked = false;
    }

    // خصم 5 جنيهات لكل بند تجاري في حالة المحل
    const discount = (projectType === 'shop') ? 5 : 0;

    // أسعار البنود الأصلية مطروح منها الخصم
    const priceRoofPoint = Math.max(0, 25 - discount);
    const pricePanel = Math.max(0, 150 - discount);
    const priceSocket = Math.max(0, 60 - discount);
    const priceJunction = Math.max(0, 40 - discount);

    // 1. أمتار المواسير
    const pipeMeters = parseFloat(document.getElementById('pipeMeters').value) || 0;
    let pipePricePerMeter = 0;
    if (document.getElementById('pipeKharta').checked) pipePricePerMeter += (20 - discount);
    if (document.getElementById('pipePVC').checked) pipePricePerMeter += (50 - discount);
    if (document.getElementById('pipeMTK').checked && projectType === 'factory') pipePricePerMeter += (65 - discount);

    const totalPipesCost = pipeMeters * pipePricePerMeter;

    // 2. بنود التأسيس
    const roofPointsCost = (parseFloat(document.getElementById('roofPoints').value) || 0) * priceRoofPoint;
    const panelsCost = (parseFloat(document.getElementById('panelsCount').value) || 0) * pricePanel;
    const socketsCost = (parseFloat(document.getElementById('socketsCount').value) || 0) * priceSocket;
    const junctionsCost = (parseFloat(document.getElementById('junctionBoxes').value) || 0) * priceJunction;

    // 3. بنود التشطيب
    const switchesCost = (parseFloat(document.getElementById('switchesCount').value) || 0) * 20;
    const motorsCost = (parseFloat(document.getElementById('motorsCount').value) || 0) * 150;
    const acCost = (parseFloat(document.getElementById('acCount').value) || 0) * 120;
    const linesCost = (parseFloat(document.getElementById('linesCount').value) || 0) * 30;
    const lampsCost = (parseFloat(document.getElementById('lampsCount').value) || 0) * 15;
    const chandeliersCost = (parseFloat(document.getElementById('chandeliersCount').value) || 0) * 100;
    const ceilingFansCost = (parseFloat(document.getElementById('ceilingFans').value) || 0) * 50;
    const wallFansCost = (parseFloat(document.getElementById('wallFans').value) || 0) * 40;

    // 4. الكاميرات والأنظمة والإطفاء
    const camsCost = (parseFloat(document.getElementById('camsCount').value) || 0) * 150;
    const alarmCost = (parseFloat(document.getElementById('alarmZones').value) || 0) * 100;
    const fireZonesCost = (parseFloat(document.getElementById('fireZones').value) || 0) * 150;
    const firePipesCost = (parseFloat(document.getElementById('firePipesMeters').value) || 0) * 75;

    // الإجمالي النهائي
    const grandTotal = totalPipesCost + roofPointsCost + panelsCost + socketsCost + junctionsCost +
                       switchesCost + motorsCost + acCost + linesCost + lampsCost + chandeliersCost + 
                       ceilingFansCost + wallFansCost + camsCost + alarmCost + fireZonesCost + firePipesCost;

    document.getElementById('totalPriceDisplay').innerText = grandTotal.toLocaleString('ar-EG') + " ج.م";
    return grandTotal;
}

// دالة حفظ الطلب وإرسال التقرير الشامل للأدمن والواتساب
async function handleFormSubmit(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const address = document.getElementById('customerAddress').value.trim();
    const serviceTitle = document.getElementById('formTitle').innerText;
    const projectType = document.getElementById('projectType').value;
    const calculatedPrice = calculateTotal();

    if (!name || !phone || !address) {
        alert("يرجى إدخال البيانات المطلوبة كاملة (الاسم، الهاتف، والعنوان)");
        return;
    }

    // 1. تجميع واستخراج البيانات التفصيلية
    const pipeMeters = document.getElementById('pipeMeters').value || 0;
    const pipesSelected = [];
    if (document.getElementById('pipeKharta').checked) pipesSelected.push('خرطوم');
    if (document.getElementById('pipePVC').checked) pipesSelected.push('PVC');
    if (document.getElementById('pipeMTK').checked) pipesSelected.push('MTK');

    const roofPoints = document.getElementById('roofPoints').value || 0;
    const panelsCount = document.getElementById('panelsCount').value || 0;
    const socketsCount = document.getElementById('socketsCount').value || 0;
    const junctionBoxes = document.getElementById('junctionBoxes').value || 0;

    const switchesCount = document.getElementById('switchesCount').value || 0;
    const motorsCount = document.getElementById('motorsCount').value || 0;
    const acCount = document.getElementById('acCount').value || 0;
    const linesCount = document.getElementById('linesCount').value || 0;
    const lampsCount = document.getElementById('lampsCount').value || 0;
    const chandeliersCount = document.getElementById('chandeliersCount').value || 0;
    const ceilingFans = document.getElementById('ceilingFans').value || 0;
    const wallFans = document.getElementById('wallFans').value || 0;

    const camsCount = document.getElementById('camsCount').value || 0;
    const camType = document.getElementById('camType').value;
    const dvrType = document.getElementById('dvrType').value;

    const alarmZones = document.getElementById('alarmZones').value || 0;
    const fireZones = document.getElementById('fireZones').value || 0;
    const firePipesMeters = document.getElementById('firePipesMeters').value || 0;

    // 2. صياغة التقرير المنظم
    const fullReportText = 
`📌 *طلب جديد من موقع SN ELECTRIC*
----------------------------------
👤 *بيانات العميل:*
• الاسم: ${name}
• الهاتف: ${phone}
• العنوان: ${address}
• نوع المقر: ${projectType}
• نوع الخدمة: ${serviceTitle}

🔌 *تفاصيل التأسيس والمواسير:*
• أمتار المواسير: ${pipeMeters} متر (${pipesSelected.join(', ') || 'لم يحدد'})
• نقاط السقف: ${roofPoints}
• عدد اللوح: ${panelsCount}
• عدد البرايز: ${socketsCount}
• علب السكة/البواط: ${junctionBoxes}

💡 *تفاصيل التشطيب:*
• المفاتيح: ${switchesCount} | المواتير: ${motorsCount} | التكييفات: ${acCount}
• الخطوط: ${linesCount} | اللمبات: ${lampsCount} | النجف: ${chandeliersCount}
• مراوح سقف: ${ceilingFans} | مراوح حائط: ${wallFans}

📹 *الأنظمة الكاميرات والإطفاء:*
• الكاميرات: ${camsCount} (نوع: ${camType}) | جهاز DVR: ${dvrType}
• زونات إنذار حريق: ${alarmZones} | زونات إطفاء: ${fireZones}
• أمتار مواسير الإطفاء: ${firePipesMeters} متر

💰 *الإجمالي التقديري:* ${calculatedPrice.toLocaleString('ar-EG')} ج.م`;

    submitBtn.disabled = true;
    submitBtn.innerText = "جاري الحفظ والتحويل للواتساب...";

    try {
        // 3. إرسال لـ Supabase لصفحة الأدمن
        const { error } = await supabaseClient
            .from('service_requests')
            .insert([{
                customer_name: name,
                customer_phone: phone,
                address: address,
                service_type: serviceTitle,
                notes: fullReportText,
                status: 'قيد الانتظار'
            }]);

        if (error) throw error;

        localStorage.setItem('user_phone', phone);

        // 4. تحويل العميل مباشرة لواتساب الإدارة (01287837118)
        const adminWhatsappNumber = "201287837118";
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${adminWhatsappNumber}&text=${encodeURIComponent(fullReportText)}`;

        closeForm();
        document.getElementById('serviceForm').reset();
        calculateTotal();

        window.open(whatsappUrl, '_blank');

    } catch (err) {
        alert("حدث خطأ أثناء حفظ الطلب: " + (err.message || err));
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "حفظ الطلب وتأكيد الإرسال";
    }
}

// إرسال طلب الفني
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

        alert("تم إرسال طلب انضمامك كفني بنجاح!");
        closeTechForm();
        document.getElementById('techForm').reset();
    } catch (err) {
        alert("حدث خطأ أثناء التقديم: " + err.message);
    } finally {
        btn.disabled = false;
    }
}

// جلب الفنيين
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
                <p><strong>التخصص:</strong> ${tech.specialty || 'كهربائي معتمد'}</p>
                <p><strong>المنطقة:</strong> ${tech.area || 'غير محدد'}</p>
                <a href="https://wa.me/2${tech.phone}" target="_blank" class="btn-service" style="background:#2ecc71; color:#fff; text-decoration:none; display:block; margin-top:10px;">تواصل مع الفني</a>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        container.innerHTML = `<div style="color:#aaa; text-align:center; grid-column:1/-1;">تعذر جلب قائمة الفنيين</div>`;
    }
}

// التحقق من موافقة الأدمن لإظهار شات المحادثة للعميل
async function checkApprovedChats() {
    const phone = localStorage.getItem('user_phone');
    const chatDirectBtn = document.getElementById('directChatBtn');
    if (!phone || !chatDirectBtn) return;

    try {
        const { data } = await supabaseClient
            .from('service_requests')
            .select('status')
            .eq('customer_phone', phone)
            .order('created_at', { ascending: false })
            .limit(1);

        if (data && data.length > 0 && data[0].status === 'موافقة') {
            chatDirectBtn.style.display = 'block';
        } else {
            chatDirectBtn.style.display = 'none';
        }
    } catch (e) {
        console.log("Chat check fail", e);
    }
}

// الذكاء الاصطناعي SN AI
function toggleChat() {
    const chatBox = document.getElementById('chatBox');
    chatBox.style.display = (chatBox.style.display === 'none' || !chatBox.style.display) ? 'block' : 'none';
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;

    const chatBody = document.getElementById('chatBody');

    const userDiv = document.createElement('div');
    userDiv.style.cssText = "background:rgba(241, 196, 15, 0.2); color:#f1c40f; padding:8px 12px; border-radius:8px; align-self:flex-end; max-width:85%; font-size:13px;";
    userDiv.innerText = msg;
    chatBody.appendChild(userDiv);

    input.value = '';

    setTimeout(() => {
        const aiDiv = document.createElement('div');
        aiDiv.style.cssText = "background:rgba(255,255,255,0.08); color:#fff; padding:8px 12px; border-radius:8px; align-self:flex-start; max-width:85%; font-size:13px; line-height:1.5;";
        aiDiv.innerHTML = processAIQuery(msg);
        chatBody.appendChild(aiDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 400);
}

function processAIQuery(query) {
    const q = query.toLowerCase();

    if (q.includes("سعر") || q.includes("تكلفة") || q.includes("حساب") || q.includes("بكام")) {
        return "يقدم الموقع حاسبة تفصيلية تلقائية! يمكنك اختيار نوع الخدمة (شقة، سقف، محل، أو مصنع) وسيتم حساب التكلفة الإجمالية فوراً.";
    } 
    if (q.includes("تأسيس") || q.includes("شقة") || q.includes("سقف") || q.includes("مواسير")) {
        return "نوفر تأسيس خرطوم (20 ج/م)، PVC (50 ج/م)، وللمصانع مواسير MTK معدنية (65 ج/م)، مع خصم 5 جنيهات لكل بند في تأسيس المحلات.";
    } 
    if (q.includes("كاميرات") || q.includes("مراقبة") || q.includes("ديفيار") || q.includes("dvr")) {
        return "نوفر تركيب جميع أنواع الكاميرات (داخلي، خارجي، بصوت، ومتحركة) بأجهزة 4, 8, 16, 32 قناة بتكلفة 150 ج/كاميرا.";
    } 
    if (q.includes("إنذار") || q.includes("اطفاء") || q.includes("حريق")) {
        return "ننفذ أنظمة إنذار الدخان والحريق وزونات الإطفاء ومواسير النحاس والحديد بتكلفة 75 ج/م للمواسير و150 ج لزون الإطفاء.";
    } 
    if (q.includes("سلام") || q.includes("مرحبا") || q.includes("أهلا")) {
        return "أهلاً بك في منصة <b>SN ELECTRIC</b>! كيف يمكنني مساعدتك اليوم؟";
    }

    return "يمكنني مساعدتك في استفسارات التأسيس، التشطيب، الكاميرات، أنظمة الحريق، أو التقديم كفني معتمد!";
}
