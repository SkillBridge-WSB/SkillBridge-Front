import '@tamagui/core/reset.css'
import '@tamagui/font-inter/css/400.css'
import '@tamagui/font-inter/css/700.css'
import '@tamagui/polyfill-dev'

import type { ReactNode } from 'react'
import { NextThemeProvider, useRootTheme } from '@tamagui/next-theme'
import { Provider } from 'app/provider'
import { QueryProvider } from 'app/providers/query-provider'

export const NextTamaguiProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useRootTheme()

  // Note: For Pages Router, styles are handled in _app.tsx and _document.tsx
  // useServerInsertedHTML is only needed for App Router

  return (
    <QueryProvider>
      <NextThemeProvider
        skipNextHead
        defaultTheme="dark"
        forcedTheme="dark"
        onChangeTheme={(next) => {
          setTheme('dark' as any) // Always force dark
        }}
      >
        <Provider disableRootThemeClass defaultTheme="dark">
          {children}
        </Provider>
      </NextThemeProvider>
    </QueryProvider>
  )
}
