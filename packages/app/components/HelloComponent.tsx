import React from 'react'
import { useHello } from '../api/hooks/use-hello'
import { Button, Text, YStack, XStack } from '@my/ui'

export function HelloComponent() {
  const { data: helloMessage, isLoading, error, refetch } = useHello()

  if (isLoading) {
    return <Text>Loading hello message...</Text>
  }

  if (error) {
    return <Text>Error loading message: {error.message}</Text>
  }

  return (
    <YStack space="$4" padding="$4">
      <XStack space="$2" alignItems="center">
        <Text fontSize="$6" fontWeight="bold">
          API Hello
        </Text>
        <Button onPress={() => refetch()} size="$3">
          Refresh
        </Button>
      </XStack>

      <YStack padding="$2" backgroundColor="$background" borderRadius="$2">
        <Text>Message: {helloMessage}</Text>
      </YStack>
    </YStack>
  )
}









