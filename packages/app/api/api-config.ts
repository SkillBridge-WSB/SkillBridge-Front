import { Platform } from 'react-native'
import { Configuration } from './generated/runtime'
import { getCookie } from '../utils/cookies'

// Dynamically import AsyncStorage only on React Native
let AsyncStorage: typeof import('@react-native-async-storage/async-storage').default | null = null

if (Platform.OS !== 'web') {
  try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default
  } catch (e) {
    // AsyncStorage not available
    console.warn('AsyncStorage not available')
  }
}

const AUTH_TOKEN_KEY = 'auth_token'

// Cross-platform token getter
const getAuthToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return getCookie(AUTH_TOKEN_KEY)
  } else if (AsyncStorage) {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY)
    } catch (e) {
      console.error('Error reading auth token:', e)
      return null
    }
  }
  return null
}

// API base URL - use full URL for native (Expo), relative for web (Next.js rewrites)
const API_BASE_URL =
  Platform.OS === 'web'
    ? '' // Use relative URLs since Next.js rewrites will handle the proxying
    : 'https://api-sb-wsb.franeklab.com' // Use full URL for native apps

// Create configuration with auth middleware
export const apiConfiguration = new Configuration({
  basePath: API_BASE_URL,
  middleware: [
    {
      pre: async (context) => {
        const token = await getAuthToken()
        if (token) {
          // Add auth header to all requests
          return {
            url: context.url,
            init: {
              ...context.init,
              headers: {
                ...context.init.headers,
                'x-auth-token': `Bearer ${token}`,
              },
            },
          }
        }
        return context
      },
    },
  ],
})

// Helper to create API instances with auth
export function createApiInstance<T>(ApiClass: new (config: Configuration) => T): T {
  return new ApiClass(apiConfiguration)
}



