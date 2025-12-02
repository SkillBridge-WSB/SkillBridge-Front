import React, { createContext, useContext, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { setCookie, getCookie, deleteCookie } from '../utils/cookies'

// Dynamically import AsyncStorage only on React Native
let AsyncStorage: typeof import('@react-native-async-storage/async-storage').default | null = null

if (Platform.OS !== 'web') {
  try {
    AsyncStorage = require('@react-native-async-storage/async-storage').default
  } catch (e) {
    // AsyncStorage not available, will use in-memory storage
    console.warn('AsyncStorage not available, using in-memory storage')
  }
}

const AUTH_TOKEN_KEY = 'auth_token'

// Cross-platform base64 decode (works on web, Node.js, and React Native)
function base64Decode(str: string): string {
  // Pad the string if needed
  const padding = str.length % 4
  const padded = padding ? str + '='.repeat(4 - padding) : str
  
  // Use atob on web if available
  if (typeof atob === 'function') {
    try {
      return decodeURIComponent(
        atob(padded)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
    } catch {
      // Fall through to manual decode
    }
  }
  
  // Manual base64 decode for React Native
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  let output = ''
  
  for (let i = 0; i < padded.length; i += 4) {
    const a = chars.indexOf(padded[i])
    const b = chars.indexOf(padded[i + 1])
    const c = chars.indexOf(padded[i + 2])
    const d = chars.indexOf(padded[i + 3])
    
    const byte1 = (a << 2) | (b >> 4)
    const byte2 = ((b & 15) << 4) | (c >> 2)
    const byte3 = ((c & 3) << 6) | d
    
    output += String.fromCharCode(byte1)
    if (c !== 64) output += String.fromCharCode(byte2)
    if (d !== 64) output += String.fromCharCode(byte3)
  }
  
  // Decode UTF-8
  try {
    return decodeURIComponent(escape(output))
  } catch {
    return output
  }
}

// Decode JWT to extract user ID (without verification - verification happens server-side)
function decodeJwtPayload(token: string): { sub?: string; userId?: string; id?: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    // Base64 decode the payload (second part)
    const payload = parts[1]
    // Handle URL-safe base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = base64Decode(base64)
    
    return JSON.parse(jsonPayload)
  } catch (e) {
    console.error('Error decoding JWT:', e)
    return null
  }
}

// Extract user ID from JWT token
function getUserIdFromToken(token: string): string | null {
  const payload = decodeJwtPayload(token)
  if (!payload) return null
  // Try common JWT user ID field names
  return payload.sub || payload.userId || payload.id || null
}

// Cross-platform storage helpers
const getStoredToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return getCookie(AUTH_TOKEN_KEY)
  } else if (AsyncStorage) {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY)
    } catch (e) {
      console.error('Error reading from AsyncStorage:', e)
      return null
    }
  }
  return null
}

const setStoredToken = async (token: string): Promise<void> => {
  if (Platform.OS === 'web') {
    setCookie(AUTH_TOKEN_KEY, token, 7) // 7 days
  } else if (AsyncStorage) {
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token)
    } catch (e) {
      console.error('Error writing to AsyncStorage:', e)
    }
  }
}

const removeStoredToken = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    deleteCookie(AUTH_TOKEN_KEY)
  } else if (AsyncStorage) {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY)
    } catch (e) {
      console.error('Error removing from AsyncStorage:', e)
    }
  }
}

interface AuthContextType {
  token: string | null
  userId: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth data on mount
    const loadStoredToken = async () => {
      try {
        const storedToken = await getStoredToken()
        if (storedToken) {
          setToken(storedToken)
          // Extract user ID from the token
          const extractedUserId = getUserIdFromToken(storedToken)
          setUserId(extractedUserId)
        }
      } catch (e) {
        console.error('Error loading stored token:', e)
      } finally {
        setIsLoading(false)
      }
    }

    loadStoredToken()
  }, [])

  const login = async (newToken: string) => {
    setToken(newToken)
    // Extract user ID from the token
    const extractedUserId = getUserIdFromToken(newToken)
    setUserId(extractedUserId)
    await setStoredToken(newToken)
  }

  const logout = async () => {
    setToken(null)
    setUserId(null)
    await removeStoredToken()
  }

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider value={{ token, userId, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
