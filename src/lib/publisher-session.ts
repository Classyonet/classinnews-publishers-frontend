'use client'

import { PUBLISHERS_API_URL } from './api-config'

export type PublisherUser = {
  id: string
  email?: string | null
  username?: string | null
  phoneNumber?: string | null
  role?: string | null
  avatarUrl?: string | null
  isVerified?: boolean
  isActive?: boolean
  createdAt?: string | null
  lastLoginAt?: string | null
}

export const PUBLISHER_AUTH_EVENT = 'publisher-auth-changed'
export const PUBLISHER_SESSION_PLACEHOLDER = '__publisher_session__'

const PUBLISHER_USER_KEY = 'publisher_user'
const LEGACY_PUBLISHER_TOKEN_KEY = 'auth_token'

function notifyPublisherAuthChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(PUBLISHER_AUTH_EVENT))
  }
}

export function getStoredPublisherUser(): PublisherUser | null {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(PUBLISHER_USER_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as PublisherUser
  } catch {
    window.localStorage.removeItem(PUBLISHER_USER_KEY)
    return null
  }
}

export function storePublisherUser(user: PublisherUser) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(PUBLISHER_USER_KEY, JSON.stringify(user))
  window.localStorage.removeItem(LEGACY_PUBLISHER_TOKEN_KEY)
  notifyPublisherAuthChanged()
}

export function clearStoredPublisherSession() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(PUBLISHER_USER_KEY)
  window.localStorage.removeItem(LEGACY_PUBLISHER_TOKEN_KEY)
  notifyPublisherAuthChanged()
}

export async function fetchCurrentPublisher(): Promise<PublisherUser | null> {
  try {
    const response = await fetch(`${PUBLISHERS_API_URL}/api/auth/me`, {
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        clearStoredPublisherSession()
      }
      return null
    }

    const data = await response.json()
    const user = (data?.user || data?.data?.user || data?.data || data) as PublisherUser | undefined
    if (!user?.id) {
      return null
    }

    storePublisherUser(user)
    return user
  } catch {
    return getStoredPublisherUser()
  }
}

export async function logoutPublisherSession() {
  try {
    await fetch(`${PUBLISHERS_API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
  } catch {
    // Clear client state even if the network call fails.
  } finally {
    clearStoredPublisherSession()
  }
}

export async function publisherAuthFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const url = input.startsWith('http://') || input.startsWith('https://')
    ? input
    : `${PUBLISHERS_API_URL}${input.startsWith('/') ? input : `/${input}`}`

  return fetch(url, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init.headers || {}),
    },
  })
}
