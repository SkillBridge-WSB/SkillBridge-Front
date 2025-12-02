import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { useAuth } from 'app/contexts/auth-context'
import { AuthScreen } from 'app/features/auth/auth-screen'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth()
  const segments = useSegments()
  const router = useRouter()
  const insets = useSafeAreaInsets()

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
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <AuthScreen />
      </View>
    )
  }

  // Return null while redirecting
  return null
}

