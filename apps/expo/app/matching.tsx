import { MatchingScreen } from 'app/features/matching/screen'
import { Stack, useRouter } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCurrentUser } from 'app/api/hooks'
import { useEffect } from 'react'

export default function MatchingScreenRoute() {
  const insets = useSafeAreaInsets()
  const { data: currentUser, isLoading } = useCurrentUser()
  const router = useRouter()

  // Redirect tutors away from matching
  useEffect(() => {
    if (!isLoading && currentUser?.role === 'tutor') {
      router.replace('/(tabs)/chat')
    }
  }, [currentUser, isLoading, router])

  // Show loading while checking user role
  if (isLoading || currentUser?.role === 'tutor') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E1E1E' }}>
        <ActivityIndicator size="large" color="#CC5500" />
      </View>
    )
  }
  
  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <MatchingScreen />
    </View>
  )
}


