'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Music, 
  File as FileIcon,
  Search,
  Grid,
  List,
  Trash2,
  Edit,
  Download,
  X
} from 'lucide-react'
import { mediaAPI } from '@/lib/api'

interface Media {
  id: string
  fileUrl: string
  fileType: string
  fileSize: number
  altText: string | null
  caption: string | null
  metadata: any
  createdAt: string
  article?: {
    id: string
    title: string
  }
}

export default function MediaPage() {
  const [media, setMedia] = useState<Media[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterType, setFilterType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [uploadProgress, setUploadProgress] = useState(false)

  useEffect(() => {
    fetchMedia()
  }, [filterType, searchTerm])

  const fetchMedia = async () => {
    try {
      setIsLoading(true)
      
      const response = await mediaAPI.getAll()
      // Handle both response formats: { success: true, data: [...] } or just [...]
      const data = response.data ? response.data : response
      let mediaList = Array.isArray(data) ? data : []
      
      // Client-side filtering
      if (filterType !== 'all') {
        mediaList = mediaList.filter((item: any) => item.type === filterType)
      }
      if (searchTerm) {
        mediaList = mediaList.filter((item: any) => 
          item.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.title?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      setMedia(mediaList)
    } catch (err) {
      console.error('Failed to fetch media:', err)
      setMedia([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert('Please select at least one file to upload')
      return
    }

    setUploadProgress(true)
    const errors: string[] = []
    let successCount = 0

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        try {
          await mediaAPI.upload(selectedFiles[i])
          successCount++
        } catch (err: any) {
          errors.push(`${selectedFiles[i].name}: ${err.message}`)
        }
      }
      
      if (successCount > 0) {
        alert(`${successCount} file(s) uploaded successfully!${errors.length > 0 ? '\n\nFailed uploads:\n' + errors.join('\n') : ''}`)
        setUploadModalOpen(false)
        setSelectedFiles(null)
        fetchMedia()
      } else {
        alert(`Upload failed:\n${errors.join('\n')}`)
      }
    } catch (err: any) {
      alert(`Upload failed: ${err.message || 'Unknown error occurred'}`)
    } finally {
      setUploadProgress(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      await mediaAPI.delete(id)
      setMedia(media.filter(m => m.id !== id))
      alert('File deleted successfully!')
    } catch (err: any) {
      alert(err.message || 'Delete failed')
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-5 w-5" />
    if (fileType.startsWith('video/')) return <Video className="h-5 w-5" />
    if (fileType.startsWith('audio/')) return <Music className="h-5 w-5" />
    return <FileIcon className="h-5 w-5" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const copyToClipboard = (url: string) => {
    const fullUrl = `http://localhost:3001${url}`
    navigator.clipboard.writeText(fullUrl)
    alert('URL copied to clipboard!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Media Library</h1>
          <p className="text-slate-600 mt-1">Manage your uploaded images, videos, and files</p>
        </div>
        <button 
          onClick={() => setUploadModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload Files
        </button>
      </div>

      {/* Filters and View Toggle */}
      <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search files..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
            </select>
            <div className="flex border border-slate-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2.5 transition-all ${viewMode === 'grid' ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2.5 border-l border-slate-200 transition-all ${viewMode === 'list' ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-lg mx-4 rounded-2xl bg-white shadow-2xl">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Upload Files</h3>
                <button 
                  onClick={() => setUploadModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>
              <p className="text-slate-600 text-sm mt-2">Upload images, videos, audio files, or PDFs (max 10MB each)</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-gradient-to-br from-slate-50 to-purple-50/30 hover:border-purple-300 transition-all">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf"
                  onChange={(e) => setSelectedFiles(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-purple-600 hover:text-purple-700 font-semibold">
                    Click to browse
                  </span>
                  <span className="text-slate-600"> or drag and drop</span>
                </label>
                <p className="text-sm text-slate-500 mt-2">
                  JPG, PNG, GIF, MP4, MP3, PDF up to 10MB
                </p>
              </div>

              {selectedFiles && selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700">
                    {selectedFiles.length} file(s) selected:
                  </p>
                  {Array.from(selectedFiles).map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-purple-50/30 rounded-xl border border-slate-200">
                      <span className="text-sm font-medium text-slate-700">{file.name}</span>
                      <span className="text-sm text-slate-500 font-medium">{formatFileSize(file.size)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  onClick={handleUpload}
                  disabled={!selectedFiles || uploadProgress}
                >
                  {uploadProgress ? 'Uploading...' : 'Upload'}
                </button>
                <button
                  className="px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                  onClick={() => {
                    setUploadModalOpen(false)
                    setSelectedFiles(null)
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-purple-500"></div>
        </div>
      )}

      {/* Grid View */}
      {!isLoading && viewMode === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item) => {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'
            const imageUrl = `${API_URL}${item.fileUrl}`
            return (
            <div key={item.id} className="group rounded-2xl overflow-hidden bg-white shadow-lg border border-slate-100 hover:shadow-2xl hover:scale-[1.02] transition-all">
              <div className="aspect-square bg-gradient-to-br from-slate-100 to-purple-100/30 relative">
                {item.fileType.startsWith('image/') ? (
                  <img
                    src={imageUrl}
                    alt={item.altText || 'Media'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      console.error('Image load error:', imageUrl)
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                      {getFileIcon(item.fileType)}
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-2">
                    <button
                      className="p-2.5 bg-white rounded-xl shadow-lg hover:scale-110 transition-transform"
                      onClick={() => copyToClipboard(imageUrl)}
                    >
                      <Download className="h-4 w-4 text-slate-700" />
                    </button>
                    <button
                      className="p-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {item.metadata?.originalName || item.fileUrl.split('/').pop()}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{formatFileSize(item.fileSize)}</p>
              </div>
            </div>
          )})}
        </div>
      )}

      {/* List View */}
      {!isLoading && viewMode === 'list' && (
        <div className="rounded-2xl bg-white shadow-lg border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-purple-50/30 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Preview</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Type</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Size</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Uploaded</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {media.map((item) => {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'
                const imageUrl = `${API_URL}${item.fileUrl}`
                return (
                <tr key={item.id} className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-purple-50/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-100 to-purple-100/30 flex items-center justify-center overflow-hidden shadow-md">
                      {item.fileType.startsWith('image/') ? (
                        <img
                          src={imageUrl}
                          alt={item.altText || 'Media'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-purple-500">
                          {getFileIcon(item.fileType)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {item.metadata?.originalName || item.fileUrl.split('/').pop()}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{item.fileType}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{formatFileSize(item.fileSize)}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      className="px-3 py-1.5 text-sm bg-white text-purple-600 border border-purple-200 rounded-lg font-medium hover:bg-purple-50 transition-colors"
                      onClick={() => copyToClipboard(imageUrl)}
                    >
                      Copy URL
                    </button>
                    <button
                      className="px-3 py-1.5 text-sm bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && media.length === 0 && (
        <div className="rounded-2xl bg-white p-12 shadow-lg border border-slate-100 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
            <Upload className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No media files</h3>
          <p className="text-slate-600 mb-6">
            Upload images, videos, or other files to get started
          </p>
          <button 
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all inline-flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Your First File
          </button>
        </div>
      )}
    </div>
  )
}
