'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArticleEditor } from '@/components/articles/article-editor'
import { ArrowLeft, Save, Eye, Send, Upload, Image as ImageIcon, X } from 'lucide-react'
import Link from 'next/link'
import { articlesAPI, categoriesAPI, mediaAPI } from '@/lib/api'

export default function NewArticlePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [article, setArticle] = useState({
    title: '',
    content: '',
    excerpt: '',
    categoryId: '',
    tags: [] as string[],
    featuredImageUrl: '',
    status: 'draft' as 'draft' | 'pending_review'
  })

  const [categories, setCategories] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const data = await categoriesAPI.getAll()
        console.log('Fetched categories:', data)
        setCategories(data)
      } catch (err) {
        console.error('Failed to fetch categories:', err)
      }
    }
    fetchCategories()
  }, [])

  // Separate useEffect for reading URL parameters
  useEffect(() => {
    // Pre-fill title and content if coming from Browse Topics
    const topicTitle = searchParams.get('topic')
    const topicDescription = searchParams.get('description')
    
    console.log('URL Params:', { topicTitle, topicDescription })
    
    if (topicTitle || topicDescription) {
      console.log('Pre-filling article from topic...')
      setArticle(prev => ({
        ...prev,
        title: topicTitle || '',
        content: topicDescription ? `<p>${topicDescription}</p>` : ''
      }))
    }
  }, [searchParams])

  const fetchMedia = async () => {
    try {
      const response = await mediaAPI.getAll()
      // Handle both response formats
      const data = response.data ? response.data : response
      // Filter for images only
      const images = Array.isArray(data) ? data.filter((m: any) => m.type === 'image') : []
      setMediaFiles(images)
    } catch (err) {
      console.error('Failed to fetch media:', err)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    setUploadingImage(true)
    try {
      const media = await mediaAPI.upload(file)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'
      const imageUrl = media.data ? `${API_URL}${media.data.fileUrl}` : `${API_URL}${media.fileUrl}`
      setArticle({ ...article, featuredImageUrl: imageUrl })
      alert('Image uploaded successfully!')
    } catch (err: any) {
      alert(err.message || 'Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const openMediaLibrary = async () => {
    setShowMediaLibrary(true)
    await fetchMedia()
  }

  const selectMediaImage = (imageUrl: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'
    setArticle({ ...article, featuredImageUrl: `${API_URL}${imageUrl}` })
    setShowMediaLibrary(false)
  }

  const validateArticle = (status: 'draft' | 'pending_review') => {
    const errors: string[] = [];

    // Only validate thoroughly if submitting for review
    if (status === 'pending_review') {
      if (!article.title || article.title.trim().length < 5) {
        errors.push("Title must be at least 5 characters long");
      }

      if (!article.content || article.content.trim().length < 100) {
        errors.push("Content must be at least 100 characters long");
      }

      if (!article.categoryId) {
        errors.push("Please select a category");
      }

      if (!article.featuredImageUrl) {
        errors.push("Featured image is required");
      }

      if (!article.excerpt || article.excerpt.trim().length < 50) {
        errors.push("Meta description must be at least 50 characters long");
      }

      if (article.tags.length === 0) {
        errors.push("Please add at least one tag");
      }
    } else {
      // Basic validation for drafts
      if (!article.title) {
        errors.push("Title is required");
      }

      if (!article.content) {
        errors.push("Content is required");
      }
    }

    return errors;
  };

  const handleSave = async (status: 'draft' | 'pending_review') => {
    setError('');
    const validationErrors = validateArticle(status);
    
    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
      // Show validation errors in a modal
      const errorMessage = `Please fix the following issues:\n\n${validationErrors.join('\n')}`;
      alert(errorMessage);
      return;
    }

    setIsSaving(true);
    
    try {
      const payload = {
        ...article,
        status,
        categoryId: article.categoryId || null,
        featuredImageUrl: article.featuredImageUrl || null,
        title: article.title.trim(),
        content: article.content.trim(),
        excerpt: article.excerpt.trim()
      }
      
      await articlesAPI.create(payload)
      
      // Show success notification
      const message = status === 'draft' 
        ? 'Article saved as draft successfully!' 
        : 'Article submitted for review! You will be notified once it is approved by a moderator.';
      
      alert(message);
      router.push('/dashboard/articles')
    } catch (err: any) {
      setError(err.message || 'Failed to save article');
      alert(err.message || 'Failed to save article');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/articles">
            <button className="px-3 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Articles
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Create New Article</h1>
            <p className="text-slate-600 mt-1">Write and publish your news content</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            className="px-4 py-2.5 bg-white text-purple-600 border border-purple-200 rounded-xl font-medium hover:bg-purple-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setShowPreview(true)}
            disabled={!article.title || !article.content}
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button 
            className="px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleSave('draft')}
            disabled={isSaving || !article.title || !article.content}
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
          <button 
            className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            onClick={() => handleSave('pending_review')}
            disabled={isSaving || !article.title || !article.content}
          >
            <Send className="h-4 w-4" />
            Submit for Review
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Article Content</h3>
              <p className="text-sm text-slate-600">
                Write your article using our rich text editor
              </p>
            </div>
            <div>
              <ArticleEditor 
                article={article}
                onChange={(updated) => setArticle({ 
                  ...article, 
                  title: updated.title,
                  content: updated.content
                })}
              />
              <div className="mt-6 p-5 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-2xl border-2 border-purple-200 shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    Requirements for Review Submission
                  </p>
                </div>
                <div className="space-y-2">
                  <div className={`flex items-center gap-2 p-2 rounded-lg transition-all ${article.title.length >= 5 ? 'bg-emerald-100 border border-emerald-300' : 'bg-white border border-slate-200'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${article.title.length >= 5 ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className={`text-sm font-medium ${article.title.length >= 5 ? 'text-emerald-700' : 'text-slate-600'}`}>
                      Title (at least 5 characters)
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 p-2 rounded-lg transition-all ${article.content.length >= 100 ? 'bg-emerald-100 border border-emerald-300' : 'bg-white border border-slate-200'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${article.content.length >= 100 ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className={`text-sm font-medium ${article.content.length >= 100 ? 'text-emerald-700' : 'text-slate-600'}`}>
                      Content (at least 100 characters)
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 p-2 rounded-lg transition-all ${!!article.categoryId ? 'bg-emerald-100 border border-emerald-300' : 'bg-white border border-slate-200'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${!!article.categoryId ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className={`text-sm font-medium ${!!article.categoryId ? 'text-emerald-700' : 'text-slate-600'}`}>
                      Category selected
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 p-2 rounded-lg transition-all ${!!article.featuredImageUrl ? 'bg-emerald-100 border border-emerald-300' : 'bg-white border border-slate-200'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${!!article.featuredImageUrl ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className={`text-sm font-medium ${!!article.featuredImageUrl ? 'text-emerald-700' : 'text-slate-600'}`}>
                      Featured image added
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 p-2 rounded-lg transition-all ${article.excerpt.length >= 50 ? 'bg-emerald-100 border border-emerald-300' : 'bg-white border border-slate-200'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${article.excerpt.length >= 50 ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className={`text-sm font-medium ${article.excerpt.length >= 50 ? 'text-emerald-700' : 'text-slate-600'}`}>
                      Meta description (at least 50 characters)
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 p-2 rounded-lg transition-all ${article.tags.length > 0 ? 'bg-emerald-100 border border-emerald-300' : 'bg-white border border-slate-200'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${article.tags.length > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className={`text-sm font-medium ${article.tags.length > 0 ? 'text-emerald-700' : 'text-slate-600'}`}>
                      At least one tag
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Article Settings */}
          <div className="rounded-2xl bg-gradient-to-br from-white to-purple-50/20 p-6 shadow-xl border-2 border-purple-100">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-purple-700 bg-clip-text text-transparent">Article Settings</h3>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <span>Category</span>
                  {!article.categoryId && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-semibold">Required</span>
                  )}
                </label>
                <select 
                  className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm ${
                    !article.categoryId ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-slate-200 bg-white text-slate-900'
                  }`}
                  value={article.categoryId}
                  onChange={(e) => setArticle({...article, categoryId: e.target.value})}
                >
                  <option value="">Select a category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {!article.categoryId && (
                  <p className="text-xs text-amber-700 mt-2 font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Required for review submission
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <span>Tags</span>
                  {article.tags.length === 0 && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-semibold">Required</span>
                  )}
                </label>
                  <div className={`border-2 rounded-xl p-4 shadow-sm transition-all ${article.tags.length === 0 ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-white'}`}>
                    <div className="space-y-3">
                      <input
                        type="text"
                        className="w-full border-2 border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder:text-slate-400"
                        placeholder="Type a tag and press Enter..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const input = e.currentTarget
                            const tag = input.value.trim()
                            if (tag && !article.tags.includes(tag)) {
                              setArticle({...article, tags: [...article.tags, tag]})
                              input.value = ''
                            }
                          }
                        }}
                      />
                      {article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {article.tags.map((tag, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-md hover:shadow-lg transition-shadow"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => setArticle({
                                  ...article,
                                  tags: article.tags.filter((_, i) => i !== index)
                                })}
                                className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-slate-600 font-medium">Press Enter to add each tag</p>
                    </div>
                    {article.tags.length === 0 && (
                      <p className="text-xs text-amber-700 mt-3 font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        At least one tag required for review
                      </p>
                    )}
                  </div>
                </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <span>Featured Image</span>
                  {!article.featuredImageUrl && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-semibold">Required</span>
                  )}
                </label>
                
                {/* Image Preview */}
                {article.featuredImageUrl && (
                  <div className="mb-3 relative group">
                    <img 
                      src={article.featuredImageUrl} 
                      alt="Featured" 
                      className="w-full h-48 object-cover rounded-xl border-2 border-purple-200 shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setArticle({...article, featuredImageUrl: ''})}
                      className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl px-3 py-1.5 text-sm font-semibold hover:scale-110 transition-transform shadow-lg opacity-0 group-hover:opacity-100 flex items-center gap-1"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                )}

                {/* URL Input Field */}
                  <div className="mb-3">
                    <div className={`p-4 rounded-xl border-2 shadow-sm transition-all ${!article.featuredImageUrl ? 'bg-amber-50 border-amber-400' : 'bg-slate-50 border-slate-200'}`}>
                      <input
                        type="url"
                        className="w-full border-2 border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder:text-slate-400 bg-white"
                        placeholder="https://example.com/image.jpg"
                        value={article.featuredImageUrl}
                        onChange={(e) => setArticle({...article, featuredImageUrl: e.target.value})}
                      />
                      {!article.featuredImageUrl && (
                        <p className="text-xs text-amber-700 mt-2 font-medium flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          Featured image required for review
                        </p>
                      )}
                    </div>
                  </div>
                {/* Upload and Browse Buttons */}
                <div className="flex gap-2">
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    <button
                      type="button"
                      className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-2 border-purple-400 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md"
                      disabled={uploadingImage}
                      onClick={(e) => {
                        e.preventDefault()
                        const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement
                        input?.click()
                      }}
                    >
                      <Upload className="h-4 w-4" />
                      {uploadingImage ? 'Uploading...' : 'Upload New'}
                    </button>
                  </label>
                  
                  <button
                    type="button"
                    onClick={openMediaLibrary}
                    className="flex-1 px-4 py-3 bg-white text-slate-700 border-2 border-slate-300 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Browse
                  </button>
                </div>
                
                <p className="text-xs text-slate-600 mt-3 font-medium">
                  Paste URL, upload new, or select from library
                </p>
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="rounded-2xl bg-gradient-to-br from-white to-purple-50/20 p-6 shadow-xl border-2 border-purple-100">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-purple-700 bg-clip-text text-transparent">SEO Settings</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <span>Meta Description</span>
                  {(!article.excerpt || article.excerpt.length < 50) && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-semibold">Required</span>
                  )}
                </label>
                <textarea
                  className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm placeholder:text-slate-400 ${
                    !article.excerpt || article.excerpt.length < 50 ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-slate-200 bg-white text-slate-900'
                  }`}
                  rows={3}
                  placeholder="Write a compelling description for search engines (minimum 50 characters)..."
                  value={article.excerpt}
                  onChange={(e) => setArticle({...article, excerpt: e.target.value})}
                />
                <div className="flex justify-between items-center mt-2">
                  {(!article.excerpt || article.excerpt.length < 50) ? (
                    <p className="text-xs text-amber-700 font-medium flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Required for review submission
                    </p>
                  ) : (
                    <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Looks good!
                    </p>
                  )}
                  <p className={`text-xs font-bold ${article.excerpt.length >= 50 ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {article.excerpt.length}/50 min
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Publishing Status */}
          <div className="rounded-2xl bg-gradient-to-br from-white to-purple-50/20 p-6 shadow-xl border-2 border-purple-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-purple-700 bg-clip-text text-transparent">Status</h3>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-purple-50 rounded-xl border border-purple-200">
              <div className={`w-3 h-3 rounded-full shadow-md ${
                article.status === 'draft' ? 'bg-amber-400' : 'bg-blue-500'
              }`} />
              <span className="text-sm font-bold text-slate-900">
                {article.status === 'draft' ? 'Draft' : 'Pending Review'}
              </span>
            </div>
            {article.status === 'pending_review' && (
              <p className="text-xs text-slate-600 mt-3 font-medium">
                Your article will be reviewed by moderators before publishing
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Media Library Modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-5xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Select from Media Library</h3>
              <button
                type="button"
                onClick={() => setShowMediaLibrary(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            
            {mediaFiles.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="h-10 w-10 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium">No images in media library</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {mediaFiles.map((media) => {
                  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'
                  const imageUrl = `${API_URL}${media.fileUrl}`
                  return (
                    <div
                      key={media.id}
                      onClick={() => selectMediaImage(media.fileUrl)}
                      className="group cursor-pointer hover:scale-[1.02] transition-transform border-2 border-slate-200 hover:border-purple-400 rounded-xl overflow-hidden shadow-md hover:shadow-xl"
                    >
                      <img
                        src={imageUrl}
                        alt={media.altText || 'Media file'}
                        className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          console.error('Image load error:', imageUrl)
                          e.currentTarget.src = '/placeholder-image.png'
                        }}
                      />
                      <div className="p-2 bg-gradient-to-r from-slate-50 to-purple-50/30">
                        <p className="text-xs text-slate-700 font-medium truncate">
                          {media.fileName || 'Image'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Article Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Article Preview</h3>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-slate-500" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Featured Image */}
              {article.featuredImageUrl && (
                <div className="mb-6">
                  <img
                    src={article.featuredImageUrl}
                    alt={article.title}
                    className="w-full h-96 object-cover rounded-2xl shadow-lg"
                  />
                </div>
              )}

              {/* Article Header */}
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-slate-900 mb-4 leading-tight">
                  {article.title || 'Untitled Article'}
                </h1>
                
                {article.excerpt && (
                  <p className="text-xl text-slate-600 mb-4 leading-relaxed">
                    {article.excerpt}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span>{new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                  {article.categoryId && categories.length > 0 && (
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full font-medium">
                      {categories.find(c => c.id === article.categoryId)?.name || 'Category'}
                    </span>
                  )}
                </div>
              </div>

              {/* Article Content */}
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Tags */}
              {article.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <h4 className="text-sm font-bold text-slate-700 mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-slate-100 to-purple-100 text-slate-700 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}













