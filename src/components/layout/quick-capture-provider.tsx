'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import useSWR from 'swr'

import { QuickCapture } from '@/components/layout/quick-capture'
import { fetcher } from '@/lib/fetcher'
import type { Domain } from '@/lib/types/database'

type QuickCaptureContextType = {
  openCapture: () => void;
}

const QuickCaptureContext = createContext<QuickCaptureContextType>({ openCapture: () => {} })

export function QuickCaptureProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: domains = [] } = useSWR<Domain[]>('/api/domains', fetcher)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'c' && e.altKey) {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <QuickCaptureContext.Provider value={{ openCapture: () => setIsOpen(true) }}>
      {children}
      <QuickCapture open={isOpen} onClose={() => setIsOpen(false)} domains={domains} />
    </QuickCaptureContext.Provider>
  )
}

export const useQuickCapture = () => useContext(QuickCaptureContext)
