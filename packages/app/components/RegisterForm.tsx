import React, { useState, useEffect, useRef } from 'react'
import { useRegister } from '../api/hooks/use-auth'
import { Button, Text, YStack, Input, Label, useToastController } from '@my/ui'
import type { components } from '../api/types'

type RegisterRequest = components['schemas']['RegisterRequest']

interface RegisterFormProps {
  onSuccess?: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    password: '',
    name: '',
    bio: '',
    image_url: '',
    role: '',
  })

  const registerMutation = useRegister()
  const toast = useToastController()

  useEffect(() => {
    if (registerMutation.isSuccess) {
      toast.show('Registration successful!', {
        message: 'Please login with your credentials.',
      })
      onSuccess?.()
      registerMutation.reset()
    }
  }, [registerMutation.isSuccess, toast, onSuccess])

  useEffect(() => {
    if (registerMutation.isError) {
      toast.show('Registration failed', {
        message: registerMutation.error?.message || 'Please try again.',
      })
    }
  }, [registerMutation.isError, registerMutation.error, toast])

  const handleSubmit = () => {
    if (!registerMutation.isPending && !registerMutation.isSuccess) {
      formData.email = formData.email?.toLowerCase()
      registerMutation.mutate(formData)
    }
  }

  const handleChange = (field: keyof RegisterRequest) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <YStack space="$4" padding="$4" alignItems="center" maxWidth={400} width="100%">
      <Text fontSize="$6" fontWeight="bold" textAlign="center">
        User Registration
      </Text>

      <YStack space="$2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name || ''}
          onChangeText={handleChange('name')}
          placeholder="Enter name"
        />
      </YStack>

      <YStack space="$2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={formData.email || ''}
          onChangeText={handleChange('email')}
          placeholder="Enter email"
          keyboardType="email-address"
        />
      </YStack>

      <YStack space="$2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          value={formData.password || ''}
          onChangeText={handleChange('password')}
          placeholder="Enter password"
          secureTextEntry
        />
      </YStack>

      <Button
        onPress={handleSubmit}
        disabled={registerMutation.isPending}
        opacity={registerMutation.isPending ? 0.6 : 1}
      >
        {registerMutation.isPending ? 'Registering...' : 'Register'}
      </Button>
    </YStack>
  )
}
