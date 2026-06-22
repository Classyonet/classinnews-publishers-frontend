import { PUBLISHERS_API_URL } from './api-config'
import {
  clearStoredPublisherSession,
  getStoredPublisherUser,
  PUBLISHER_SESSION_PLACEHOLDER,
} from './publisher-session'

const RAW_API_URL = PUBLISHERS_API_URL
export const API_URL = RAW_API_URL.replace(/\/+$/, '') // Remove trailing slashes

export async function apiFetch(path: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }

  const fullUrl = `${API_URL}${path}`

  const res = await fetch(fullUrl, {
    ...options,
    credentials: 'include',
    headers
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `API error: ${res.status}`)
  }

  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return res.json()
  return res.text()
}

export function setAuthHeader(token?: string) {
  const headers: Record<string, string> = {}
  if (token && token !== PUBLISHER_SESSION_PLACEHOLDER) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

// Legacy compatibility helpers during the cookie-session migration.
export function setToken(_token: string) {
  // Session is now managed by an httpOnly cookie.
}

export function getToken(): string | null {
  return getStoredPublisherUser() ? PUBLISHER_SESSION_PLACEHOLDER : null
}

export function removeToken() {
  clearStoredPublisherSession()
}

async function publisherApiRequest(path: string, options: RequestInit = {}) {
  const token = getToken()
  const hasFormDataBody =
    typeof FormData !== 'undefined' && options.body instanceof FormData

  const headers: Record<string, string> = {
    ...(!hasFormDataBody ? { 'Content-Type': 'application/json' } : {}),
    ...setAuthHeader(token || undefined),
    ...((options.headers || {}) as Record<string, string>),
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  })

  const contentType = response.headers.get('content-type') || ''

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredPublisherSession()
    }

    if (contentType.includes('application/json')) {
      const error = await response.json()
      throw new Error(error.message || 'Request failed')
    }

    const text = await response.text()
    throw new Error(text || `Request failed: ${response.status}`)
  }

  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

// Auth API
export const authAPI = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      const err: any = new Error(error.message || 'Login failed')
      err.code = error.code // Preserve error code for special handling
      throw err
    }

    const data = await response.json()
    return data.user ? data : { ...data, user: data.data?.user || data.user }
  },

  async register(email: string, username: string, password: string) {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, username, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Registration failed')
    }

    const data = await response.json()
    return data
  },

  async me() {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user data')
    }

    const data = await response.json()
    return data.data || data.user || data
  },
}

// Articles API
export const articlesAPI = {
  async getAll() {
    const data = await publisherApiRequest('/api/articles')
    return data.data || data
  },

  async getOne(id: string) {
    const data = await publisherApiRequest(`/api/articles/${id}`)
    return data.data || data
  },

  async create(articleData: any) {
    const data = await publisherApiRequest('/api/articles', {
      method: 'POST',
      body: JSON.stringify(articleData),
    })
    return data.data || data
  },

  async update(id: string, articleData: any) {
    const data = await publisherApiRequest(`/api/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(articleData),
    })
    return data.data || data
  },

  async delete(id: string) {
    await publisherApiRequest(`/api/articles/${id}`, {
      method: 'DELETE',
    })
    return true
  },
}

// Dashboard API
export const dashboardAPI = {
  async getStats() {
    const data = await publisherApiRequest('/api/dashboard/stats')
    return data
  },
}

// Settings API
export const settingsAPI = {
  async getPublicSettings(category: string) {
    const data = await apiFetch(`/api/settings/public/${category}?_t=${Date.now()}`, {
      cache: 'no-store'
    })
    return data.data || data
  },
}

// Categories API
export const categoriesAPI = {
  async getAll() {
    const data = await publisherApiRequest('/api/categories', {
      credentials: 'include',
    })
    return data.data || data
  },
}

// Media API
export const mediaAPI = {
  async getAll() {
    const data = await publisherApiRequest('/api/media')
    return data.data || data
  },

  async upload(file: File, metadata?: any) {
    const formData = new FormData()
    formData.append('file', file)
    if (metadata) {
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key])
      })
    }

    const data = await publisherApiRequest('/api/media/upload', {
      method: 'POST',
      body: formData,
    })
    return data.data || data
  },

  async delete(id: string) {
    await publisherApiRequest(`/api/media/${id}`, {
      method: 'DELETE',
    })
    return true
  },

  async update(id: string, metadata: any) {
    const data = await publisherApiRequest(`/api/media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(metadata),
    })
    return data.data || data
  },
}

export default apiFetch
