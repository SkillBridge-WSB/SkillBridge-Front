import React, { useState } from 'react'
import { Button, Text, YStack, XStack, Separator } from '@my/ui'
import { LoginForm, RegisterForm } from '../../components'
import { useAuth } from '../../contexts/auth-context'

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true)
  const { login } = useAuth()

  const handleLoginSuccess = () => {
    // The login hook already handles storing the token and user
    // This callback is for any additional logic after successful login
    // The auth context will automatically update the UI
  }

  const handleRegisterSuccess = () => {
    // Switch to login form after successful registration
    setIsLogin(true)
  }

  return (
    <YStack flex={1} justify="center" items="center" gap="$6" p="$4" bg="$background">
      <YStack gap="$4" maxWidth={500} width="100%" alignItems="center">
        <Text fontSize="$8" fontWeight="bold" textAlign="center">
          Welcome to SkillBridge
        </Text>

        <XStack gap="$4" justify="center">
          <Button
            variant={isLogin ? 'outlined' : 'outline'}
            onPress={() => setIsLogin(true)}
            opacity={isLogin ? 1 : 0.6}
          >
            Login
          </Button>
          <Button
            variant={!isLogin ? 'outlined' : 'outline'}
            onPress={() => setIsLogin(false)}
            opacity={!isLogin ? 1 : 0.6}
          >
            Register
          </Button>
        </XStack>

        <Separator />

        {isLogin ? (
          <LoginForm onSuccess={handleLoginSuccess} />
        ) : (
          <RegisterForm onSuccess={handleRegisterSuccess} />
        )}
      </YStack>
    </YStack>
  )
}
