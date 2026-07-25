function openForm(serviceName) {
    document.getElementById('formModal').style.display = 'flex';
    document.getElementById('formTitle').innerText = 'طلب خدمة: ' + serviceName;
    
    const dynamicFields = document.getElementById('dynamicFields');
    dynamicFields.innerHTML = '';
    let basePrice = 300;
    
    if(serviceName === 'تأسيس كهرباء') {
        basePrice = 1500;
        dynamicFields.innerHTML = `
            <label>مساحة المكان تقريبا (متر مربع)</label>
            <input type="number" id="spaceArea" value="100" oninput="calculateTotal(${basePrice})" style="width:100%; padding:10px; margin-bottom:10px; background:#0d1729; color:#fff; border:1px solid var(--border); border-radius:8px;">
        `;
    } else if(serviceName === 'تشطيب إكسسوارات') {
        basePrice = 600;
        dynamicFields.innerHTML = `
            <label>عدد نقاط المفاتيح والبرايز</label>
            <input type="number" id="pointsCount" value="10" oninput="calculateTotal(${basePrice})" style="width:100%; padding:10px; margin-bottom:10px; background:#0d1729; color:#fff; border:1px solid var(--border); border-radius:8px;">
        `;
    } else if(serviceName === 'صيانة الأعطال') {
        basePrice = 250;
    } else if(serviceName === 'كاميرات مراقبة') {
        basePrice = 1200;
    }
    
    window.currentBasePrice = basePrice;
    calculateTotal(basePrice);
}

function closeForm() {
    document.getElementById('formModal').style.display = 'none';
}

function calculateTotal(base) {
    let total = base;
    const spaceArea = document.getElementById('spaceArea');
    const pointsCount = document.getElementById('pointsCount');
    
    if(spaceArea) {
        total = spaceArea.value * 15;
    } else if(pointsCount) {
        total = pointsCount.value * 60;
    }
    
    if(window.isVipCustomer) {
        total = total * 0.95;
        const discountNotice = document.getElementById('vipDiscountNotice');
        discountNotice.style.display = 'block';
        discountNotice.innerText = 'تم تطبيق خصم 5% للعملاء المميزين (VIP)!';
    } else {
        document.getElementById('vipDiscountNotice').style.display = 'none';
    }
    
    window.finalCalculatedPrice = Math.round(total);
    document.getElementById('totalPrice').innerText = 'السعر التقديري: ' + window.finalCalculatedPrice + ' جنيه';
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
            calculateTotal(window.currentBasePrice || 300);
        } else {
            window.isVipCustomer = false;
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
    
    let msg = `السلام عليكم، أطلب خدمة: ${serviceTitle}%0aالاسم: ${name}%0aالهاتف: ${phone}%0aالعنوان: ${address}%0aالسعر التقديري: ${finalPrice} جنيه`;
    if(window.isVipCustomer) {
        msg += `%0a(ملاحظة: تم تطبيق خصم 5% للعميل المميز VIP)`;
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
        <input type="text" class="exp-title" required placeholder="مثال: فني تنفيذ رئيسي" style="width:100%; padding:10px; background:var(--dark); border:1px solid var(--border); border-radius:8px; color:#fff; margin-bottom:10px;">

        <label style="display:block; margin-bottom:5px; font-weight:700;">اسم المكان / الشركة / المشروع</label>
        <input type="text" class="exp-workplace" required placeholder="مثال: شركة النور" style="width:100%; padding:10px; background:var(--dark); border:1px solid var(--border); border-radius:8px; color:#fff; margin-bottom:10px;">

        <label style="display:block; margin-bottom:5px; font-weight:700;">المدة (الفترة الزمنية)</label>
        <input type="text" class="exp-duration" required placeholder="مثال: من 2021 إلى 2024" style="width:100%; padding:10px; background:var(--dark); border:1px solid var(--border); border-radius:8px; color:#fff;">
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
        if(lower.includes('طلب جديد') || lower.includes('أوردر ثالث') || lower.includes('أورد جديد') || lower.includes('كمان طلب') || lower.includes('خدمة كمان')) {
            reply = "بصفتك عميلاً مميزاً (VIP)، يسعدنا إبلاغك بأنه تم تطبيق خصم إضافي بقيمة 5% على تكلفة طلبك الجديد تقديراً لثقتك المستمرة بنا!";
            window.isVipCustomer = true;
        } else if(lower.includes('أسعار') || lower.includes('تكلفة')) {
            reply = "أسعارنا تنافسية للغاية مع خصم 5% تلقائي للعملاء المتكررين. يمكنك طلب الخدمة مباشرة من قسم الخدمات.";
        } else if(lower.includes('موعد') || lower.includes('متى')) {
            reply = "فريقنا الفني جاهز للتحرك الفوري بناءً على عنوانك ومواعيدك المفضلة.";
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
});
