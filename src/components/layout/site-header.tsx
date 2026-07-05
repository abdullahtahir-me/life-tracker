'use client'

import { Search, Plus, Bell, Settings } from 'lucide-react' // <-- Added Settings icon
import Link from 'next/link' // <-- Added Link component
import { useQuickCapture } from './quick-capture-provider'
import { ModeToggle } from '@/components/mode-toggle'

export function Topbar() {
  const { openCapture } = useQuickCapture();

  return (
    <header className="shrink-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-8">
      
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg border border-input bg-secondary/40 py-2 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring"
        />
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        <ModeToggle />
        {/* Notifications */}
        <button type="button" className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors">
          <Bell className="size-4.5" />
        </button>

        {/* --- NEW: SETTINGS BUTTON (MOBILE ONLY) --- */}
        {/* Using md:hidden ensures this ONLY shows up on phones */}
        <Link 
          href="/settings"
          className="md:hidden flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
        >
          <Settings className="size-4.5" />
        </Link>

        {/* Quick Capture (Desktop Only) */}
        <button
          type="button"
          onClick={openCapture}
          className="hidden md:flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 shadow-sm"
        >
          <Plus className="size-4" />
          <span>Quick Capture</span>
        </button>
      </div>
      
    </header>
  )
}