'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface ZenModeContextType {
  isZenMode: boolean
  toggleZenMode: () => void
  setZenMode: (value: boolean) => void
}

const ZenModeContext = createContext<ZenModeContextType | null>(null)

export function ZenModeProvider({ children }: { children: ReactNode }) {
  const [isZenMode, setIsZenMode] = useState(false)

  const toggleZenMode = useCallback(() => {
    setIsZenMode(prev => !prev)
  }, [])

  const setZenModeValue = useCallback((value: boolean) => {
    setIsZenMode(value)
  }, [])

  const value: ZenModeContextType = {
    isZenMode,
    toggleZenMode,
    setZenMode: setZenModeValue,
  }

  return (
    <ZenModeContext.Provider value={value}>
      {children}
    </ZenModeContext.Provider>
  )
}

export function useZenMode(): ZenModeContextType {
  const context = useContext(ZenModeContext)
  
  if (context === null) {
    return {
      isZenMode: false,
      toggleZenMode: () => {},
      setZenMode: () => {},
    }
  }
  
  return context
}
