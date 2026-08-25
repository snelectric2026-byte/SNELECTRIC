/*==================================================
    SN ELECTRIC | app.js (المصحح وشامل الوظائف وتتبع الحالات)
==================================================*/

// تفعيل فحص رابط واتساب وحالة المحادثة الآمنة عند تحميل المستند
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    let phoneFromURL = urlParams.get('phone');

    if (phoneFromURL) {
        localStorage.setItem('client_phone', phoneFromURL);
        checkClientChatAccess(phoneFromURL);
    } else {
        let savedPhone = localStorage.getItem('client_phone');
        if (savedPhone) {
            checkClientChatAccess(savedPhone);
        }
    }
    loadTechnicians();
});

// التحقق من حالة الطلب في قاعدة البيانات (Supabase) لتفعيل الشات الآمن
async function checkClientChatAccess(customerPhone) {
    if (!window.supabaseClient || !customerPhone) return;

    try {
        const { data, error } = await window.supabaseClient
            .from('service_requests')
            .select('status')
            .eq('customer_phone', customerPhone)
            .single();

        if (data && data.status === 'موافقة') {
            showSecureChatButton();
            loadChatMessages(customerPhone);
        }
    } catch (err) {
        console.log('Access check note:', err);
    }
}

// إظهار زر محادثة المشروع الآمنة الحصري للعميل المعتمد
function showSecureChatButton() {
    let container = document.getElementById('floatingSecureChatContainer');
    if (container && !document.getElementById('secureChatToggleBtn')) {
        container.innerHTML = `<button id="secureChatToggleBtn" onclick="toggleApprovedChat()" style="position: fixed; bottom: 25px; left: 25px; background: var(--accent); color: var(--dark); border: none; padding: 12px 20px; border-radius: 30px; font-weight: 800; cursor: pointer; box-shadow: 0 5px 20px rgba(0,0,0,0.5); z-index: 999;"><i class="fa-solid fa-lock"></i> محادثة المشروع الآمنة</button>`;
    }
}

