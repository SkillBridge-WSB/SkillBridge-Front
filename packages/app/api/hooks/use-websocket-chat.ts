import { useEffect, useRef, useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { webSocketService, ChatMessageCallback } from '../services/websocket-service'
import type { ChatMessageResponse } from '../generated/models'

interface UseWebSocketChatOptions {
  chatId: string | undefined
  enabled?: boolean
}

/**
 * Hook to manage WebSocket connection for a specific chat
 * Automatically subscribes/unsubscribes when chatId changes
 */
export const useWebSocketChat = ({ chatId, enabled = true }: UseWebSocketChatOptions) => {
  const queryClient = useQueryClient()
  const isSubscribedRef = useRef(false)
  const [isConnected, setIsConnected] = useState(false)
  
  // Store chatId in a ref to use in callback without causing re-subscriptions
  const chatIdRef = useRef(chatId)
  chatIdRef.current = chatId

  // Handle incoming messages - use ref to avoid dependency issues
  const handleMessageRef = useRef<ChatMessageCallback>((message: ChatMessageResponse) => {
    const currentChatId = chatIdRef.current
    queryClient.setQueryData(['chat', 'messages', currentChatId], (old: ChatMessageResponse[] | undefined) => {
      if (!old) return [message]
      
      // Check if message already exists (avoid duplicates)
      const exists = old.some((m) => m.messageId === message.messageId)
      if (exists) return old
      
      // Add new message and sort by timestamp
      return [...old, message].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
    })
  })

  // Subscribe to chat messages - only re-run when chatId or enabled changes
  useEffect(() => {
    if (!enabled || !chatId) {
      return
    }

    // Prevent duplicate subscriptions
    if (isSubscribedRef.current) {
      return
    }

    const subscribe = async () => {
      try {
        await webSocketService.connect()
        await webSocketService.subscribeToChat(chatId, handleMessageRef.current)
        isSubscribedRef.current = true
        setIsConnected(true)
      } catch (error) {
        console.error('Failed to subscribe to chat:', error)
        setIsConnected(false)
      }
    }

    subscribe()

    // Cleanup: unsubscribe when component unmounts or chatId changes
    return () => {
      if (chatId && isSubscribedRef.current) {
        webSocketService.unsubscribeFromChat(chatId)
        isSubscribedRef.current = false
        setIsConnected(false)
      }
    }
  }, [chatId, enabled])

  // Send message function
  const sendMessage = useCallback(
    async (senderId: string, receiverId: string, message: string) => {
      if (!chatId) {
        throw new Error('Chat ID is required')
      }

      try {
        await webSocketService.sendMessage(chatId, senderId, receiverId, message)
      } catch (error) {
        console.error('Failed to send message:', error)
        throw error
      }
    },
    [chatId]
  )

  return {
    sendMessage,
    isConnected,
  }
}

