import { getCookie } from '../../utils/cookies'

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

// Check if we're in React Native (not web)
const isReactNative = () => {
  try {
    const { Platform } = require('react-native')
    return Platform.OS !== 'web'
  } catch {
    return false
  }
}

// Lazy load AsyncStorage only when needed
let AsyncStorage: any = null
const getAsyncStorage = async () => {
  if (AsyncStorage) return AsyncStorage
  if (!isBrowser || !isReactNative()) return null

  try {
    const module = await import('@react-native-async-storage/async-storage')
    AsyncStorage = module.default
    return AsyncStorage
  } catch {
    return null
  }
}

// Cross-platform token getter
const getAuthToken = async (): Promise<string | null> => {
  // Server-side: no token available
  if (!isBrowser) return null

  // Web: use cookies
  if (!isReactNative()) {
    return getCookie('auth_token')
  }

  // React Native: use AsyncStorage
  const storage = await getAsyncStorage()
  if (storage) {
    try {
      return await storage.getItem('auth_token')
    } catch {
      return null
    }
  }
  return null
}

// WebSocket base URL
const getWebSocketUrl = (): string => {
  return 'wss://api-sb-wsb.franeklab.com/ws/websocket'
}

export interface ChatMessageCallback {
  (message: ChatMessage): void
}

export interface ChatMessage {
  messageId?: string
  chatId: string
  senderId: string
  receiverId?: string
  message: string
  timestamp?: number
}

// Minimal STOMP protocol implementation
class StompClient {
  private ws: WebSocket | null = null
  private connected = false
  private subscriptions: Map<string, { id: string; callback: ChatMessageCallback }> = new Map()
  private subscriptionCounter = 0
  private messageQueue: Array<{ destination: string; body: string }> = []

  private onConnectCallback: (() => void) | null = null
  private onErrorCallback: ((error: Error) => void) | null = null

  // Create STOMP frame (using \n which is standard for STOMP 1.2)
  private createFrame(command: string, headers: Record<string, string>, body = ''): string {
    let frame = command + '\n'
    for (const [key, value] of Object.entries(headers)) {
      frame += `${key}:${value}\n`
    }
    frame += '\n' + body + '\0'
    console.log('STOMP: Created frame for', command)
    return frame
  }

  // Create STOMP frame as binary (for React Native compatibility)
  private createFrameAsBuffer(
    command: string,
    headers: Record<string, string>,
    body = ''
  ): ArrayBuffer {
    const frame = this.createFrame(command, headers, body)
    const encoder = new TextEncoder()
    return encoder.encode(frame).buffer
  }

  // Parse STOMP frame
  private parseFrame(
    data: string
  ): { command: string; headers: Record<string, string>; body: string } | null {
    // Remove null character
    data = data.replace(/\0$/, '')

    const lines = data.split('\n')
    if (lines.length < 1) return null

    const command = lines[0]
    const headers: Record<string, string> = {}
    let bodyStart = 1

    // Parse headers
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (line === '') {
        bodyStart = i + 1
        break
      }
      const colonIndex = line.indexOf(':')
      if (colonIndex > 0) {
        headers[line.substring(0, colonIndex)] = line.substring(colonIndex + 1)
      }
    }

    // Parse body
    const body = lines.slice(bodyStart).join('\n')

