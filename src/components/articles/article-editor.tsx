'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

interface Article {
  title: string
  content: string
  excerpt?: string
  categoryId?: string
  tags?: string[]
  featuredImageUrl?: string
  status?: string
  // Legacy fields for backward compatibility
  category?: string
  featuredImage?: string
}

interface ArticleEditorProps {
  article: Article
  onChange: (article: Article) => void
}

export function ArticleEditor({ article, onChange }: ArticleEditorProps) {
  const [title, setTitle] = useState(article.title)
  const [content, setContent] = useState(article.content)

  // Sync with parent article changes (e.g., when pre-filling from URL params)
  useEffect(() => {
    setTitle(article.title)
    setContent(article.content)
  }, [article.title, article.content])

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['blockquote', 'code-block'],
      ['clean']
    ],
  }

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent',
    'align', 'link', 'image', 'video', 'blockquote', 'code-block'
  ]

  useEffect(() => {
    onChange({
      ...article,
      title,
      content
    })
  }, [title, content])

  return (
    <div className="space-y-6">
      {/* Title Input */}
      <div>
        <input
          type="text"
          className="w-full text-3xl font-bold border-none outline-none placeholder-gray-400"
          placeholder="Enter your article title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Rich Text Editor */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          modules={quillModules}
          formats={quillFormats}
          placeholder="Start writing your article..."
          style={{ minHeight: '400px' }}
        />
      </div>

      {/* Word Count and Reading Time */}
      <div className="flex justify-between text-sm text-gray-500">
        <span>
          {content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length} words
        </span>
        <span>
          ~{Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length / 200)} min read
        </span>
      </div>
    </div>
  )
}













