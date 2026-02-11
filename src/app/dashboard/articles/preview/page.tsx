'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Calendar, User, Eye, Clock } from 'lucide-react'

export default function ArticlePreviewPage() {
  const [article, setArticle] = useState<any>(null)

  useEffect(() => {
    // Get article from session storage
    const stored = sessionStorage.getItem('article_preview')
    if (stored) {
      setArticle(JSON.parse(stored))
    }
  }, [])

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No article to preview</p>
            <Button onClick={() => window.close()} className="mt-4">
              Close Window
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.trim().split(/\s+/).length
    const minutes = Math.ceil(words / wordsPerMinute)
    return minutes
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => window.close()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Close Preview
            </Button>
            <span className="text-sm text-gray-500">Preview Mode</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            article.status === 'draft' 
              ? 'bg-yellow-100 text-yellow-800' 
              : article.status === 'published' 
              ? 'bg-green-100 text-green-800'
              : article.status === 'pending_review'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {article.status === 'draft' 
              ? 'Draft' 
              : article.status === 'published' 
              ? 'Published'
              : article.status === 'pending_review'
              ? 'Pending Review'
              : article.status}
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Featured Image */}
          {article.featuredImageUrl && (
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={article.featuredImageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8 md:p-12">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {article.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-8 pb-8 border-b">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>Your Name</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>{calculateReadingTime(article.content)} min read</span>
              </div>
              {article.categoryId && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  Category
                </span>
              )}
            </div>

            {/* Excerpt */}
            {article.excerpt && (
              <div className="mb-8 p-4 bg-gray-50 border-l-4 border-blue-500 rounded">
                <p className="text-lg text-gray-700 italic">{article.excerpt}</p>
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-gray-800 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }}
              />
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag: string, index: number) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Preview Notice */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Preview Mode</h4>
                <p className="text-sm text-blue-800">
                  This is how your article will appear to readers. Close this window and click 
                  "Save Draft" or "Submit for Review" to publish.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
