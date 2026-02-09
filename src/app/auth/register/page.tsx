'use client'

export const runtime = 'edge';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://classinnews-publishers-backend.onrender.com'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [formData, setFormData] = useState({ email: '', username: '', password: '', confirmPassword: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [oauthProviders, setOauthProviders] = useState({ google: false, facebook: false, twitter: false })

  useEffect(() => {
    fetch(`${API_URL}/api/auth/oauth-providers`)
      .then(res => res.json())
      .then(data => { if (data.providers) setOauthProviders(data.providers) })
      .catch(() => {})
  }, [])

  const handleGoogleRegister = () => {
    window.location.href = `${API_URL}/api/auth/google`
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      const response = await register(formData.email, formData.username, formData.password)
      setSuccess(true)
      setSuccessMessage(response.message || 'Registration successful! Please check your email to verify your account.')
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-teal-600 to-green-500"></div>
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-sm text-white hover:text-white/80 backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>

        <Card className="backdrop-blur-md bg-white/95 shadow-2xl border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
            <CardDescription>Join ClassinNews and start creating amazing content</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <h3 className="text-sm font-medium text-green-800">Registration Successful!</h3>
                  <p className="mt-2 text-sm text-green-700">{successMessage}</p>
                </div>
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">Go to Login Page</Button>
                </Link>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                  <form className="space-y-4" onSubmit={handleEmailSubmit}>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input id="email" type="email" autoComplete="email" required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Enter your email" value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input id="username" type="text" autoComplete="username" required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Choose a username" value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})} />
                    </div>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input id="password" type="password" autoComplete="new-password" required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Min 6 characters" value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})} />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                      <input id="confirmPassword" type="password" autoComplete="new-password" required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Confirm your password" value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or sign up with</span></div>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full" onClick={handleGoogleRegister} disabled={!oauthProviders.google} type="button">
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
                    Already have an account?{' '}
                    <Link href="/auth/login" className="font-medium text-teal-600 hover:text-teal-500">Sign in here</Link>
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
