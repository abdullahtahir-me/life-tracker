'use client'

import { LayoutDashboard, FolderGit2, ListChecks, Users, Wallet, Plus } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useQuickCapture } from './quick-capture-provider'

// --- SWR PREFETCH IMPORTS ---
import { preload } from 'swr'
import { fetcher } from '@/lib/fetcher'

const items = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard, api: '/api/dashboard/stats' },
  { href: '/projects', label: 'Projects', icon: FolderGit2, api: '/api/data/projects' },
  { href: '/tasks', label: 'Tasks', icon: ListChecks, api: '/api/data/tasks' },
  { href: '/network', label: 'Network', icon: Users, api: '/api/data/network' },
  { href: '/finances', label: 'Finances', icon: Wallet, api: '/api/data/finances' },
]

export function MobileNav() {
  const pathname = usePathname();
  const { openCapture } = useQuickCapture();

  // --- THE PREFETCH FUNCTION ---
  const handlePrefetch = (apiRoute: string) => {
    if (apiRoute) {
      preload(apiRoute, fetcher);
    }
  };

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={openCapture}
        className={cn(
          "md:hidden fixed z-50 right-5 flex size-14 items-center justify-center",
          "bg-primary text-primary-foreground transition-all active:scale-95",
          "rounded-2xl shadow-lg shadow-primary/20 border border-primary/50",
          "bottom-[calc(4.5rem+env(safe-area-inset-bottom))]"
        )}
      >
        <Plus className="size-6" />
      </button>

      {/* Bottom Nav */}
      <nav
        className="md:hidden fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-border bg-background/95 backdrop-blur-md px-1"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              // --- THE MOBILE SPEED HACK IS HERE ---
              // Triggers the moment your finger touches the screen
              onTouchStart={() => handlePrefetch(item.api)} 
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className={cn("size-5", isActive && "fill-primary/20")} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}