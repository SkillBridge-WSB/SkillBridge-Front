import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useLogin } from '../api/hooks/use-auth'
import { Button, Text, YStack, Input, Label, XStack, useToastController } from '@my/ui'
import type { components } from '../api/types'

type LoginRequest = components['schemas']['LoginRequest']

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  })

  const loginMutation = useLogin()
  const toast = useToastController()
  const hasProcessedSuccess = useRef(false)

  // Handle success and error states
  useEffect(() => {
    if (loginMutation.isSuccess && !hasProcessedSuccess.current) {
      hasProcessedSuccess.current = true
      toast.show('Login successful!', {
        message: 'Welcome back!',
      })
      onSuccess?.()
    }
  }, [loginMutation.isSuccess, toast, onSuccess])

  useEffect(() => {
    if (loginMutation.isError) {
      toast.show('Login failed', {
        message: loginMutation.error?.message || 'Please check your credentials.',
      })
    }
  }, [loginMutation.isError, loginMutation.error, toast])

  const handleSubmit = () => {
    if (!loginMutation.isPending && !hasProcessedSuccess.current) {
      loginMutation.mutate(formData)
    }
  }

  const handleChange = (field: keyof LoginRequest) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <YStack space="$4" padding="$4" maxWidth={400} width="100%" alignItems="center">
      <Text fontSize="$6" fontWeight="bold" textAlign="center">
        Login
      </Text>

      <YStack space="$2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={formData.email}
          onChangeText={handleChange('email')}
          placeholder="Enter email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </YStack>

      <YStack space="$2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          value={formData.password}
          onChangeText={handleChange('password')}
          placeholder="Enter password"
          secureTextEntry
        />
      </YStack>

      <Button
        onPress={handleSubmit}
        disabled={loginMutation.isPending}
        opacity={loginMutation.isPending ? 0.6 : 1}
      >
        {loginMutation.isPending ? 'Logging in...' : 'Login'}
      </Button>
    </YStack>
  )
}
