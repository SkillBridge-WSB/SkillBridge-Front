import { Platform } from 'react-native'
import createClient from 'openapi-fetch'
import type { paths } from './types'
import { getCookie } from '../utils/cookies'

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

// API base URL - use full URL for native (Expo), relative for web (Next.js rewrites)
const API_BASE_URL = Platform.OS === 'web' 
  ? '' // Use relative URLs since Next.js rewrites will handle the proxying
  : 'https://api-sb-wsb.franeklab.com' // Use full URL for native apps

// Create the API client with the base URL
export const apiClient = createClient<paths>({
  baseUrl: API_BASE_URL,
})

// Configure default headers if needed
apiClient.use({
  async onRequest({ request }) {
    // Add authentication headers here if needed
    const token = await getAuthToken()
    if (token) {
      request.headers.set('x-auth-token', `Bearer ${token}`)
    }
    return request
  },
  onResponse({ response }) {
    // Handle global response logic here
    return response
  },
})
