import { ExploreScreen } from 'app/features/explore/screen'
import { AppLayout } from 'app/components'
import Head from 'next/head'

export default function Page() {
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

