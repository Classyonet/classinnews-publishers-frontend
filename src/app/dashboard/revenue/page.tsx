'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download,
  CreditCard,
  Eye
} from 'lucide-react'

export default function RevenuePage() {
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const stats = [
    {
      title: 'Total Earnings',
      value: '$0.00',
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-500',
      shadowColor: 'shadow-emerald-500/30',
      bgGradient: 'from-emerald-50 to-teal-50',
      change: '+0%'
    },
    {
      title: 'This Month',
      value: '$0.00',
      icon: Calendar,
      gradient: 'from-blue-500 to-cyan-500',
      shadowColor: 'shadow-blue-500/30',
      bgGradient: 'from-blue-50 to-cyan-50',
      change: currentMonth
    },
    {
      title: 'Pending',
      value: '$0.00',
      icon: TrendingUp,
      gradient: 'from-amber-500 to-yellow-500',
      shadowColor: 'shadow-amber-500/30',
      bgGradient: 'from-amber-50 to-yellow-50',
      change: 'Processing'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Revenue</h1>
          <p className="text-slate-600 mt-1">Track your earnings and payment history</p>
        </div>
        <button className="px-4 py-2.5 bg-white text-purple-600 border border-purple-200 rounded-xl font-medium shadow-md hover:bg-purple-50 hover:shadow-lg transition-all flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="group relative rounded-2xl bg-white p-6 shadow-lg border border-slate-100 hover:shadow-2xl transition-all hover:scale-[1.02]">
            <div className={`absolute -z-10 inset-0 bg-gradient-to-br ${stat.bgGradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity`}></div>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-600 mb-2">
                  {stat.title}
                </p>
                <h3 className="text-3xl font-bold text-slate-900 mb-2">
                  {stat.value}
                </h3>
                <span className="text-sm font-medium text-slate-600">{stat.change}</span>
              </div>
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg ${stat.shadowColor}`}>
                <stat.icon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Model Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">How You Earn</h3>
            <p className="text-sm text-slate-600">Revenue model breakdown</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/30 flex-shrink-0">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Per View</h4>
                <p className="text-sm text-slate-600">
                  Earn $0.001 per article view from engaged readers
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/30 flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Engagement Bonus</h4>
                <p className="text-sm text-slate-600">
                  Extra earnings for high engagement articles
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-purple-500/30 flex-shrink-0">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Premium Readers</h4>
                <p className="text-sm text-slate-600">
                  Higher rate for views from premium subscribers
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Payment Information</h3>
            <p className="text-sm text-slate-600">Manage your payout details</p>
          </div>
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-slate-50 to-purple-50/30 rounded-xl border border-slate-200 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-slate-500" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">No Payment Method</h4>
              <p className="text-sm text-slate-600 mb-4">
                Add your payment information to receive earnings
              </p>
              <button className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all">
                Add Payment Method
              </button>
            </div>
            
            <div className="text-sm text-slate-600 space-y-2 p-4 bg-slate-50 rounded-xl">
              <p><strong className="text-slate-900">Minimum Payout:</strong> $50.00</p>
              <p><strong className="text-slate-900">Payment Schedule:</strong> Monthly (1st of each month)</p>
              <p><strong className="text-slate-900">Processing Time:</strong> 5-7 business days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Transaction History</h3>
          <p className="text-sm text-slate-600">Your recent payments and earnings</p>
        </div>
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4">
            <DollarSign className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No transactions yet</h3>
          <p className="text-slate-600">
            Start creating content and earning revenue. Transactions will appear here.
          </p>
        </div>
      </div>

      {/* Getting Started */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 p-8 shadow-2xl shadow-purple-500/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl"></div>
        <div className="relative flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-2">
              Start Earning Today
            </h3>
            <p className="text-purple-100 mb-4 leading-relaxed">
              Publish high-quality articles to start generating revenue. The more engaged your 
              readers are, the more you earn. Focus on creating valuable content that resonates 
              with your audience.
            </p>
            <button className="px-4 py-2.5 bg-white text-purple-600 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
              Learn More About Monetization
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
