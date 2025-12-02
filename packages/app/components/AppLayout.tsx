import { YStack } from '@my/ui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// Mobile version - wraps children with safe area padding
export function AppLayout({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets()
  
  return (
    <YStack flex={1} paddingTop={insets.top}>
      {children}
    </YStack>
  )
}


