import { useState, useEffect, useRef } from 'react'
import {
  H1,
  H2,
  H3,
  Paragraph,
  YStack,
  XStack,
  Button,
  Spinner,
  Input,
  ScrollView,
  useToastController,
} from '@my/ui'
import {
  MessageCircle,
  Send,
  User,
  ArrowLeft,
  Users,
  AlertCircle,
  Calendar,
} from '@tamagui/lucide-icons'
import { useMatches } from '../../api/hooks/use-user'
import { useFindChat, useChatMessages, useSendMessage } from '../../api/hooks/use-chat'
import { useWebSocketChat } from '../../api/hooks/use-websocket-chat'
import { useAuth } from '../../contexts/auth-context'
import { BookingModal } from '../../components/BookingModal'
import type { User as UserType, ChatMessageResponse } from '../../api/generated/models'
import { Image, Platform, KeyboardAvoidingView } from 'react-native'

interface MatchCardProps {
  match: UserType
  onSelect: () => void
  isSelected: boolean
}

function MatchCard({ match, onSelect, isSelected }: MatchCardProps) {
  return (
    <XStack
      padding="$3"
      gap="$3"
      alignItems="center"
      backgroundColor={isSelected ? '$orange3' : '$background'}
      borderRadius="$3"
      borderWidth={1}
      borderColor={isSelected ? '$orange6' : '$borderColor'}
      hoverStyle={{ backgroundColor: '$backgroundHover' }}
      pressStyle={{ opacity: 0.8 }}
      cursor="pointer"
      onPress={onSelect}
    >
      {match.imageUrl ? (
        <Image
          source={{ uri: match.imageUrl }}
          style={{ width: 48, height: 48, borderRadius: 24 }}
        />
      ) : (
        <YStack
          width={48}
          height={48}
          borderRadius={24}
          backgroundColor="$gray6"
          alignItems="center"
          justifyContent="center"
        >
          <User size={24} color="$gray10" />
        </YStack>
      )}
      <YStack flex={1} gap="$1">
        <Paragraph color="$textPrimary" fontWeight="600" fontSize="$4">
          {match.name || 'Unknown User'}
        </Paragraph>
        <Paragraph color="$textSecondary" fontSize="$2" numberOfLines={1}>
          {match.role === 'TUTOR' ? 'Tutor' : 'Student'}
        </Paragraph>
      </YStack>
    </XStack>
  )
}

interface ChatViewProps {
  match: UserType
  onBack: () => void
}

