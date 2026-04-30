self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.titulo || 'Nueva notificacion'
  const body = data.descripcion || 'Tienes una alerta pendiente.'
  const path = typeof data.path === 'string' && data.path.startsWith('/') ? data.path : '/'

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/vite.svg',
      badge: '/vite.svg',
      data: {
        path,
      },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const rawPath = event.notification?.data?.path
  const path = typeof rawPath === 'string' && rawPath.startsWith('/') ? rawPath : '/'
  const targetUrl = new URL(path, self.location.origin).href

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.navigate(targetUrl)
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
      return null
    })
  )
})
