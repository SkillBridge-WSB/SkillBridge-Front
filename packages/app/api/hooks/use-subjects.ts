import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subjectApi } from '../api-instances'
import type { CreateSubject, UpdateSubject } from '../generated/models'
import { SUBJECTS } from '../../constants/subjects'
import { useAuth } from '../../contexts/auth-context'

/**
 * Hook to get all subjects (static data from constants)
 */
export const useSubjects = (enabled = true) => {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      // Return static subjects data
      return SUBJECTS
    },
    enabled,
    staleTime: Infinity, // Data never goes stale since it's static
  })
}

/**
 * Hook to get subjects by tutor ID
 */
export const useSubjectsByTutor = (tutorId: string, enabled = true) => {
  return useQuery({
    queryKey: ['subjects', 'tutor', tutorId],
    queryFn: async () => {
      return await subjectApi.list({ tutorId })
    },
    enabled: enabled && !!tutorId,
  })
}

/**
 * Hook to get current tutor's subjects
 */
export const useMySubjects = (enabled = true) => {
  const { userId } = useAuth()

  return useQuery({
    queryKey: ['subjects', 'tutor', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated')
      return await subjectApi.list({ tutorId: userId })
    },
    enabled: enabled && !!userId,
  })
}

/**
 * Hook to create a new subject (tutor only)
 */
export const useCreateSubject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['subjects', 'create'],
    mutationFn: async ({ userId, data }: { userId: string; data: CreateSubject }) => {
      return await subjectApi.create1({ userId, createSubject: data })
    },
    onSuccess: (_, variables) => {
      // Invalidate subjects to refetch the updated list
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      queryClient.invalidateQueries({ queryKey: ['subjects', 'tutor', variables.userId] })
    },
  })
}

/**
 * Hook to delete a subject (tutor only)
 */
export const useDeleteSubject = () => {
  const queryClient = useQueryClient()
  const { userId } = useAuth()

  return useMutation({
    mutationKey: ['subjects', 'delete'],
    mutationFn: async ({ subjectId }: { subjectId: string }) => {
      if (!userId) throw new Error('User not authenticated')
      return await subjectApi._delete({ userId, subjectId })
    },
    onSuccess: () => {
      // Invalidate subjects to refetch the updated list
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['subjects', 'tutor', userId] })
      }
    },
  })
}

/**
 * Hook to update a subject (tutor only)
 */
export const useUpdateSubject = () => {
  const queryClient = useQueryClient()
  const { userId } = useAuth()

  return useMutation({
    mutationKey: ['subjects', 'update'],
    mutationFn: async ({ subjectId, data }: { subjectId: string; data: UpdateSubject }) => {
      if (!userId) throw new Error('User not authenticated')
      return await subjectApi.update({ userId, subjectId, updateSubject: data })
    },
    onSuccess: () => {
      // Invalidate subjects to refetch the updated list
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['subjects', 'tutor', userId] })
      }
    },
  })
}
