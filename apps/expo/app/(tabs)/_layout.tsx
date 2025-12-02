import { Tabs } from 'expo-router'
import { Compass, MessageCircle, User, Calendar, CalendarDays } from '@tamagui/lucide-icons'
import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useUserDetails } from 'app/api/hooks/use-user'

export default function TabsLayout() {
  const insets = useSafeAreaInsets()
  const { data: userDetails } = useUserDetails()

  const isTutor = userDetails?.role === 'TUTOR'

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
      {/* Explore tab - only visible for students */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => <Compass size={size} color={color} />,
          href: isTutor ? null : '/explore', // Hide for tutors
        }}
      />
      {/* Calendar tab - only visible for tutors */}
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => <CalendarDays size={size} color={color} />,
          href: isTutor ? '/calendar' : null, // Hide for students
        }}
      />
      <Tabs.Screen
        name="lessons"
        options={{
          title: 'Lessons',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
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
