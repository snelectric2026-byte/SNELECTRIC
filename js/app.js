nts = parseInt(document.getElementById('calcPoints')?.value || 0);
        const wireLength = parseInt(document.getElementById('calcWireLength')?.value || 0);
        const drillingType = document.getElementById('calcDrillingType')?.value || 'بدون';
        
        let pointPrice = 50;
        if(drillingType === 'بسيط') pointPrice = 100;
        else if(drillingType === 'عميق') pointPrice = 150;
        
        const pointsTotal = points * pointPrice;
        const wireTotal = wireLength * 10;
        
        total = pointsTotal + wireTotal;
        breakdown = `
            <small>
                ${points} نقاط × ${pointPrice} ج.م = ${pointsTotal} ج.م<br>
                ${wireLength} متر سلك × 10 ج.م = ${wireTotal} ج.م
            </small>
        `;
    } else if(service === 'تشطيب إكسسوارات') {
        const points = parseInt(document.getElementById('calcPoints')?.value || 0);
        const boxes = parseInt(document.getElementById('calcBoxes')?.value || 0);
        const panels = parseInt(document.getElementById('calcPanels')?.value || 0);
        const automatic = parseInt(document.getElementById('calcAutomatic')?.value || 0);
        
        const pointsTotal = points * 50;
        const boxesTotal = boxes * 40;
        const panelsTotal = panels * 200;
        const automaticTotal = automatic * 50;
        
        total = pointsTotal + boxesTotal + panelsTotal + automaticTotal;
        breakdown = `
            <small>
                ${points} نقطة × 50 ج.م = ${pointsTotal} ج.م<br>
                ${boxes} علبة × 40 ج.م = ${boxesTotal} ج.م<br>
                ${panels} لوحة × 200 ج.م = ${panelsTotal} ج.م<br>
                ${automatic} مفتاح أوتوماتيك × 50 ج.م = ${automaticTotal} ج.م
            </small>
        `;
    } else if(service === 'صيانة أجهزة منزلية') {
        const appliance = document.getElementById('calcAppliance')?.value;
        
        const prices = {
            'غسالة': 350,
            'بوتاجاز': 300,
            'ثلاجة': 400,
            'سخان': 250,
            'ميكروويف': 200,
            'خلاط': 150
        };
        
        total = appliance && prices[appliance] ? prices[appliance] : 0;
        breakdown = `<small>صيانة ${appliance}: ${total} ج.م (تقديري - قبل المعاينة)</small>`;
    } else if(service === 'كاميرات مراقبة') {
        const cameras = parseInt(document.getElementById('calcCameras')?.value || 1);
        const cableLength = parseInt(document.getElementById('calcCableLength')?.value || 0);
        const installationType = document.getElementById('calcInstallationType')?.value;
        
        const camerasTotal = cameras * 300;
        const cableTotal = cableLength * 5;
        const installationFee = installationType === 'متقدم' ? 500 : 0;
        
        total = camerasTotal + cableTotal + installationFee;
        breakdown = `
            <small>
                ${cameras} كاميرا × 300 ج.م = ${camerasTotal} ج.م<br>
                ${cableLength} متر أسلاك × 5 ج.م = ${cableTotal} ج.م
                ${installationFee > 0 ? '<br>رسوم التركيب المتقدم = ' + installationFee + ' ج.م' : ''}
            </small>
        `;
    } else if(service === 'المعاينة') {
        total = 100;
        breakdown = `<small>سعر المعاينة في المحافظة</small>`;
    }
    
    let finalTotal = total;
    if(window.isVipCustomer) {
        finalTotal = Math.round(total * 0.95);
    }
    
    if(document.getElementById('priceBreakdown')) {
        document.getElementById('priceBreakdown').innerHTML = breakdown;
    }
    if(document.getElementById('finalPrice')) {
        document.getElementById('finalPrice').innerText = finalTotal;
    }
    if(document.getElementById('totalPrice')) {
        document.getElementById('totalPrice').innerText = 'السعر التقديري: ' + finalTotal + ' جنيه';
    }
    
    window.finalCalculatedPrice = finalTotal;
    
    if(window.isVipCustomer && document.getElementById('vipDiscountNotice')) {
        document.getElementById('vipDiscountNotice').style.display = 'block';
        document.getElementById('vipDiscountNotice').innerText = '✓ تم تطبيق خصم 5% للعملاء المميزين (VIP)! السعر الأصلي: ' + total + ' ج.م';
    }
}

async function checkCustomerStatus(name) {
    if(!name || !window.supabaseClient) return;
    try {
        const { data, error } = await supabaseClient
            .from('service_requests')
            .select('*')
            .eq('customer_name', name);
            
        if(data && data.length >= 1) {
            window.isVipCustomer = true;
            const welcomeArea = document.getElementById('customerWelcomeArea');
            if(welcomeArea) {
                welcomeArea.innerHTML = `<span class="vip-badge"><i class="fa-solid fa-crown"></i> عميل مميز VIP (إجمالي طلباتك السابقة: ${data.length})</span>`;
            }
            calculatePrice();
        } else {
            window.isVipCustomer = false;
            if(document.getElementById('vipDiscountNotice')) {
                document.getElementById('vipDiscountNotice').style.display = 'none';
            }
        }
    } catch(err) {
        console.log('Error checking customer status:', err);
    }
}

