'use client'

import { Star } from 'lucide-react'

interface StarBadgeProps {
  stars: number
  maxStars?: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  showProgress?: boolean
  className?: string
}

// Get tier info based on star count - exported for use in profile page
export const getTierInfo = (starCount: number) => {
  if (starCount >= 5) return { 
    name: 'Gold',
    background: 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500', 
    bg: 'from-yellow-400 via-amber-400 to-yellow-500', 
    border: 'border-yellow-500',
    shadow: 'shadow-yellow-400/50',
    text: 'text-yellow-900', 
    label: 'Gold',
    starFilled: 'fill-yellow-100 text-yellow-100 drop-shadow-[0_0_3px_rgba(255,255,255,0.8)]',
    starUnfilled: 'text-yellow-700/40',
    glow: 'shadow-[0_0_20px_rgba(251,191,36,0.6)]'
  }
  if (starCount >= 4) return { 
    name: 'Platinum',
    background: 'bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600', 
    bg: 'from-purple-500 via-violet-500 to-purple-600', 
    border: 'border-purple-400',
    shadow: 'shadow-purple-400/50',
    text: 'text-purple-100', 
    label: 'Platinum',
    starFilled: 'fill-purple-100 text-purple-100 drop-shadow-[0_0_3px_rgba(255,255,255,0.8)]',
    starUnfilled: 'text-purple-300/40',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.6)]'
  }
  if (starCount >= 3) return { 
    name: 'Silver',
    background: 'bg-gradient-to-r from-blue-400 via-sky-500 to-blue-600', 
    bg: 'from-blue-400 via-sky-500 to-blue-600', 
    border: 'border-blue-400',
    shadow: 'shadow-blue-400/50',
    text: 'text-blue-100', 
    label: 'Silver',
    starFilled: 'fill-blue-100 text-blue-100 drop-shadow-[0_0_3px_rgba(255,255,255,0.8)]',
    starUnfilled: 'text-blue-300/40',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.6)]'
  }
  if (starCount >= 2) return { 
    name: 'Bronze',
    background: 'bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600', 
    bg: 'from-emerald-400 via-green-500 to-emerald-600', 
    border: 'border-emerald-400',
    shadow: 'shadow-emerald-400/50',
    text: 'text-emerald-100', 
    label: 'Bronze',
    starFilled: 'fill-emerald-100 text-emerald-100 drop-shadow-[0_0_3px_rgba(255,255,255,0.8)]',
    starUnfilled: 'text-emerald-300/40',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.6)]'
  }
  if (starCount >= 1) return { 
    name: 'Starter',
    background: 'bg-gradient-to-r from-slate-400 via-gray-500 to-slate-600', 
    bg: 'from-slate-400 via-gray-500 to-slate-600', 
    border: 'border-slate-400',
    shadow: 'shadow-slate-400/50',
    text: 'text-slate-100', 
    label: 'Starter',
    starFilled: 'fill-slate-100 text-slate-100 drop-shadow-[0_0_3px_rgba(255,255,255,0.8)]',
    starUnfilled: 'text-slate-300/40',
    glow: 'shadow-[0_0_15px_rgba(100,116,139,0.5)]'
  }
  return { 
    name: 'New',
    background: 'bg-gradient-to-r from-slate-300 via-gray-400 to-slate-500', 
    bg: 'from-slate-300 via-gray-400 to-slate-500', 
    border: 'border-slate-300',
    shadow: 'shadow-slate-300/30',
    text: 'text-slate-100', 
    label: 'New',
    starFilled: 'fill-slate-200 text-slate-200',
    starUnfilled: 'text-slate-400/50',
    glow: ''
  }
}

export function StarBadge({ 
  stars = 0, 
  maxStars = 5, 
  size = 'md', 
  showLabel = true,
  showProgress = false,
  className = ''
}: StarBadgeProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const labelClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  const paddingClasses = {
    sm: 'px-2 py-1',
    md: 'px-3 py-1.5',
    lg: 'px-4 py-2'
  }

  const starSize = sizeClasses[size]
  const labelSize = labelClasses[size]
  const padding = paddingClasses[size]
  const safeStars = Math.max(0, Math.min(stars || 0, maxStars))
  const tier = getTierInfo(safeStars)

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={`
        flex items-center gap-1 ${padding} rounded-full 
        bg-gradient-to-r ${tier.bg} 
        border-2 ${tier.border}
        ${tier.glow}
        shadow-lg ${tier.shadow}
        transition-all duration-300
      `}>
        {Array.from({ length: maxStars }).map((_, index) => {
          const isFilled = index < safeStars
          const isCurrentStar = index === Math.floor(safeStars) && safeStars % 1 !== 0
          
          return (
            <Star
              key={index}
              className={`${starSize} transition-all duration-300 ${
                isFilled
                  ? tier.starFilled
                  : isCurrentStar
                    ? `${tier.starFilled} opacity-50`
                    : tier.starUnfilled
              }`}
            />
          )
        })}
        {showLabel && (
          <span className={`ml-1.5 font-bold ${labelSize} ${tier.text} tracking-wide`}>
            {tier.label}
          </span>
        )}
      </div>
    </div>
  )
}

