import { ExploreScreen } from 'app/features/explore/screen'
import { Stack } from 'expo-router'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function ExploreTab() {
  const insets = useSafeAreaInsets()
  
  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ExploreScreen />
    </View>
  )
}


