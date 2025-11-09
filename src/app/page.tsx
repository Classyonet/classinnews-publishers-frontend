'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // If user is authenticated, redirect to dashboard
  if (!isLoading && user) {
    router.push('/dashboard')
    return null
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 animate-gradient"></div>
      
      {/* Animated wave overlay */}
      <div className="absolute inset-0 opacity-30">
        <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="rgba(255,255,255,0.1)" fillOpacity="1" d="M0,160L48,144C96,128,192,96,288,90.7C384,85,480,107,576,128C672,149,768,171,864,165.3C960,160,1056,128,1152,117.3C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
            <animate attributeName="d" dur="10s" repeatCount="indefinite" values="
              M0,160L48,144C96,128,192,96,288,90.7C384,85,480,107,576,128C672,149,768,171,864,165.3C960,160,1056,128,1152,117.3C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
              M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,128C672,107,768,85,864,90.7C960,96,1056,128,1152,138.7C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
              M0,160L48,144C96,128,192,96,288,90.7C384,85,480,107,576,128C672,149,768,171,864,165.3C960,160,1056,128,1152,117.3C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
          </path>
        </svg>
        <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ top: '20%' }}>
          <path fill="rgba(255,255,255,0.05)" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,208C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
            <animate attributeName="d" dur="15s" repeatCount="indefinite" values="
              M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,208C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
              M0,128L48,138.7C96,149,192,171,288,165.3C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,181.3C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
              M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,208C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
          </path>
        </svg>
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            Welcome to ClassinNews
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow">
            Create, manage, and publish your news content with ease
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="hover:shadow-2xl transition-all hover:scale-105 backdrop-blur-sm bg-white/90 border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-3xl">✏️</span>
                Create Articles
              </CardTitle>
              <CardDescription className="text-gray-700">
                Write and edit your news articles with our rich text editor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/auth/register">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-2xl transition-all hover:scale-105 backdrop-blur-sm bg-white/90 border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-3xl">📊</span>
                Analytics
              </CardTitle>
              <CardDescription className="text-gray-700">
                Track your content performance and audience engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/auth/register">
                <Button variant="outline" className="w-full border-2 hover:bg-white/50">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-2xl transition-all hover:scale-105 backdrop-blur-sm bg-white/90 border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-3xl">📰</span>
                Manage Content
              </CardTitle>
              <CardDescription className="text-gray-700">
                Organize and manage all your published articles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/auth/register">
                <Button variant="outline" className="w-full border-2 hover:bg-white/50">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-16">
          <p className="text-white text-lg mb-6 drop-shadow">
            Ready to get started? Sign in to your account
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90 shadow-lg">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}













