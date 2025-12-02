import { ChatScreen } from 'app/features/chat/screen'
import { Stack } from 'expo-router'

export default function ChatTab() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ChatScreen />
    </>
  )
}


