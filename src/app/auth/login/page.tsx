'use client'

export const runtime = 'edge';

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://classinnews-publishers-backend.onrender.com'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [errorCode, setErrorCode] = useState('')
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [oauthProviders, setOauthProviders] = useState({ google: false, facebook: false, twitter: false })

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      const messages: Record<string, string> = {
        google_auth_failed: 'Google authentication failed. Please try again.',
        facebook_auth_failed: 'Facebook authentication failed. Please try again.',
        pending_approval: 'Your account is pending admin approval.',
        auth_failed: 'Authentication failed. Please try again.',
        no_token: 'Authentication failed. No token received.',
        callback_failed: 'Authentication callback failed. Please try again.'
      }
      setError(messages[errorParam] || 'An error occurred during login.')
      if (errorParam === 'pending_approval') setErrorCode('PENDING_APPROVAL')
    }
  }, [searchParams])

  useEffect(() => {
    fetch(`${API_URL}/api/auth/oauth-providers`)
      .then(res => res.json())
      .then(data => { if (data.providers) setOauthProviders(data.providers) })
      .catch(() => {})
  }, [])

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setErrorCode('')
    setResendSuccess(false)

    try {
      await login(formData.email, formData.password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.')
      setErrorCode(err.code || '')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setResending(true)
    setResendSuccess(false)
    try {
      const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      })
      if (response.ok) setResendSuccess(true)
      else {
        const data = await response.json()
        setError(data.message || 'Failed to resend verification email')
      }
    } catch {
      setError('Failed to resend verification email. Please try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"></div>
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-sm text-white hover:text-white/80 backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>

        <Card className="backdrop-blur-md bg-white/95 shadow-2xl border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>Sign in to your ClassinNews creator account</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
                {errorCode === 'EMAIL_NOT_VERIFIED' && (
                  <div className="mt-3">
                    {resendSuccess ? (
                      <p className="text-sm text-green-600">Verification email sent! Check your inbox.</p>
                    ) : (
                      <Button type="button" onClick={handleResendVerification} disabled={resending} size="sm" variant="outline" className="w-full">
                        {resending ? 'Sending...' : 'Resend Verification Email'}
                      </Button>
                    )}
                  </div>
                )}
                {errorCode === 'PENDING_APPROVAL' && (
                  <p className="text-sm text-gray-600 mt-2">We will notify you via email once your account is activated.</p>
                )}
              </div>
            )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input id="email" type="email" autoComplete="email" required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your email" value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input id="password" type="password" autoComplete="current-password" required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your password" value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})} />
                </div>
                <div className="flex items-center justify-end">
                  <Link href="/auth/forgot-password" className="text-sm font-medium text-purple-600 hover:text-purple-500">Forgot password?</Link>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={!oauthProviders.google} type="button">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" className="font-medium text-purple-600 hover:text-purple-500">Sign up here</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"><div className="text-white text-lg">Loading...</div></div>}>
      <LoginContent />
    </Suspense>
  )
}













