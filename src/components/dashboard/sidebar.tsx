'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  BarChart3, 
  FileText, 
  Settings, 
  Home,
  Plus,
  BookOpen,
  DollarSign,
  Image,
  Mail,
  TrendingUp,
  Search
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, notificationKey: 'dashboard' },
  { name: 'Articles', href: '/dashboard/articles', icon: FileText, notificationKey: 'articles', showBadge: true },
  { name: 'New Article', href: '/dashboard/articles/new', icon: Plus, notificationKey: 'new' },
  { name: 'Browse Topics', href: '/dashboard/browse-topics', icon: Search, notificationKey: 'topics' },
  { name: 'Media Library', href: '/dashboard/media', icon: Image, notificationKey: 'media' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, notificationKey: 'analytics' },
  { name: 'Revenue', href: '/dashboard/revenue', icon: DollarSign, notificationKey: 'revenue' },
  { name: 'Messages', href: '/dashboard/messages', icon: Mail, notificationKey: 'messages', showBadge: true },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, notificationKey: 'settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [notificationCounts, setNotificationCounts] = useState<Record<string, number>>({
    articles: 0,
    messages: 0,
  })

  useEffect(() => {
    // Fetch notification counts
    const fetchNotifications = async () => {
      try {
        // Fetch approved articles count
        const articlesRes = await fetch('http://localhost:3001/api/articles?status=published');
        const articlesData = await articlesRes.json();
        
        // Fetch unread messages count
        const messagesRes = await fetch('http://localhost:3001/api/messages/unread-count');
        const messagesData = await messagesRes.json();

        setNotificationCounts({
          articles: articlesData.length || 0,
          messages: messagesData.count || 0,
        });
      } catch (error) {
        console.error('Failed to fetch notification counts:', error);
        // On error, keep previous counts or set to 0
        // This ensures UI doesn't show stale mock data
      }
    };

    fetchNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-6 pb-4 border-r border-slate-800">
        <div className="flex h-20 shrink-0 items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">ClassinNews</h1>
              <p className="text-xs text-slate-400">Creator Dashboard</p>
            </div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  const count = notificationCounts[item.notificationKey] || 0
                  const showBadge = (item.showBadge || count > 0) && count > 0
                  
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          isActive
                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border-r-2 border-purple-400'
                            : 'text-slate-300 hover:text-white hover:bg-white/5',
                          'group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium relative transition-all duration-200'
                        )}
                      >
                        <item.icon
                          className={cn(
                            isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-purple-400',
                            'h-5 w-5 shrink-0 transition-colors'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                        {showBadge && (
                          <span className="ml-auto bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-lg shadow-red-500/50">
                            {count}
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>
            <li className="mt-auto">
              <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white">Pro Tip</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Publish consistently to build your audience and increase engagement.
                </p>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}









