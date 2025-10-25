import React from 'react'
import { useUsers, useCreateUser } from '../hooks/use-users'
import { Button, Text, YStack, XStack } from '@my/ui'

export function UsersList() {
  const { data: users, isLoading, error } = useUsers()
  const createUserMutation = useCreateUser()

  const handleCreateUser = () => {
    createUserMutation.mutate({
      name: 'New User',
      email: 'newuser@example.com',
    })
  }

  if (isLoading) {
    return <Text>Loading users...</Text>
  }

  if (error) {
    return <Text>Error loading users: {error.message}</Text>
  }

  return (
    <YStack space="$4" padding="$4">
      <XStack space="$2" alignItems="center">
        <Text fontSize="$6" fontWeight="bold">
          Users
        </Text>
        <Button onPress={handleCreateUser} disabled={createUserMutation.isPending} size="$3">
          {createUserMutation.isPending ? 'Creating...' : 'Add User'}
        </Button>
      </XStack>

      {users?.map((user) => (
        <YStack key={user.id} padding="$2" backgroundColor="$background" borderRadius="$2">
          <Text fontWeight="bold">{user.name}</Text>
          <Text color="$color">{user.email}</Text>
        </YStack>
      ))}
    </YStack>
  )
}







