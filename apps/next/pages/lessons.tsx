import { LessonsScreen } from 'app/features/lessons/screen'
import { AppLayout } from 'app/components'
import Head from 'next/head'

export default function Page() {
  return (
    <>
      <Head>
        <title>Lessons</title>
      </Head>
      <AppLayout>
        <LessonsScreen />
      </AppLayout>
    </>
  )
}




