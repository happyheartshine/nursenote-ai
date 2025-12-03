import HomePageClient from '@/components/HomePageClient'
import AuthGuard from '@/components/AuthGuard'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <AuthGuard>
      <HomePageClient />
    </AuthGuard>
  )
}

