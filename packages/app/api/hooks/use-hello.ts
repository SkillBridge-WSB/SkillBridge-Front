import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../client'

// Hello query
export const useHello = () => {
  return useQuery({
    queryKey: ['hello'],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/api/hello')

      if (error) {
        throw new Error('Failed to fetch hello message')
      }

      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}







