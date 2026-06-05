'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Search, Menu, User, LogOut, Settings, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { StarBadgeCompact } from '@/components/star-badge'
import { publisherAuthFetch } from '@/lib/publisher-session'

interface HeaderMessage {
  id: string
  subject?: string
  body: string
  isRead: boolean
  createdAt: string
}

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [messages, setMessages] = useState<HeaderMessage[]>([])
  const [stars, setStars] = useState<number>(0)
  const [ratingError, setRatingError] = useState<string | null>(null)
  const { user, logout, token, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchRating = async () => {
      if (isLoading) {
        return
      }

      try {
        if (!token) {
          setRatingError('Not authenticated')
          return
        }

        const response = await publisherAuthFetch('/api/rating/my-rating')

        if (response.ok) {
          const result = await response.json()
          // Handle both response formats
          const data = result.data || result
          if (data && typeof data === 'object' && data.starRating !== undefined) {
            setStars(data.starRating || 0)
            setRatingError(null)
          } else {
            setRatingError('Rating unavailable')
          }
        } else {
          const error = await response.json().catch(() => null)
          setRatingError(error?.message || 'Rating unavailable')
        }
      } catch (err) {
        console.error('Error fetching rating:', err)
        setRatingError('Rating unavailable')
      }
    }

    fetchRating()
  }, [isLoading, token])

  useEffect(() => {
    if (isLoading || !token) return

    const fetchMessages = async () => {
      try {
        const response = await publisherAuthFetch('/api/messages')
        if (!response.ok) return
        const result = await response.json()
        setMessages(Array.isArray(result.data) ? result.data : [])
      } catch (error) {
        console.error('Error fetching messages:', error)
      }
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 30000)
    return () => clearInterval(interval)
  }, [isLoading, token])

  const unreadMessages = messages.filter((message) => !message.isRead)
  const latestUnreadMessages = unreadMessages.slice(0, 5)

  const markMessageRead = async (id: string) => {
    try {
      await publisherAuthFetch(`/api/messages/${id}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })
      setMessages((current) => current.map((message) => message.id === id ? { ...message, isRead: true } : message))
    } catch (error) {
      console.error('Error marking message read:', error)
    }
  }

  const handleLogout = () => {
    void logout()
    router.push('/auth/login')
  }

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white/80 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-slate-700 lg:hidden hover:bg-slate-100 rounded-lg transition-colors"
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-slate-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Search */}
        <div className="relative flex flex-1">
          {isSearchOpen ? (
            <div className="flex w-full max-w-lg">
              <input
                type="text"
                className="block w-full rounded-l-xl border-0 py-2 pl-4 pr-3 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-purple-500 sm:text-sm sm:leading-6 bg-white/50 backdrop-blur"
                placeholder="Search articles, analytics..."
                autoFocus
              />
              <button
                type="button"
                className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-xl px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-colors"
                onClick={() => setIsSearchOpen(false)}
              >
                <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="flex items-center gap-x-2 px-4 py-2 rounded-xl text-sm leading-6 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
              <span className="hidden sm:block">Search...</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotificationsOpen((value) => !value)}
              className="relative -m-2.5 p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" aria-hidden="true" />
              {unreadMessages.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white ring-2 ring-white shadow-lg">
                  {unreadMessages.length}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 z-20 mt-3 w-80 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl ring-1 ring-slate-900/5">
                <div className="border-b border-slate-100 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">Notifications</p>
                  <p className="text-xs text-slate-500">{unreadMessages.length} unread message{unreadMessages.length === 1 ? '' : 's'}</p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {latestUnreadMessages.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-slate-500">No new notifications.</div>
                  ) : latestUnreadMessages.map((message) => (
                    <button
                      key={message.id}
                      type="button"
                      onClick={() => markMessageRead(message.id)}
                      className="block w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50"
                    >
                      <p className="text-sm font-semibold text-slate-900">{message.subject || 'New message'}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{message.body}</p>
                      <p className="mt-2 text-[11px] text-slate-400">{new Date(message.createdAt).toLocaleString()}</p>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsNotificationsOpen(false)
                    router.push('/dashboard/messages')
                  }}
                  className="block w-full bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-purple-600 hover:bg-purple-50"
                >
                  Open Messages
                </button>
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200" aria-hidden="true" />

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              className="-m-1.5 flex items-center p-1.5 hover:bg-slate-100 rounded-xl transition-all"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            >
              <span className="sr-only">Open user menu</span>
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <span className="text-sm font-bold text-white">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-3 text-sm font-semibold leading-6 text-slate-900" aria-hidden="true">
                  {user?.username || 'User'}
                </span>
                <span className="ml-2">
                  {ratingError ? (
                    <span className="text-xs text-slate-500">Rating unavailable</span>
                  ) : (
                    <StarBadgeCompact stars={stars} size="sm" />
                  )}
                </span>
              </span>
            </button>

            {/* Dropdown menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-white py-1 shadow-xl ring-1 ring-slate-900/5 focus:outline-none border border-slate-100">
                <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{user?.username}</p>
                    {ratingError ? (
                      <span className="text-xs text-slate-500">Rating unavailable</span>
                    ) : (
                      <StarBadgeCompact stars={stars} size="sm" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 truncate mt-0.5">{user?.email}</p>
                </div>
                <button
                  className="flex w-full items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={() => {
                    setIsProfileMenuOpen(false)
                    // Navigate to settings if page exists
                  }}
                >
                  <Settings className="mr-3 h-4 w-4 text-slate-400" />
                  Settings
                </button>
                <button
                  className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-b-xl"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}





