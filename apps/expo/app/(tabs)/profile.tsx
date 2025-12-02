import { ProfileScreen } from 'app/features/profile/screen'
import { Stack } from 'expo-router'

export default function ProfileTab() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ProfileScreen />
    </>
  )
}


