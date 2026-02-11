'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Processing login...</p></div>}>
      <AuthCallbackContent />
    </Suspense>
  )
}

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setTokenAndUser } = useAuth()
  const [status, setStatus] = useState('Processing login...')

  useEffect(() => {
    const handleAuth = async () => {
      const token = searchParams.get('token')
      const provider = searchParams.get('provider')

      if (!token) {
        setStatus('Authentication failed. No token received.')
        setTimeout(() => router.push('/auth/login?error=no_token'), 2000)
        return
      }

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://classinnews-publishers-backend.onrender.com'
        
        // Fetch user data
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.id || data.user) {
          const user = data.user || data
          
          // Use the auth context to set token and user
          // This should handle storage internally
          await setTokenAndUser(token, user)
          
          setStatus(`Welcome back${user.name ? `, ${user.name}` : ''}! Redirecting to dashboard...`)
          
          // Small delay for better UX
          setTimeout(() => {
            router.push('/dashboard')
          }, 1000)
        } else {
          throw new Error('Invalid user data received')
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setStatus('Authentication failed. Please try again.')
        setTimeout(() => router.push('/auth/login?error=callback_failed'), 2000)
      }
    }

    handleAuth()
  }, [searchParams, router, setTokenAndUser])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl text-center max-w-md mx-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{status}</h2>
        <p className="text-gray-500 text-sm">Please wait...</p>
      </div>
    </div>
  )
}