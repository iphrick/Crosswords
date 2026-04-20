/* =============================================
   SERVICE WORKER — JuriQuest Push Notifications
   ============================================= */
'use strict';

const CACHE_NAME = 'juriquest-v1';

// Instalação do SW
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Ativação
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Receber push notification do servidor
self.addEventListener('push', (event) => {
  let data = { title: 'JuriQuest', body: 'Você tem uma nova notificação!', icon: '/icon-192.png' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'juriquest-notification',
    renotify: true,
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    },
    actions: [
      { action: 'open', title: '⚖️ Ver Ranking' },
      { action: 'close', title: 'Fechar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'JuriQuest', options)
  );
});

// Click na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Se já tem uma janela aberta, foca nela
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Senão, abre uma nova
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// Sincronização em background (para verificar ranking quando o app estiver fechado)
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-ranking') {
    event.waitUntil(checkRankingInBackground());
  }
});

async function checkRankingInBackground() {
  try {
    const response = await fetch('/api/get-ranking');
    if (response.ok) {
      const data = await response.json();
      // Envia dados para o cliente ativo
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({ type: 'RANKING_UPDATE', ranking: data.ranking });
      });
    }
  } catch (e) {
    console.error('[SW] Erro ao verificar ranking:', e);
  }
}
