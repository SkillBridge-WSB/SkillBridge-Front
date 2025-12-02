import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { calendarApi } from '../api-instances'
import type { CreateCalendarSlot } from '../generated/models'

/**
 * Hook to get calendar slots for a tutor
 */
export const useTutorCalendar = (tutorId: string, enabled = true) => {
  return useQuery({
    queryKey: ['calendar', 'tutor', tutorId],
    queryFn: async () => {
      return await calendarApi.getCalendar({ tutorId })
    },
    enabled: enabled && !!tutorId,
  })
}

/**
 * Hook to create a calendar slot (tutor only)
 */
export const useCreateCalendarSlot = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['calendar', 'create'],
    mutationFn: async ({ userId, slot }: { userId: string; slot: CreateCalendarSlot }) => {
      return await calendarApi.create({ userId, createCalendarSlot: slot })
    },
    onSuccess: () => {
      // Invalidate calendar queries to refetch
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
    },
  })
}








