import { ProfileScreen } from 'app/features/profile/screen'
import { AppLayout } from 'app/components'
import Head from 'next/head'

export default function Page() {
  return (
    <>
      <Head>
        <title>Profile</title>
      </Head>
      <AppLayout>
        <ProfileScreen />
      </AppLayout>
    </>
  )
}

