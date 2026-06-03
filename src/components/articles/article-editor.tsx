'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill')
    return RQ
  },
  { 
    ssr: false,
    loading: () => <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
  }
)

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
  const [htmlMode, setHtmlMode] = useState(false)

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

  const appendHtml = (html: string) => {
    const cleaned = html.trim()
    if (!cleaned) return
    setContent((current) => `${current || ''}\n${cleaned}`)
  }

  const youtubeIdFromUrl = (url: string) => {
    try {
      const parsed = new URL(url)
      if (parsed.hostname.includes('youtu.be')) {
        return parsed.pathname.split('/').filter(Boolean)[0]
      }
      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/').filter(Boolean)[1]
      }
      if (parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname.split('/').filter(Boolean)[1]
      }
      return parsed.searchParams.get('v')
    } catch {
      return ''
    }
  }

  const addHtmlEmbed = () => {
    const html = window.prompt('Paste HTML or embed code')
    if (html) appendHtml(html)
  }

  const addYouTubeEmbed = () => {
    const url = window.prompt('Paste YouTube video URL')
    if (!url) return
    const videoId = youtubeIdFromUrl(url)
    if (!videoId) {
      window.alert('That YouTube URL could not be understood.')
      return
    }

    appendHtml(`
      <div class="article-embed article-embed-youtube" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:24px 0;">
        <iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube video" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
      </div>
    `)
  }

  const addFacebookEmbed = () => {
    const input = window.prompt('Paste Facebook post/video URL or full embed code')
    if (!input) return
    if (input.includes('<iframe') || input.includes('<blockquote')) {
      appendHtml(input)
      return
    }

    appendHtml(`
      <div class="article-embed article-embed-facebook" style="margin:24px 0;text-align:center;">
        <iframe src="https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(input)}&show_text=true&width=500" width="500" height="560" style="border:none;overflow:hidden;max-width:100%;" scrolling="no" frameborder="0" allowfullscreen allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>
      </div>
    `)
  }

  const addInstagramEmbed = () => {
    const input = window.prompt('Paste Instagram post/reel URL or full embed code')
    if (!input) return
    if (input.includes('<iframe') || input.includes('<blockquote')) {
      appendHtml(input)
      return
    }

    appendHtml(`
      <div class="article-embed article-embed-instagram" style="margin:24px 0;">
        <blockquote class="instagram-media" data-instgrm-permalink="${input}" data-instgrm-version="14" style="background:#fff;border:1px solid #ddd;border-radius:12px;margin:0 auto;max-width:540px;min-width:326px;padding:16px;width:100%;"></blockquote>
      </div>
    `)
  }

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

      <div className="rounded-lg border border-gray-200 bg-white p-3">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button type="button" onClick={addHtmlEmbed} className="rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            HTML
          </button>
          <button type="button" onClick={addYouTubeEmbed} className="rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
            YouTube
          </button>
          <button type="button" onClick={addFacebookEmbed} className="rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">
            Facebook
          </button>
          <button type="button" onClick={addInstagramEmbed} className="rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold text-pink-700 hover:bg-pink-50">
            Instagram
          </button>
          <button
            type="button"
            onClick={() => setHtmlMode((value) => !value)}
            className={`ml-auto rounded-md border px-3 py-2 text-sm font-semibold ${
              htmlMode
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {htmlMode ? 'Visual editor' : 'HTML editor'}
          </button>
        </div>

        {htmlMode ? (
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="h-[460px] w-full rounded-md border border-gray-300 bg-gray-950 p-4 font-mono text-sm text-gray-50 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="Paste or edit article HTML here..."
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-300">
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
        )}
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












