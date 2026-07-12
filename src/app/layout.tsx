import type { Metadata, Viewport } from 'next'
import './globals.css' // <-- This expects globals.css to be in the same src/app folder!
import { ThemeProvider } from '@/components/theme-provider'
import { PwaRegistrar } from '@/components/pwa-registrar'

export const metadata: Metadata = {
  title: 'Orbit OS',
  description: 'Personal Command Center',
  applicationName: 'Orbit OS',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Orbit OS',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark', 
  themeColor: '#09090b',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PwaRegistrar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
