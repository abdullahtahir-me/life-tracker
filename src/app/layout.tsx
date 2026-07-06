import type { Metadata, Viewport } from 'next'
import './globals.css' // <-- This expects globals.css to be in the same src/app folder!
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: 'Orbit OS',
  description: 'Personal Command Center',
  manifest: '/manifest.json',
  
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}