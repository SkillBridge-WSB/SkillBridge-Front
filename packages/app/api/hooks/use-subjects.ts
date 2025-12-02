import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subjectApi } from '../api-instances'
import type { CreateSubject } from '../generated/models'
import { SUBJECTS } from '../../constants/subjects'

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
 * Hook to create a new subject (tutor only)
 */
export const useCreateSubject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['subjects', 'create'],
    mutationFn: async ({ userId, data }: { userId: string; data: CreateSubject }) => {
      return await subjectApi.create1({ userId, createSubject: data })
    },
    onSuccess: () => {
      // Invalidate subjects to refetch the updated list
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
    },
  })
}
