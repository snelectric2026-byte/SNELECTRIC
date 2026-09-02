// تطبيق الرسم الهندسي - معالج الحفظ المحلي فقط (بدون إنترنت)

let deferredPrompt;

// ✅ حفظ الرسمة محلياً على الجهاز
function saveDrawingLocally() {
    const canvas = window.canvasApp;
    if (!canvas) {
        alert('❌ خطأ: لم يتم العثور على لوحة الرسم!');
        return;
    }
    
    const timestamp = new Date().getTime();
    const imageData = canvas.toDataURL('image/png');
    
    // 📥 تحميل الملف على الجهاز
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `رسمة_${timestamp}.png`;
    link.click();
    
    // 💾 حفظ في Local Storage
    const drawingName = `drawing_${timestamp}`;
    localStorage.setItem(drawingName, JSON.stringify({
        name: `رسمة_${new Date().toLocaleString('ar-EG')}`,
        data: imageData,
        timestamp: timestamp,
        size: Math.round(imageData.length / 1024) + ' KB'
    }));
    
    // ✨ إظهار إشعار النجاح
    showSuccessNotification('✅ تم حفظ الرسمة على جهازك بنجاح!');
}

// ✅ عرض معرض الرسمات المحفوظة محلياً
function showLocalGallery() {
    const drawings = getLocalDrawings();
    
    if (drawings.length === 0) {
        alert('📭 لا توجد رسمات محفوظة على جهازك!\n\nابدأ برسم جديد وحفظه.');
        return;
    }
    
    let html = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; padding: 20px; max-width: 1200px;">
    `;
    
    drawings.forEach((drawing, index) => {
        html += `
            <div style="border: 2px solid #00f2fe; border-radius: 12px; padding: 12px; text-align: center; background: rgba(0,242,254,0.1); transition: all 0.3s;">
                <img src="${drawing.data}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 10px; border: 1px solid #00f2fe;">
                <p style="color: #00f2fe; font-size: 12px; margin: 8px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${drawing.name}</p>
                <p style="color: #94a3b8; font-size: 11px; margin: 5px 0;">${drawing.size}</p>
                <div style="display: flex; gap: 5px; margin-top: 10px;">
                    <button onclick="downloadLocalDrawing(${drawing.timestamp})" style="flex: 1; padding: 6px 8px; background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); color: #000; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 12px; transition: transform 0.2s;">📥 تحميل</button>
                    <button onclick="deleteLocalDrawing(${drawing.timestamp})" style="flex: 1; padding: 6px 8px; background: linear-gradient(135deg, #ff4d6d 0%, #7209b7 100%); color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 12px; transition: transform 0.2s;">🗑️ حذف</button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    // 📂 عرض المعرض في Modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; 
        top: 0; 
        left: 0; 
        width: 100%; 
        height: 100%; 
        background: rgba(11, 15, 25, 0.95); 
        z-index: 9999; 
        overflow-y: auto; 
        padding: 20px;
        backdrop-filter: blur(10px);
        direction: rtl;
    `;
    modal.innerHTML = `
        <div style="max-width: 1200px; margin: 0 auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #00f2fe;">
                <h2 style="color: #00f2fe; margin: 0; font-size: 24px;">📂 رسماتي المحفوظة</h2>
                <button onclick="this.closest('[style*=position]').remove()" style="padding: 8px 16px; background: #7209b7; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold;">✕ إغلاق</button>
            </div>
            <p style="color: #94a3b8; text-align: center; margin-bottom: 20px;">
                📊 عدد الرسمات: <span style="color: #00f2fe; font-weight: bold;">${drawings.length}</span>
            </p>
            ${html}
        </div>
    `;
    document.body.appendChild(modal);
}

// ✅ الحصول على جميع الرسمات المحفوظة
function getLocalDrawings() {
    const drawings = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('drawing_')) {
            try {
                const drawing = JSON.parse(localStorage.getItem(key));
                drawings.push({
                    timestamp: parseInt(key.replace('drawing_', '')),
                    ...drawing
                });
            } catch (e) {
                console.error('خطأ في قراءة الرسمة:', e);
            }
        }
    }
    return drawings.sort((a, b) => b.timestamp - a.timestamp);
}

// ✅ تحميل رسمة محلية
function downloadLocalDrawing(timestamp) {
    const key = `drawing_${timestamp}`;
    const drawing = JSON.parse(localStorage.getItem(key));
    
    if (!drawing) {
        alert('❌ لم يتم العثور على الرسمة!');
        return;
    }
    
    const link = document.createElement('a');
    link.href = drawing.data;
    link.download = `${drawing.name}.png`;
    link.click();
    
    showSuccessNotification('✅ جاري تحميل الرسمة...');
}

// ✅ حذف رسمة محلية
function deleteLocalDrawing(timestamp) {
    if (confirm('⚠️ هل أنت متأكد من حذف هذه الرسمة؟\n(لا يمكن استرجاعها)')) {
        const key = `drawing_${timestamp}`;
        localStorage.removeItem(key);
        
        showSuccessNotification('✅ تم حذف الرسمة!');
        
        // تحديث المعرض
        setTimeout(() => {
            document.querySelectorAll('[style*="position: fixed"]').forEach(el => el.remove());
            showLocalGallery();
        }, 500);
    }
}

// ✅ إظهار إشعار النجاح
function showSuccessNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
        color: #000;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 0 20px rgba(0, 242, 254, 0.5);
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ✅ حساب المساحة وعدد البرايز
function generateRoomLayout() {
    const width = parseFloat(document.getElementById('roomWidth').value) || 4;
    const height = parseFloat(document.getElementById('roomHeight').value) || 5;
    
    const area = (width * height).toFixed(2);
    const socketsCount = Math.ceil(area / 6);
    const switchesCount = Math.ceil(area / 15);
    const dataPointsCount = Math.ceil(area / 20);
    const lampCount = Math.ceil(area / 10);
    
    const result = `
        <div style="background: rgba(0,242,254,0.1); border: 2px solid #00f2fe; border-radius: 8px; padding: 15px; text-align: center;">
            <h3 style="color: #00f2fe; margin-top: 0;">📊 النتائج المحسوبة</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0;">
                <div style="background: rgba(0,242,254,0.2); padding: 10px; border-radius: 6px;">
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">المساحة الإجمالية</p>
                    <p style="color: #00f2fe; font-size: 18px; font-weight: bold; margin: 5px 0;">${area} م²</p>
                </div>
                <div style="background: rgba(0,242,254,0.2); padding: 10px; border-radius: 6px;">
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">المقاسات</p>
                    <p style="color: #00f2fe; font-size: 14px; font-weight: bold; margin: 5px 0;">${width}م × ${height}م</p>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 15px;">
                <div style="background: rgba(255,77,109,0.15); padding: 12px; border-radius: 6px; border-left: 3px solid #ff4d6d;">
                    <p style="color: #94a3b8; font-size: 11px; margin: 0;">🔌 البرايز المقترحة</p>
                    <p style="color: #ff4d6d; font-size: 20px; font-weight: bold; margin: 5px 0;">${socketsCount}</p>
                </div>
                <div style="background: rgba(0,242,254,0.15); padding: 12px; border-radius: 6px; border-left: 3px solid #00f2fe;">
                    <p style="color: #94a3b8; font-size: 11px; margin: 0;">🔘 المفاتيح</p>
                    <p style="color: #00f2fe; font-size: 20px; font-weight: bold; margin: 5px 0;">${switchesCount}</p>
                </div>
                <div style="background: rgba(0,255,136,0.15); padding: 12px; border-radius: 6px; border-left: 3px solid #00ff88;">
                    <p style="color: #94a3b8; font-size: 11px; margin: 0;">🌐 نقاط الداتا</p>
                    <p style="color: #00ff88; font-size: 20px; font-weight: bold; margin: 5px 0;">${dataPointsCount}</p>
                </div>
                <div style="background: rgba(255,183,3,0.15); padding: 12px; border-radius: 6px; border-left: 3px solid #ffb703;">
                    <p style="color: #94a3b8; font-size: 11px; margin: 0;">💡 الإضاءة</p>
                    <p style="color: #ffb703; font-size: 20px; font-weight: bold; margin: 5px 0;">${lampCount}</p>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('outDetails').innerHTML = result;
}

