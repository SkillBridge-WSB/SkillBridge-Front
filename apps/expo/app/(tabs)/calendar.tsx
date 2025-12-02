import { CalendarScreen } from 'app/features/calendar/screen'
import { Stack } from 'expo-router'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function CalendarTab() {
  const insets = useSafeAreaInsets()

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <CalendarScreen />
    </View>
  )
}