async function sendWhatsApp() {
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const address = document.getElementById('customerAddress').value;
    const serviceTitle = document.getElementById('formTitle').innerText;
    const finalPrice = window.finalCalculatedPrice || 0;
    
    if(window.supabaseClient) {
        try {
            await supabaseClient.from('service_requests').insert([
                { customer_name: name, customer_phone: phone, address: address, service_name: serviceTitle, price: finalPrice, status: 'جديد' }
            ]);
            
            await supabaseClient.from('customers').upsert([
                { name: name, phone: phone, total_orders: 1 }
            ], { onConflict: 'phone' });
        } catch(e) {
            console.log('Supabase insert note:', e);
        }
    }
    
    let msg = `السلام عليكم، أطلب خدمة: ${serviceTitle}%0aالاسم: ${name}%0aالهاتف: ${phone}%0aالعنوان: ${address}%0aالسعر التقديري: ${finalPrice} ج.م%0a(ملاحظة: هذا السعر تقديري ويتم تأكيده بعد المعاينة)`;
    if(window.isVipCustomer) {
        msg += `%0a✓ تم تطبيق خصم 5% للعميل المميز VIP`;
    }
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
    
    if(window.supabaseClient) {
        try {
            const { data: techData, error } = await supabaseClient.from('technicians').insert([
                { name: name, phone: phone, specialty: specialty, area: area, total_stars: 0 }
            ]).select();
            
            if(techData && techData.length > 0) {
                const techId = techData[0].id;
                const expGroups = document.querySelectorAll('.exp-group');
                for(let group of expGroups) {
                    const title = group.querySelector('.exp-title').value;
                    const workplace = group.querySelector('.exp-workplace').value;
                    const duration = group.querySelector('.exp-duration').value;
                    
                    await supabaseClient.from('technician_experiences').insert([
                        { technician_id: techId, job_title: title, workplace: workplace, duration: duration }
                    ]);
                }
            }
        } catch(e) {
            console.log('Tech submit error:', e);
        }
    }
    
    alert('تم إرسال طلب انضمامك كفني بنجاح! سيتم مراجعة بياناتك وإضافتك للقائمة.');
    document.getElementById('tName').value = '';
    document.getElementById('tPhone').value = '';
    document.getElementById('tArea').value = '';
    loadTechnicians();
}

async function loadTechnicians() {
    const container = document.getElementById('techniciansContainer');
    if(!container) return;
    
    let techs = [
        { id: 1, name: 'محمد إبراهيم', specialty: 'تأسيس كهرباء وصيانة', area: 'القاهرة والجيزة', total_stars: 9 },
        { id: 2, name: 'محمود عبد الفتاح', specialty: 'كاميرات مراقبة وإكسسوارات', area: 'الإسكندرية', total_stars: 10 }
        { id: 3, name: 'محمد على', specialty: ' صيانة اجهزة منزليه', area: ' اسكندرية /العجمى  ', total_stars:8 },
        { id: 4, name: 'احمد رزق', specialty: 'كاميرات مراقبة وإكسسوارات', area: ' الحبزة ', total_stars: 8}
    ];
    
    if(window.supabaseClient) {
        try {
            const { data } = await supabaseClient.from('technicians').select('*');
            if(data && data.length > 0) techs = data;
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
            <p><strong>النجوم الحالية:</strong> <span id="star-count-${tech.id}">${stars}</span> ⭐</p>
            ${bonusBadge}
            <div class="rating-stars" data-tech-id="${tech.id}">
                <i class="fa-star fa-solid" onclick="rateTech(${tech.id}, 1)"></i>
                <i class="fa-star fa-solid" onclick="rateTech(${tech.id}, 2)"></i>
                <i class="fa-star fa-solid" onclick="rateTech(${tech.id}, 3)"></i>
                <i class="fa-star fa-solid" onclick="rateTech(${tech.id}, 4)"></i>
                <i class="fa-star fa-solid" onclick="rateTech(${tech.id}, 5)"></i>
            </div>
        `;
        container.appendChild(card);
    });
}

async function rateTech(techId, starsGiven) {
    alert(`شكراً لتقييمك! تم منح الفني ${starsGiven} نجوم.`);
    if(window.supabaseClient) {
        try {
            const { data } = await supabaseClient.from('technicians').select('total_stars').eq('id', techId).single();
            let currentStars = data ? (data.total_stars || 0) : 0;
            let newTotal = currentStars + starsGiven;
            
            await supabaseClient.from('technicians').update({ total_stars: newTotal }).eq('id', techId);
            await supabaseClient.from('reviews').insert([{ technician_id: techId, stars: starsGiven }]);
        } catch(e) {
            console.log('Rating error:', e);
        }
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
    if(!text) return;
    
    appendMessage(text, 'outgoing');
    input.value = '';
    
    setTimeout(() => {
        let reply = "شكراً لتواصلك مع إدارة SN ELECTRIC. لقد تلقينا رسالتك وسنتابع طلبك فوراً.";
        
        const lower = text.toLowerCase();
        if(lower.includes('طلب جديد') || lower.includes('أوردر') || lower.includes('خدمة')) {
            reply = "بصفتك عميلاً مميزاً (VIP)، يسعدنا إبلاغك بأنه تم تطبيق خصم إضافي بقيمة 5% على تكلفة طلبك الجديد. برجاء اختيار الخدمة المطلوبة من القسم المخصص.";
            window.isVipCustomer = true;
        } else if(lower.includes('أسعار') || lower.includes('تكلفة')) {
            reply = "أسعارنا تنافسية للغاية مع خصم 5% تلقائي للعملاء المتكررين. جميع الأسعار تقديرية وتتم مراجعتها بعد المعاينة. يمكنك طلب الخدمة مباشرة من قسم الخدمات.";
        } else if(lower.includes('موعد') || lower.includes('متى')) {
            reply = "فريقنا الفني جاهز للتحرك الفوري بناءً على عنوانك ومواعيدك المفضلة. برجاء تقديم طلبك والاتفاق على التفاصيل عبر واتساب.";
        }
        
        appendMessage(reply, 'incoming');
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
