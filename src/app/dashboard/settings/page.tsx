'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Shield,
  Palette,
  Globe,
  Camera,
  Award,
  Star,
  Users,
  FileText,
  TrendingUp,
  Heart,
  Share2,
  Target,
  Zap,
  ChevronRight,
  Settings,
  Sparkles,
  Info,
  Check,
  X,
  Moon,
  Sun,
  Monitor,
  MessageSquare,
  ThumbsUp,
  UserPlus,
  CheckCircle,
  XCircle,
  DollarSign
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useTheme } from '@/contexts/theme-context'
import { StarBadgeLarge, getTierInfo } from '@/components/star-badge'
import { API_URL, getToken } from '@/lib/api'

interface RatingSetting {
  settingKey: string
  settingValue: string
  settingUnit: string
  description: string
}

export default function SettingsPage() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  
  // Rating state
  const [rating, setRating] = useState<any>(null)
  const [ratingLoading, setRatingLoading] = useState(true)
  const [ratingError, setRatingError] = useState<string | null>(null)
  const [ratingSettings, setRatingSettings] = useState<RatingSetting[]>([])

  // Fetch rating data and settings
  useEffect(() => {
    const fetchRatingData = async () => {
      try {
        setRatingLoading(true)
        setRatingError(null)
        const token = getToken()
        if (!token) {
          setRatingError('Not authenticated. Please sign in again to view your rating.')
          return
        }

        // Fetch rating and settings in parallel
        const [ratingRes, settingsRes] = await Promise.all([
          fetch(`${API_URL}/api/rating/my-rating`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_URL}/api/rating/rating-info`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ])

        let ratingFetchError: string | null = null

        if (ratingRes.ok) {
          const result = await ratingRes.json()
          const ratingData = result.data || result
          if (ratingData && typeof ratingData === 'object' && ratingData.starRating !== undefined) {
            setRating(ratingData)
          } else {
            ratingFetchError = 'Rating response did not include valid data.'
          }
        } else {
          const error = await ratingRes.json().catch(() => null)
          ratingFetchError = error?.message || 'Failed to load publisher rating.'
        }

        if (settingsRes.ok) {
          const result = await settingsRes.json()
          setRatingSettings(result.data || [])
        } else {
          const error = await settingsRes.json().catch(() => null)
          console.warn('Failed to load rating settings, using rating payload fallback:', error?.message || settingsRes.statusText)
          setRatingSettings([])
        }

        // Only block rating UI when rating payload itself failed.
        if (ratingFetchError) {
          setRatingError(ratingFetchError)
        } else {
          setRatingError(null)
        }
      } catch (err) {
        console.error('Error fetching rating:', err)
        setRatingError('Rating data is unavailable right now. Please try again shortly.')
      } finally {
        setRatingLoading(false)
      }
    }

    fetchRatingData()
  }, [])

  // Get setting value by key
  const getSetting = (key: string): number | undefined => {
    const setting = ratingSettings.find(s => s.settingKey === key)
    if (!setting) return undefined
    const parsed = parseFloat(setting.settingValue)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  const stars = rating?.starRating || 0
  const maxStars = rating?.maxStars || 5
  const hasRatingData = !!rating
  const tier = getTierInfo(stars)
  const tierBackground = hasRatingData ? tier.background : 'bg-gradient-to-r from-slate-500 to-slate-600'
  const tierBorder = hasRatingData ? tier.border : 'border-slate-300'
  const tierName = hasRatingData ? tier.name : 'Unavailable'
  
  // Points-based rating data from API
  const totalPoints = rating?.totalPoints || 0
  const followerPoints = rating?.followerPoints || 0
  const articlePoints = rating?.articlePoints || 0
  const likePoints = rating?.likePoints || 0
  const sharePoints = rating?.sharePoints || 0
  const nextStarPoints = rating?.nextStarPoints || 50
  const currentLevelPoints = rating?.currentLevelPoints || 0
  const progressToNext = rating?.progressToNext || 0
  
  // Points per activity settings
  const pointsPerFollower = rating?.pointsPerFollower ?? getSetting('points_per_follower') ?? 10
  const pointsPerArticle = rating?.pointsPerArticle ?? getSetting('points_per_article') ?? 5
  const pointsPerLike = rating?.pointsPerLike ?? getSetting('points_per_like') ?? 1
  const pointsPerShare = rating?.pointsPerShare ?? getSetting('points_per_share') ?? 0
  
  // Points thresholds for star levels
  const pointsFor1Star = rating?.pointsFor1Star ?? getSetting('points_for_1_star') ?? 50
  const pointsFor2Stars = rating?.pointsFor2Stars ?? getSetting('points_for_2_stars') ?? 150
  const pointsFor3Stars = rating?.pointsFor3Stars ?? getSetting('points_for_3_stars') ?? 300
  const pointsFor4Stars = rating?.pointsFor4Stars ?? getSetting('points_for_4_stars') ?? 500
  const pointsFor5Stars = rating?.pointsFor5Stars ?? getSetting('points_for_5_stars') ?? 1000

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return
    alert('Avatar upload functionality will be implemented with user profile API')
  }

  const handleSavePreferences = () => {
    alert('Preferences saved successfully!')
  }

  const tabs = [
    { id: 'profile', label: 'Profile & Rating', icon: Award, gradient: 'from-purple-500 to-pink-500', description: 'Your rating and profile info' },
    { id: 'account', label: 'Account Security', icon: Shield, gradient: 'from-blue-500 to-cyan-500', description: 'Password and security' },
    { id: 'notifications', label: 'Notifications', icon: Bell, gradient: 'from-amber-500 to-orange-500', description: 'Email and push settings' },
    { id: 'preferences', label: 'Preferences', icon: Palette, gradient: 'from-emerald-500 to-teal-500', description: 'Theme and display' }
  ]

  const notificationItems = [
    { label: 'Article Comments', description: 'When someone comments on your article', icon: MessageSquare, bgColor: 'bg-blue-50', borderColor: 'border-blue-100', iconBg: 'bg-gradient-to-br from-blue-400 to-blue-600' },
    { label: 'Article Likes', description: 'When someone likes your article', icon: ThumbsUp, bgColor: 'bg-red-50', borderColor: 'border-red-100', iconBg: 'bg-gradient-to-br from-red-400 to-red-600' },
    { label: 'New Followers', description: 'When someone follows you', icon: UserPlus, bgColor: 'bg-purple-50', borderColor: 'border-purple-100', iconBg: 'bg-gradient-to-br from-purple-400 to-purple-600' },
    { label: 'Article Approved', description: 'When your article is approved by moderators', icon: CheckCircle, bgColor: 'bg-green-50', borderColor: 'border-green-100', iconBg: 'bg-gradient-to-br from-green-400 to-green-600' },
    { label: 'Article Rejected', description: 'When your article is rejected', icon: XCircle, bgColor: 'bg-amber-50', borderColor: 'border-amber-100', iconBg: 'bg-gradient-to-br from-amber-400 to-amber-600' },
    { label: 'Revenue Updates', description: 'Monthly earnings reports', icon: DollarSign, bgColor: 'bg-emerald-50', borderColor: 'border-emerald-100', iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600' }
  ]

  return (
    <div className="min-h-screen">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-200/30 via-pink-200/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-200/30 via-cyan-200/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="space-y-8 relative">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-slate-600 mt-1">Manage your account, rating, and preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Enhanced Sidebar */}
          <div className="xl:col-span-1">
            <div className="sticky top-24 space-y-3">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group w-full text-left transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'scale-[1.02]'
                      : 'hover:scale-[1.01]'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`
                    relative overflow-hidden rounded-2xl p-4 transition-all duration-300
                    ${activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.gradient} shadow-xl`
                      : 'bg-white/80 backdrop-blur-sm border border-slate-200 hover:border-purple-200 hover:shadow-lg'
                    }
                  `}>
                    {/* Shimmer effect */}
                    {activeTab === tab.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                    )}
                    
                    <div className="relative flex items-center gap-3">
                      <div className={`
                        p-2.5 rounded-xl transition-all
                        ${activeTab === tab.id
                          ? 'bg-white/20'
                          : `bg-gradient-to-br ${tab.gradient} bg-opacity-10`
                        }
                      `}>
                        <tab.icon className={`w-5 h-5 ${
                          activeTab === tab.id ? 'text-white' : 'text-slate-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate ${
                          activeTab === tab.id ? 'text-white' : 'text-slate-800'
                        }`}>{tab.label}</p>
                        <p className={`text-xs truncate ${
                          activeTab === tab.id ? 'text-white/70' : 'text-slate-500'
                        }`}>{tab.description}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${
                        activeTab === tab.id 
                          ? 'text-white translate-x-0' 
                          : 'text-slate-400 -translate-x-1 group-hover:translate-x-0'
                      }`} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="xl:col-span-4 space-y-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Publisher Rating Card */}
                <div className="overflow-hidden rounded-3xl shadow-2xl border-0">
                  {/* Header with Tier-Based Gradient */}
                  <div className={`${tierBackground} px-8 py-10 relative overflow-hidden`}>
                    {/* Decorative elements */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
                      <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-2xl"></div>
                      <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl"></div>
                    </div>
                    
                    <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
                      <div className="text-center lg:text-left">
                        <div className="flex items-center gap-3 justify-center lg:justify-start mb-3">
                          <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                            <Award className="w-7 h-7 text-white" />
                          </div>
                          <h2 className="text-3xl font-bold text-white">Publisher Rating</h2>
                        </div>
                        <p className="text-white/80 text-base max-w-lg">
                          Your performance score calculated from followers, published articles, and reader engagement
                        </p>
                        <div className={`inline-flex items-center gap-2 mt-4 px-5 py-2 rounded-full ${tierBorder} border-2 bg-white/10 backdrop-blur-sm`}>
                          <Sparkles className="w-5 h-5 text-white" />
                          <span className="text-white font-bold text-xl">{tierName}{hasRatingData ? ' Tier' : ''}</span>
                        </div>
                      </div>
                      
                      {/* Large Star Badge */}
                      {!ratingLoading && hasRatingData ? (
                        <StarBadgeLarge 
                          stars={stars} 
                          maxStars={maxStars} 
                          showProgress={true}
                        />
                      ) : ratingLoading ? (
                        <div className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/20 backdrop-blur-sm">
                          <div className="animate-pulse flex gap-2">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className="w-10 h-10 rounded-full bg-white/30"></div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="px-6 py-4 rounded-2xl bg-white/20 backdrop-blur-sm">
                          <p className="text-white font-semibold">Rating unavailable</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Rating Stats Grid - Points Based */}
                  <div className="bg-white p-8">
                    {ratingError ? (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
                        <h3 className="text-lg font-semibold text-rose-700">Publisher rating is unavailable</h3>
                        <p className="mt-2 text-sm text-rose-600">{ratingError}</p>
                      </div>
                    ) : (
                      <>
                    {/* Total Points Display */}
                    <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border border-amber-200">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-amber-500/30">
                            <Zap className="w-8 h-8" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-amber-600">Total Points</p>
                            <p className="text-4xl font-bold text-slate-900">{totalPoints}</p>
                          </div>
                        </div>
                        <div className="text-center md:text-right">
                          <p className="text-sm text-slate-600 mb-1">
                            {stars < 5 ? `${nextStarPoints - totalPoints} more points to next star` : 'Maximum stars achieved!'}
                          </p>
                          <div className="flex items-center gap-2 justify-center md:justify-end">
                            <span className="text-sm text-slate-500">Progress to {stars + 1} ★:</span>
                            <span className="font-bold text-amber-600">{progressToNext.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 h-3 bg-amber-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-1000 relative overflow-hidden"
                          style={{ width: `${progressToNext}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer"></div>
                        </div>
                      </div>
                    </div>

                    {/* Points Breakdown Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {/* Followers Points */}
                      <div className="group p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md group-hover:scale-110 transition-transform">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-blue-600 font-medium">Followers</p>
                            <p className="text-xl font-bold text-slate-900">{rating?.followersCount || 0}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Points earned:</span>
                          <span className="font-bold text-blue-600">+{followerPoints}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{pointsPerFollower} pts each</p>
                      </div>

                      {/* Articles Points */}
                      <div className="group p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-md group-hover:scale-110 transition-transform">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-purple-600 font-medium">Articles</p>
                            <p className="text-xl font-bold text-slate-900">{rating?.articlesCount || 0}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Points earned:</span>
                          <span className="font-bold text-purple-600">+{articlePoints}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{pointsPerArticle} pts each</p>
                      </div>

                      {/* Likes Points */}
                      <div className="group p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md group-hover:scale-110 transition-transform">
                            <Heart className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-pink-600 font-medium">Likes</p>
                            <p className="text-xl font-bold text-slate-900">{rating?.totalLikes || 0}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Points earned:</span>
                          <span className="font-bold text-pink-600">+{likePoints}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{pointsPerLike} pts each</p>
                      </div>

                      {/* Shares Points */}
                      <div className="group p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md group-hover:scale-110 transition-transform">
                            <Share2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-emerald-600 font-medium">Shares</p>
                            <p className="text-xl font-bold text-slate-900">{rating?.totalShares || 0}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Points earned:</span>
                          <span className="font-bold text-emerald-600">+{sharePoints}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{pointsPerShare} pts each</p>
                      </div>
                    </div>
                    
                    {/* Tier Progress */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 via-purple-50/50 to-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-purple-600" />
                          <span className="font-semibold text-slate-800">Tier Progress</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${tierBackground} text-white`}>
                            {tierName}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                          <span className="px-3 py-1 rounded-full text-sm font-bold bg-slate-200 text-slate-600">
                            {stars >= 5 ? 'Max!' : 
                              stars >= 4 ? 'Gold' : 
                              stars >= 3 ? 'Platinum' : 
                              stars >= 2 ? 'Silver' : 
                              stars >= 1 ? 'Bronze' : 'Starter'}
                          </span>
                        </div>
                      </div>
                      <div className="h-4 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full ${tierBackground} rounded-full transition-all duration-1000 relative overflow-hidden`}
                          style={{ width: `${progressToNext}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer"></div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mt-3 text-center flex items-center justify-center gap-2">
                        {stars >= 5 
                          ? <><Sparkles className="w-4 h-4 text-yellow-500" /> Congratulations! You have reached the highest tier!</>
                          : <><Zap className="w-4 h-4 text-purple-500" /> Earn {nextStarPoints - totalPoints} more points to reach the next tier!</>
                        }
                      </p>
                    </div>

                    {/* Tier Ranks Progression */}
                    <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Award className="w-5 h-5 text-amber-600" />
                        <span className="font-semibold text-slate-800">Tier Ranks</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[
                          { name: 'New', stars: 0, points: 0, color: 'bg-slate-400', textColor: 'text-slate-600', bgLight: 'bg-slate-100' },
                          { name: 'Starter', stars: 1, points: pointsFor1Star, color: 'bg-emerald-500', textColor: 'text-emerald-600', bgLight: 'bg-emerald-50' },
                          { name: 'Bronze', stars: 2, points: pointsFor2Stars, color: 'bg-amber-600', textColor: 'text-amber-600', bgLight: 'bg-amber-50' },
                          { name: 'Silver', stars: 3, points: pointsFor3Stars, color: 'bg-slate-500', textColor: 'text-slate-600', bgLight: 'bg-slate-100' },
                          { name: 'Platinum', stars: 4, points: pointsFor4Stars, color: 'bg-indigo-500', textColor: 'text-indigo-600', bgLight: 'bg-indigo-50' },
                          { name: 'Gold', stars: 5, points: pointsFor5Stars, color: 'bg-yellow-500', textColor: 'text-yellow-600', bgLight: 'bg-yellow-50' },
                        ].map((tierInfo, index) => {
                          const isCurrentTier = tierName === tierInfo.name;
                          const isAchieved = totalPoints >= tierInfo.points;
                          return (
                            <div 
                              key={tierInfo.name}
                              className={`relative p-3 rounded-xl border-2 transition-all duration-300 ${
                                isCurrentTier 
                                  ? 'border-purple-500 shadow-lg shadow-purple-200 scale-105' 
                                  : isAchieved 
                                    ? 'border-green-300 bg-green-50/50' 
                                    : 'border-slate-200 bg-slate-50/50 opacity-60'
                              }`}
                            >
                              {isCurrentTier && (
                                <div className="absolute -top-2 -right-2 p-1 bg-purple-500 rounded-full">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              )}
                              <div className={`w-10 h-10 mx-auto mb-2 rounded-lg ${tierInfo.color} flex items-center justify-center shadow-md`}>
                                <Award className="w-5 h-5 text-white" />
                              </div>
                              <p className={`text-center font-bold ${tierInfo.textColor}`}>{tierInfo.name}</p>
                              <div className="flex items-center justify-center gap-0.5 mt-1">
                                {Array.from({ length: Math.max(1, tierInfo.stars) }).map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${tierInfo.stars === 0 ? 'text-slate-300' : 'text-amber-400'} fill-current`} />
                                ))}
                              </div>
                              <p className="text-xs text-center text-slate-500 mt-1 font-mono">
                                {tierInfo.points === 0 ? `< ${pointsFor1Star}` : `${tierInfo.points}+`} pts
                              </p>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-slate-500 text-center mt-4 flex items-center justify-center gap-1">
                        <Info className="w-3 h-3" />
                        Your current tier is highlighted. Earn more stars to unlock higher tiers!
                      </p>
                    </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Profile Information Card */}
                <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-8 shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Profile Information</h3>
                      <p className="text-sm text-slate-600">Update your personal information</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden shadow-xl shadow-purple-500/30 ring-4 ring-white">
                          {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            user?.username?.charAt(0).toUpperCase() || 'U'
                          )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="w-4 h-4 text-purple-600" />
                        </div>
                      </div>
                      <div>
                        <input
                          type="file"
                          id="avatar-upload"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                        <button 
                          className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2"
                          type="button" 
                          onClick={() => document.getElementById('avatar-upload')?.click()}
                        >
                          <Camera className="h-4 w-4" />
                          Change Avatar
                        </button>
                        <p className="text-xs text-slate-500 mt-2">
                          JPG, PNG or GIF (max. 2MB)
                        </p>
                        {avatarFile && (
                          <button 
                            className="mt-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                            onClick={handleAvatarUpload}
                          >
                            <Check className="w-4 h-4" />
                            Upload
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <User className="w-4 h-4 text-purple-500" />
                          Username
                        </label>
                        <input
                          type="text"
                          defaultValue={user?.username}
                          className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-white/50 backdrop-blur-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <Mail className="w-4 h-4 text-purple-500" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          defaultValue={user?.email}
                          className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-white/50 backdrop-blur-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <FileText className="w-4 h-4 text-purple-500" />
                        Bio
                      </label>
                      <textarea
                        rows={4}
                        className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-white/50 backdrop-blur-sm resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02] transition-all flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Security Card */}
                <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-8 shadow-xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Account Security</h3>
                      <p className="text-sm text-slate-600">Manage your password and security settings</p>
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Lock className="w-4 h-4 text-blue-500" />
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <Lock className="w-4 h-4 text-blue-500" />
                          New Password
                        </label>
                        <input
                          type="password"
                          className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <Check className="w-4 h-4 text-blue-500" />
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white/50 backdrop-blur-sm"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Update Password
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="rounded-3xl bg-gradient-to-br from-red-50 to-pink-50 p-8 shadow-xl border-2 border-red-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 text-white">
                      <X className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-red-700">Danger Zone</h3>
                      <p className="text-sm text-red-600/70">Irreversible account actions</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white/50 backdrop-blur-sm rounded-2xl border border-red-200">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Delete Account</h4>
                      <p className="text-sm text-slate-600">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <button className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all whitespace-nowrap">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-8 shadow-xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Notification Preferences</h3>
                      <p className="text-sm text-slate-600">Choose what you want to be notified about</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {notificationItems.map((item, index) => (
                      <div 
                        key={index} 
                        className={`group flex items-center justify-between p-5 rounded-2xl ${item.bgColor} border ${item.borderColor} hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-xl ${item.iconBg} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">{item.label}</h4>
                            <p className="text-sm text-slate-500">{item.description}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-md peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                        </label>
                      </div>
                    ))}
                    
                    <button className="mt-6 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/30 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                      <Check className="w-5 h-5" />
                      Save Notification Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-8 shadow-xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                      <Palette className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Display Preferences</h3>
                      <p className="text-sm text-slate-600">Customize your dashboard experience</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Theme Selection */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Palette className="w-4 h-4 text-emerald-500" />
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { id: 'light', label: 'Light', icon: Sun, gradient: 'from-amber-400 to-orange-400' },
                          { id: 'dark', label: 'Dark', icon: Moon, gradient: 'from-slate-600 to-slate-800' },
                          { id: 'system', label: 'System', icon: Monitor, gradient: 'from-blue-400 to-purple-400' }
                        ].map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setTheme(t.id as 'light' | 'dark' | 'system')}
                            className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                              theme === t.id
                                ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100'
                                : 'border-slate-200 bg-white hover:border-emerald-200 hover:shadow-md'
                            }`}
                          >
                            <div className={`mx-auto w-12 h-12 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center mb-2 shadow-lg`}>
                              <t.icon className="w-6 h-6 text-white" />
                            </div>
                            <p className="font-semibold text-slate-800">{t.label}</p>
                            {theme === t.id && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Language Selection */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Globe className="w-4 h-4 text-emerald-500" />
                        Language
                      </label>
                      <select className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white/50 backdrop-blur-sm appearance-none cursor-pointer">
                        <option>🇺🇸 English</option>
                        <option>🇪🇸 Spanish</option>
                        <option>🇫🇷 French</option>
                        <option>🇩🇪 German</option>
                      </select>
                    </div>

                    {/* Timezone Selection */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Globe className="w-4 h-4 text-emerald-500" />
                        Timezone
                      </label>
                      <select className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white/50 backdrop-blur-sm appearance-none cursor-pointer">
                        <option>🕐 UTC-5 (Eastern Time)</option>
                        <option>🕐 UTC-6 (Central Time)</option>
                        <option>🕐 UTC-7 (Mountain Time)</option>
                        <option>🕐 UTC-8 (Pacific Time)</option>
                      </select>
                    </div>

                    <button 
                      onClick={handleSavePreferences}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
