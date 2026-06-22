export const runtime = 'edge'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { BrandingHead } from '@/components/BrandingHead'
import { ADMIN_API_URL } from '@/lib/api-config'
import { GoogleVerificationScript } from '@/components/GoogleScript'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Classy News',
  description: 'Classy News is a news application and website for reading the latest breaking news, politics, entertainment, sports, and lifestyle stories. Publishers can create, manage, and publish news articles on the Classy News platform.',
}

async function fetchPublisherGoogleTools() {
  const results = { verification: '', ga: '', gtm: '' };
  try {
    const res = await fetch(`${ADMIN_API_URL}/api/settings/public/google_tools`, { next: { revalidate: 60 } });
    if (res.ok) {
      const { data } = await res.json();
      const v = data?.find((s: any) => s.key === 'publisher_google_site_verification');
      const ga = data?.find((s: any) => s.key === 'publisher_ga_measurement_id');
      const gtm = data?.find((s: any) => s.key === 'publisher_gtm_container_id');
      if (v?.value) results.verification = v.value;
      if (ga?.value) results.ga = ga.value;
      if (gtm?.value) results.gtm = gtm.value;
    }
  } catch (e) {
    console.error('Failed to load Publisher Google tool settings:', e);
  }
  return results;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { verification, ga, gtm } = await fetchPublisherGoogleTools();

  return (
    <html lang="en">
      <head>
        <GoogleVerificationScript snippet={verification} />
        {ga && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init-pub" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`}
            </Script>
          </>
        )}
        {gtm && (
          <Script id="gtm-head-pub" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
          </Script>
        )}
      </head>
      <body className={inter.className}>
        {gtm && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtm}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
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
