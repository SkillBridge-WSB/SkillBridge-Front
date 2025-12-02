import { ExploreScreen } from 'app/features/explore/screen'
import { LessonsScreen } from 'app/features/lessons/screen'
import { AuthScreen } from 'app/features/auth/auth-screen'
import { AppLayout } from 'app/components'
import { useAuth } from 'app/contexts/auth-context'
import { useUserDetails } from 'app/api/hooks'
import Head from 'next/head'
import { Spinner, YStack } from '@my/ui'

export default function Page() {
  const { isAuthenticated, isLoading } = useAuth()
  const { data: userDetails, isLoading: userLoading } = useUserDetails(isAuthenticated)

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

  // Show loading while fetching user details
  if (userLoading) {
    return (
      <AppLayout>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" color="$orange6" />
        </YStack>
      </AppLayout>
    )
  }

  const isTutor = userDetails?.role === 'TUTOR'

  // Tutors see Lessons as their home, Students see Explore
  return (
    <>
      <Head>
        <title>{isTutor ? 'Lessons' : 'Explore'}</title>
      </Head>
      <AppLayout>
        {isTutor ? <LessonsScreen /> : <ExploreScreen />}
      </AppLayout>
    </>
  )
}
