import { ExploreScreen } from 'app/features/explore/screen'
import { Stack } from 'expo-router'

export default function ExploreTab() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ExploreScreen />
    </>
  )
}


