'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Award, 
  Star, 
  Users, 
  FileText, 
  Heart, 
  Share2, 
  Zap, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Sparkles, 
  Check, 
  ChevronRight, 
  Calculator, 
  ArrowRight,
  Info,
  ShieldCheck,
  Percent,
  Plus
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { StarBadgeLarge, getTierInfo } from '@/components/star-badge'
import { publisherAuthFetch } from '@/lib/publisher-session'

interface RatingSetting {
  settingKey: string
  settingValue: string
  settingUnit: string
  description: string
}

export default function RankRatePage() {
  const { user, token, isLoading: authLoading } = useAuth()
  const [rating, setRating] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quotaStatus, setQuotaStatus] = useState<any>(null)

  // Interactive Points Calculator State
  const [calcFollowers, setCalcFollowers] = useState(10)
  const [calcArticles, setCalcArticles] = useState(15)
  const [calcLikes, setCalcLikes] = useState(100)
  const [calcShares, setCalcShares] = useState(25)

  // Interactive Revenue Calculator State
  const [calcRevenue, setCalcRevenue] = useState(250)

  useEffect(() => {
    fetchRatingAndQuota()
  }, [authLoading, token])

  const fetchRatingAndQuota = async () => {
    if (authLoading) return
    try {
      setLoading(true)
      setError(null)
      if (!token) {
        setError('Please log in to view your Rank & Rate status.')
        return
      }

      const [ratingRes, quotaRes] = await Promise.all([
        publisherAuthFetch('/api/rating/my-rating'),
        publisherAuthFetch('/api/articles/daily-limit-status')
      ])

      if (ratingRes.ok) {
        const result = await ratingRes.json()
        const ratingData = result.data || result
        setRating(ratingData)

        // Seed interactive calculator with user's real stats
        if (ratingData) {
          setCalcFollowers(ratingData.followersCount || 10)
          setCalcArticles(ratingData.articlesCount || 15)
          setCalcLikes(ratingData.totalLikes || 100)
          setCalcShares(ratingData.totalShares || 25)
        }
      } else {
        const errJson = await ratingRes.json().catch(() => null)
        setError(errJson?.message || 'Failed to load rating information.')
      }

      if (quotaRes.ok) {
        const qJson = await quotaRes.json()
        setQuotaStatus(qJson.data || qJson)
      }
    } catch (err: any) {
      console.error('Error loading rank and rate:', err)
      setError('Unable to load rating status. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const stars = rating?.starRating ?? 0
  const maxStars = rating?.maxStars || 5
  const tier = getTierInfo(stars)
  const tierName = rating?.tierName || tier.name
  const totalPoints = rating?.totalPoints || 0
  const followerPoints = rating?.followerPoints || 0
  const articlePoints = rating?.articlePoints || 0
  const likePoints = rating?.likePoints || 0
  const sharePoints = rating?.sharePoints || 0
  const nextStarPoints = rating?.nextStarPoints || 50
  const progressToNext = rating?.progressToNext || 0
  const commissionRate = rating?.rate ?? (stars === 0 ? 30 : Math.max(0, 30 - stars * 6))
  const takeHomeRate = 100 - commissionRate
  const dailyLimit = rating?.dailyArticleLimit || quotaStatus?.limit || 5

  const pointsPerFollower = rating?.pointsPerFollower || 10
  const pointsPerArticle = rating?.pointsPerArticle || 5
  const pointsPerLike = rating?.pointsPerLike || 1
  const pointsPerShare = rating?.pointsPerShare || 0

  const pointsFor1Star = rating?.pointsFor1Star || 50
  const pointsFor2Stars = rating?.pointsFor2Stars || 150
  const pointsFor3Stars = rating?.pointsFor3Stars || 300
  const pointsFor4Stars = rating?.pointsFor4Stars || 500
  const pointsFor5Stars = rating?.pointsFor5Stars || 1000

  // Calculator computations
  const simTotalPoints = (calcFollowers * pointsPerFollower) + 
                         (calcArticles * pointsPerArticle) + 
                         (calcLikes * pointsPerLike) + 
                         (calcShares * pointsPerShare)

  let simStars = 0
  let simTierName = 'New'
  let simDailyLimit = 5
  let simCommission = 30

  if (simTotalPoints >= pointsFor5Stars) {
    simStars = 5; simTierName = 'Gold'; simDailyLimit = 50; simCommission = 0
  } else if (simTotalPoints >= pointsFor4Stars) {
    simStars = 4; simTierName = 'Platinum'; simDailyLimit = 25; simCommission = 6
  } else if (simTotalPoints >= pointsFor3Stars) {
    simStars = 3; simTierName = 'Silver'; simDailyLimit = 15; simCommission = 12
  } else if (simTotalPoints >= pointsFor2Stars) {
    simStars = 2; simTierName = 'Bronze'; simDailyLimit = 10; simCommission = 18
  } else if (simTotalPoints >= pointsFor1Star) {
    simStars = 1; simTierName = 'Starter'; simDailyLimit = 7; simCommission = 24
  }

  const simTakeHome = 100 - simCommission

  const tierMatrix = [
    { name: 'New Publisher', stars: 0, points: 0, limit: 5, commission: 30, takeHome: 70, color: 'from-slate-600 to-slate-800', badge: 'bg-slate-100 text-slate-700' },
    { name: 'Starter', stars: 1, points: pointsFor1Star, limit: 7, commission: 24, takeHome: 76, color: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-100 text-emerald-800' },
    { name: 'Bronze', stars: 2, points: pointsFor2Stars, limit: 10, commission: 18, takeHome: 82, color: 'from-amber-500 to-orange-600', badge: 'bg-amber-100 text-amber-800' },
    { name: 'Silver', stars: 3, points: pointsFor3Stars, limit: 15, commission: 12, takeHome: 88, color: 'from-slate-400 to-zinc-600', badge: 'bg-slate-200 text-slate-800' },
    { name: 'Platinum', stars: 4, points: pointsFor4Stars, limit: 25, commission: 6, takeHome: 94, color: 'from-indigo-500 to-purple-600', badge: 'bg-indigo-100 text-indigo-800' },
    { name: 'Gold', stars: 5, points: pointsFor5Stars, limit: 50, commission: 0, takeHome: 100, color: 'from-yellow-400 to-amber-500', badge: 'bg-yellow-100 text-yellow-800' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading Rank & Rate details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent">
            Rank & Rate
          </h1>
          <p className="text-slate-600 mt-1">
            Track your star ranking, daily article quota, points breakdown, and commission earnings
          </p>
        </div>

        <Link href="/dashboard/articles/new">
          <button className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-xl hover:scale-[1.02] transition-all">
            <Plus className="h-5 w-5" />
            Write New Article
          </button>
        </Link>
      </div>

      {/* Hero Rank Card */}
      <div className="overflow-hidden rounded-3xl shadow-2xl border-0">
        <div className={`${tier.background} px-8 py-10 relative overflow-hidden text-white`}>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-48 h-48 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-white rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
          </div>

          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <div className="flex items-center gap-3 justify-center lg:justify-start mb-2">
                <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-widest text-white/80 font-bold">Current Standing</span>
                  <h2 className="text-3xl font-extrabold text-white">{tierName} Rank</h2>
                </div>
              </div>

              <p className="text-white/90 text-sm max-w-xl mt-3 leading-relaxed">
                You have earned <strong className="text-white font-bold">{totalPoints} total points</strong> across your articles, audience followers, and reader engagement.
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-5 justify-center lg:justify-start">
                <div className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  {stars} of 5 Stars
                </div>
                <div className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-300" />
                  {dailyLimit} Articles / Day Limit
                </div>
                <div className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-cyan-300" />
                  {takeHomeRate}% Revenue Share ({commissionRate}% Platform Fee)
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <StarBadgeLarge stars={stars} maxStars={maxStars} showProgress={true} />
            </div>
          </div>
        </div>

        {/* Progress bar and Key stats inside hero */}
        <div className="bg-white p-6 sm:p-8 border-t border-slate-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tier Advancement</span>
              <p className="text-lg font-bold text-slate-900">
                {stars < 5 
                  ? `${nextStarPoints - totalPoints} more points to reach ${tierMatrix[stars + 1]?.name || 'Next Star'}` 
                  : 'Maximum Star Rank Achieved (Gold Tier)!'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                {progressToNext.toFixed(1)}% Progress to {stars < 5 ? stars + 1 : 5}★
              </span>
            </div>
          </div>

          <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
            <div 
              className={`h-full ${tier.background} rounded-full transition-all duration-1000 relative overflow-hidden`}
              style={{ width: `${Math.min(100, Math.max(5, progressToNext))}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Daily Quota Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
              24h Quota
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Daily Publishing Limit</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-900">
              {quotaStatus?.used ?? 0} / {dailyLimit}
            </span>
            <span className="text-xs text-slate-500 font-medium">articles</span>
          </div>
          <p className="text-xs text-emerald-600 font-semibold mt-3 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            {quotaStatus?.remaining ?? dailyLimit} articles remaining today
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Resets in: {quotaStatus?.resetsIn || 'Rolling 24h'}
          </p>
        </div>

        {/* Commission Share Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
              Take-Home
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Your Revenue Share</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-900">{takeHomeRate}%</span>
            <span className="text-xs text-slate-500">payout</span>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-3">
            Platform fee: <strong className="text-slate-800">{commissionRate}%</strong>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Reach Gold rank to pay 0% fee (100% take-home)!
          </p>
        </div>

        {/* Audience Points Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
              +{pointsPerFollower} pts/ea
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Follower Points</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-900">{followerPoints}</span>
            <span className="text-xs text-slate-500">pts ({rating?.followersCount || 0} followers)</span>
          </div>
          <p className="text-xs text-blue-600 font-semibold mt-3">
            Audience engagement
          </p>
        </div>

        {/* Published Articles Points Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700">
              +{pointsPerArticle} pts/ea
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Content Points</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-900">{articlePoints}</span>
            <span className="text-xs text-slate-500">pts ({rating?.articlesCount || 0} articles)</span>
          </div>
          <p className="text-xs text-purple-600 font-semibold mt-3">
            +{likePoints + sharePoints} pts from likes & shares
          </p>
        </div>
      </div>

      {/* Tier Matrix Table */}
      <div className="rounded-3xl bg-white border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 text-white flex items-center justify-center shadow-md">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Publisher Tier Progression Matrix</h3>
              <p className="text-xs text-slate-500">Compare required points, daily article limits, and revenue shares across all ranks</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="py-4 px-6">Rank Tier</th>
                <th className="py-4 px-6">Stars</th>
                <th className="py-4 px-6">Required Points</th>
                <th className="py-4 px-6">Daily Article Limit</th>
                <th className="py-4 px-6">Platform Fee</th>
                <th className="py-4 px-6 text-right">Publisher Take-Home</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tierMatrix.map((item) => {
                const isCurrent = item.stars === stars
                return (
                  <tr 
                    key={item.name}
                    className={`transition-colors ${
                      isCurrent 
                        ? 'bg-purple-50/80 font-semibold text-purple-950' 
                        : 'hover:bg-slate-50/60 text-slate-800'
                    }`}
                  >
                    <td className="py-4 px-6 flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.badge}`}>
                        {item.name}
                      </span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white animate-pulse">
                          YOUR RANK
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.max(1, item.stars) }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${item.stars === 0 ? 'text-slate-300' : 'text-amber-400 fill-amber-400'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-700">
                      {item.points === 0 ? `< ${pointsFor1Star} pts` : `${item.points}+ pts`}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold">
                        <FileText className="w-3.5 h-3.5" />
                        {item.limit} articles / day
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {item.commission}%
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-base">
                        {item.takeHome}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Interactive Calculators Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Simulator 1: Points & Star Rating Progression Calculator */}
        <div className="rounded-3xl bg-white border border-slate-100 shadow-xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Rating Points Simulator</h3>
                <p className="text-xs text-slate-500">Calculate how much content and followers you need to reach the next tier</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Followers slider */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-500" /> Followers ({pointsPerFollower} pts each)
                  </label>
                  <span className="font-mono font-bold text-blue-600">{calcFollowers}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="200" 
                  value={calcFollowers}
                  onChange={(e) => setCalcFollowers(parseInt(e.target.value, 10) || 0)}
                  className="w-full accent-blue-600"
                />
              </div>

              {/* Articles slider */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-purple-500" /> Articles ({pointsPerArticle} pts each)
                  </label>
                  <span className="font-mono font-bold text-purple-600">{calcArticles}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="200" 
                  value={calcArticles}
                  onChange={(e) => setCalcArticles(parseInt(e.target.value, 10) || 0)}
                  className="w-full accent-purple-600"
                />
              </div>

              {/* Likes slider */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-pink-500" /> Likes ({pointsPerLike} pt each)
                  </label>
                  <span className="font-mono font-bold text-pink-600">{calcLikes}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1000" 
                  step="10"
                  value={calcLikes}
                  onChange={(e) => setCalcLikes(parseInt(e.target.value, 10) || 0)}
                  className="w-full accent-pink-600"
                />
              </div>
            </div>
          </div>

          {/* Simulation Output Card */}
          <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-purple-200 uppercase font-bold tracking-wider">Projected Result</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.max(1, simStars) }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${simStars === 0 ? 'text-slate-400' : 'text-amber-400 fill-amber-400'}`} />
                ))}
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold">{simTotalPoints}</span>
                <span className="text-xs text-purple-200 ml-1.5 font-medium">Total Points</span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 border border-white/30">
                {simTierName} Tier ({simStars}★)
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-xs text-purple-100">
              <span>Unlocked Daily Limit: <strong>{simDailyLimit} articles/day</strong></span>
              <span>Take-Home: <strong>{simTakeHome}%</strong></span>
            </div>
          </div>
        </div>

        {/* Simulator 2: Commission & Take-Home Earnings Calculator */}
        <div className="rounded-3xl bg-white border border-slate-100 shadow-xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Commission & Earnings Calculator</h3>
                <p className="text-xs text-slate-500">See your take-home payout at different gross ad revenue levels</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-700">
                  Gross Ad Revenue Generated
                </label>
                <span className="text-lg font-bold text-emerald-600">${calcRevenue}.00</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="2000" 
                step="10"
                value={calcRevenue}
                onChange={(e) => setCalcRevenue(parseInt(e.target.value, 10) || 10)}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>$10</span>
                <span>$500</span>
                <span>$1,000</span>
                <span>$2,000</span>
              </div>
            </div>

            {/* Comparison Cards for Current vs Gold */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-600 block">At Your Rank ({tierName})</span>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">
                  ${((calcRevenue * takeHomeRate) / 100).toFixed(2)}
                </p>
                <span className="text-[11px] text-slate-500">
                  Fee: ${((calcRevenue * commissionRate) / 100).toFixed(2)} ({commissionRate}%)
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 border border-amber-200">
                <span className="text-xs font-bold text-amber-800 block">At Gold Rank (5★)</span>
                <p className="text-2xl font-extrabold text-amber-900 mt-1">
                  ${calcRevenue.toFixed(2)}
                </p>
                <span className="text-[11px] text-amber-700 font-semibold">
                  Fee: $0.00 (0% Fee - 100% Payout!)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Why Star Ranking Matters:</strong>
              As you rank up from New to Gold, platform fees drop from 30% to 0%. Leveling up to Gold on ${calcRevenue} gross revenue saves you <strong>${((calcRevenue * 0.3)).toFixed(2)}</strong> extra in direct profit!
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
