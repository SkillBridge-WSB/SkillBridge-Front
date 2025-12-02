import { MatchingScreen } from 'app/features/matching/screen'
import { AppLayout } from 'app/components'
import Head from 'next/head'

export default function Page() {
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

