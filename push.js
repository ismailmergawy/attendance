// phone notifications (Firebase). call(fn, args) talks to the operations server with the page's own PIN.
(function () {
  const V = '10.12.2', libs = ['firebase-app-compat.js', 'firebase-messaging-compat.js'];
  const load = src => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => no(new Error('مفيش اتصال — جرب تاني')); document.head.append(s); });
  const ios = () => /iPhone|iPad|iPod/.test(navigator.userAgent), home = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  async function fb() { if (!self.FB_CFG) await load('fb-config.js?' + Date.now()); if (!self.FB_CFG) throw new Error('إشعارات الموبايل لسه مش جاهزة — إسماعيل بيجهزها');
    if (!self.firebase) { await load('https://www.gstatic.com/firebasejs/' + V + '/' + libs[0]); await load('https://www.gstatic.com/firebasejs/' + V + '/' + libs[1]); }
    if (!firebase.apps.length) firebase.initializeApp(self.FB_CFG); return firebase.messaging(); }
  window.LVPush = {
    state() { if (ios() && !home()) return 'addHome'; if (!('serviceWorker' in navigator) || !('Notification' in window) || !('PushManager' in window)) return 'unsupported';
      if (Notification.permission === 'denied') return 'denied'; try { return localStorage.getItem('pushTok') && Notification.permission === 'granted' ? 'on' : 'off'; } catch (e) { return 'off'; } },
    async enable(call) {
      const st = this.state();
      if (st === 'addHome') throw new Error('على الآيفون: من Safari دوس Share ← Add to Home Screen، وافتح الصفحة من الأيقونة الجديدة، وبعدين فعّل');
      if (st === 'unsupported') throw new Error('الموبايل ده مش بيدعم الإشعارات — حدّث iOS لـ 16.4 أو أحدث');
      if (st === 'denied') throw new Error('الإشعارات مقفولة للصفحة دي — افتحها من Settings ← Notifications');
      const perm = await Notification.requestPermission(); if (perm !== 'granted') throw new Error('لازم توافق على الإشعارات');
      const m = await fb(), reg = await navigator.serviceWorker.register('firebase-messaging-sw.js'); await navigator.serviceWorker.ready;
      const token = await m.getToken({ vapidKey: self.FB_VAPID, serviceWorkerRegistration: reg }); if (!token) throw new Error('مقدرتش أسجل الموبايل — جرب تاني');
      try { localStorage.setItem('pushTok', token); } catch (e) {}
      m.onMessage(p => { const n = (p && p.notification) || {}; reg.showNotification(n.title || 'Luxury VMS', { body: n.body || '', icon: 'icon-192.png' }); });
      return call('pushReg', { token: token, device: ios() ? 'iPhone' : /Android/.test(navigator.userAgent) ? 'Android' : 'Browser' });
    },
    async disable(call) { let t = ''; try { t = localStorage.getItem('pushTok') || ''; localStorage.removeItem('pushTok'); } catch (e) {} return call('pushOff', { token: t }); },
    test(call) { return call('pushTest'); }
  };
})();
