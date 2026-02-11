'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  BarChart3, 
  FileText, 
  Eye, 
  Heart, 
  MessageCircle, 
  TrendingUp,
  Plus
} from 'lucide-react'
import { dashboardAPI } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardAPI.getStats()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 p-8 shadow-2xl shadow-purple-500/30">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
        <div className="relative">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.username || 'Creator'}! 👋
          </h1>
          <p className="text-purple-100 text-lg">
            Here's what's happening with your content today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-2xl group-hover:blur-3xl transition-all"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Views</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stats?.stats?.totalViews?.toLocaleString() || 0}</div>
            <p className="text-sm text-slate-500">
              Across all your articles
            </p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-2xl group-hover:blur-3xl transition-all"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">Articles</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stats?.stats?.totalArticles || 0}</div>
            <p className="text-sm text-slate-500">
              {stats?.stats?.publishedArticles || 0} published
            </p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-red-500/10 to-pink-500/10 blur-2xl group-hover:blur-3xl transition-all"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 shadow-lg shadow-red-500/30">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">Likes</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stats?.stats?.totalLikes || 0}</div>
            <p className="text-sm text-slate-500">
              From your readers
            </p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-500/10 blur-2xl group-hover:blur-3xl transition-all"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Shares</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stats?.stats?.totalShares || 0}</div>
            <p className="text-sm text-slate-500">
              Social shares
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Quick Actions</h3>
            <p className="text-sm text-slate-500">
              Get started with your content creation
            </p>
          </div>
          <div className="space-y-3">
            <Link href="/dashboard/articles/new">
              <button className="w-full flex items-center justify-start gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/30 hover:shadow-xl hover:scale-[1.02]">
                <Plus className="h-5 w-5" />
                Create New Article
              </button>
            </Link>
            <Link href="/dashboard/articles">
              <button className="w-full flex items-center justify-start gap-3 p-4 rounded-xl bg-slate-50 text-slate-700 font-medium hover:bg-slate-100 transition-all border border-slate-200">
                <FileText className="h-5 w-5 text-slate-400" />
                Manage Articles
              </button>
            </Link>
            <Link href="/dashboard/analytics">
              <button className="w-full flex items-center justify-start gap-3 p-4 rounded-xl bg-slate-50 text-slate-700 font-medium hover:bg-slate-100 transition-all border border-slate-200">
                <BarChart3 className="h-5 w-5 text-slate-400" />
                View Analytics
              </button>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Recent Articles</h3>
            <p className="text-sm text-slate-500">
              Your latest content and its performance
            </p>
          </div>
          {stats?.recentArticles?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentArticles.map((article: any) => (
                <div key={article.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-purple-200 hover:bg-purple-50/50 transition-all">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-slate-900 truncate">{article.title}</h4>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                        article.status === 'published' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {article.status}
                      </span>
                      <span className="text-xs text-slate-500">{new Date(article.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4 text-blue-500" />
                      {article.viewsCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      {article.likesCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium mb-2">No articles yet</p>
              <p className="text-sm text-slate-500 mb-4">Create your first one!</p>
              <Link href="/dashboard/articles/new">
                <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/30">
                  <Plus className="h-4 w-4" />
                  Create Article
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}













