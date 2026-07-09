'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, ListChecks, FolderGit2, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
// --- IMPORT SWR CONFIG TO PEEK INTO MEMORY ---
import { useSWRConfig } from 'swr'

type SearchResult = {
  id: string;
  title: string;
  type: 'Task' | 'Project' | 'Connection';
  link: string;
}

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [localResults, setLocalResults] = useState<SearchResult[]>([])
  const [remoteResults, setRemoteResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)
  
  // Gets access to the SWR memory cache
  const { cache } = useSWRConfig()

  // 1. Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // 2. THE HYBRID SEARCH LOGIC
  useEffect(() => {
    if (!query.trim()) {
      setLocalResults([])
      setRemoteResults([])
      setIsOpen(false)
      return
    }

    setIsOpen(true)
    const q = query.toLowerCase()

    // --- PART A: INSTANT LOCAL SEARCH (0ms latency) ---
    // Safely pull whatever we currently have in the browser's memory
    const cachedTasks = cache.get('/api/data/tasks')?.data?.tasks || []
    const cachedProjects = cache.get('/api/data/projects')?.data?.projects || []
    const cachedNetwork = cache.get('/api/data/network')?.data || []

    const instantResults: SearchResult[] = []

    // Instantly filter local tasks
    cachedTasks.forEach((t: any) => {
      if (t.title.toLowerCase().includes(q)) {
        instantResults.push({ id: t.id, title: t.title, type: 'Task', link: '/tasks' })
      }
    })
    // Instantly filter local projects
    cachedProjects.forEach((p: any) => {
      if (p.name.toLowerCase().includes(q)) {
        instantResults.push({ id: p.id, title: p.name, type: 'Project', link: '/projects' })
      }
    })
    // Instantly filter local network
    cachedNetwork.forEach((n: any) => {
      if (n.name.toLowerCase().includes(q) || (n.role_company && n.role_company.toLowerCase().includes(q))) {
        instantResults.push({ id: n.id, title: n.name, type: 'Connection', link: '/network' })
      }
    })

    // Show top 5 local results instantly
    setLocalResults(instantResults.slice(0, 5))


    // --- PART B: BACKGROUND DATABASE SEARCH (300ms Debounce) ---
    // This finds archived items or things not currently on screen
    setIsSearching(true)
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (response.ok) {
          const dbData = await response.json()
          setRemoteResults(dbData)
        }
      } catch (error) {
        console.error("Remote search failed", error)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query, cache])


  // --- PART C: MERGE AND DE-DUPLICATE ---
  // Combine local and remote, ensuring we don't show the same item twice
  const combinedResultsMap = new Map<string, SearchResult>()
  
  // Add local first
  localResults.forEach(res => combinedResultsMap.set(`${res.type}-${res.id}`, res))
  // Backfill with remote (will overwrite if duplicate, which is fine)
  remoteResults.forEach(res => combinedResultsMap.set(`${res.type}-${res.id}`, res))
  
  const finalResults = Array.from(combinedResultsMap.values()).slice(0, 8) // Show max 8 total


  // --- RENDER LOGIC ---
  const getIcon = (type: string) => {
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
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim() && setIsOpen(true)}
        placeholder="Search everything..."
        className="w-full rounded-lg border border-input bg-secondary/40 py-2 pl-9 pr-10 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary transition-colors duration-300"
      />

      {isSearching && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {isOpen && query.trim() && (
        <div className="absolute top-full mt-2 w-full overflow-hidden rounded-xl border border-border bg-card shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
          
          {finalResults.length === 0 && !isSearching ? (
             <div className="p-4 text-sm text-muted-foreground text-center">No results found for "{query}"</div>
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
              
              {/* Show a subtle indicator if the database is still searching to find more */}
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