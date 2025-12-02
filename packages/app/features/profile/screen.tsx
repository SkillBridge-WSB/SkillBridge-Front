import { H1, Paragraph, YStack, Button } from '@my/ui'
import { LogOut } from '@tamagui/lucide-icons'
import { useAuth } from '../../contexts/auth-context'
import { Platform } from 'react-native'
import { useRouter } from 'solito/navigation'

export function ProfileScreen() {
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    // On native, navigation to auth screen happens automatically via the auth context
    // On web, we redirect to home page
    if (Platform.OS === 'web') {
      router.push('/')
    }
  }

  return (
    <YStack flex={1} justify="center" items="center" gap="$4" p="$4" bg="$background">
      <H1 text="center" color="$textPrimary">
        Profile
      </H1>
      <Paragraph text="center" color="$textSecondary">
        Your profile settings
      </Paragraph>
      
      <Button
        onPress={handleLogout}
        variant="outlined"
        size="$4"
        icon={LogOut}
        backgroundColor="transparent"
        color="$red10"
        borderColor="$red10"
        borderWidth={1}
        marginTop="$4"
        hoverStyle={{
          backgroundColor: '$red4',
          opacity: 1,
        }}
        pressStyle={{
          opacity: 0.8,
        }}
      >
        Logout
      </Button>
    </YStack>
  )
}