    return { command, headers, body }
  }

  connect(url: string, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.onConnectCallback = resolve
      this.onErrorCallback = reject

      console.log('STOMP: Opening WebSocket to', url)
      // Add STOMP subprotocols - server might require this
      this.ws = new WebSocket(url, ['v10.stomp', 'v11.stomp', 'v12.stomp'])

      // Set binary type for React Native compatibility
      this.ws.binaryType = 'arraybuffer'

      console.log('STOMP: WebSocket created with STOMP subprotocols')

      this.ws.onopen = () => {
        console.log('STOMP: WebSocket opened, readyState:', this.ws?.readyState)

        // Small delay to let WebSocket stabilize (helps on React Native)
        setTimeout(() => {
          console.log('STOMP: Sending CONNECT after delay...')
          // Send STOMP CONNECT frame
          const connectFrame = this.createFrame('CONNECT', {
            'accept-version': '1.2,1.1,1.0',
            'heart-beat': '10000,10000',
            Authorization: `Bearer ${token}`,
          })
          console.log('STOMP: CONNECT frame:', JSON.stringify(connectFrame))

          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(connectFrame)
            console.log('STOMP: CONNECT sent successfully')
          } else {
            console.error('STOMP: WebSocket not open, readyState:', this.ws?.readyState)
          }
        }, 100)
      }

      this.ws.onmessage = (event) => {
        console.log(
          'STOMP: Message event received, data type:',
          typeof event.data,
          'constructor:',
          event.data?.constructor?.name
        )

        // Handle both string and Blob data (React Native may send Blob)
        const handleData = (data: string) => {
          console.log('STOMP: Raw message received:', data.substring(0, 100))
          const frame = this.parseFrame(data)
          if (!frame) {
            console.log('STOMP: Could not parse frame')
            return
          }

          console.log('STOMP: Received', frame.command)

          switch (frame.command) {
            case 'CONNECTED':
              console.log('STOMP: Connected successfully')
              this.connected = true
              this.processMessageQueue()
              this.onConnectCallback?.()
              break

            case 'MESSAGE':
              this.handleMessage(frame)
              break

            case 'ERROR':
              console.error('STOMP: Error', frame.body)
              this.onErrorCallback?.(new Error(frame.body || 'STOMP error'))
              break

            case 'RECEIPT':
              console.log('STOMP: Receipt received', frame.headers['receipt-id'])
              break
          }
        }

        const data = event.data

        // Handle different data types from different WebSocket implementations
        if (typeof data === 'string') {
          handleData(data)
        } else if (data instanceof ArrayBuffer) {
          // React Native might send ArrayBuffer
          const decoder = new TextDecoder('utf-8')
          handleData(decoder.decode(data))
        } else if (data instanceof Blob) {
          // Browser might send Blob
          const reader = new FileReader()
          reader.onload = () => {
            handleData(reader.result as string)
          }
          reader.readAsText(data)
        } else {
          // Try to convert to string as fallback
          console.log('STOMP: Unknown data type:', typeof data)
          handleData(String(data))
        }
      }

      this.ws.onerror = (event: any) => {
        console.error('STOMP: WebSocket error', JSON.stringify(event))
        console.error('STOMP: WebSocket error message:', event?.message || 'unknown')
        this.onErrorCallback?.(new Error('WebSocket error'))
      }

      this.ws.onclose = (event: any) => {
        console.log(
          'STOMP: WebSocket closed - code:',
          event?.code,
          'reason:',
          event?.reason,
          'wasClean:',
          event?.wasClean
        )
        this.connected = false
        // If connection was never established, reject the promise
        if (!this.connected && this.onErrorCallback) {
          this.onErrorCallback(new Error(`WebSocket closed: ${event?.code} ${event?.reason || ''}`))
        }
      }

      // Timeout for connection
      setTimeout(() => {
        if (!this.connected) {
          this.onErrorCallback?.(new Error('STOMP connection timeout'))
        }
      }, 10000)
    })
  }

  private handleMessage(frame: {
    command: string
    headers: Record<string, string>
    body: string
  }): void {
    const destination = frame.headers['destination']

    // Find matching subscription
    for (const [chatId, sub] of this.subscriptions.entries()) {
      if (destination?.includes(chatId)) {
        try {
          const data = JSON.parse(frame.body)
          sub.callback({
            messageId: data.messageId || data.id,
            chatId: data.chatId || chatId,
            senderId: data.senderId,
            receiverId: data.receiverId,
            message: data.message || data.content,
            timestamp: data.timestamp || Date.now(),
          })
        } catch (e) {
          console.error('STOMP: Error parsing message', e)
        }
        break
      }
    }
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.connected) {
      const msg = this.messageQueue.shift()
      if (msg) {
        this.sendInternal(msg.destination, msg.body)
      }
    }
  }

  private sendInternal(destination: string, body: string): void {
    if (!this.ws || !this.connected) return

    const frame = this.createFrame(
      'SEND',
      {
        destination: destination,
        'content-type': 'application/json',
      },
      body
    )

    console.log('STOMP: Sending to', destination)
    this.ws.send(frame)
  }

  send(destination: string, body: string): void {
    if (this.connected) {
      this.sendInternal(destination, body)
    } else {
      this.messageQueue.push({ destination, body })
    }
  }

  subscribe(chatId: string, callback: ChatMessageCallback): string {
    const id = `sub-${++this.subscriptionCounter}`
    this.subscriptions.set(chatId, { id, callback })

    if (this.connected && this.ws) {
      const frame = this.createFrame('SUBSCRIBE', {
        id: id,
        destination: `/topic/chats/${chatId}`,
      })
      console.log('STOMP: Subscribing to', `/topic/chats/${chatId}`)
      this.ws.send(frame)
    }

    return id
  }

  unsubscribe(chatId: string): void {
    const sub = this.subscriptions.get(chatId)
    if (sub && this.connected && this.ws) {
      const frame = this.createFrame('UNSUBSCRIBE', {
        id: sub.id,
      })
      this.ws.send(frame)
    }
    this.subscriptions.delete(chatId)
  }

  disconnect(): void {
    if (this.ws && this.connected) {
      const frame = this.createFrame('DISCONNECT', {})
      this.ws.send(frame)
    }
    this.ws?.close()
    this.ws = null
    this.connected = false
    this.subscriptions.clear()
    this.messageQueue = []
  }

  isConnected(): boolean {
    return this.connected
  }
}

