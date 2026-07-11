'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, Loader2, ListChecks, FolderGit2, Users } from 'lucide-react'
import Link from 'next/link'
import useSWR, { useSWRConfig } from 'swr'

import { fetcher } from '@/lib/fetcher'

type SearchResult = {
  id: string;
  title: string;
  type: 'Task' | 'Project' | 'Connection';
  link: string;
}

type CachedTask = { id: string; title: string }
type CachedProject = { id: string; name: string }
type CachedConnection = { id: string; name: string; role_company: string | null }

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { cache } = useSWRConfig()
  const trimmedQuery = query.trim()
  const searchUrl = trimmedQuery ? `/api/search?q=${encodeURIComponent(trimmedQuery)}` : null
  const { data: remoteResults = [], isLoading: isSearching } = useSWR<SearchResult[]>(searchUrl, fetcher)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const localResults = useMemo(() => {
    const q = trimmedQuery.toLowerCase()
    if (!q) return []

    const cachedTasks = (cache.get('/api/data/tasks')?.data?.tasks ?? []) as CachedTask[]
    const cachedProjects = (cache.get('/api/data/projects')?.data?.projects ?? []) as CachedProject[]
    const cachedNetwork = (cache.get('/api/data/network')?.data ?? []) as CachedConnection[]

    const results: SearchResult[] = []

    cachedTasks.forEach((task) => {
      if (task.title.toLowerCase().includes(q)) {
        results.push({ id: task.id, title: task.title, type: 'Task', link: '/tasks' })
      }
    })

    cachedProjects.forEach((project) => {
      if (project.name.toLowerCase().includes(q)) {
        results.push({ id: project.id, title: project.name, type: 'Project', link: '/projects' })
      }
    })

    cachedNetwork.forEach((connection) => {
      if (connection.name.toLowerCase().includes(q) || connection.role_company?.toLowerCase().includes(q)) {
        results.push({ id: connection.id, title: connection.name, type: 'Connection', link: '/network' })
      }
    })

    return results.slice(0, 5)
  }, [trimmedQuery, cache])

  const finalResults = useMemo(() => {
    const combinedResultsMap = new Map<string, SearchResult>()
    localResults.forEach((result) => combinedResultsMap.set(`${result.type}-${result.id}`, result))
    remoteResults.forEach((result) => combinedResultsMap.set(`${result.type}-${result.id}`, result))
    return Array.from(combinedResultsMap.values()).slice(0, 8)
  }, [localResults, remoteResults])

  const getIcon = (type: SearchResult['type']) => {
    if (type === 'Task') return <ListChecks className="size-4 text-primary" />
    if (type === 'Project') return <FolderGit2 className="size-4 text-warning" />
    return <Users className="size-4 text-success" />
  }

  return (
    <div ref={wrapperRef} className="relative flex-1 max-w-md w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

      <input
        type="search"
        value={query}
        onChange={(event) => {
          const nextQuery = event.target.value
          setQuery(nextQuery)
          setIsOpen(Boolean(nextQuery.trim()))
        }}
        onFocus={() => trimmedQuery && setIsOpen(true)}
        placeholder="Search everything..."
        className="w-full rounded-lg border border-input bg-secondary/40 py-2 pl-9 pr-10 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary transition-colors duration-300"
      />

      {isSearching && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {isOpen && trimmedQuery && (
        <div className="absolute top-full mt-2 w-full overflow-hidden rounded-xl border border-border bg-card shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
          {finalResults.length === 0 && !isSearching ? (
            <div className="p-4 text-sm text-muted-foreground text-center">No results found for &quot;{query}&quot;</div>
          ) : (
            <ul className="max-h-80 overflow-y-auto p-2 space-y-1">
              {finalResults.map((result) => (
                <li key={`${result.type}-${result.id}`}>
                  <Link
                    href={`${result.link}?highlight=${result.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary/50"
                  >
                    <div className="p-2 bg-secondary/50 rounded-md">
                      {getIcon(result.type)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate text-card-foreground">
                        {result.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {result.type}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}

              {isSearching && finalResults.length > 0 && (
                <li className="text-[10px] text-muted-foreground text-center pt-2 pb-1 flex items-center justify-center gap-2">
                  <Loader2 className="size-3 animate-spin" /> Searching archives...
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
