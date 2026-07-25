// تسجيل Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/js/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('[PWA] تم تسجيل Service Worker بنجاح:', registration);
        
        // البحث عن التحديثات كل ساعة
        setInterval(() => {
          registration.update();
        }, 3600000);
      })
      .catch((error) => {
        console.warn('[PWA] فشل تسجيل Service Worker:', error);
      });

    // الاستماع لـ Controller التغيير
    navigator.serviceWorker.addEventListener('controller', () => {
      console.log('[PWA] تحديث Service Worker متاح');
      showUpdateNotification();
    });
  });
}

// عرض إشعار بوجود تحديث
function showUpdateNotification() {
  const updateBanner = document.createElement('div');
  updateBanner.id = 'update-banner';
  updateBanner.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #1e3a8a, #0d2749);
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    border-right: 4px solid #ffd700;
    z-index: 9999;
    max-width: 300px;
  `;
  updateBanner.innerHTML = `
    <div style="display: flex; gap: 15px; align-items: center;">
      <div>
        <p style="margin: 0; font-weight: bold;">✨ تحديث جديد متاح</p>
        <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.9;">تم تحديث التطبيق إعادة تحميل الصفحة</p>
      </div>
      <button onclick="location.reload()" style="
        background: #ffd700;
        color: #1e3a8a;
        border: none;
        padding: 8px 15px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
        white-space: nowrap;
      ">تحديث</button>
    </div>
  `;
  document.body.appendChild(updateBanner);
  
  // إغلاق البنر بعد 10 ثواني
  setTimeout(() => {
    if (updateBanner.parentNode) {
      updateBanner.remove();
    }
  }, 10000);
}

// عرض رسالة الرحب عند الفتح الأول
window.addEventListener('load', () => {
  const hasVisited = localStorage.getItem('snelectric-visited');
  if (!hasVisited) {
    localStorage.setItem('snelectric-visited', 'true');
    showFirstVisitWelcome();
  }
});

function showFirstVisitWelcome() {
  setTimeout(() => {
    const welcome = document.createElement('div');
    welcome.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #111e38;
      border: 2px solid #ffd700;
      padding: 30px;
      border-radius: 15px;
      z-index: 10000;
      max-width: 350px;
      text-align: center;
      direction: rtl;
    `;
    welcome.innerHTML = `
      <p style="font-size: 40px; margin: 0 0 15px 0;">⚡</p>
      <h2 style="color: #ffd700; margin: 0 0 10px 0; font-size: 24px;">أهلاً بك في SN ELECTRIC</h2>
      <p style="color: rgba(255,255,255,0.8); margin: 0 0 20px 0; font-size: 14px;">يمكنك الآن استخدام التطبيق بدون اتصال إنترنت!</p>
      <button onclick="this.closest('div').remove()" style="
        background: linear-gradient(135deg, #ffd700, #ff8c00);
        color: #1e3a8a;
        border: none;
        padding: 10px 30px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        font-size: 16px;
      ">فهمت</button>
    `;
    document.body.appendChild(welcome);
  }, 500);
}

// التحقق من الاتصال بالإنترنت
let isOnline = navigator.onLine;

window.addEventListener('online', () => {
  isOnline = true;
  console.log('[PWA] الاتصال بالإنترنت متاح');
  showConnectionStatus('الاتصال متاح ✓', '#4caf50');
});

window.addEventListener('offline', () => {
  isOnline = false;
  console.log('[PWA] بدون اتصال إنترنت');
  showConnectionStatus('بدون اتصال - يعمل بوضع بدون اتصال', '#ff9800');
});

function showConnectionStatus(message, color) {
  const status = document.createElement('div');
  status.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    background: ${color};
    color: white;
    padding: 10px 20px;
    border-radius: 6px;
    z-index: 9999;
    font-size: 12px;
    animation: slideIn 0.3s ease;
  `;
  status.textContent = message;
  document.body.appendChild(status);
  
  setTimeout(() => {
    status.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => status.remove(), 300);
  }, 3000);
}

// إضافة أنماط الحركة
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(-100%); opacity: 0; }
  }
`;
document.head.appendChild(style);
