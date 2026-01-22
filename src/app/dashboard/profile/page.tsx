'use client'

export const runtime = 'edge';

import { useAuth } from '@/contexts/auth-context'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StarBadgeLarge, getTierInfo } from '@/components/star-badge'
import { Star, TrendingUp, Users, FileText, Heart, Share2, ThumbsUp, Award, Target, Zap } from 'lucide-react'

interface RatingData {
  starRating: number
  followersCount: number
  articlesCount: number
  totalLikes: number
  totalShares: number
  totalEngagement: number
  followersScore: number
  articlesScore: number
  engagementScore: number
  overallRating: number
  maxStars: number
  halfStar?: boolean
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [rating, setRating] = useState<RatingData | null>(null)
  const [ratingLoading, setRatingLoading] = useState(true)
  const [ratingError, setRatingError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'achievements'>('overview')

  useEffect(() => {
    const fetchRating = async () => {
      try {
        setRatingLoading(true)
        const token = localStorage.getItem('auth_token')
        if (!token) {
          setRatingError('Not authenticated')
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_PUBLISHERS_API || 'http://localhost:3003'}/api/rating/my-rating`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const result = await response.json()
          // Handle both response formats
          const data = result.data || result
          setRating(data)
          setRatingError(null)
        } else {
          const error = await response.json()
          setRatingError(error.error || error.message || 'Failed to fetch rating')
        }
      } catch (err) {
        console.error('Error fetching rating:', err)
        setRatingError('Failed to connect to server')
      } finally {
        setRatingLoading(false)
      }
    }

    fetchRating()
  }, [])

  const stars = rating?.starRating || 0
  const maxStars = rating?.maxStars || 5
  const tier = getTierInfo(stars)
  
  // Calculate progress to next star
  const currentProgress = ((rating?.followersScore || 0) * 0.3 + (rating?.articlesScore || 0) * 0.3 + (rating?.engagementScore || 0) * 0.4)
  const nextStarProgress = Math.min(100, (currentProgress % 1) * 100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
      </div>

      {/* Publisher Rating Card - Enhanced */}
      <Card className="overflow-hidden border-0 shadow-xl">
        {/* Header with Tier-Based Gradient */}
        <div className={`${tier.background} px-6 py-8 relative overflow-hidden`}>
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
          </div>
          
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <Award className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white">Publisher Rating</h2>
              </div>
              <p className="text-white/80 text-sm max-w-md">
                Your performance score based on followers, articles, and engagement
              </p>
              <div className={`inline-block mt-3 px-4 py-1.5 rounded-full ${tier.border} border-2 bg-white/10 backdrop-blur-sm`}>
                <span className="text-white font-bold text-lg">{tier.name} Tier</span>
              </div>
            </div>
            
            {/* Large Star Badge */}
            {!ratingLoading && (
              <StarBadgeLarge 
                stars={stars} 
                maxStars={maxStars} 
                showProgress={true}
                progressPercent={nextStarProgress}
              />
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'overview' 
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-white' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Star className="w-4 h-4" />
                Overview
              </div>
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'progress' 
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-white' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Target className="w-4 h-4" />
                Progress
              </div>
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'achievements' 
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-white' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                Achievements
              </div>
            </button>
          </div>
        </div>

        <CardContent className="pt-6">
          {ratingLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Score Breakdown Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                          <Users className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-blue-600 font-medium">Followers</p>
                          <p className="text-3xl font-bold text-blue-800">{rating?.followersCount || 0}</p>
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-blue-500 mb-1">
                              <span>Score</span>
                              <span>{rating?.followersScore?.toFixed(2) || '0.00'} / {maxStars}</span>
                            </div>
                            <div className="w-full bg-blue-200 rounded-full h-2">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                                style={{ width: `${((rating?.followersScore || 0) / maxStars) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-emerald-600 font-medium">Articles</p>
                          <p className="text-3xl font-bold text-emerald-800">{rating?.articlesCount || 0}</p>
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-emerald-500 mb-1">
                              <span>Score</span>
                              <span>{rating?.articlesScore?.toFixed(2) || '0.00'} / {maxStars}</span>
                            </div>
                            <div className="w-full bg-emerald-200 rounded-full h-2">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
                                style={{ width: `${((rating?.articlesScore || 0) / maxStars) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg">
                          <Heart className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-pink-600 font-medium">Engagement</p>
                          <p className="text-3xl font-bold text-pink-800">{rating?.totalEngagement || 0}</p>
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-pink-500 mb-1">
                              <span>Score</span>
                              <span>{rating?.engagementScore?.toFixed(2) || '0.00'} / {maxStars}</span>
                            </div>
                            <div className="w-full bg-pink-200 rounded-full h-2">
                              <div 
                                className="h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full transition-all duration-500"
                                style={{ width: `${((rating?.engagementScore || 0) / maxStars) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Engagement Breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 text-center">
                      <ThumbsUp className="w-6 h-6 text-rose-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-rose-700">{rating?.totalLikes || 0}</p>
                      <p className="text-xs text-rose-500">Total Likes</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-200 text-center">
                      <Share2 className="w-6 h-6 text-violet-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-violet-700">{rating?.totalShares || 0}</p>
                      <p className="text-xs text-violet-500">Total Shares</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 text-center">
                      <Star className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-amber-700">{stars}</p>
                      <p className="text-xs text-amber-500">Stars Earned</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 text-center">
                      <Award className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-cyan-700">{tier.name}</p>
                      <p className="text-xs text-cyan-500">Current Tier</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Tab */}
              {activeTab === 'progress' && (
                <div className="space-y-6">
                  {/* Next Star Progress */}
                  <div className={`p-6 rounded-2xl ${tier.background} relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                            <Target className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">Progress to Next Star</h3>
                            <p className="text-sm text-white/70">Keep going! You're almost there.</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-white">{stars} → {Math.min(stars + 1, maxStars)}</p>
                          <p className="text-sm text-white/70">{nextStarProgress.toFixed(0)}% complete</p>
                        </div>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden backdrop-blur-sm">
                        <div 
                          className="h-full bg-white rounded-full transition-all duration-1000 relative"
                          style={{ width: `${nextStarProgress}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tier Progress */}
                  <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-500" />
                      Tier Progression
                    </h3>
                    <div className="space-y-4">
                      {[
                        { name: 'Gold', minStars: 5, color: 'yellow', icon: '👑' },
                        { name: 'Platinum', minStars: 4, color: 'purple', icon: '💎' },
                        { name: 'Silver', minStars: 3, color: 'blue', icon: '🥈' },
                        { name: 'Bronze', minStars: 2, color: 'emerald', icon: '🥉' },
                        { name: 'Starter', minStars: 1, color: 'slate', icon: '⭐' },
                      ].map((t, idx) => {
                        const isCurrentOrPast = stars >= t.minStars
                        const isCurrent = tier.name === t.name
                        return (
                          <div 
                            key={t.name} 
                            className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                              isCurrent ? `bg-${t.color}-100 border-2 border-${t.color}-400 shadow-md` : 
                              isCurrentOrPast ? 'bg-gray-100 opacity-60' : 'bg-white border border-gray-200'
                            }`}
                          >
                            <span className="text-2xl">{t.icon}</span>
                            <div className="flex-1">
                              <p className={`font-semibold ${isCurrent ? `text-${t.color}-700` : 'text-gray-700'}`}>
                                {t.name} Tier
                                {isCurrent && <span className="ml-2 text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">Current</span>}
                              </p>
                              <p className="text-xs text-gray-500">Requires {t.minStars}+ stars</p>
                            </div>
                            <div className="flex">
                              {Array.from({ length: t.minStars }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-5 h-5 ${isCurrentOrPast ? `text-${t.color}-400 fill-${t.color}-400` : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200">
                      <Users className="w-8 h-8 text-blue-500 mb-3" />
                      <h4 className="font-bold text-blue-800">Followers Goal</h4>
                      <p className="text-sm text-blue-600 mt-1">100 followers = 1 star</p>
                      <div className="mt-3 text-xs text-blue-500">
                        Current: {rating?.followersCount || 0} / {((stars + 1) * 100)} needed
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                      <FileText className="w-8 h-8 text-emerald-500 mb-3" />
                      <h4 className="font-bold text-emerald-800">Articles Goal</h4>
                      <p className="text-sm text-emerald-600 mt-1">50 articles = 1 star</p>
                      <div className="mt-3 text-xs text-emerald-500">
                        Current: {rating?.articlesCount || 0} / {((stars + 1) * 50)} needed
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl bg-pink-50 border border-pink-200">
                      <Heart className="w-8 h-8 text-pink-500 mb-3" />
                      <h4 className="font-bold text-pink-800">Engagement Goal</h4>
                      <p className="text-sm text-pink-600 mt-1">200 engagements = 1 star</p>
                      <div className="mt-3 text-xs text-pink-500">
                        Current: {rating?.totalEngagement || 0} / {((stars + 1) * 200)} needed
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Achievements Tab */}
              {activeTab === 'achievements' && (
                <div className="space-y-6">
                  {/* Achievements Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { name: 'First Article', desc: 'Publish your first article', achieved: (rating?.articlesCount || 0) >= 1, icon: '📝' },
                      { name: 'Rising Star', desc: 'Earn your first star', achieved: stars >= 1, icon: '⭐' },
                      { name: '10 Followers', desc: 'Gain 10 followers', achieved: (rating?.followersCount || 0) >= 10, icon: '👥' },
                      { name: 'Popular Post', desc: 'Get 50+ likes on an article', achieved: (rating?.totalLikes || 0) >= 50, icon: '🔥' },
                      { name: 'Viral Writer', desc: 'Get 100+ shares total', achieved: (rating?.totalShares || 0) >= 100, icon: '🚀' },
                      { name: 'Prolific Author', desc: 'Publish 25 articles', achieved: (rating?.articlesCount || 0) >= 25, icon: '📚' },
                      { name: 'Community Star', desc: 'Reach 100 followers', achieved: (rating?.followersCount || 0) >= 100, icon: '🌟' },
                      { name: 'Gold Status', desc: 'Reach 5-star rating', achieved: stars >= 5, icon: '👑' },
                    ].map((achievement, idx) => (
                      <div 
                        key={achievement.name}
                        className={`p-4 rounded-2xl border-2 text-center transition-all ${
                          achievement.achieved 
                            ? 'bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-300 shadow-lg' 
                            : 'bg-gray-50 border-gray-200 opacity-50'
                        }`}
                      >
                        <span className={`text-3xl ${achievement.achieved ? '' : 'grayscale'}`}>{achievement.icon}</span>
                        <p className={`font-bold mt-2 ${achievement.achieved ? 'text-amber-800' : 'text-gray-500'}`}>
                          {achievement.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{achievement.desc}</p>
                        {achievement.achieved && (
                          <span className="inline-block mt-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                            ✓ Achieved
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Tips */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200">
                    <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-500" />
                      Tips to Improve Your Rating
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50">
                        <span className="text-xl">📊</span>
                        <div>
                          <p className="font-medium text-purple-700">Consistent Publishing</p>
                          <p className="text-xs text-purple-600">Post articles regularly to build momentum</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50">
                        <span className="text-xl">💬</span>
                        <div>
                          <p className="font-medium text-purple-700">Engage with Readers</p>
                          <p className="text-xs text-purple-600">Respond to comments to build community</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50">
                        <span className="text-xl">🎯</span>
                        <div>
                          <p className="font-medium text-purple-700">Quality Content</p>
                          <p className="text-xs text-purple-600">Focus on value to encourage shares</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50">
                        <span className="text-xl">🔗</span>
                        <div>
                          <p className="font-medium text-purple-700">Share Your Work</p>
                          <p className="text-xs text-purple-600">Promote articles on social media</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <input
              type="text"
              value={user?.role || 'Creator'}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID
            </label>
            <input
              type="text"
              value={user?.id || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>Manage your session</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm('Are you sure you want to log out?')) {
                logout()
              }
            }}
            disabled={isLoading}
          >
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
