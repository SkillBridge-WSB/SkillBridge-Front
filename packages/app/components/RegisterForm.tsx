import React, { useState, useEffect, useRef } from 'react'
import { useRegister } from '../api/hooks/use-auth'
import { Button, Text, YStack, Input, Label, useToastController } from '@my/ui'
import { GraduationCap, BookOpen } from '@tamagui/lucide-icons'
import type { components } from '../api/types'

type RegisterRequest = components['schemas']['RegisterRequest']

interface RegisterFormProps {
  onSuccess?: () => void
}

const ROLE_OPTIONS = [
  { value: 'student', label: 'I am a Student', icon: GraduationCap },
  { value: 'tutor', label: 'I am a Tutor', icon: BookOpen },
] as const

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

  const handleRoleSelect = (role: string) => {
    setFormData((prev) => ({ ...prev, role }))
  }

  return (
    <YStack space="$4" width="100%" alignItems="center">
      <Text fontSize="$6" fontWeight="bold" textAlign="center">
        User Registration
      </Text>

      <YStack space="$2" width="100%">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name || ''}
          onChangeText={handleChange('name')}
          placeholder="Enter name"
          width="100%"
        />
      </YStack>

      <YStack space="$2" width="100%">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={formData.email || ''}
          onChangeText={handleChange('email')}
          placeholder="Enter email"
          keyboardType="email-address"
          width="100%"
        />
      </YStack>

      <YStack space="$2" width="100%">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          value={formData.password || ''}
          onChangeText={handleChange('password')}
          placeholder="Enter password"
          secureTextEntry
          width="100%"
        />
      </YStack>

      <YStack space="$2" width="100%">
        <Label>Select your role</Label>
        <YStack space="$2" width="100%">
          {ROLE_OPTIONS.map((option) => {
            const Icon = option.icon
            const isSelected = formData.role === option.value
            return (
              <Button
                key={option.value}
                onPress={() => handleRoleSelect(option.value)}
                backgroundColor={isSelected ? '$orange6' : '$surfaceSecondary'}
                borderColor="$orange6"
                borderWidth={1}
                color={isSelected ? '$textPrimary' : '$textPrimary'}
                width="100%"
                height={56}
                icon={<Icon size={24} />}
                justifyContent="flex-start"
                paddingHorizontal="$4"
              >
                {option.label}
              </Button>
            )
          })}
        </YStack>
        <Text fontSize="$2" color="$textSecondary" marginTop="$1">
          You can change this later in Settings
        </Text>
      </YStack>

      <Button
        onPress={handleSubmit}
        disabled={registerMutation.isPending || !formData.role}
        opacity={registerMutation.isPending || !formData.role ? 0.6 : 1}
        width="100%"
        backgroundColor="$orange6"
        color="$textPrimary"
      >
        {registerMutation.isPending ? 'Registering...' : 'Register'}
      </Button>
    </YStack>
  )
}
