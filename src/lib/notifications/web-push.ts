import webpush, { type PushSubscription } from 'web-push'

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const privateKey = process.env.VAPID_PRIVATE_KEY
const subject = process.env.VAPID_SUBJECT ?? 'mailto:admin@example.com'

let configured = false

export function getVapidPublicKey() {
  return publicKey
}

export function configureWebPush() {
  if (configured) return

  if (!publicKey || !privateKey) {
    throw new Error('Missing VAPID keys')
  }

  webpush.setVapidDetails(subject, publicKey, privateKey)
  configured = true
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
