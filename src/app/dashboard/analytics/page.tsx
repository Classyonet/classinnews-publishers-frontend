'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2,
  Users,
  FileText,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { articlesAPI } from '@/lib/api'

export default function AnalyticsPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const data = await articlesAPI.getAll()
      setArticles(data)
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const totalViews = articles.reduce((sum, a) => sum + a.viewsCount, 0)
  const totalLikes = articles.reduce((sum, a) => sum + a.likesCount, 0)
  const totalShares = articles.reduce((sum, a) => sum + a.sharesCount, 0)
  const totalArticles = articles.length
  const publishedArticles = articles.filter(a => a.status === 'published').length

  const stats = [
    {
      title: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: Eye,
      gradient: 'from-blue-500 to-cyan-500',
      shadowColor: 'shadow-blue-500/30',
      bgGradient: 'from-blue-50 to-cyan-50',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Total Likes',
      value: totalLikes.toLocaleString(),
      icon: Heart,
      gradient: 'from-red-500 to-pink-500',
      shadowColor: 'shadow-red-500/30',
      bgGradient: 'from-red-50 to-pink-50',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Total Shares',
      value: totalShares.toLocaleString(),
      icon: Share2,
      gradient: 'from-emerald-500 to-teal-500',
      shadowColor: 'shadow-emerald-500/30',
      bgGradient: 'from-emerald-50 to-teal-50',
      change: '+15%',
      trend: 'up'
    },
    {
      title: 'Published Articles',
      value: publishedArticles,
      icon: FileText,
      gradient: 'from-purple-500 to-pink-500',
      shadowColor: 'shadow-purple-500/30',
      bgGradient: 'from-purple-50 to-pink-50',
      change: `${totalArticles} total`,
      trend: 'neutral'
    }
  ]

  const topArticles = [...articles]
    .filter(a => a.status === 'published')
    .sort((a, b) => b.viewsCount - a.viewsCount)
    .slice(0, 5)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">Analytics</h1>
        <p className="text-slate-600">Track your content performance and engagement</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
            <div className={`absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br ${stat.bgGradient} blur-2xl group-hover:blur-3xl transition-all`}></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.shadowColor}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">
                {stat.title}
              </p>
              <h3 className="text-3xl font-bold text-slate-900 mb-2">
                {stat.value}
              </h3>
              <div className="flex items-center text-sm">
                {stat.trend === 'up' && (
                  <>
                    <ArrowUp className="h-4 w-4 text-emerald-600 mr-1" />
                    <span className="text-emerald-600 font-medium">{stat.change}</span>
                  </>
                )}
                {stat.trend === 'down' && (
                  <>
                    <ArrowDown className="h-4 w-4 text-red-600 mr-1" />
                    <span className="text-red-600 font-medium">{stat.change}</span>
                  </>
                )}
                {stat.trend === 'neutral' && (
                  <span className="text-slate-600 font-medium">{stat.change}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Overview */}
        <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Engagement Overview</h3>
            <p className="text-sm text-slate-600">Your content interaction metrics</p>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-700">Views</span>
                <span className="text-sm font-bold text-slate-900">{totalViews.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full shadow-inner" 
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-700">Likes</span>
                <span className="text-sm font-bold text-slate-900">{totalLikes.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-red-500 to-pink-500 h-3 rounded-full shadow-inner" 
                  style={{ width: `${totalViews > 0 ? (totalLikes / totalViews * 100) : 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-700">Shares</span>
                <span className="text-sm font-bold text-slate-900">{totalShares.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full shadow-inner" 
                  style={{ width: `${totalViews > 0 ? (totalShares / totalViews * 100) : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Article Status */}
        <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Article Status</h3>
            <p className="text-sm text-slate-600">Breakdown of your articles</p>
          </div>
          <div className="space-y-6">
            {[
              { label: 'Published', count: articles.filter(a => a.status === 'published').length, gradient: 'from-emerald-500 to-teal-500' },
              { label: 'Pending Review', count: articles.filter(a => a.status === 'pending_review').length, gradient: 'from-blue-500 to-cyan-500' },
              { label: 'Draft', count: articles.filter(a => a.status === 'draft').length, gradient: 'from-amber-500 to-orange-500' },
              { label: 'Rejected', count: articles.filter(a => a.status === 'rejected').length, gradient: 'from-red-500 to-pink-500' },
            ].map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                  <span className="text-sm font-bold text-slate-900">{item.count}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`bg-gradient-to-r ${item.gradient} h-3 rounded-full shadow-inner`}
                    style={{ width: `${totalArticles > 0 ? (item.count / totalArticles * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Articles */}
      <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Top Performing Articles</h3>
          <p className="text-sm text-slate-600">Your most viewed published articles</p>
        </div>
        {topArticles.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">No published articles yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topArticles.map((article, index) => (
              <div 
                key={article.id}
                className="group flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-purple-50/30 rounded-xl hover:from-purple-50 hover:to-pink-50 transition-all border border-slate-200 hover:border-purple-200"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg bg-gradient-to-br ${
                    index === 0 ? 'from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-500/30' :
                    index === 1 ? 'from-slate-300 to-slate-400 text-white shadow-lg shadow-slate-400/30' :
                    index === 2 ? 'from-orange-400 to-amber-500 text-white shadow-lg shadow-orange-500/30' :
                    'from-slate-100 to-slate-200 text-slate-600'
                  }`}>
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 mb-2 truncate group-hover:text-purple-600 transition-colors">
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{article.viewsCount.toLocaleString()}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="font-medium">{article.likesCount.toLocaleString()}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Share2 className="h-4 w-4 text-emerald-500" />
                        <span className="font-medium">{article.sharesCount || 0}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
