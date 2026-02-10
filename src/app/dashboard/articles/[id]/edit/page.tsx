import EditArticlePage from './ClientContent'

export async function generateStaticParams() {
  return [{ id: '_placeholder' }]
}

export default function Page() {
  return <EditArticlePage />
}
