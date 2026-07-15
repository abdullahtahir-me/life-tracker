import webpush, { type PushSubscription } from 'web-push'

let configured = false
let configuredPublicKey: string | undefined

function getVapidConfig() {
  return {
    publicKey:
      process.env.VAPID_PUBLIC_KEY ?? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY,
    subject: process.env.VAPID_SUBJECT ?? 'mailto:admin@example.com',
  }
}

export function getVapidPublicKey() {
  return getVapidConfig().publicKey
}

export function configureWebPush() {
  const { publicKey, privateKey, subject } = getVapidConfig()

  if (!publicKey || !privateKey) {
    throw new Error('Missing VAPID keys')
  }

  if (configured && configuredPublicKey === publicKey) return

  webpush.setVapidDetails(subject, publicKey, privateKey)
  configured = true
  configuredPublicKey = publicKey
}

export type WebPushPayload = {
  title: string
  body?: string
  url?: string
}

export async function sendWebPush(
  subscription: PushSubscription,
  payload: WebPushPayload,
) {
  configureWebPush()

  return webpush.sendNotification(subscription, JSON.stringify(payload))
}
