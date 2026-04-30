import { del, get, post, silent } from './api'

const SW_URL = '/push-sw.js'
const SW_SCOPE = '/'
const ENDPOINT_STORAGE_KEY = 'push_endpoint'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function isSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

async function getPublicKey() {
  const response = await get('/push/public-key', {}, silent())
  return response.data?.data?.public_key || ''
}

async function registerSubscription(subscription) {
  await post('/push/subscribe', subscription.toJSON(), silent())
  localStorage.setItem(ENDPOINT_STORAGE_KEY, subscription.endpoint)
}

async function ensureSubscribed() {
  if (!isSupported()) return
  if (Notification.permission === 'denied') return

  const permission =
    Notification.permission === 'granted'
      ? 'granted'
      : await Notification.requestPermission()
  if (permission !== 'granted') return

  const publicKey = await getPublicKey()
  if (!publicKey) return

  const registration = await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE })
  let subscription = await registration.pushManager.getSubscription()

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    })
  }

  await registerSubscription(subscription)
}

async function unsubscribeServer(endpoint) {
  if (!endpoint) return
  try {
    await del('/push/unsubscribe', { data: { endpoint }, ...silent() })
  } catch {
    // No bloquea logout o cambios de sesión.
  }
}

async function cleanupForLogout() {
  const endpoint = localStorage.getItem(ENDPOINT_STORAGE_KEY)
  await unsubscribeServer(endpoint)
  localStorage.removeItem(ENDPOINT_STORAGE_KEY)
}

export const pushService = {
  isSupported,
  ensureSubscribed,
  cleanupForLogout,
}