// ✅ دوال الـ Modals
function openTasissModal(type) {
    document.getElementById('tasissType').value = type;
    document.getElementById('tasissTitle').textContent = `طلب تأسيس ${type}`;
    document.getElementById('tasissModal').style.display = 'block';
}

function closeTasissModal() {
    document.getElementById('tasissModal').style.display = 'none';
}

function handleTasissSubmit(event) {
    event.preventDefault();
    showSuccessNotification('✅ تم استقبال طلب التأسيس بنجاح!');
    closeTasissModal();
    event.target.reset();
}

function openApplianceModal(appliance) {
    document.getElementById('applianceType').value = appliance;
    document.getElementById('applianceTitle').textContent = `طلب صيانة ${appliance}`;
    document.getElementById('applianceModal').style.display = 'block';
}

function closeApplianceModal() {
    document.getElementById('applianceModal').style.display = 'none';
}

function handleApplianceSubmit(event) {
    event.preventDefault();
    showSuccessNotification('✅ تم استقبال طلب الصيانة بنجاح!');
    closeApplianceModal();
    event.target.reset();
}

function openTechModal() {
    document.getElementById('techModal').style.display = 'block';
}

function closeTechModal() {
    document.getElementById('techModal').style.display = 'none';
}

function handleTechSubmit(event) {
    event.preventDefault();
    showSuccessNotification('✅ شكراً على تقديمك! سيتم مراجعة طلبك.');
    closeTechModal();
    event.target.reset();
}

