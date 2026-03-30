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
  return token && token !== PUBLISHER_SESSION_PLACEHOLDER ? { Authorization: `Bearer ${token}` } : {}
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
    const token = getToken()
    const response = await fetch(`${API_URL}/api/articles`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch articles')
    }

    const data = await response.json()
    return data.data || data
  },

  async getOne(id: string) {
    const token = getToken()
    const response = await fetch(`${API_URL}/api/articles/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch article')
    }

    const data = await response.json()
    return data.data || data
  },

  async create(articleData: any) {
    const token = getToken()
    const response = await fetch(`${API_URL}/api/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(articleData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create article')
    }

    const data = await response.json()
    return data.data || data
  },

  async update(id: string, articleData: any) {
    const token = getToken()
    const response = await fetch(`${API_URL}/api/articles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(articleData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update article')
    }

    const data = await response.json()
    return data.data || data
  },

  async delete(id: string) {
    const token = getToken()
    const response = await fetch(`${API_URL}/api/articles/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to delete article')
    }

    return true
  },
}

// Dashboard API
export const dashboardAPI = {
  async getStats() {
    const token = getToken()
    const response = await fetch(`${API_URL}/api/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch dashboard stats')
    }

    const data = await response.json()
    return data
  },
}

// Categories API
export const categoriesAPI = {
  async getAll() {
    const response = await fetch(`${API_URL}/api/categories`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch categories')
    }

    const data = await response.json()
    return data.data || data
  },
}

// Media API
export const mediaAPI = {
  async getAll() {
    const token = getToken()
    const response = await fetch(`${API_URL}/api/media`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch media')
    }

    const data = await response.json()
    return data.data || data
  },

  async upload(file: File, metadata?: any) {
    const token = getToken()
    const formData = new FormData()
    formData.append('file', file)
    if (metadata) {
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key])
      })
    }

    const response = await fetch(`${API_URL}/api/media/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to upload media')
    }

    const data = await response.json()
    return data.data || data
  },

  async delete(id: string) {
    const token = getToken()
    const response = await fetch(`${API_URL}/api/media/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to delete media')
    }

    return true
  },

  async update(id: string, metadata: any) {
    const token = getToken()
    const response = await fetch(`${API_URL}/api/media/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(metadata),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update media')
    }

    const data = await response.json()
    return data.data || data
  },
}

export default apiFetch
