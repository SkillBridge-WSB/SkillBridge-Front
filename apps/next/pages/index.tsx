import { ExploreScreen } from 'app/features/explore/screen'
import { AuthScreen } from 'app/features/auth/auth-screen'
import { AppLayout } from 'app/components'
import { useAuth } from 'app/contexts/auth-context'
import Head from 'next/head'

export default function Page() {
  const { isAuthenticated, isLoading } = useAuth()

  // Show loading state
  if (isLoading) {
    return null
  }

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>SkillBridge - Login</title>
        </Head>
        <AuthScreen />
      </>
    )
  }

  // Show explore screen if authenticated
  return (
    <>
      <Head>
        <title>Explore</title>
      </Head>
      <AppLayout>
        <ExploreScreen />
      </AppLayout>
    </>
  )
}
