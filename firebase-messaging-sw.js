// background notifications for the home-screen page
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js', 'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js', 'fb-config.js');
if (self.FB_CFG) { firebase.initializeApp(self.FB_CFG); firebase.messaging(); }
self.addEventListener('notificationclick', e => { e.notification.close(); e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => { const w = ws.find(x => 'focus' in x); return w ? w.focus() : clients.openWindow('./'); })); });
