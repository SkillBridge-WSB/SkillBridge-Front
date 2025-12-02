import { CalendarScreen } from 'app/features/calendar/screen'
import { AppLayout } from 'app/components'
import Head from 'next/head'

export default function Page() {
  return (
    <>
      <Head>
        <title>Calendar - SkillBridge</title>
      </Head>
      <AppLayout>
        <CalendarScreen />
      </AppLayout>
    </>
  )
}


