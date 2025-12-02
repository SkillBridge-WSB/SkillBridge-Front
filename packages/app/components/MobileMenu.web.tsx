import { Menu } from '@tamagui/lucide-icons'
import { Button, XStack } from '@my/ui'

export function MobileMenu({ onToggle }: { onToggle: () => void }) {
  return (
    <XStack
      position="fixed"
      top={0}
      left={0}
      right={0}
      bg="$background"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
      paddingHorizontal="$4"
      paddingVertical="$3"
      alignItems="center"
      gap="$3"
      zIndex={200}
      $gtSm={{
        display: 'none',
      }}
    >
      <Button
        icon={Menu}
        size="$3"
        circular
        backgroundColor="transparent"
        color="$textPrimary"
        onPress={onToggle}
      />
    </XStack>
  )
}

