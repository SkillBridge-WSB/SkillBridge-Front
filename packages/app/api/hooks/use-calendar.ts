import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { calendarApi } from '../api-instances'
import type { CreateCalendarSlot } from '../generated/models'

/**
 * Hook to get available calendar slots for a tutor within a date range
 */
export const useTutorAvailableSlots = (tutorId: string, from: Date, to: Date, enabled = true) => {
  return useQuery({
    queryKey: ['calendar', 'available', tutorId, from.toISOString(), to.toISOString()],
    queryFn: async () => {
      return await calendarApi.available({ tutorId, from, to })
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
