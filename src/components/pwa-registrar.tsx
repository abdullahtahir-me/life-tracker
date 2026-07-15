'use client'

import { useEffect } from 'react'

export function PwaRegistrar() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return
    }

    const unregisterDevelopmentServiceWorkers = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(
          registrations.map((registration) => registration.unregister()),
        )

        if ('caches' in window) {
          const cacheNames = await caches.keys()
          await Promise.all(
            cacheNames
              .filter((cacheName) => cacheName.startsWith('orbit-os-pwa-'))
              .map((cacheName) => caches.delete(cacheName)),
          )
        }
      } catch (error) {
        console.error('Development service worker cleanup failed:', error)
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      unregisterDevelopmentServiceWorkers()
      return
    }

    if (!window.isSecureContext) {
      console.warn(
        'Service worker registration skipped: PWAs require HTTPS or localhost.',
      )
      return
    }

    const registerServiceWorker = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      } catch (error) {
        console.error('Service worker registration failed:', error)
      }
    }

    if (document.readyState === 'complete') {
      registerServiceWorker()
      return
    }

    window.addEventListener('load', registerServiceWorker)

    return () => {
      window.removeEventListener('load', registerServiceWorker)
    }
  }, [])

  return null
}
