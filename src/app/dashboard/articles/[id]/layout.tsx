// This file is required for static export with dynamic routes
// Since we can't know article IDs at build time, we return empty array
// and handle the dynamic routing client-side

export function generateStaticParams() {
  return []
}

export const dynamicParams = true

export default function ArticleEditLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
