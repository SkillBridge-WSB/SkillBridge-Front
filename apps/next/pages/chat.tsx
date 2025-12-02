import { ChatScreen } from 'app/features/chat/screen'
import { AppLayout } from 'app/components'
import Head from 'next/head'

export default function Page() {
  return (
    <>
      <Head>
        <title>Chat</title>
      </Head>
      <AppLayout>
        <ChatScreen />
      </AppLayout>
    </>
  )
}

