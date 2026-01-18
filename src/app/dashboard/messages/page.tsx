'use client'

import { useEffect, useState } from 'react'
import { InboxIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/auth-context'

interface Message {
  id: string
  subject: string
  body: string
  isRead: boolean
  createdAt: string
  from?: {
    username?: string
    email?: string
  }
}

export default function MessagesPage() {
  const { token } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Poll for new messages every 30 seconds
  useEffect(() => {
    if (token) {
      fetchMessages()
      
      // Set up polling for new messages
      const interval = setInterval(() => {
        fetchMessages()
      }, 30000)

      return () => clearInterval(interval)
    } else {
      setIsLoading(false)
    }
  }, [token])

  async function fetchMessages() {
    setIsLoading(true)
    setError(null)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'
      console.log('Fetching messages with token:', token)
      const res = await fetch(`${apiUrl}/api/messages`, { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!res.ok) {
        const errorData = await res.json()
        console.error('Server response:', errorData)
        throw new Error(errorData.message || 'Failed to fetch messages')
      }
      const data = await res.json()
      console.log('Received messages:', data)
      setMessages(data.data || [])
    } catch (err) {
      console.error('Fetch Messages Error:', err)
      setError('Could not load messages. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function markRead(id: string) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'
      console.log('Marking message as read:', id)
      const res = await fetch(`${apiUrl}/api/messages/${id}/read`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!res.ok) {
        const errorData = await res.json()
        console.error('Server response:', errorData)
        throw new Error(errorData.message || 'Failed to mark message as read')
      }
      await fetchMessages() // Refresh messages list
    } catch (err) {
      console.error('Mark as read error:', err)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">Inbox</h2>
        <p className="text-slate-600">Messages from your admin team</p>
      </div>

      {isLoading && (
        <div className="rounded-2xl bg-white p-12 text-center shadow-lg border border-slate-100">
          <div className="text-slate-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="font-medium">Loading messages...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-red-50 p-6 shadow-lg border border-red-100">
          <div className="flex items-center gap-3 text-red-600">
            <ExclamationTriangleIcon className="w-6 h-6" />
            <div>
              <p className="font-semibold">An Error Occurred</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {messages.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-lg border border-slate-100">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
                <InboxIcon className="w-10 h-10 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Your inbox is empty</h3>
              <p className="text-slate-600">Messages from the admin will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m) => (
                <div 
                  key={m.id} 
                  className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 border ${
                    m.isRead 
                      ? 'bg-slate-50 border-slate-200 hover:border-slate-300' 
                      : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {!m.isRead && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-500"></div>
                  )}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                          <span className="text-sm font-bold text-white">
                            {m.from?.username?.charAt(0).toUpperCase() || 'A'}
                          </span>
                        </div>
                        <div>
                          <div className={`font-bold ${m.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                            {m.subject || 'Message from Admin'}
                          </div>
                          <div className="text-sm text-slate-500">
                            From: {m.from?.username || m.from?.email || 'Admin'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 flex-shrink-0 pl-4">
                      {new Date(m.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className={`mt-4 text-sm leading-relaxed ${m.isRead ? 'text-slate-600' : 'text-slate-700'} pl-13`}>
                    {m.body}
                  </div>
                  {!m.isRead && (
                    <div className="mt-4 pl-13">
                      <button 
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-purple-600 font-medium hover:bg-purple-50 transition-all border border-purple-200 shadow-sm hover:shadow" 
                        onClick={() => markRead(m.id)}
                      >
                        Mark as read
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
