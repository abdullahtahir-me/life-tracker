'use client'

import { useEffect, useMemo, useState } from 'react'
import { BellDot, BellOff, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

type PushStatus =
  | 'checking'
  | 'unsupported'
  | 'blocked'
  | 'disabled'
  | 'enabled'
  | 'error'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index)
  }

  return outputArray
}

function getApplicationServerKey(publicKey: string) {
  const applicationServerKey = urlBase64ToUint8Array(publicKey.trim())

  if (applicationServerKey.byteLength !== 65) {
    throw new Error('Invalid VAPID public key')
  }

  return applicationServerKey
}

async function getServiceWorkerRegistration() {
  const existing = await navigator.serviceWorker.getRegistration('/')

  if (existing) {
    return navigator.serviceWorker.ready
  }

  await navigator.serviceWorker.register('/sw.js', { scope: '/' })
  return navigator.serviceWorker.ready
}

async function getExistingPushSubscription(
  registration: ServiceWorkerRegistration,
) {
  try {
    return await registration.pushManager.getSubscription()
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.warn('Ignoring stale browser push subscription:', error)
      return null
    }

    throw error
  }
}

export function PushNotificationSettings() {
  const [status, setStatus] = useState<PushStatus>('checking')
  const [isBusy, setIsBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const checkSubscription = async () => {
      if (process.env.NODE_ENV !== 'production') {
        setStatus('unsupported')
        setMessage('Web push is only available in production builds.')
        return
      }

      if (
        !('serviceWorker' in navigator) ||
        !('PushManager' in window) ||
        !('Notification' in window)
      ) {
        setStatus('unsupported')
        return
      }

      if (!window.isSecureContext) {
        setStatus('unsupported')
        return
      }

      if (Notification.permission === 'denied') {
        setStatus('blocked')
        return
      }

      try {
        const registration = await getServiceWorkerRegistration()
        const subscription = await getExistingPushSubscription(registration)

        setStatus(subscription ? 'enabled' : 'disabled')
      } catch (error) {
        console.error('Push subscription check failed:', error)
        setStatus('error')
      }
    }

    checkSubscription()
  }, [])

  const statusLabel = useMemo(() => {
    switch (status) {
      case 'checking':
        return 'Checking browser support'
      case 'unsupported':
        return 'Unavailable in this browser'
      case 'blocked':
        return 'Blocked by browser settings'
      case 'enabled':
        return 'Enabled for this browser'
      case 'error':
        return 'Setup needs attention'
      default:
        return 'Not enabled'
    }
  }, [status])

  const enableNotifications = async () => {
    setIsBusy(true)
    setMessage(null)
    let setupStep = 'requesting notification permission'

    try {
      if (process.env.NODE_ENV !== 'production') {
        throw new Error('Web push is only available in production builds.')
      }

      const permission = await Notification.requestPermission()

      if (permission === 'denied') {
        setStatus('blocked')
        return
      }

      if (permission !== 'granted') {
        setStatus('disabled')
        return
      }

      setupStep = 'loading VAPID public key'
      const keyResponse = await fetch('/api/push/public-key')

      if (!keyResponse.ok) {
        throw new Error('Web push is not configured on the server')
      }

      const { publicKey } = (await keyResponse.json()) as { publicKey: string }
      setupStep = 'validating VAPID public key'
      const applicationServerKey = getApplicationServerKey(publicKey)

      setupStep = 'waiting for service worker'
      const registration = await getServiceWorkerRegistration()

      setupStep = 'checking existing browser subscription'
      const existingSubscription = await getExistingPushSubscription(registration)

      if (existingSubscription) {
        setupStep = 'removing existing browser subscription'
        await existingSubscription.unsubscribe()
      }

      setupStep = 'creating browser push subscription'
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      })

      setupStep = 'saving browser push subscription'
      const saveResponse = await fetch('/api/push/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      })

      if (!saveResponse.ok) {
        throw new Error('Could not save this browser subscription')
      }

      setStatus('enabled')
      setMessage('Notifications enabled.')
    } catch (error) {
      console.error(`Push notification setup failed while ${setupStep}:`, error)
      setStatus('error')
      setMessage(
        error instanceof DOMException && error.name === 'AbortError'
          ? `Browser push setup failed while ${setupStep}. Try Chrome with browser notifications enabled.`
          : error instanceof Error
            ? error.message
            : 'Setup failed.',
      )
    } finally {
      setIsBusy(false)
    }
  }

  const disableNotifications = async () => {
    setIsBusy(true)
    setMessage(null)

    try {
      const registration = await getServiceWorkerRegistration()
      const subscription = await getExistingPushSubscription(registration)

      if (subscription) {
        const response = await fetch('/api/push/subscription', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })

        if (!response.ok) {
          throw new Error('Could not remove this browser subscription')
        }

        await subscription.unsubscribe()
      }

      setStatus('disabled')
      setMessage('Notifications disabled for this browser.')
    } catch (error) {
      console.error('Push notification disable failed:', error)
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Disable failed.')
    } finally {
      setIsBusy(false)
    }
  }

  const sendTestNotification = async () => {
    setIsBusy(true)
    setMessage(null)

    try {
      const response = await fetch('/api/push/test', { method: 'POST' })

      if (!response.ok) {
        throw new Error('Could not send a test notification')
      }

      setMessage('Test notification sent.')
    } catch (error) {
      console.error('Push notification test failed:', error)
      setMessage(error instanceof Error ? error.message : 'Test failed.')
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <div className="p-4 flex flex-col gap-4 hover:bg-secondary/20 transition-colors sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-orange-500/10 text-orange-500 rounded-lg">
          <BellDot className="size-5" />
        </div>
        <div>
          <h3 className="font-medium text-sm">Web Push Notifications</h3>
          <p className="text-xs text-muted-foreground">
            Browser alerts for this device.
          </p>
          {message ? (
            <p className="mt-1 text-xs text-muted-foreground">{message}</p>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md">
          {statusLabel}
        </span>
        {status === 'enabled' ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={sendTestNotification}
              disabled={isBusy}
            >
              {isBusy ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Send className="size-3" />
              )}
              Test
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={disableNotifications}
              disabled={isBusy}
            >
              <BellOff className="size-3" />
              Disable
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={enableNotifications}
            disabled={
              isBusy ||
              status === 'checking' ||
              status === 'unsupported' ||
              status === 'blocked'
            }
          >
            {isBusy ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <BellDot className="size-3" />
            )}
            Enable
          </Button>
        )}
      </div>
    </div>
  )
}
