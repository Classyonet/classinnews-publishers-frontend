/**
 * Helper function to get the full URL for uploaded media files
 * @param fileUrl - The file URL from the database (e.g., "/uploads/file-123.jpg")
 * @returns Full URL (e.g., "http://localhost:3003/uploads/file-123.jpg")
 */
export function getMediaUrl(fileUrl: string | null | undefined): string {
  if (!fileUrl) return ''
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'
  
  // If the URL already includes http, return as is
  if (fileUrl.startsWith('http')) {
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
