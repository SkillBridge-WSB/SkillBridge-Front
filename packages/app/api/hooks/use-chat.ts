import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatApi } from '../api-instances'

/**
 * Hook to find or create a chat between student and tutor
 */
export const useFindChat = (studentId: string, tutorId: string, enabled = true) => {
  return useQuery({
    queryKey: ['chat', 'find', studentId, tutorId],
    queryFn: async () => {
      return await chatApi.findChat({ studentId, tutorId })
    },
    enabled: enabled && !!studentId && !!tutorId,
  })
}

/**
 * Hook to get messages for a specific chat
 * Note: Real-time updates are handled via WebSocket, so we don't need polling
 */
export const useChatMessages = (chatId: string, enabled = true) => {
  return useQuery({
    queryKey: ['chat', 'messages', chatId],
    queryFn: async () => {
      return await chatApi.getMessages({ chatId })
    },
    enabled: enabled && !!chatId,
    // No refetchInterval - WebSocket handles real-time updates
  })
}








