'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArticleEditor } from '@/components/articles/article-editor'
import { ArrowLeft, Save, Eye, Send, Upload, Image as ImageIcon, X } from 'lucide-react'
import Link from 'next/link'
import { articlesAPI, categoriesAPI, mediaAPI } from '@/lib/api'

export default function EditArticlePage() {
  const router = useRouter()
  const params = useParams()
  const articleId = params?.id as string

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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    // Fetch article and categories
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch categories
        const categoriesData = await categoriesAPI.getAll()
        console.log('Fetched categories:', categoriesData)
        setCategories(categoriesData)

        // Fetch article
        const articleData = await articlesAPI.getOne(articleId)
        console.log('Fetched article:', articleData)
        
        setArticle({
          title: articleData.title || '',
          content: articleData.content || '',
          excerpt: articleData.excerpt || '',
          categoryId: articleData.categoryId || '',
          tags: articleData.tags || [],
          featuredImageUrl: articleData.featuredImageUrl || '',
          status: articleData.status || 'draft'
        })
      } catch (err) {
        console.error('Failed to fetch data:', err)
        setError('Failed to load article')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (articleId) {
      fetchData()
    }
  }, [articleId])

  const fetchMedia = async () => {
    try {
      const response = await mediaAPI.getAll()
      // Handle both {success, data} format and direct array
      const mediaData = response?.data || response
      // Filter for images only
      const images = Array.isArray(mediaData) ? mediaData.filter((m: any) => m.type === 'image') : []
      setMediaFiles(images)
    } catch (err) {
      console.error('Failed to fetch media:', err)
      setMediaFiles([])
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
      const response = await mediaAPI.upload(file)
      const media = response?.data || response
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'
      const imageUrl = `${API_URL}${media.fileUrl}`
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

  const handleSave = async (status: 'draft' | 'pending_review') => {
    setIsSaving(true)
    setError('')
    
    try {
      const payload = {
        ...article,
        status,
        categoryId: article.categoryId || null,
        featuredImageUrl: article.featuredImageUrl || null
      }
      
      await articlesAPI.update(articleId, payload)
      
      // Show success notification
      if (status === 'pending_review') {
        alert('Article updated and submitted for review!')
      } else {
        alert('Article saved as draft!')
      }
      
      // Redirect to articles list
      router.push('/dashboard/articles')
    } catch (err: any) {
      setError(err.message || 'Failed to save article')
      alert(err.message || 'Failed to save article')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    )
  }

  if (error && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/dashboard/articles">
            <Button>Back to Articles</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 space-y-4">
        <div className="flex items-start justify-between">
          <Link href="/dashboard/articles">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Articles
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Article</h1>
            <p className="text-gray-600">Update your article content</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowPreview(true)}
            disabled={!article.title || !article.content}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleSave('draft')}
            disabled={isSaving || !article.title || !article.content}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button 
            onClick={() => handleSave('pending_review')}
            disabled={isSaving || !article.title || !article.content}
          >
            <Send className="h-4 w-4 mr-2" />
            Submit for Review
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Article Editor - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Article Content</CardTitle>
              <CardDescription>Write your article content using the rich text editor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ArticleEditor 
                article={article}
                onChange={(updatedArticle) => setArticle({
                  ...article,
                  title: updatedArticle.title,
                  content: updatedArticle.content
                })}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Settings */}
        <div className="space-y-6">
          {/* Article Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Article Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={article.categoryId}
                  onChange={(e) => setArticle({...article, categoryId: e.target.value})}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="Type tag and press Enter"
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
                          className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => {
                              setArticle({
                                ...article,
                                tags: article.tags.filter((_, i) => i !== index)
                              })
                            }}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500">Press Enter to add tags</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image
                </label>
                
                {/* Image Preview */}
                {article.featuredImageUrl && (
                  <div className="mb-3 relative">
                    <img 
                      src={article.featuredImageUrl} 
                      alt="Featured" 
                      className="w-full h-48 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => setArticle({...article, featuredImageUrl: ''})}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* URL Input Field */}
                <div className="mb-3">
                  <input
                    type="url"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="Enter image URL (https://example.com/image.jpg)"
                    value={article.featuredImageUrl}
                    onChange={(e) => setArticle({...article, featuredImageUrl: e.target.value})}
                  />
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
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={uploadingImage}
                      onClick={(e) => {
                        e.preventDefault()
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement
                        input?.click()
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    </Button>
                  </label>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={openMediaLibrary}
                    className="flex-1"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Browse Library
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  Enter a URL, upload a new image, or select from your media library
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Brief description for search engines"
                  value={article.excerpt}
                  onChange={(e) => setArticle({...article, excerpt: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Publishing Status */}
          <Card>
            <CardHeader>
              <CardTitle>Publishing Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  article.status === 'draft' ? 'bg-yellow-400' : 'bg-blue-400'
                }`} />
                <span className="text-sm font-medium">
                  {article.status === 'draft' ? 'Draft' : article.status === 'pending_review' ? 'Pending Review' : article.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Edited articles will be sent for review before becoming active
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Media Library Modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-5xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Select from Media Library</h3>
              <button
                type="button"
                onClick={() => setShowMediaLibrary(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {mediaFiles.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No images in media library</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {mediaFiles.map((media) => {
                  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'
                  return (
                    <div
                      key={media.id}
                      onClick={() => selectMediaImage(media.fileUrl)}
                      className="cursor-pointer hover:opacity-75 transition-opacity border-2 border-transparent hover:border-blue-500 rounded-lg overflow-hidden"
                    >
                      <img
                        src={`${API_URL}${media.fileUrl}`}
                        alt={media.altText || 'Media file'}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          console.error('Failed to load image:', media.fileUrl)
                          e.currentTarget.src = '/placeholder-image.png'
                        }}
                      />
                      <div className="p-2 bg-gray-50">
                        <p className="text-xs text-gray-600 truncate">
                          {media.fileName}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Article Preview</h3>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Featured Image */}
              {article.featuredImageUrl && (
                <div className="mb-6">
                  <img
                    src={article.featuredImageUrl}
                    alt={article.title}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Article Header */}
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {article.title || 'Untitled Article'}
                </h1>
                
                {article.excerpt && (
                  <p className="text-xl text-gray-600 mb-4">
                    {article.excerpt}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                  {article.categoryId && categories.length > 0 && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
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
                <div className="mt-8 pt-6 border-t">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
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
