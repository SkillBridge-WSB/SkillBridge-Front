import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lessonApi } from '../api-instances'
import type { BookLesson } from '../generated/models'

/**
 * Hook to get all lessons
 */
export const useLessons = (enabled = true) => {
  return useQuery({
    queryKey: ['lessons'],
    queryFn: async () => {
      return await lessonApi.getAllLessons()
    },
    enabled,
  })
}

/**
 * Hook to book a lesson
 */
export const useBookLesson = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['lessons', 'book'],
    mutationFn: async (data: BookLesson) => {
      return await lessonApi.bookLesson({ bookLesson: data })
    },
    onSuccess: () => {
      // Invalidate lessons and calendar to refetch
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}








