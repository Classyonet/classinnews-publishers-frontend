export const runtime = 'edge'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { BrandingHead } from '@/components/BrandingHead'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Classy News',
  description: 'Classy News is a news application and website for reading the latest breaking news, politics, entertainment, sports, and lifestyle stories. Publishers can create, manage, and publish news articles on the Classy News platform.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BrandingHead />
        <Providers>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}













