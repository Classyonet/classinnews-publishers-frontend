'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authAPI, setToken, removeToken } from '@/lib/api'

interface User {
  id: string
  email: string
  username: string
  role: string
  avatarUrl?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<any>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setTokenState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        // Get token from localStorage
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
        if (storedToken) {
          setTokenState(storedToken)
          const userData = await authAPI.me()
          setUser(userData)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // Clear invalid token
        removeToken()
        setTokenState(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password)
    setToken(response.token)
    setTokenState(response.token)
    setUser(response.user)
  }

  const register = async (email: string, username: string, password: string) => {
    const response = await authAPI.register(email, username, password)
    // No token returned on registration - user must wait for admin approval
    // Don't set user or token here
    return response // Return the response with success message
  }

  const logout = () => {
    removeToken()
    setTokenState(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
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
