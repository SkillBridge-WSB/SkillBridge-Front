import React, { useState } from 'react'
import { Platform, KeyboardAvoidingView, ScrollView } from 'react-native'
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

  const content = (
    <YStack flex={Platform.OS === 'web' ? 1 : undefined} justify="center" items="center" gap="$6" p="$4" bg="$background" minHeight={Platform.OS === 'web' ? undefined : '100%'}>
      <YStack
        bg="$surface"
        borderRadius="$4"
        padding="$6"
        gap="$4"
        maxWidth={500}
        width="100%"
        alignItems="center"
        shadowColor="$background"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.1}
        shadowRadius={8}
        elevation={4}
      >
        <Text fontSize="$8" fontWeight="bold" textAlign="center">
          Welcome to SkillBridge
        </Text>

        <XStack gap="$4" justify="center">
          <Button
            onPress={() => setIsLogin(true)}
            backgroundColor={isLogin ? '$orange6' : 'transparent'}
            borderColor="$orange6"
            borderWidth={1}
            color={isLogin ? '$textPrimary' : '$orange6'}
            opacity={isLogin ? 1 : 0.8}
          >
            Login
          </Button>
          <Button
            onPress={() => setIsLogin(false)}
            backgroundColor={!isLogin ? '$orange6' : 'transparent'}
            borderColor="$orange6"
            borderWidth={1}
            color={!isLogin ? '$textPrimary' : '$orange6'}
            opacity={!isLogin ? 1 : 0.8}
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

  if (Platform.OS === 'web') {
    return content
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {content}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
