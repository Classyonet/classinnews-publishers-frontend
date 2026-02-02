'use client'

export const runtime = 'edge';

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setTokenAndUser } = useAuth()
  const [status, setStatus] = useState('Processing login...')

  useEffect(() => {
    const token = searchParams.get('token')
    const provider = searchParams.get('provider')

    if (!token) {
      setStatus('Authentication failed. No token received.')
      setTimeout(() => router.push('/auth/login?error=no_token'), 2000)
      return
    }

    // Store token and redirect to dashboard
    try {
      localStorage.setItem('token', token)
      
      // Fetch user data
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://classinnews-publishers-backend.onrender.com'
      
      fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.id || data.user) {
            const user = data.user || data
            localStorage.setItem('user', JSON.stringify(user))
            setStatus(`Welcome back! Redirecting to dashboard...`)
            router.push('/dashboard')
          } else {
            throw new Error('Failed to get user data')
          }
        })
        .catch(err => {
          console.error('Auth callback error:', err)
          setStatus('Authentication failed. Please try again.')
          setTimeout(() => router.push('/auth/login?error=callback_failed'), 2000)
        })
    } catch (error) {
      console.error('Token storage error:', error)
      setStatus('Authentication failed. Please try again.')
      setTimeout(() => router.push('/auth/login?error=storage_failed'), 2000)
    }
  }, [searchParams, router])

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
