import { MatchingScreen } from 'app/features/matching/screen'
import { Stack } from 'expo-router'

export default function MatchingScreenRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <MatchingScreen />
    </>
  )
}