function ChatView({ match, onBack }: ChatViewProps) {
  const { userId } = useAuth()
  const [message, setMessage] = useState('')
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const scrollViewRef = useRef<any>(null)
  const toast = useToastController()

  // Show booking button only if the match is a tutor
  const canBookLesson = match.role === 'TUTOR'

  // Determine student/tutor IDs based on current user role
  // If I'm a student, the match is a tutor. If I'm a tutor, the match is a student.
  const isMatchTutor = match.role === 'TUTOR'
  const studentId = isMatchTutor ? userId! : match.id!
  const tutorId = isMatchTutor ? match.id! : userId!

  // Find or create chat
  const { data: chat, isLoading: isChatLoading } = useFindChat(
    studentId,
    tutorId,
    !!userId && !!match.id
  )

  // Get messages for the chat (with polling as WebSocket fallback)
  const { data: messages, isLoading: isMessagesLoading } = useChatMessages(
    chat?.chatId || '',
    !!chat?.chatId
  )

  // WebSocket connection for real-time messaging
  const { isConnected } = useWebSocketChat({
    chatId: chat?.chatId,
    enabled: !!chat?.chatId && !!userId,
  })

  // Send message mutation with optimistic updates
  const sendMessageMutation = useSendMessage(chat?.chatId)

  // Determine receiver ID (the other person in the chat)
  const receiverId = match.id!

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current && messages?.length) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd?.({ animated: true })
      }, 100)
    }
  }, [messages?.length])

  const handleSend = async () => {
    if (!message.trim() || !userId || !chat?.chatId) return

    const messageText = message.trim()
    setMessage('') // Clear immediately for better UX

    try {
      await sendMessageMutation.mutateAsync({
        senderId: userId,
        receiverId,
        message: messageText,
      })
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessage(messageText) // Restore message on error
      toast.show('Failed to send message', {
        message: 'Please try again',
      })
    }
  }

  const isLoading = isChatLoading || isMessagesLoading
  const isSending = sendMessageMutation.isPending

  return (
    <YStack flex={1} bg="$background">
      {/* Chat Header */}
      <XStack
        padding="$4"
        gap="$3"
        alignItems="center"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
        bg="$background"
      >
        <Button
          icon={ArrowLeft}
          size="$3"
          circular
          chromeless
          onPress={onBack}
          $gtSm={{ display: 'none' }}
        />
        {match.imageUrl ? (
          <Image
            source={{ uri: match.imageUrl }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
        ) : (
          <YStack
            width={40}
            height={40}
            borderRadius={20}
            backgroundColor="$gray6"
            alignItems="center"
            justifyContent="center"
          >
            <User size={20} color="$gray10" />
          </YStack>
        )}
        <YStack flex={1}>
          <XStack alignItems="center" gap="$2">
            <Paragraph color="$textPrimary" fontWeight="600" fontSize="$5">
              {match.name || 'Unknown User'}
            </Paragraph>
            <YStack
              width={8}
              height={8}
              borderRadius={4}
              bg={isConnected ? '$green9' : '$yellow9'}
            />
          </XStack>
          <Paragraph color="$textSecondary" fontSize="$2">
            {match.role === 'TUTOR' ? 'Tutor' : 'Student'}
            {!isConnected && ' • Live updates paused'}
          </Paragraph>
        </YStack>

        {/* Book Lesson Button - only visible for tutors */}
        {canBookLesson && (
          <Button
            icon={Calendar}
            size="$3"
            backgroundColor="$orange6"
            color="white"
            borderRadius="$3"
            onPress={() => setBookingModalOpen(true)}
          >
            Book
          </Button>
        )}
      </XStack>

      {/* Booking Modal */}
      {canBookLesson && match.id && (
        <BookingModal
          open={bookingModalOpen}
          onOpenChange={setBookingModalOpen}
          tutorId={match.id}
          tutorName={match.name || 'Unknown'}
        />
      )}

      {/* Messages */}
      <ScrollView ref={scrollViewRef} flex={1} padding="$4" contentContainerStyle={{ flexGrow: 1 }}>
        {isLoading ? (
          <YStack flex={1} alignItems="center" justifyContent="center">
            <Spinner size="large" color="$orange6" />
          </YStack>
        ) : messages && messages.length > 0 ? (
          <YStack gap="$3">
            {messages.map((msg) => (
              <MessageBubble key={msg.messageId} message={msg} isOwn={msg.senderId === userId} />
            ))}
          </YStack>
        ) : (
          <YStack flex={1} alignItems="center" justifyContent="center" gap="$3">
            <MessageCircle size={48} color="$gray8" />
            <Paragraph color="$textSecondary" textAlign="center">
              No messages yet.{'\n'}Start the conversation!
            </Paragraph>
          </YStack>
        )}
      </ScrollView>

      {/* Message Input */}
      <XStack
        padding="$3"
        gap="$2"
        borderTopWidth={1}
        borderTopColor="$borderColor"
        bg="$background"
      >
        <Input
          flex={1}
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
          onSubmitEditing={handleSend}
          backgroundColor="$backgroundFocus"
          borderColor="$borderColor"
          editable={!isSending}
        />
        <Button
          icon={isSending ? undefined : Send}
          size="$4"
          circular
          backgroundColor="$orange6"
          color="$color1"
          onPress={handleSend}
          disabled={!message.trim() || isSending}
          opacity={message.trim() && !isSending ? 1 : 0.5}
        >
          {isSending && <Spinner size="small" color="$color1" />}
        </Button>
      </XStack>
    </YStack>
  )
}

