'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, TrendingUp, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface TrendingTopic {
  id: string
  title: string
  description: string
  icon?: string
  color?: string
  isActive: boolean
  order: number
}

export default function BrowseTopicsPage() {
  const router = useRouter()
  const [topics, setTopics] = useState<TrendingTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchTopics()
  }, [])

  async function fetchTopics() {
    setLoading(true)
    try {
      console.log('🔍 Fetching topics from admin backend...')
      const res = await fetch('http://localhost:3002/api/trending-topics/active')
      console.log('📡 Response status:', res.status)
      
      if (!res.ok) {
        console.error('❌ Failed to fetch topics:', res.statusText)
        throw new Error('Failed to fetch topics')
      }
      
      const data = await res.json()
      console.log('✅ Topics received:', data)
      console.log('📊 Number of topics:', data.data?.length || 0)
      
      setTopics(data.data || [])
    } catch (err) {
      console.error('❌ Failed to fetch topics:', err)
      setTopics([])
    } finally {
      setLoading(false)
    }
  }

  function handleTopicClick(topic: TrendingTopic) {
    router.push(`/dashboard/articles/new?topic=${encodeURIComponent(topic.title)}&description=${encodeURIComponent(topic.description)}`)
  }

  const filteredTopics = topics.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Browse Topics
          </h1>
          <p className="text-slate-600">
            Explore trending topics from admins and start writing your next article
          </p>
        </div>
        {topics.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">
              {topics.length} Topics Available
            </span>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : filteredTopics.length === 0 ? (
        <Card className="border-2 border-dashed border-purple-200">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Sparkles className="h-16 w-16 text-purple-400 mb-4" />
            <CardTitle className="text-xl text-gray-700 mb-2">
              {searchQuery ? 'No topics found' : 'No topics available yet'}
            </CardTitle>
            <CardDescription>
              {searchQuery 
                ? 'Try a different search term' 
                : 'Check back later for trending topics to write about!'}
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTopics.map((topic) => (
            <Card
              key={topic.id}
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-300"
              onClick={() => handleTopicClick(topic)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  {/* Icon */}
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-4xl flex-shrink-0 transition-transform group-hover:scale-110 shadow-md"
                    style={{ backgroundColor: `${topic.color || '#9333EA'}20` }}
                  >
                    {topic.icon || '📝'}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-xl font-bold group-hover:text-purple-600 transition-colors mb-2">
                          {topic.title}
                        </h3>
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {topic.description}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 flex-shrink-0">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        Active
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTopicClick(topic)
                    }}
                  >
                    <span className="mr-2">✍️</span>
                    Write Article
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
