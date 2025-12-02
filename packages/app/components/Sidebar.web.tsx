import {
  Compass,
  MessageCircle,
  User,
  MessageSquare,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from '@tamagui/lucide-icons'
import { Button, YStack, XStack, H3 } from '@my/ui'
import { useLink } from 'solito/navigation'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useAuth } from '../contexts/auth-context'

const navItems = [
  { href: '/', label: 'Explore', icon: Compass },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/profile', label: 'Profile', icon: User },
]

interface NavButtonProps {
  item: (typeof navItems)[0]
  isActive: boolean
  isMobileCollapsed?: boolean
  onPress?: () => void
}

function NavButton({ item, isActive, isMobileCollapsed, onPress }: NavButtonProps) {
  const linkProps = useLink({ href: item.href })

  return (
    <Button
      {...linkProps}
      variant="outlined"
      size="$4"
      width="100%"
      justifyContent="flex-start"
      icon={item.icon}
      backgroundColor={isActive ? '$orange6' : 'transparent'}
      color={isActive ? '$textPrimary' : '$textSecondary'}
      borderRadius="$3"
      paddingHorizontal="$4"
      paddingVertical="$3"
      onPress={onPress}
      hoverStyle={{
        backgroundColor: isActive ? '$orange6' : '$backgroundHover',
        opacity: 1,
      }}
      pressStyle={{
        opacity: 0.8,
      }}
      // Only on mobile: adjust layout when collapsed
      $sm={{
        justifyContent: isMobileCollapsed ? 'center' : 'flex-start',
        paddingHorizontal: isMobileCollapsed ? '$3' : '$4',
      }}
      title={isMobileCollapsed ? item.label : undefined}
    >
      {/* Label - hidden on mobile when collapsed */}
      <XStack
        $sm={{
          display: isMobileCollapsed ? 'none' : 'flex',
        }}
      >
        {item.label}
      </XStack>
    </Button>
  )
}

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  onCollapseChange?: (collapsed: boolean) => void
}

export function Sidebar({ isOpen = false, onClose, onCollapseChange }: SidebarProps) {
  const router = useRouter()
  const currentPath = router?.pathname || '/'
  const { logout } = useAuth()

  // Mobile-only state: controls whether sidebar is collapsed (icon-only mode)
  const [mobileCollapsed, setMobileCollapsed] = useState(false)

  const handleMobileCollapse = (newCollapsed: boolean) => {
    setMobileCollapsed(newCollapsed)
    onCollapseChange?.(newCollapsed)
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  // Derived: sidebar width on mobile (desktop is always 260px via CSS)
  const mobileWidth = mobileCollapsed ? 80 : 260

  return (
    <>
      {/* Mobile overlay - tap outside to close */}
      {isOpen && onClose && (
        <YStack
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0, 0, 0, 0.5)"
          zIndex={150}
          onPress={onClose}
          $gtSm={{
            display: 'none', // No overlay on desktop
          }}
        />
      )}

      {/* Sidebar container */}
      <YStack
        position="fixed"
        left={0}
        top={0}
        bottom={0}
        width={260} // Desktop: always 260px
        bg="$background"
        borderRightWidth={1}
        borderRightColor="$borderColor"
        paddingVertical="$4"
        paddingHorizontal="$4"
        gap="$3"
        zIndex={200}
        // Desktop: always visible
        $gtSm={{
          transform: [{ translateX: 0 }],
        }}
        // Mobile: slide in/out based on isOpen state
        $sm={{
          width: mobileWidth,
          paddingHorizontal: mobileCollapsed ? '$3' : '$4',
          transform: [{ translateX: isOpen ? 0 : -mobileWidth }],
        }}
        animation="quick"
      >
        {/* Header with Logo and Controls */}
        <XStack
          alignItems="center"
          justifyContent="space-between"
          paddingBottom="$2"
          marginBottom="$2"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          {/* Logo section */}
          <XStack alignItems="center" gap="$3" flex={1}>
            <YStack
              width={40}
              height={40}
              borderRadius="$4"
              bg="$orange6"
              alignItems="center"
              justifyContent="center"
            >
              <MessageSquare size={24} color="#FFFFFF" />
            </YStack>
            <H3
              color="$textPrimary"
              fontWeight="700"
              // Hide text when mobile collapsed
              $sm={{
                display: mobileCollapsed ? 'none' : 'flex',
              }}
            >
              SkillBridge
            </H3>
          </XStack>

          {/* Controls - only visible on mobile */}
          <XStack gap="$2" $gtSm={{ display: 'none' }}>
            {/* Close button (X) */}
            {onClose && (
              <Button
                icon={X}
                size="$3"
                circular
                backgroundColor="transparent"
                color="$textPrimary"
                onPress={onClose}
              />
            )}
            {/* Collapse/expand button */}
            <Button
              icon={mobileCollapsed ? ChevronRight : ChevronLeft}
              size="$3"
              circular
              backgroundColor="transparent"
              color="$textPrimary"
              onPress={() => handleMobileCollapse(!mobileCollapsed)}
            />
          </XStack>
        </XStack>

        {/* Navigation Items */}
        <YStack gap="$2" flex={1}>
          {navItems.map((item) => {
            const isActive =
              currentPath === item.href ||
              (item.href === '/' && (currentPath === '/' || currentPath === '/index'))

            return (
              <NavButton
                key={item.href}
                item={item}
                isActive={isActive}
                isMobileCollapsed={mobileCollapsed}
                onPress={onClose}
              />
            )
          })}
        </YStack>

        {/* Logout Button */}
        <YStack paddingTop="$3" marginTop="$3" borderTopWidth={1} borderTopColor="$borderColor">
          <Button
            variant="outlined"
            size="$4"
            width="100%"
            justifyContent="flex-start"
            icon={LogOut}
            backgroundColor="transparent"
            color="$red10"
            borderRadius="$3"
            paddingHorizontal="$4"
            paddingVertical="$3"
            onPress={handleLogout}
            hoverStyle={{
              backgroundColor: '$red4',
              opacity: 1,
            }}
            pressStyle={{
              opacity: 0.8,
            }}
            $sm={{
              justifyContent: mobileCollapsed ? 'center' : 'flex-start',
              paddingHorizontal: mobileCollapsed ? '$3' : '$4',
            }}
            title={mobileCollapsed ? 'Logout' : undefined}
          >
            {/* Label - hidden on mobile when collapsed */}
            <XStack
              $sm={{
                display: mobileCollapsed ? 'none' : 'flex',
              }}
            >
              Logout
            </XStack>
          </Button>
        </YStack>
      </YStack>
    </>
  )
}
