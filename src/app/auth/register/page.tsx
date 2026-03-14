'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { PUBLISHERS_API_URL as API_URL } from '@/lib/api-config'

export default function RegisterPage() {
  const { register } = useAuth()
  const [formData, setFormData] = useState({ email: '', username: '', password: '', confirmPassword: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [googleEnabled, setGoogleEnabled] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/api/auth/oauth-providers`)
      .then(res => res.json())
      .then(data => { if (data.providers?.google) setGoogleEnabled(true) })
      .catch(() => {})
  }, [])

  const handleGoogleRegister = () => {
    window.location.href = `${API_URL}/api/auth/google`
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
    <div className="min-h-screen flex">
      {/* Left - Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-emerald-700 to-green-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <h1 className="text-5xl font-extrabold mb-4 leading-tight">ClassinNews</h1>
          <p className="text-xl text-teal-100 mb-8 leading-relaxed">Start your journey as a content creator and reach millions of readers.</p>
          <div className="space-y-4">
            {["Publish articles instantly", "Earn from your content", "Build your brand"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-teal-100">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="text-sm text-gray-500 hover:text-teal-600 transition-colors">&larr; Back to Home</Link>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            {success ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Registration Successful!</h2>
                <p className="text-gray-600 text-sm">{successMessage}</p>
                <Link href="/auth/login">
                  <button className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-sm hover:shadow-md">
                    Go to Login
                  </button>
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
                  <p className="text-gray-500 mt-1">Join ClassinNews as a publisher</p>
                </div>

                {/* Google Sign Up */}
                <button type="button" onClick={handleGoogleRegister} disabled={!googleEnabled}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed mb-6">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                  <div className="relative flex justify-center"><span className="bg-white px-4 text-sm text-gray-400">or register with email</span></div>
                </div>

                {error && (
                  <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input id="email" type="email" autoComplete="email" required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-gray-50 placeholder-gray-400"
                      placeholder="you@example.com" value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                    <input id="username" type="text" autoComplete="username" required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-gray-50 placeholder-gray-400"
                      placeholder="Choose a username" value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})} />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                    <input id="password" type="password" autoComplete="new-password" required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-gray-50 placeholder-gray-400"
                      placeholder="Min 6 characters" value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                    <input id="confirmPassword" type="password" autoComplete="new-password" required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-gray-50 placeholder-gray-400"
                      placeholder="Confirm your password" value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
                  </div>
                  <button type="submit" disabled={isLoading}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md">
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-teal-600 hover:text-teal-700 font-semibold">Sign in</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