interface MessageBubbleProps {
  message: ChatMessageResponse
  isOwn: boolean
}

function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const timestamp = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <XStack justifyContent={isOwn ? 'flex-end' : 'flex-start'}>
      <YStack
        maxWidth="75%"
        padding="$3"
        borderRadius="$4"
        backgroundColor={isOwn ? '$orange6' : '$gray4'}
        gap="$1"
      >
        <Paragraph color={isOwn ? '$color1' : '$textPrimary'} fontSize="$4">
          {message.message}
        </Paragraph>
        <Paragraph color={isOwn ? '$orange2' : '$textSecondary'} fontSize="$1" textAlign="right">
          {timestamp}
        </Paragraph>
      </YStack>
    </XStack>
  )
}

export function ChatScreen() {
  const [selectedMatch, setSelectedMatch] = useState<UserType | null>(null)
  const { userId } = useAuth()
  const { data: matches, isLoading, error } = useMatches()

  // On larger screens, show split view
  // On mobile, show either list or chat

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" bg="$background">
        <Spinner size="large" color="$orange6" />
        <Paragraph mt="$3" color="$textSecondary">
          Loading conversations...
        </Paragraph>
      </YStack>
    )
  }

  if (error) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" gap="$4" p="$4" bg="$background">
        <H2 color="$red10">Error</H2>
        <Paragraph color="$textSecondary" textAlign="center">
          Failed to load matches. Please try again.
        </Paragraph>
      </YStack>
    )
  }

  // Mobile: show either list or chat
  if (selectedMatch && Platform.OS !== 'web') {
    return <ChatView match={selectedMatch} onBack={() => setSelectedMatch(null)} />
  }

  return (
    <XStack flex={1} bg="$background">
      {/* Matches List */}
      <YStack
        flex={1}
        maxWidth={Platform.OS === 'web' ? 320 : undefined}
        borderRightWidth={Platform.OS === 'web' ? 1 : 0}
        borderRightColor="$borderColor"
        $sm={{
          display: selectedMatch ? 'none' : 'flex',
          maxWidth: '100%',
        }}
      >
        {/* Header */}
        <YStack padding="$4" borderBottomWidth={1} borderBottomColor="$borderColor">
          <H1 color="$textPrimary" fontSize="$7">
            Chats
          </H1>
          <Paragraph color="$textSecondary" fontSize="$3">
            {matches?.length || 0} conversation{matches?.length !== 1 ? 's' : ''}
          </Paragraph>
        </YStack>

        {/* Matches List */}
        <ScrollView flex={1} padding="$3">
          {matches && matches.length > 0 ? (
            <YStack gap="$2">
              {matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onSelect={() => setSelectedMatch(match)}
                  isSelected={selectedMatch?.id === match.id}
                />
              ))}
            </YStack>
          ) : (
            <YStack flex={1} alignItems="center" justifyContent="center" padding="$6" gap="$3">
              <Users size={48} color="$gray8" />
              <Paragraph color="$textSecondary" textAlign="center">
                No matches yet.{'\n'}Start swiping to find tutors!
              </Paragraph>
            </YStack>
          )}
        </ScrollView>
      </YStack>

      {/* Chat View (Web only - for split view) */}
      {Platform.OS === 'web' && (
        <YStack
          flex={2}
          $sm={{
            display: selectedMatch ? 'flex' : 'none',
            flex: 1,
          }}
        >
          {selectedMatch ? (
            <ChatView match={selectedMatch} onBack={() => setSelectedMatch(null)} />
          ) : (
            <YStack flex={1} alignItems="center" justifyContent="center" gap="$4">
              <MessageCircle size={64} color="$gray6" />
              <Paragraph color="$textSecondary" textAlign="center" fontSize="$5">
                Select a conversation to start chatting
              </Paragraph>
            </YStack>
          )}
        </YStack>
      )}
    </XStack>
  )
}
