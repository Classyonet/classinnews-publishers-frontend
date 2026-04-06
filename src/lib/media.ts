import { PUBLISHERS_API_URL } from './api-config'

const LEGACY_UPLOAD_HOSTS = new Set([
  'publishers-api.147.93.53.76.sslip.io',
  'publisher-api.147.93.53.76.sslip.io',
  'publishers-api.classinnews.com',
  'publisher-api.classinnews.com',
])

/**
 * Helper function to get the full URL for uploaded media files
 * @param fileUrl - The file URL from the database (e.g., "/uploads/file-123.jpg")
 * @returns Full URL (e.g., "http://localhost:3003/uploads/file-123.jpg")
 */
export function getMediaUrl(fileUrl: string | null | undefined): string {
  if (!fileUrl) return ''
  
  const API_URL = PUBLISHERS_API_URL
  
  if (fileUrl.startsWith('http')) {
    try {
      const parsedUrl = new URL(fileUrl)

      if (
        parsedUrl.pathname.startsWith('/uploads/') &&
        LEGACY_UPLOAD_HOSTS.has(parsedUrl.hostname.toLowerCase())
      ) {
        return `${API_URL}${parsedUrl.pathname}`
      }
    } catch {
      return fileUrl
    }

    return fileUrl
  }
  
  // Remove leading slash if present, then add it back with API_URL
  const cleanPath = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`
  return `${API_URL}${cleanPath}`
}

/**
 * Helper function to check if a file URL is an image
 */
export function isImageFile(fileUrl: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
  return imageExtensions.some(ext => fileUrl.toLowerCase().endsWith(ext))
}

/**
 * Helper function to check if a file URL is a video
 */
export function isVideoFile(fileUrl: string): boolean {
  const videoExtensions = ['.mp4', '.mov', '.avi', '.webm']
  return videoExtensions.some(ext => fileUrl.toLowerCase().endsWith(ext))
}
