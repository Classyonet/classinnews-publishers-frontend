'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowLeft, Mail } from 'lucide-react'

function PendingApprovalContent() {
  const searchParams = useSearchParams()
  const provider = searchParams.get('provider') || 'social'
  const email = searchParams.get('email') || ''

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-white hover:text-white/80 backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>

        <Card className="backdrop-blur-md bg-white/95 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Registration Complete!</CardTitle>
            <CardDescription className="text-gray-600">
              Your account has been created successfully via {provider.charAt(0).toUpperCase() + provider.slice(1)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-800 mb-2">⏳ Pending Admin Approval</h3>
              <p className="text-sm text-amber-700">
                Your publisher account requires administrator approval before you can access the dashboard. 
                This typically takes 1-2 business days.
              </p>
            </div>

            {email && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-800">We'll notify you</h3>
                    <p className="text-sm text-blue-700">
                      An email will be sent to <strong>{email}</strong> once your account is approved.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="font-medium text-gray-800">What happens next?</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">1.</span>
                  Our team will review your registration
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">2.</span>
                  You'll receive an email notification when approved
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600">3.</span>
                  Login with your {provider} account to start publishing
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t">
              <Link href="/auth/login">
                <Button className="w-full">
                  Return to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PendingApprovalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <PendingApprovalContent />
    </Suspense>
  )
}
