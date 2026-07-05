'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { QuickCapture } from '@/components/layout/quick-capture'

// 1. Define the Context
type QuickCaptureContextType = {
  openCapture: () => void;
}

const QuickCaptureContext = createContext<QuickCaptureContextType>({ openCapture: () => {} })

// 2. Create the Provider Wrapper
export function QuickCaptureProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [domains, setDomains] = useState([])

  const openCapture = async () => {
    setIsOpen(true)
    try {
      const response = await fetch('/api/domains')
      if (response.ok) {
        setDomains(await response.json())
      }
    } catch (error) {
      console.error("Failed to fetch domains", error)
    }
  }

  return (
    <QuickCaptureContext.Provider value={{ openCapture }}>
      {children}
      {/* The modal lives here globally now! */}
      <QuickCapture open={isOpen} onClose={() => setIsOpen(false)} domains={domains} />
    </QuickCaptureContext.Provider>
  )
}

// 3. Create a simple hook to use it
export const useQuickCapture = () => useContext(QuickCaptureContext)