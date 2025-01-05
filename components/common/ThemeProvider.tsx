'use client'

import { useEffect, type ReactNode } from 'react'
import { isDarkModeEnabled } from './useColorScheme'

export function ThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  useEffect(() => {
    if (isDarkModeEnabled()) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return <>{children}</>
}