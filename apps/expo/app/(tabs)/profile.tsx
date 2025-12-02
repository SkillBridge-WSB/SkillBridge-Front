import { ProfileScreen } from 'app/features/profile/screen'
import { Stack } from 'expo-router'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function ProfileTab() {
  const insets = useSafeAreaInsets()
  
  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ProfileScreen />
    </View>
  )
}


