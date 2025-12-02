import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tutorApi, studentApi } from '../api-instances'
import { useAuth } from '../../contexts/auth-context'
import type { Swipe } from '../generated/models'

/**
 * Hook to get all tutors with optional subject filtering
 * Uses the generated API: GET /api/tutor/all?userId=X&subjects=Y
 */
export const useTutors = (subjectNames?: string[], enabled = true) => {
  const { userId } = useAuth()

  return useQuery({
    queryKey: ['tutors', subjectNames, userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User not authenticated')
      }

      // Use the generated API with subjects as query params
      const tutors = await tutorApi.getTutorsForSubjects({
        userId,
        subjects: subjectNames || [],
      })

      return tutors || []
    },
    enabled: enabled && !!userId,
  })
}

/**
 * Hook to swipe on a tutor (like=1 for match, like=0 for pass)
 * Uses the generated API: POST /api/student/swipe
 */
export const useSwipe = () => {
  const queryClient = useQueryClient()
  const { userId } = useAuth()

  return useMutation({
    mutationKey: ['swipe'],
    mutationFn: async ({ tutorId, like }: { tutorId: string; like: number }) => {
      if (!userId) {
        throw new Error('User not authenticated')
      }

      const swipeData: Swipe = {
        tutorId,
        like,
      }

      return await studentApi.swipe({
        userId,
        swipe: swipeData,
      })
    },
    onSuccess: () => {
      // Optionally invalidate tutors query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['tutors'] })
    },
    onError: (error) => {
      console.error('Swipe failed:', error)
    },
  })
}
