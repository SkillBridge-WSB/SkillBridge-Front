import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Example API types
export interface User {
  id: string
  name: string
  email: string
}

export interface CreateUserData {
  name: string
  email: string
}

// Example API functions (replace with your actual API calls)
const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch('/api/users')
  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }
  return response.json()
}

const createUser = async (userData: CreateUserData): Promise<User> => {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })
  if (!response.ok) {
    throw new Error('Failed to create user')
  }
  return response.json()
}

// React Query hooks
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  })
}

export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalidate and refetch users after creating a new user
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}







