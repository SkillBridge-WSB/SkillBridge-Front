import { Tabs } from 'expo-router'
import { Compass, MessageCircle, User } from '@tamagui/lucide-icons'
import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function TabsLayout() {
  const insets = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#CC5500', // Orange accent
        tabBarInactiveTintColor: '#AAAAAA', // Text secondary
        tabBarStyle: {
          backgroundColor: '#282828', // Surface
          borderTopColor: '#282828', // Border color
          borderTopWidth: 1,
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 12),
          paddingTop: 8,
          height:
            (Platform.OS === 'ios' ? 60 : 56) +
            Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 12),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => <Compass size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
