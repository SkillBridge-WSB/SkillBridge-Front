import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Platform } from 'react-native'
import { chatApi } from '../api-instances'
import type { ChatMessageResponse } from '../generated/models'

// Check if we're in React Native (not web)
const isReactNative = Platform.OS !== 'web'

// Lazy load websocket service to avoid SSR issues
const getWebSocketService = async () => {
  const { webSocketService } = await import('../services/websocket-service')
  return webSocketService
}

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
 * Includes polling as fallback when WebSocket is not connected
 */
export const useChatMessages = (chatId: string, enabled = true) => {
  return useQuery({
    queryKey: ['chat', 'messages', chatId],
    queryFn: async () => {
      return await chatApi.getMessages({ chatId })
    },
    enabled: enabled && !!chatId,
    // Poll every 3 seconds as fallback for WebSocket
    refetchInterval: 3000,
  })
}

/**
 * Hook to send a message
 * Uses HTTP endpoint on React Native, WebSocket on web
 */
export const useSendMessage = (chatId: string | undefined) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      senderId,
      receiverId,
      message,
    }: {
      senderId: string
      receiverId: string
      message: string
    }) => {
      if (!chatId) throw new Error('Chat ID is required')
      
      // On React Native, use HTTP endpoint
      if (isReactNative) {
        const response = await chatApi.sendMessageRest({
          chatMessageRequest: {
            chatId,
            senderId,
            receiverId,
            message,
          },
        })
        return response
      }
      
      // On web, use WebSocket
      const wsService = await getWebSocketService()
      await wsService.sendChatMessage(chatId, senderId, receiverId, message)
      return { senderId, receiverId, message }
    },
    onMutate: async ({ senderId, message }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['chat', 'messages', chatId] })

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData<ChatMessageResponse[]>([
        'chat',
        'messages',
        chatId,
      ])

      // Optimistically update to the new value
      const optimisticMessage: ChatMessageResponse = {
        messageId: `temp-${Date.now()}`,
        senderId,
        message,
        timestamp: Date.now(),
      }

      queryClient.setQueryData<ChatMessageResponse[]>(
        ['chat', 'messages', chatId],
        (old) => [...(old || []), optimisticMessage]
      )

      return { previousMessages }
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(['chat', 'messages', chatId], context.previousMessages)
      }
    },
    onSettled: () => {
      // Refetch after mutation to get real message with server ID
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', chatId] })
    },
  })
}








