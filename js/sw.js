// Service Worker لتطبيق SN ELECTRIC
const CACHE_NAME = 'snelectric-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/calculator.js',
  '/js/supabase.js',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/webfonts/fa-solid-900.woff2',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800;900&display=swap'
];

// تثبيت Service Worker والتخزين المؤقت للأصول الثابتة
self.addEventListener('install', (event) => {
  console.log('[Service Worker] تثبيت...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] تخزين مؤقت للأصول الثابتة');
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[Service Worker] بعض الأصول لم يتم تخزينها:', err);
        // لا نفشل عند عدم توفر بعض الموارد
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// تنظيف الكاش القديم
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] تفعيل...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] حذف كاش قديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// استراتيجية التخزين المؤقت: Cache First, then Network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // تجاهل الطلبات غير الـ GET
  if (request.method !== 'GET') {
    return;
  }

  // للملفات الثابتة: Cache First
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((response) => {
          // تخزين الردود الناجحة فقط
          if (response && response.status === 200 && response.type !== 'error') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        }).catch(() => {
          // رد بديل عند عدم الاتصال
          return createOfflineResponse();
        });
      })
    );
    return;
  }

  // للطلبات الديناميكية: Network First, then Cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // تخزين الردود الناجحة
        if (response && response.status === 200 && response.type !== 'error') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // البحث في الكاش عند فشل الشبكة
        return caches.match(request).then((response) => {
          return response || createOfflineResponse();
        });
      })
  );
});

// التعامل مع الرسائل من العميل
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// دالة للتحقق من الملفات الثابتة
function isStaticAsset(pathname) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/.test(pathname) ||
         pathname === '/' ||
         pathname === '/index.html' ||
         pathname === '/manifest.json';
}

// رد بديل عند عدم الاتصال
function createOfflineResponse() {
  return caches.match('/index.html').then((response) => {
    return response || new Response(
      '<h1>لا يوجد اتصال بالإنترنت</h1><p>يرجى التحقق من الاتصال وإعادة المحاولة</p>',
      {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
        status: 503,
        statusText: 'بدون اتصال'
      }
    );
  });
}

// معالجة الخطأ العام
self.addEventListener('error', (event) => {
  console.error('[Service Worker] خطأ:', event.error);
});
