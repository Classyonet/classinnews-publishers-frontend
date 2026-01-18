'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Search, Menu, User, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
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
          <button
            type="button"
            className="relative -m-2.5 p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 ring-2 ring-white shadow-lg"></span>
          </button>

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
              </span>
            </button>

            {/* Dropdown menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-white py-1 shadow-xl ring-1 ring-slate-900/5 focus:outline-none border border-slate-100">
                <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-pink-50">
                  <p className="text-sm font-semibold text-slate-900">{user?.username}</p>
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