// إرسال وحفظ رسالة العميل في قاعدة البيانات مباشرة
async function sendApprovedMessage() {
    const input = document.getElementById('approvedChatInput');
    if (!input) return;
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

// رسم الرسالة في واجهة الشات الآمن
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

// تبديل إظهار وإخفاء صندوق المحادثة الآمنة
function toggleApprovedChat() {
    const chat = document.getElementById('approvedChatWidget');
    if (chat) {
        chat.style.display = chat.style.display === 'flex' ? 'none' : 'flex';
    }
}

function openForm(serviceName) {
    const modal = document.getElementById('formModal');
    const title = document.getElementById('formTitle');
    const dynamicFields = document.getElementById('dynamicFields');
    const calcSection = document.getElementById('calculatorSection');
    
    if (!modal) return;
    
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
            
            <label>عدد أمتار تكسير حوائط (المتر 25 جنيه)</label>
            <input type="number" id="calcWallBreakMeters" value="0" min="0" oninput="calculatePrice()">
            
            <label>عدد أمتار نحت خرسانة (المتر المسطح 50 جنيه)</label>
            <input type="number" id="calcConcreteChiselMeters" value="0" min="0" oninput="calculatePrice()">
            
            <label>عدد أمتار فتحات الجبس للأسبوت (الفتحة 5 جنيه)</label>
            <input type="number" id="calcGypsumSpotHoles" value="0" min="0" oninput="calculatePrice()">

            <label>عدد اللوحات الرئيسية (تأسيس - 600 جنيه للوحة)</label>
            <input type="number" id="calcPanelsCount" value="1" min="0" oninput="calculatePrice()">
            
            <label>عدد علب الكهرباء (العلبة 40 جنيه)</label>
            <input type="number" id="calcElectricBoxes" value="0" min="0" oninput="calculatePrice()">
            
            <label>عدد علب الداتا (تليفزيون، انترنت، وحدة صوت - العلبه 40 جنيه)</label>
            <input type="number" id="calcDataBoxes" value="0" min="0" oninput="calculatePrice()">
            
            <label>عدد مخارج الإنارة - لمبات السقف (المخرج 20 جنيه)</label>
            <input type="number" id="calcLightOutputs" value="0" min="0" oninput="calculatePrice()">
            
            <label>عدد النجف على خطين (النجفة 30 جنيه)</label>
            <input type="number" id="calcChandeliers" value="0" min="0" oninput="calculatePrice()">
            
            <label>عدد سماعات السقف</label>
            <input type="number" id="calcSpeakers" value="0" min="0" oninput="calculatePrice()">
            
            <label>عدد أسبوطات السقف</label>
            <input type="number" id="calcSpotlights" value="0" min="0" oninput="calculatePrice()">
            
            <label>عدد وحدات الإنارة المتحركة بالسقف</label>
            <input type="number" id="calcMovingLights" value="0" min="0" oninput="calculatePrice()">
            
            <label>طريقة تركيب ليد بروفايل</label>
            <select id="calcLedType" onchange="calculatePrice()">
                <option value="بدون حفر">بدون حفر (25 جنيه للمتر)</option>
                <option value="بالحفر">بالحفر (60 جنيه للمتر)</option>
            </select>
            
            <label>عدد أمتار ليد بروفايل</label>
            <input type="number" id="calcLedMeters" value="0" min="0" oninput="calculatePrice()">
            
            <label>عدد بريزات تركيب الإكسسوار (البريزة 10 جنيه)</label>
            <input type="number" id="calcAccessoryOutlets" value="0" min="0" oninput="calculatePrice()">
            
            <label>عدد المفاتيح (المفتاح 10 جنيه)</label>
            <input type="number" id="calcSwitches" value="0" min="0" oninput="calculatePrice()">
            
            <label>شاشة تحكم السمارت هوم</label>
            <select id="calcSmartScreen" onchange="calculatePrice()">
                <option value="لا">لا يوجد</option>
                <option value="نعم">يوجد (تركيب 500 جنيه)</option>
            </select>
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
    const modal = document.getElementById('formModal');
    if (modal) modal.style.display = 'none';
}

function calculatePrice() {
    const titleElement = document.getElementById('formTitle');
    if (!titleElement) return;
    const title = titleElement.innerText;
    let total = 0;
    let breakdown = '';
    
    if (title === 'تأسيس شقق') {
        const pipeType = document.getElementById('calcPipeType')?.value || 'PVC';
        const pipeLength = parseInt(document.getElementById('calcPipeLength')?.value || 0);
        const takhilLength = parseInt(document.getElementById('calcTakhilLength')?.value || 0);
        const shedadLength = parseInt(document.getElementById('calcShedadLength')?.value || 0);
        
        const wallBreakMeters = parseInt(document.getElementById('calcWallBreakMeters')?.value || 0);
        const concreteChiselMeters = parseInt(document.getElementById('calcConcreteChiselMeters')?.value || 0);
        const gypsumSpotHoles = parseInt(document.getElementById('calcGypsumSpotHoles')?.value || 0);
        
        const panelsCount = parseInt(document.getElementById('calcPanelsCount')?.value || 0);
        const electricBoxes = parseInt(document.getElementById('calcElectricBoxes')?.value || 0);
        const dataBoxes = parseInt(document.getElementById('calcDataBoxes')?.value || 0);
        const lightOutputs = parseInt(document.getElementById('calcLightOutputs')?.value || 0);
        const chandeliers = parseInt(document.getElementById('calcChandeliers')?.value || 0);
        const speakers = parseInt(document.getElementById('calcSpeakers')?.value || 0);
        const spotlights = parseInt(document.getElementById('calcSpotlights')?.value || 0);
        const movingLights = parseInt(document.getElementById('calcMovingLights')?.value || 0);
        
        const ledType = document.getElementById('calcLedType')?.value || 'بدون حفر';
        const ledMeters = parseInt(document.getElementById('calcLedMeters')?.value || 0);
        
        const accessoryOutlets = parseInt(document.getElementById('calcAccessoryOutlets')?.value || 0);
        const switches = parseInt(document.getElementById('calcSwitches')?.value || 0);
        const smartScreen = document.getElementById('calcSmartScreen')?.value === 'نعم';

        let pipeUnitPrice = pipeType === 'EMT' ? 60 : 40;
        let takhilUnitPrice = pipeType === 'EMT' ? 25 : 20;
        let shedadUnitPrice = pipeType === 'EMT' ? 10 : 5;

        const pipeTotal = pipeLength * pipeUnitPrice;
        const takhilTotal = takhilLength * takhilUnitPrice;
        const shedadTotal = shedadLength * shedadUnitPrice;
        
        const wallBreakTotal = wallBreakMeters * 25;
        const concreteChiselTotal = concreteChiselMeters * 50;
        const gypsumSpotTotal = gypsumSpotHoles * 5;
        
        const panelsTotal = panelsCount * 600;
        const boxesTotal = (electricBoxes + dataBoxes) * 40;
        const lightOutputsTotal = lightOutputs * 20;
        const chandeliersTotal = chandeliers * 30;
        
        const speakersTotal = speakers * 30;
        const spotlightsTotal = spotlights * 20;
        const movingLightsTotal = movingLights * 30;

        let ledUnitPrice = ledType === 'بالحفر' ? 60 : 25;
        const ledTotal = ledMeters * ledUnitPrice;

        const accessoryTotal = accessoryOutlets * 10;
        const switchesTotal = switches * 10;
        const smartScreenTotal = smartScreen ? 500 : 0;

        total = pipeTotal + takhilTotal + shedadTotal + wallBreakTotal + concreteChiselTotal + 
                gypsumSpotTotal + panelsTotal + boxesTotal + lightOutputsTotal + chandeliersTotal + 
                speakersTotal + spotlightsTotal + movingLightsTotal + ledTotal + accessoryTotal + 
                switchesTotal + smartScreenTotal;
        
        breakdown = `<small style="line-height: 1.6; display: block;">
            - مواسير ${pipeType} (${pipeLength}م × ${pipeUnitPrice}ج) = ${pipeTotal} ج.م<br>
            - التكحيل (${takhilLength}م × ${takhilUnitPrice}ج) = ${takhilTotal} ج.م<br>
            - الشداد (${shedadLength}م × ${shedadUnitPrice}ج) = ${shedadTotal} ج.م<br>
            ${wallBreakMeters > 0 ? `- تكسير حوائط (${wallBreakMeters}م × 25ج) = ${wallBreakTotal} ج.م<br>` : ''}
            ${concreteChiselMeters > 0 ? `- نحت خرسانة (${concreteChiselMeters}م × 50ج) = ${concreteChiselTotal} ج.م<br>` : ''}
            ${gypsumSpotHoles > 0 ? `- فتحات جبس للأسبوت (${gypsumSpotHoles} × 5ج) = ${gypsumSpotTotal} ج.م<br>` : ''}
            - لوحات تأسيس (${panelsCount} × 600ج) = ${panelsTotal} ج.م<br>
            - علب كهرباء وداتا (${electricBoxes + dataBoxes} × 40ج) = ${boxesTotal} ج.م<br>
            - مخارج إنارة سقف (${lightOutputs} × 20ج) = ${lightOutputsTotal} ج.م<br>
            - نجف على خطين (${chandeliers} × 30ج) = ${chandeliersTotal} ج.م<br>
            ${speakers > 0 ? `- سماعات سقف (${speakers} × 30ج) = ${speakersTotal} ج.م<br>` : ''}
            ${spotlights > 0 ? `- أسبوطات سقف (${spotlights} × 20ج) = ${spotlightsTotal} ج.م<br>` : ''}
            ${movingLights > 0 ? `- إنارة متحركة (${movingLights} × 30ج) = ${movingLightsTotal} ج.م<br>` : ''}
            - ليد بروفايل ${ledType} (${ledMeters}م × ${ledUnitPrice}ج) = ${ledTotal} ج.م<br>
            - بريزات إكسسوار (${accessoryOutlets} × 10ج) = ${accessoryTotal} ج.م<br>
            - مفاتيح (${switches} × 10ج) = ${switchesTotal} ج.م<br>
            ${smartScreen ? `- شاشة تحكم سمارت هوم = 500 ج.م` : ''}
        </small>`;

    } else if (title === 'تأسيس سقف') {
        const pipeType = document.getElementById('calcPipeType')?.value || 'PVC';
        const pipeLength = parseInt(document.getElementById('calcPipeLength')?.value || 0);
        const takhilLength = parseInt(document.getElementById('calcTakhilLength')?.value || 0);
        const shedadLength = parseInt(document.getElementById('calcShedadLength')?.value || 0);

        let pipeUnitPrice = pipeType === 'EMT' ? 60 : 35;
        let takhilUnitPrice = pipeType === 'EMT' ? 25 : 10;
        let shedadUnitPrice = pipeType === 'EMT' ? 10 : 5;

        const pipeTotal = pipeLength * pipeUnitPrice;
        const takhilTotal = takhilLength * takhilUnitPrice;
        const shedadTotal = shedadLength * shedadUnitPrice;

        total = pipeTotal + takhilTotal + shedadTotal;
        breakdown = `<small>
            - مواسير ${pipeType} (${pipeLength}م × ${pipeUnitPrice}ج) = ${pipeTotal} ج.م<br>
            - التكحيل / القورب (${takhilLength}م × ${takhilUnitPrice}ج) = ${takhilTotal} ج.م<br>
            - الشداد (${shedadLength}م × ${shedadUnitPrice}ج) = ${shedadTotal} ج.م
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
        const { data } = await window.supabaseClient.from('service_requests').select('*').eq('customer_name', name);
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
    const name = document.getElementById('customerName')?.value || '';
    const phone = document.getElementById('customerPhone')?.value || '';
    const address = document.getElementById('customerAddress')?.value || '';
    const serviceTitle = document.getElementById('formTitle')?.innerText || 'خدمة';
    const finalPrice = window.finalCalculatedPrice || 0;
    
    const submitBtn = document.querySelector('#serviceForm button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerText : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = '⏳ جاري تسجيل الاتفاق وحفظ الحالة بالوقت الفعلي...';
    }

    const currentTimestamp = new Date().toISOString();

    if (window.supabaseClient) {
        try {
            await window.supabaseClient.from('service_requests').insert([
                { 
                    customer_name: name, 
                    customer_phone: phone, 
                    address: address, 
                    service_name: serviceTitle, 
                    price: finalPrice, 
                    status: 'قيد الانتظار',
                    status_color: '#f1c40f',
                    pending_at: currentTimestamp,
                    created_at: currentTimestamp
                }
            ]);
        } catch(e) { 
            console.log('Supabase insert error:', e); 
        }
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = originalBtnText;
    }

    let msg = `السلام عليكم، أطلب تسجيل اتفاق بالطلب وليس تعاقد: ${serviceTitle}%0aالاسم: ${name}%0aالهاتف: ${phone}%0aالعنوان: ${address}%0aالسعر التقديري: ${finalPrice} ج.م%0a(حالة الطلب: قيد الانتظار 🟡)`;
    if (window.isVipCustomer) msg += `%0a✓ تم تطبيق خصم 5% للعميل المميز VIP`;
    
    window.open(`https://wa.me/201287837118?text=${msg}`, '_blank');
    closeForm();
}

function addExperienceField() {
    const container = document.getElementById('experiencesContainer');
    if (!container) return;
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
    const name = document.getElementById('tName')?.value || '';
    const phone = document.getElementById('tPhone')?.value || '';
    const specialty = document.getElementById('tSpecialty')?.value || '';
    const area = document.getElementById('tArea')?.value || '';
    
    if (window.supabaseClient) {
        try {
            const { data: techData } = await window.supabaseClient.from('technicians').insert([
                { name: name, phone: phone, specialty: specialty, area: area, total_stars: 0 }
            ]).select();
            if (techData && techData.length > 0) {
                const techId = techData[0].id;
                for (let group of document.querySelectorAll('.exp-group')) {
                    await window.supabaseClient.from('technician_experiences').insert([{
                        technician_id: techId,
                        job_title: group.querySelector('.exp-title').value,
                        workplace: group.querySelector('.exp-workplace').value,
                        duration: group.querySelector('.exp-duration').value
                    }]);
                }
            }
        } catch(e) { console.log('Tech error:', e); }
    }
    alert('تم إرسال طلب انضمامك كفني بنجاح!');
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
            const { data } = await window.supabaseClient.from('technicians').select('*');
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
            const { data } = await window.supabaseClient.from('technicians').select('total_stars').eq('id', techId).single();
            let newTotal = (data ? (data.total_stars || 0) : 0) + starsGiven;
            await window.supabaseClient.from('technicians').update({ total_stars: newTotal }).eq('id', techId);
        } catch(e) {}
    }
    loadTechnicians();
}

function toggleChat() {
    const chat = document.getElementById('chatBox');
    if (chat) {
        chat.style.display = chat.style.display === 'flex' ? 'none' : 'flex';
    }
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    
    const body = document.getElementById('chatBody');
    if (!body) return;
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-message outgoing';
    userMsg.innerText = text;
    body.appendChild(userMsg);
    input.value = '';
    body.scrollTop = body.scrollHeight;

    setTimeout(() => {
        const replyMsg = document.createElement('div');
        replyMsg.className = 'chat-message incoming';
        replyMsg.innerText = 'شكراً لتواصلك مع SN ELECTRIC. تم استلام رسالتك وسيتم الرد عليك قريباً.';
        body.appendChild(replyMsg);
        body.scrollTop = body.scrollHeight;
    }, 1000);
}
