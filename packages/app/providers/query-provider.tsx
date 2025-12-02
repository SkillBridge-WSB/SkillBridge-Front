import { useState } from 'react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Create a new QueryClient instance for each request/component mount
  // This is necessary for SSR in Next.js to avoid sharing state between requests
  // Each request gets its own QueryClient instance
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: (failureCount, error) => {
              if (error instanceof Error && 'status' in error && typeof error.status === 'number') {
                if (error.status >= 400 && error.status < 500) {
                  return false
                }
              }
              return failureCount < 3
            },
          },
          mutations: {
            retry: (failureCount, error) => {
              if (error instanceof Error && 'status' in error && typeof error.status === 'number') {
                if (error.status >= 400 && error.status < 500) {
                  return false
                }
              }
              return failureCount < 1
            },
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}








