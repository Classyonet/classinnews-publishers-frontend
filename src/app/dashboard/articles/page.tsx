'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Heart, 
  MessageCircle,
  Edit,
  Trash2,
  Calendar,
  FileText
} from 'lucide-react'
import { articlesAPI } from '@/lib/api'

interface Article {
  id: string
  title: string
  excerpt: string
  status: string
  viewsCount: number
  likesCount: number
  commentsCount?: number
  publishedAt: string | null
  category: any
  featuredImageUrl: string | null
  createdAt: string
}

export default function ArticlesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      setIsLoading(true)
      setError('')
      const data = await articlesAPI.getAll()
      setArticles(data)
    } catch (err: any) {
      console.error('Failed to fetch articles:', err)
      setError(err.message || 'Failed to load articles')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return
    
    try {
      await articlesAPI.delete(id)
      setArticles(articles.filter(a => a.id !== id))
      alert('Article deleted successfully!')
    } catch (err: any) {
      alert(err.message || 'Failed to delete article')
    }
  }

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending_review':
        return 'bg-blue-100 text-blue-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not published'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Articles</h1>
          <p className="text-slate-600 mt-1">Manage your published and draft articles</p>
        </div>
        <Link href="/dashboard/articles/new">
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/30 hover:shadow-xl hover:scale-[1.02]">
            <Plus className="h-5 w-5" />
            New Article
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-slate-50 hover:bg-white transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-slate-50 hover:bg-white transition-colors font-medium text-slate-700"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option>
              <option value="rejected">Rejected</option>
            </select>
            <button className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 text-slate-700 font-medium hover:bg-slate-100 transition-all border border-slate-200">
              <Filter className="h-4 w-4" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="rounded-2xl bg-white p-12 text-center shadow-lg border border-slate-100">
          <div className="text-slate-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="font-medium">Loading articles...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-2xl bg-white p-12 text-center shadow-lg border border-red-100">
          <div className="text-red-500">
            <p className="mb-4 font-medium">{error}</p>
            <button onClick={fetchArticles} className="px-6 py-2.5 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => {
            const isPendingReview = article.status === 'pending_review'
            
            return (
          <div key={article.id} className={`group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 ${isPendingReview ? 'opacity-60' : ''}`}>
            <div className="relative">
              {article.featuredImageUrl ? (
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={article.featuredImageUrl}
                    alt={article.title}
                    className={`h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 ${isPendingReview ? 'grayscale' : ''}`}
                  />
                </div>
              ) : (
                <div className={`aspect-video w-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center ${isPendingReview ? 'grayscale' : ''}`}>
                  <FileText className="h-16 w-16 text-white opacity-50" />
                </div>
              )}
              <div className="absolute top-3 right-3">
                <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-sm ${
                  article.status === 'published' ? 'bg-emerald-100/90 text-emerald-700' :
                  article.status === 'draft' ? 'bg-amber-100/90 text-amber-700' :
                  article.status === 'pending_review' ? 'bg-blue-100/90 text-blue-700' :
                  'bg-red-100/90 text-red-700'
                }`}>
                  {article.status.replace('_', ' ')}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="line-clamp-2 text-lg font-bold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">
                {article.title}
              </h3>
              <p className="line-clamp-2 text-sm text-slate-600 mb-4">
                {article.excerpt || 'No description available'}
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="h-4 w-4" />
                    {formatDate(article.publishedAt)}
                  </span>
                  {article.category && (
                    <span className="px-2.5 py-1 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-lg text-xs font-semibold">
                      {article.category.name}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Eye className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{article.viewsCount}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="font-medium">{article.likesCount}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <MessageCircle className="h-4 w-4 text-emerald-500" />
                      <span className="font-medium">{article.commentsCount || 0}</span>
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex gap-2">
                    <Link href={`/dashboard/articles/${article.id}/edit`}>
                      <button 
                        disabled={isPendingReview}
                        className={`p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-purple-50 hover:text-purple-600 transition-all border border-slate-200 ${isPendingReview ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    <button 
                      onClick={() => handleDelete(article.id)}
                      disabled={isPendingReview}
                      className={`p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all border border-slate-200 ${isPendingReview ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      sessionStorage.setItem('article_preview', JSON.stringify(article))
                      window.open('/dashboard/articles/preview', '_blank')
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
            )
          })}
        </div>
      )}

      {!isLoading && !error && filteredArticles.length === 0 && (
        <div className="rounded-2xl bg-white p-12 text-center shadow-lg border border-slate-100">
          <div className="text-slate-500">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No articles found</h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : "You haven't created any articles yet."
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link href="/dashboard/articles/new">
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/30">
                  <Plus className="h-5 w-5" />
                  Create Your First Article
                </button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}













