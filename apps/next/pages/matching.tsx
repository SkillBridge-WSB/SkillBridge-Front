import { MatchingScreen } from 'app/features/matching/screen'
import { AppLayout } from 'app/components'
import Head from 'next/head'
import { useCurrentUser } from 'app/api/hooks'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { Spinner, YStack } from '@my/ui'

export default function Page() {
  const { data: currentUser, isLoading } = useCurrentUser()
  const router = useRouter()

  // Redirect tutors away from matching
  useEffect(() => {
    if (!isLoading && currentUser?.role === 'tutor') {
      router.replace('/chat')
    }
  }, [currentUser, isLoading, router])

  // Show loading while checking user role
  if (isLoading || currentUser?.role === 'tutor') {
    return (
      <AppLayout>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" color="$orange6" />
        </YStack>
      </AppLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Matching</title>
      </Head>
      <AppLayout>
        <MatchingScreen />
      </AppLayout>
    </>
  )
}

