import { useEffect, useRef, useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { ChatMessageResponse } from '../generated/models'

// Lazy load websocket service to avoid SSR issues
let webSocketServiceInstance: any = null
const getWebSocketService = async () => {
  if (!webSocketServiceInstance) {
    const { webSocketService } = await import('../services/websocket-service')
    webSocketServiceInstance = webSocketService
  }
  return webSocketServiceInstance
}

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
  const handleMessageRef = useRef((message: any) => {
    const currentChatId = chatIdRef.current
    // Convert to ChatMessageResponse format
    const chatMessage: ChatMessageResponse = {
      messageId: message.messageId || message.id,
      senderId: message.senderId,
      message: message.message || message.content,
      timestamp: message.timestamp || Date.now(),
    }
    
    queryClient.setQueryData(['chat', 'messages', currentChatId], (old: ChatMessageResponse[] | undefined) => {
      if (!old) return [chatMessage]
      
      // Check if message already exists (avoid duplicates)
      const exists = old.some((m) => m.messageId === chatMessage.messageId)
      if (exists) return old
      
      // Add new message and sort by timestamp
      return [...old, chatMessage].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
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

    let isMounted = true

    const subscribe = async () => {
      try {
        const wsService = await getWebSocketService()
        if (!isMounted) return
        
        await wsService.connect()
        if (!isMounted) return
        
        await wsService.subscribeToChat(chatId, handleMessageRef.current)
        if (!isMounted) return
        
        isSubscribedRef.current = true
        setIsConnected(true)
      } catch (error) {
        console.error('Failed to subscribe to chat:', error)
        if (isMounted) {
          setIsConnected(false)
        }
      }
    }

    subscribe()

    // Cleanup: unsubscribe when component unmounts or chatId changes
    return () => {
      isMounted = false
      if (chatId && isSubscribedRef.current) {
        getWebSocketService().then((wsService) => {
          wsService.unsubscribeFromChat(chatId)
        })
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
        const wsService = await getWebSocketService()
        await wsService.sendChatMessage(chatId, senderId, receiverId, message)
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

