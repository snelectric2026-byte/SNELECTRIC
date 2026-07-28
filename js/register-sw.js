if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js', { scope: '/' })
      .then((reg) => console.log('[PWA] تم تسجيل Service Worker بنجاح:', reg))
      .catch((err) => console.warn('[PWA] فشل تسجيل Service Worker:', err));
  });
}
