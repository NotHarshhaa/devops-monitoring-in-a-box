import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-simple'
import { LandingPage } from '@/components/landing-page'

export default async function Home() {
  // Avoid blocking the landing page forever if auth/session is slow.
  const session = await Promise.race([
    getServerSession(authOptions),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500))
  ])

  if (session) {
    redirect('/dashboard')
  }

  return <LandingPage />
}
