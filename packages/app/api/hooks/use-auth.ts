import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../client'
import { login } from '../custom-auth'
import { useAuth } from '../../contexts/auth-context'
import type { components } from '../types'

type RegisterRequest = components['schemas']['RegisterRequest']
type LoginRequest = components['schemas']['LoginRequest']

// Auth mutations
export const useRegister = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['register'],
    mutationFn: async (data: RegisterRequest) => {
      const { data: response, error } = await apiClient.POST('/auth/register', {
        body: data,
      })

      if (error) {
        throw new Error('Registration failed')
      }

      return response
    },
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
  })
}

export const useLogin = () => {
  const queryClient = useQueryClient()
  const { login: loginContext } = useAuth()

  return useMutation({
    mutationKey: ['login'],
    mutationFn: async (credentials: LoginRequest) => {
      const { data, error } = await apiClient.POST('/auth/login', {
        body: credentials,
      })

      if (error) {
        throw new Error('Login failed')
      }

      return data
    },
    onSuccess: async (data) => {
      // Extract token from response - assuming the API returns { token: string, user: User }
      const token = data.token

      if (token) {
        // Use the auth context to store the login data
        await loginContext(token)
      }

      // Invalidate any auth-related queries
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
  })
}
