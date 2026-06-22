import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/auth/login',
        '/auth/register',
        '/auth/forgot-password'
      ],
      disallow: [
        '/dashboard/',
        '/api/'
      ],
    },
    sitemap: 'https://publisher.classinnews.com/sitemap.xml',
  }
}
