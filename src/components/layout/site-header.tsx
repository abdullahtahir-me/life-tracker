'use client'

import { Plus, Bell, Settings } from 'lucide-react'
import Link from 'next/link'
import { useQuickCapture } from './quick-capture-provider'
import { ModeToggle } from '@/components/mode-toggle'
import { GlobalSearch } from './global-search'

export function Topbar() {
  const { openCapture } = useQuickCapture();

  return (
    <header className="shrink-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-8">
      
      <GlobalSearch />

      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        <ModeToggle />
        <button type="button" className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors">
          <Bell className="size-4.5" />
        </button>

        <Link 
          href="/settings"
          className="md:hidden flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
        >
          <Settings className="size-4.5" />
        </Link>

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