function handleInspectionSubmit(event) {
    event.preventDefault();
    showSuccessNotification('✅ تم تسجيل طلب المعاينة!');
    event.target.reset();
}

function handleInquirySubmit(event) {
    event.preventDefault();
    showSuccessNotification('✅ تم إرسال استفسارك!');
    event.target.reset();
}

function toggleLocationInputs() {
    const locType = document.getElementById('inspLocType').value;
    document.getElementById('govGroup').style.display = locType === 'gov' ? 'block' : 'none';
    document.getElementById('mapGroup').style.display = locType === 'map' ? 'block' : 'none';
}

function getGPSLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const mapLink = `https://www.google.com/maps?q=${lat},${lon}`;
            document.getElementById('inspMapLink').value = mapLink;
            showSuccessNotification('✅ تم الحصول على الموقع!');
        });
    }
}

function toggleChat() {
    const chatBox = document.getElementById('chatBox');
    chatBox.style.display = chatBox.style.display === 'none' ? 'block' : 'none';
}

function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    const chatBody = document.getElementById('chatBody');
    
    const userMsg = document.createElement('div');
    userMsg.style.cssText = 'background: rgba(0,242,254,0.3); color: #fff; padding: 8px 12px; border-radius: 8px; align-self: flex-end; max-width: 80%;';
    userMsg.textContent = message;
    chatBody.appendChild(userMsg);
    
    setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.style.cssText = 'background: rgba(255,255,255,0.05); color: #fff; padding: 8px 12px; border-radius: 8px; align-self: flex-start;';
        botMsg.textContent = 'شكراً على رسالتك! كيف يمكنني مساعدتك أكثر؟';
        chatBody.appendChild(botMsg);
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 500);
    
    chatInput.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;
}

// ❌ إغلاق الـ Modals عند النقر خارجها
window.onclick = function(event) {
    const tasissModal = document.getElementById('tasissModal');
    const applianceModal = document.getElementById('applianceModal');
    const techModal = document.getElementById('techModal');
    
    if (event.target == tasissModal) tasissModal.style.display = 'none';
    if (event.target == applianceModal) applianceModal.style.display = 'none';
    if (event.target == techModal) techModal.style.display = 'none';
};

// ✅ تسجيل Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW Registration failed:', err));
}
