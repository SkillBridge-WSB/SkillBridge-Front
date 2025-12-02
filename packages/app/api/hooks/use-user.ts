import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '../api-instances'
import type { UpdateUser } from '../generated/models'
import { useAuth } from '../../contexts/auth-context'

/**
 * Hook to get current user info
 */
export const useCurrentUser = (enabled = true) => {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      return await userApi.getMe()
    },
    enabled,
  })
}

/**
 * Hook to get all matches for the current user
 */
export const useMatches = (enabled = true) => {
  const { userId } = useAuth()

  return useQuery({
    queryKey: ['user', 'matches', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated')
      return await userApi.getAllMatches({ userId })
    },
    enabled: enabled && !!userId,
  })
}

/**
 * Hook to get user by ID
 */
export const useUser = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      return await userApi.getUser({ id: userId })
    },
    enabled: enabled && !!userId,
  })
}

/**
 * Hook to update current user
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['user', 'update'],
    mutationFn: async ({ userId, data }: { userId: string; data: UpdateUser }) => {
      return await userApi.updateUser({ userId, updateUser: data })
    },
    onSuccess: () => {
      // Invalidate user queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}






