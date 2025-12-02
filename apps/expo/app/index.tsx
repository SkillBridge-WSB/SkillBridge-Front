import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { useAuth } from 'app/contexts/auth-context'
import { AuthScreen } from 'app/features/auth/auth-screen'

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    // If authenticated and not already in tabs, redirect to explore tab
    if (isAuthenticated) {
      const inTabsGroup = segments[0] === '(tabs)'
      if (!inTabsGroup) {
        router.replace('/(tabs)/explore')
      }
    }
  }, [isAuthenticated, isLoading, segments])

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <AuthScreen />
      </>
    )
  }

  // Return null while redirecting
  return null
}

