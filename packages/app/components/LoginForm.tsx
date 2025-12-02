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
      formData.email = formData.email?.toLowerCase()
      loginMutation.mutate(formData)
    }
  }

  const handleChange = (field: keyof LoginRequest) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <YStack space="$4" width="100%" alignItems="center">
      <Text fontSize="$6" fontWeight="bold" textAlign="center">
        Login
      </Text>

      <YStack space="$2" width="100%">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={formData.email}
          onChangeText={handleChange('email')}
          placeholder="Enter email"
          keyboardType="email-address"
          autoCapitalize="none"
          width="100%"
        />
      </YStack>

      <YStack space="$2" width="100%">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          value={formData.password}
          onChangeText={handleChange('password')}
          placeholder="Enter password"
          secureTextEntry
          width="100%"
        />
      </YStack>

      <Button
        onPress={handleSubmit}
        disabled={loginMutation.isPending}
        opacity={loginMutation.isPending ? 0.6 : 1}
        width="100%"
        backgroundColor="$orange6"
        color="$textPrimary"
      >
        {loginMutation.isPending ? 'Logging in...' : 'Login'}
      </Button>
    </YStack>
  )
}
