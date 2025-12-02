import { LessonsScreen } from 'app/features/lessons/screen'
import { Stack } from 'expo-router'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function LessonsTab() {
  const insets = useSafeAreaInsets()

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <LessonsScreen />
    </View>
  )
}




