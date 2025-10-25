import React, { createContext, useContext, useEffect, useState } from 'react'
import { setCookie, getCookie, deleteCookie } from '../utils/cookies'

interface AuthContextType {
  token: string | null
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Check for stored auth data on mount
    if (typeof window !== 'undefined') {
      const storedToken = getCookie('auth_token')

      console.log('storedToken', storedToken)
      if (storedToken) {
        setToken(storedToken)
      }
    }
  }, [])

  const login = (newToken: string) => {
    setToken(newToken)

    if (typeof window !== 'undefined') {
      setCookie('auth_token', newToken, 7) // 7 days
    }
  }

  const logout = () => {
    setToken(null)

    if (typeof window !== 'undefined') {
      deleteCookie('auth_token')
    }
  }

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
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