// Compact version for headers with tier-colored stars
export function StarBadgeCompact({ 
  stars = 0, 
  maxStars = 5,
  size = 'sm',
  showBackground = true,
  className = ''
}: { 
  stars?: number
  maxStars?: number
  size?: 'sm' | 'md' | 'lg'
  showBackground?: boolean
  className?: string 
}) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const starSize = sizeClasses[size]
  const safeStars = Math.max(0, Math.min(stars || 0, maxStars))
  const tier = getTierInfo(safeStars)

  // Get tier-specific filled color for compact view
  const getFilledColor = (starCount: number) => {
    if (starCount >= 5) return 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]'
    if (starCount >= 4) return 'fill-purple-400 text-purple-400 drop-shadow-[0_0_4px_rgba(168,85,247,0.8)]'
    if (starCount >= 3) return 'fill-blue-400 text-blue-400 drop-shadow-[0_0_4px_rgba(59,130,246,0.8)]'
    if (starCount >= 2) return 'fill-emerald-400 text-emerald-400 drop-shadow-[0_0_4px_rgba(16,185,129,0.8)]'
    if (starCount >= 1) return 'fill-slate-400 text-slate-400 drop-shadow-[0_0_3px_rgba(100,116,139,0.6)]'
    return 'fill-gray-300 text-gray-300'
  }

  const filledColor = getFilledColor(safeStars)

  if (showBackground) {
    return (
      <div className={`
        inline-flex items-center gap-0.5 px-2 py-1 rounded-full
        bg-gradient-to-r from-slate-100 to-slate-200
        border border-slate-300
        shadow-sm
        ${className}
      `}>
        {Array.from({ length: maxStars }).map((_, index) => (
          <Star
            key={index}
            className={`${starSize} transition-all duration-300 ${
              index < safeStars
                ? filledColor
                : 'fill-slate-200 text-slate-300'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: maxStars }).map((_, index) => (
        <Star
          key={index}
          className={`${starSize} transition-all duration-300 ${
            index < safeStars
              ? filledColor
              : 'fill-gray-200 text-gray-300'
          }`}
        />
      ))}
    </div>
  )
}

// Large display badge for profile pages
export function StarBadgeLarge({
  stars = 0,
  maxStars = 5,
  showProgress = true,
  progressPercent: customProgress,
  className = ''
}: {
  stars?: number
  maxStars?: number
  showProgress?: boolean
  progressPercent?: number
  className?: string
}) {
  const safeStars = Math.max(0, Math.min(stars || 0, maxStars))
  const tier = getTierInfo(safeStars)
  const progressPercent = customProgress !== undefined ? customProgress : (safeStars / maxStars) * 100

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Main badge */}
      <div className={`
        relative flex items-center gap-2 px-6 py-4 rounded-2xl
        bg-gradient-to-r ${tier.bg}
        border-3 ${tier.border}
        ${tier.glow}
        shadow-xl
        overflow-hidden
      `}>
        {/* Animated shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
        
        {Array.from({ length: maxStars }).map((_, index) => {
          const isFilled = index < safeStars
          const isPartiallyFilled = index === safeStars && customProgress && customProgress > 0
          
          return (
            <div key={index} className="relative">
              <Star
                className={`w-10 h-10 transition-all duration-500 transform ${
                  isFilled
                    ? `${tier.starFilled} scale-110`
                    : tier.starUnfilled
                }`}
              />
              {/* Glow effect for filled stars */}
              {isFilled && (
                <div className="absolute inset-0 animate-pulse">
                  <Star className={`w-10 h-10 ${tier.starFilled} opacity-50 blur-[2px]`} />
                </div>
              )}
              {/* Progress indicator for next star */}
              {isPartiallyFilled && (
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{ 
                    clipPath: `inset(${100 - (customProgress || 0)}% 0 0 0)`,
                  }}
                >
                  <Star className={`w-10 h-10 ${tier.starFilled} opacity-60`} />
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {/* Tier label with badge */}
      <div className={`
        px-5 py-1.5 rounded-full text-sm font-bold
        bg-gradient-to-r ${tier.bg}
        ${tier.text}
        shadow-lg border ${tier.border}
      `}>
        ⭐ {tier.label} Publisher
      </div>

      {/* Progress bar to next star */}
      {showProgress && safeStars < maxStars && (
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-xs text-white/80 mb-1">
            <span>Next star progress</span>
            <span>{(customProgress || 0).toFixed(0)}%</span>
          </div>
          <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-white rounded-full transition-all duration-700 relative"
              style={{ width: `${customProgress || 0}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Stars count */}
      <div className="text-white font-bold text-lg">
        {safeStars} / {maxStars} Stars
      </div>
    </div>
  )
}
