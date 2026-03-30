'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authAPI } from '@/lib/api'
import {
  clearStoredPublisherSession,
  fetchCurrentPublisher,
  getStoredPublisherUser,
  logoutPublisherSession,
  PUBLISHER_SESSION_PLACEHOLDER,
  storePublisherUser,
} from '@/lib/publisher-session'

interface User {
  id: string
  email?: string | null
  username?: string | null
  role?: string | null
  avatarUrl?: string | null
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<any>
  logout: () => Promise<void>
  setAuthenticatedUser: (user: User) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setTokenState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const cachedUser = getStoredPublisherUser()
    if (cachedUser) {
      setUser(cachedUser)
      setTokenState(PUBLISHER_SESSION_PLACEHOLDER)
    }

    const checkAuth = async () => {
      try {
        const userData = await fetchCurrentPublisher()
        if (userData) {
          setUser(userData as User)
          setTokenState(PUBLISHER_SESSION_PLACEHOLDER)
        } else {
          setUser(null)
          setTokenState(null)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        clearStoredPublisherSession()
        setUser(null)
        setTokenState(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password)
    const userData = response.user
    storePublisherUser(userData)
    setTokenState(PUBLISHER_SESSION_PLACEHOLDER)
    setUser(userData)
  }

  const register = async (email: string, username: string, password: string) => {
    const response = await authAPI.register(email, username, password)
    // No token returned on registration - user must wait for admin approval
    // Don't set user or token here
    return response // Return the response with success message
  }

  const logout = async () => {
    await logoutPublisherSession()
    setTokenState(null)
    setUser(null)
  }

  const setAuthenticatedUser = async (userData: User) => {
    storePublisherUser(userData)
    setTokenState(PUBLISHER_SESSION_PLACEHOLDER)
    setUser(userData)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, setAuthenticatedUser }}>
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