class WebSocketService {
  private stomp: StompClient | null = null
  private subscriptions: Map<string, ChatMessageCallback> = new Map()
  private isConnecting = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private connectionPromise: Promise<void> | null = null
  private webSocketDisabled = false

  async connect(): Promise<void> {
    // Skip on server-side
    if (!isBrowser) {
      throw new Error('WebSocket is not available on server side')
    }

    // Skip on React Native - server doesn't support it properly
    // Messages will be fetched via HTTP polling instead
    if (isReactNative()) {
      console.log('WebSocket: Skipping on React Native - using HTTP polling instead')
      this.webSocketDisabled = true
      return
    }

    // If already connected, return immediately
    if (this.stomp?.isConnected()) {
      return
    }

    // If connection is in progress, wait for it
    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise
    }

    this.isConnecting = true

    this.connectionPromise = (async () => {
      try {
        const token = await getAuthToken()
        console.log('WebSocket: Got auth token:', token ? `${token.substring(0, 20)}...` : 'null')

        if (!token) {
          throw new Error('No auth token available')
        }

        // Remove 'Bearer ' prefix if present
        const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token
        console.log('WebSocket: Using token (first 20 chars):', cleanToken.substring(0, 20))
        console.log('WebSocket: Connecting to:', getWebSocketUrl())

        this.stomp = new StompClient()
        await this.stomp.connect(getWebSocketUrl(), cleanToken)

        this.reconnectAttempts = 0
        this.isConnecting = false

        // Re-subscribe to all active chats
        for (const [chatId, callback] of this.subscriptions.entries()) {
          this.stomp.subscribe(chatId, callback)
        }
      } catch (error) {
        this.isConnecting = false
        console.error('WebSocket: Failed to connect', error)
        throw error
      }
    })()

    return this.connectionPromise
  }

  private async handleReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('WebSocket: Max reconnect attempts reached')
      return
    }

    this.reconnectAttempts++
    console.log(
      `WebSocket: Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    )

    setTimeout(async () => {
      try {
        await this.connect()
      } catch (error) {
        console.error('WebSocket: Reconnection failed', error)
      }
    }, this.reconnectDelay)
  }

  async subscribeToChat(chatId: string, callback: ChatMessageCallback): Promise<void> {
    // Store callback for reconnection
    this.subscriptions.set(chatId, callback)

    // Skip on React Native - using HTTP polling
    if (this.webSocketDisabled) {
      console.log(`WebSocket: Skipping subscription on React Native (chat ${chatId})`)
      return
    }

    if (!this.stomp?.isConnected()) {
      await this.connect()
    }

    this.stomp?.subscribe(chatId, callback)
    console.log(`WebSocket: Subscribed to chat ${chatId}`)
  }

  unsubscribeFromChat(chatId: string): void {
    this.subscriptions.delete(chatId)
    if (!this.webSocketDisabled) {
      this.stomp?.unsubscribe(chatId)
    }
    console.log(`WebSocket: Unsubscribed from chat ${chatId}`)
  }

  async sendChatMessage(
    chatId: string,
    senderId: string,
    receiverId: string,
    message: string
  ): Promise<void> {
    // On React Native, this shouldn't be called - use HTTP endpoint instead
    if (this.webSocketDisabled) {
      console.log('WebSocket: Skipping on React Native - use HTTP endpoint instead')
      return
    }

    if (!this.stomp?.isConnected()) {
      await this.connect()
    }

    const payload = JSON.stringify({
      chatId,
      senderId,
      receiverId,
      message,
    })

    console.log('WebSocket: Sending chat message', { chatId, senderId, receiverId, message })
    this.stomp?.send('/app/chat.sendMessage', payload)
  }

  disconnect(): void {
    this.subscriptions.clear()
    if (!this.webSocketDisabled) {
      this.stomp?.disconnect()
    }
    this.stomp = null
  }

  isConnected(): boolean {
    if (this.webSocketDisabled) {
      return false // React Native uses polling, not WebSocket
    }
    return this.stomp?.isConnected() ?? false
  }
}

// Singleton instance
export const webSocketService = new WebSocketService()
