import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lessonApi } from '../api-instances'
import type { BookLesson, Lesson } from '../generated/models'
import { CancelRoleEnum, GetLessonsRoleEnum } from '../generated/apis/LessonControllerApi'

/**
 * Hook to get all lessons for a user
 */
export const useLessons = (userId: string, role: 'STUDENT' | 'TUTOR', enabled = true) => {
  return useQuery({
    queryKey: ['lessons', userId, role],
    queryFn: async () => {
      return await lessonApi.getLessons({
        userId,
        role: role as GetLessonsRoleEnum,
      })
    },
    enabled: enabled && !!userId,
  })
}

/**
 * Hook to book a lesson (student books with tutor)
 */
export const useBookLesson = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['lessons', 'book'],
    mutationFn: async ({ userId, data }: { userId: string; data: BookLesson }) => {
      return await lessonApi.book({ userId, bookLesson: data })
    },
    onSuccess: () => {
      // Invalidate lessons and calendar to refetch
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}

/**
 * Hook to accept or reject a lesson (tutor action)
 */
export const useAcceptLesson = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['lessons', 'accept'],
    mutationFn: async ({
      userId,
      lessonId,
      action,
    }: {
      userId: string
      lessonId: string
      action: 'CONFIRMED' | 'REJECTED'
    }) => {
      return await lessonApi.accept({ userId, id: lessonId, action })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}

/**
 * Hook to cancel a lesson
 */
export const useCancelLesson = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['lessons', 'cancel'],
    mutationFn: async ({
      userId,
      lessonId,
      role,
    }: {
      userId: string
      lessonId: string
      role: 'STUDENT' | 'TUTOR'
    }) => {
      return await lessonApi.cancel({ userId, id: lessonId, role: role as CancelRoleEnum })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] })
    },
  })
}

export type { Lesson }
export { CancelRoleEnum, GetLessonsRoleEnum }
