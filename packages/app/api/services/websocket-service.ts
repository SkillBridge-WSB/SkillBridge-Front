import { Client, IMessage, StompSubscription } from '@stomp/stompjs'
import { Platform } from 'react-native'
import { getCookie } from '../../utils/cookies'

// Dynamically import AsyncStorage only on React Native
let AsyncStorage: typeof import('@react-native-async-storage/async-storage').default | null = null

if (Platform.OS !== 'web') {
  try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default
  } catch (e) {
    // AsyncStorage not available
  }
}

// Cross-platform token getter
const getAuthToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return getCookie('auth_token')
  } else if (AsyncStorage) {
    try {
      return await AsyncStorage.getItem('auth_token')
    } catch (e) {
      return null
    }
  }
  return null
}

// WebSocket base URL - different for web vs native
const getWebSocketUrl = (): string => {
  return 'wss://api-sb-wsb.franeklab.com/ws/websocket'
}

export interface ChatMessageCallback {
  (message: any): void
}

class WebSocketService {
  private client: Client | null = null
  private subscriptions: Map<string, StompSubscription> = new Map()
  private isConnecting = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private connectionPromise: Promise<void> | null = null
  private connectionResolve: (() => void) | null = null
  private connectionReject: ((error: Error) => void) | null = null

  async connect(): Promise<void> {
    // If already connected, return immediately
    if (this.client?.connected) {
      return
    }

    // If connection is in progress, wait for it
    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise
    }

    this.isConnecting = true

    // Create a promise that will resolve when connection is established
    this.connectionPromise = new Promise<void>((resolve, reject) => {
      this.connectionResolve = resolve
      this.connectionReject = reject
    })

    try {
      const token = await getAuthToken()
      if (!token) {
        this.isConnecting = false
        this.connectionReject?.(new Error('No auth token available'))
        throw new Error('No auth token available')
      }

      // Remove 'Bearer ' prefix if present
      const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token

      this.client = new Client({
        // Use native WebSocket directly with /websocket endpoint (no SockJS needed)
        brokerURL: getWebSocketUrl(),
        connectHeaders: {
          Authorization: `Bearer ${cleanToken}`,
        },
        reconnectDelay: this.reconnectDelay,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('WebSocket connected')
          this.reconnectAttempts = 0
          this.isConnecting = false
          this.connectionResolve?.()
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame)
          this.isConnecting = false
          this.connectionReject?.(
            new Error(`STOMP error: ${frame.headers?.message || 'Unknown error'}`)
          )
        },
        onWebSocketClose: () => {
          console.log('WebSocket closed')
          this.isConnecting = false
          this.handleReconnect()
        },
        onDisconnect: () => {
          console.log('WebSocket disconnected')
          this.isConnecting = false
        },
      })

      this.client.activate()

      // Wait for connection to be established
      await this.connectionPromise
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      this.isConnecting = false
      throw error
    }
  }

  private async handleReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached')
      return
    }

    this.reconnectAttempts++
    console.log(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    )

    setTimeout(async () => {
      try {
        await this.connect()
        // Resubscribe to all active subscriptions
        for (const [chatId, callback] of this.subscriptions.entries()) {
          await this.subscribeToChat(chatId, callback)
        }
      } catch (error) {
        console.error('Reconnection failed:', error)
      }
    }, this.reconnectDelay)
  }

  async subscribeToChat(chatId: string, callback: ChatMessageCallback): Promise<void> {
    if (!this.client?.connected) {
      await this.connect()
    }

    // Unsubscribe if already subscribed
    if (this.subscriptions.has(chatId)) {
      this.unsubscribeFromChat(chatId)
    }

    const subscription = this.client.subscribe(`/topic/chats/${chatId}`, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body)
        callback(data)
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    })

    this.subscriptions.set(chatId, subscription)
    console.log(`Subscribed to chat: ${chatId}`)
  }

  unsubscribeFromChat(chatId: string): void {
    const subscription = this.subscriptions.get(chatId)
    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(chatId)
      console.log(`Unsubscribed from chat: ${chatId}`)
    }
  }

  async sendMessage(
    chatId: string,
    senderId: string,
    receiverId: string,
    message: string
  ): Promise<void> {
    if (!this.client?.connected) {
      await this.connect()
    }

    const payload = {
      chatId,
      senderId,
      receiverId,
      message,
    }

    console.log('Sending WebSocket message:', payload)

    this.client.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(payload),
    })
  }

  disconnect(): void {
    // Unsubscribe from all chats
    for (const chatId of this.subscriptions.keys()) {
      this.unsubscribeFromChat(chatId)
    }

    if (this.client) {
      this.client.deactivate()
      this.client = null
    }
  }

  isConnected(): boolean {
    return this.client?.connected ?? false
  }
}

// Singleton instance
export const webSocketService = new WebSocketService()
