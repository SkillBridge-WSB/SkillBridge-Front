import type React from 'react'
import { XStack, YStack } from '@my/ui'
import { Sidebar } from './Sidebar'
import { MobileMenu } from './MobileMenu'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/auth-context'
import { AuthScreen } from '../features/auth/auth-screen'
import { useRouter } from 'next/router'

export function AppLayout({ children }: { children: React.ReactNode }) {
  // Mobile-only state: controls whether sidebar is open/closed
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && router.pathname !== '/') {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading state
  if (isLoading) {
    return null
  }

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <AuthScreen />
  }

  return (
    <XStack flex={1} bg="$background" height="100vh">
      {/* Sidebar: always visible on desktop, toggleable on mobile */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
      />
      
      {/* Main content area */}
      <YStack 
        flex={1} 
        marginLeft={260} // Desktop: fixed margin for sidebar
        $sm={{
          marginLeft: 0, // Mobile: no margin (sidebar overlays)
          paddingTop: 60, // Mobile: space for top menu bar
        }}
        overflow="auto"
      >
        {/* Mobile menu bar with hamburger */}
        <MobileMenu onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        {children}
      </YStack>
    </XStack>
  )
}

