'use client'

import { LayoutDashboard, FolderGit2, ListChecks, Users, Wallet, Orbit, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

// --- SWR PREFETCH IMPORTS ---
import { preload } from 'swr'
import { fetcher } from '@/lib/fetcher'

const items = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, api: '/api/dashboard/stats' },
  { href: '/projects', label: 'Projects', icon: FolderGit2, api: '/api/data/projects' },
  { href: '/tasks', label: 'Tasks', icon: ListChecks, api: '/api/data/tasks' },
  { href: '/network', label: 'Network', icon: Users, api: '/api/data/network' }, // Assuming you make an API route for this later
  { href: '/finances', label: 'Finances', icon: Wallet, api: '/api/data/finances' },
]

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const sequenceRef = useRef('');

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        return;
      } else if (e.key === 'Enter') {
        const active = document.activeElement as HTMLElement;
        
        // Let Shift+Enter keep normal newlines in textareas
        if (active?.tagName === 'TEXTAREA' && e.shiftKey) {
          return;
        }

        const form = active?.closest('form');
        if (form) {
          e.preventDefault();
          if (typeof form.requestSubmit === 'function') {
            form.requestSubmit();
          } else {
            form.submit();
          }
        }
      }

      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      sequenceRef.current += e.key.toLowerCase();
      const seq = sequenceRef.current;

      if (seq.endsWith('gd')) {
        router.push('/dashboard');
        sequenceRef.current = '';
      } else if (seq.endsWith('gp')) {
        router.push('/projects');
        sequenceRef.current = '';
      } else if (seq.endsWith('gt')) {
        router.push('/tasks');
        sequenceRef.current = '';
      } else if (seq.endsWith('gc')) {
        router.push('/network');
        sequenceRef.current = '';
      } else if (seq.endsWith('gf')) {
        router.push('/finances');
        sequenceRef.current = '';
      }

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        sequenceRef.current = '';
      }, 1000);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [router]);

  // --- THE PREFETCH FUNCTION ---
  const handlePrefetch = (apiRoute: string) => {
    if (apiRoute) {
      preload(apiRoute, fetcher);
    }
  };

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex h-full">
      <div className="flex h-16 items-center gap-2.5 px-5 border-b border-sidebar-border/50">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Orbit className="size-5" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-sidebar-foreground">Life OS</p>
          <p className="text-xs text-muted-foreground">Command Center</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              // --- THE SPEED HACK IS HERE ---
              onMouseEnter={() => handlePrefetch(item.api)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
              )}
            >
              <Icon className="size-4.5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Link
          href="/settings"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        >
          <Settings className="size-4.5" />
          Settings
        </Link>
        {/* User profile section */}
      </div>
    </aside>
  )
}