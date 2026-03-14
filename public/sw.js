// Service Worker para receber notificações push

self.addEventListener('push', (event) => {
  console.log('Push recebido:', event);

  let data = { notification: { title: 'Nova notificação', body: '' } };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.notification.body = event.data.text();
    }
  }

  const options = {
    body: data.notification.body,
    icon: data.notification.icon || '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [100, 50, 100],
    data: data.notification.data || {},
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Fechar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.notification.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notificação clicada:', event);
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Se já existe uma janela aberta, foca nela
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Senão, abre uma nova janela
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker ativado');
  event.waitUntil(clients.claim());
});
