import { useState, useMemo } from 'react'
import {
  YStack,
  XStack,
  H1,
  H2,
  Paragraph,
  Button,
  Spinner,
  ScrollView,
  useToastController,
} from '@my/ui'
import { Calendar, Clock, Video, DollarSign, Check, X, User } from '@tamagui/lucide-icons'
import { useAuth } from '../../contexts/auth-context'
import { useLessons, useAcceptLesson, useCancelLesson } from '../../api/hooks/use-lessons'
import { useUserDetails } from '../../api/hooks/use-user'
import type { Lesson } from '../../api/generated/models'

// Tab types
type TabType = 'upcoming' | 'pending' | 'archived'

interface LessonCardProps {
  lesson: Lesson
  currentUserId: string
  userRole: 'STUDENT' | 'TUTOR'
  onAccept?: () => void
  onReject?: () => void
  onCancel?: () => void
  onJoin?: () => void
  isLoading?: boolean
}

function LessonCard({
  lesson,
  currentUserId,
  userRole,
  onAccept,
  onReject,
  onCancel,
  onJoin,
  isLoading,
}: LessonCardProps) {
  const isConfirmed = lesson.status === 'CONFIRMED' || lesson.status === 'ACCEPTED'
  const isPending = lesson.status === 'PENDING'
  const isCancelled = lesson.status === 'CANCELLED' || lesson.status === 'REJECTED'
  const isCompleted = lesson.status === 'COMPLETED'

  // Format date and time
  const lessonDate = lesson.time ? new Date(lesson.time) : null
  const formattedDate = lessonDate
    ? lessonDate.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Unknown date'

  const formattedTime = lessonDate
    ? `${lessonDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })} - ${new Date(lessonDate.getTime() + 60 * 60 * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })}`
    : ''

  // Status badge
  const getStatusBadge = () => {
    if (isConfirmed) {
      return { label: 'CONFIRMED', color: '$green9', bg: '$green4' }
    }
    if (isPending) {
      return { label: 'PENDING', color: '$orange9', bg: '$orange4' }
    }
    if (isCancelled) {
      return { label: 'CANCELLED', color: '$red9', bg: '$red4' }
    }
    if (isCompleted) {
      return { label: 'COMPLETED', color: '$gray9', bg: '$gray4' }
    }
    return { label: lesson.status || 'UNKNOWN', color: '$gray9', bg: '$gray4' }
  }

  const status = getStatusBadge()

  // Check if lesson is in the future (can join)
  const canJoin =
    isConfirmed && lessonDate && lessonDate.getTime() - Date.now() < 5 * 60 * 1000 // 5 minutes before

  // Determine the other person's name based on user role
  const otherPersonName =
    userRole === 'STUDENT'
      ? `${lesson.subjectName || 'Lesson'}${lesson.tutorName ? ` – ${lesson.tutorName}` : ''}`
      : `${lesson.subjectName || 'Lesson'}${lesson.studentName ? ` – ${lesson.studentName}` : ''}`

  return (
    <YStack
      bg="$gray3"
      borderRadius="$4"
      padding="$4"
      gap="$4"
      borderWidth={1}
      borderColor="$borderColor"
    >
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="flex-start">
        <XStack gap="$3" alignItems="center" flex={1}>
          {/* Avatar placeholder */}
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

          <YStack flex={1}>
            <Paragraph fontWeight="600" fontSize="$5" color="$textPrimary">
              {otherPersonName}
            </Paragraph>
            <Paragraph fontSize="$2" color="$textSecondary">
              {formattedDate} • {formattedTime}
            </Paragraph>
          </YStack>
        </XStack>

        {/* Status Badge */}
        <YStack
          backgroundColor={status.bg}
          paddingHorizontal="$3"
          paddingVertical="$1"
          borderRadius="$2"
        >
          <Paragraph fontSize="$1" fontWeight="700" color={status.color}>
            {status.label}
          </Paragraph>
        </YStack>
      </XStack>

      {/* Details */}
      <YStack gap="$3">
        {/* Date */}
        <XStack alignItems="center" gap="$3" bg="$gray4" padding="$3" borderRadius="$3">
          <Calendar size={20} color="$textSecondary" />
          <YStack>
            <Paragraph fontSize="$2" color="$textSecondary">
              Date
            </Paragraph>
            <Paragraph fontWeight="500" color="$textPrimary">
              {formattedDate}
            </Paragraph>
          </YStack>
        </XStack>

        {/* Time */}
        <XStack alignItems="center" gap="$3" bg="$gray4" padding="$3" borderRadius="$3">
          <Clock size={20} color="$textSecondary" />
          <YStack>
            <Paragraph fontSize="$2" color="$textSecondary">
              Time
            </Paragraph>
            <Paragraph fontWeight="500" color="$textPrimary">
              {formattedTime}
            </Paragraph>
          </YStack>
        </XStack>

        {/* Mode - Online/Offline */}
        <XStack alignItems="center" gap="$3" bg="$gray4" padding="$3" borderRadius="$3">
          <Video size={20} color="$textSecondary" />
          <YStack>
            <Paragraph fontSize="$2" color="$textSecondary">
              Mode
            </Paragraph>
            <Paragraph fontWeight="500" color="$textPrimary">
              Online (video)
            </Paragraph>
          </YStack>
        </XStack>

        {/* Cost per hour */}
        {lesson.costPerHour && (
          <XStack alignItems="center" gap="$3" bg="$gray4" padding="$3" borderRadius="$3">
            <DollarSign size={20} color="$textSecondary" />
            <YStack>
              <Paragraph fontSize="$2" color="$textSecondary">
                Rate
              </Paragraph>
              <Paragraph fontWeight="500" color="$textPrimary">
                ${lesson.costPerHour} / hr
              </Paragraph>
            </YStack>
          </XStack>
        )}
      </YStack>

      {/* Actions */}
      {isPending && userRole === 'TUTOR' && (
        <XStack gap="$3">
          <Button
            flex={1}
            size="$4"
            backgroundColor="$green9"
            color="white"
            icon={Check}
            onPress={onAccept}
            disabled={isLoading}
          >
            {isLoading ? <Spinner size="small" color="white" /> : 'Accept'}
          </Button>
          <Button
            flex={1}
            size="$4"
            backgroundColor="$red9"
            color="white"
            icon={X}
            onPress={onReject}
            disabled={isLoading}
          >
            {isLoading ? <Spinner size="small" color="white" /> : 'Reject'}
          </Button>
        </XStack>
      )}

      {isConfirmed && (
        <YStack gap="$3">
          <Button
            size="$4"
            backgroundColor="$orange6"
            color="white"
            icon={Video}
            onPress={onJoin}
            disabled={!canJoin}
            opacity={canJoin ? 1 : 0.6}
          >
            Join
          </Button>
          <Button
            size="$4"
            backgroundColor="$gray5"
            color="$textPrimary"
            icon={Calendar}
            borderWidth={1}
            borderColor="$borderColor"
          >
            Add to calendar
          </Button>
          <Paragraph fontSize="$2" color="$textSecondary" textAlign="center">
            Link will appear 5 minutes before the session.
          </Paragraph>
        </YStack>
      )}

      {isPending && userRole === 'STUDENT' && (
        <YStack gap="$2">
          <Paragraph fontSize="$2" color="$textSecondary" textAlign="center">
            Waiting for tutor confirmation...
          </Paragraph>
          <Button
            size="$3"
            backgroundColor="transparent"
            color="$red10"
            borderWidth={1}
            borderColor="$red6"
            onPress={onCancel}
            disabled={isLoading}
          >
            {isLoading ? <Spinner size="small" color="$red10" /> : 'Cancel booking'}
          </Button>
        </YStack>
      )}
    </YStack>
  )
}

interface TabButtonProps {
  label: string
  isActive: boolean
  onPress: () => void
}

function TabButton({ label, isActive, onPress }: TabButtonProps) {
  return (
    <Button
      size="$3"
      paddingHorizontal="$4"
      backgroundColor={isActive ? '$orange6' : 'transparent'}
      color={isActive ? 'white' : '$textSecondary'}
      borderRadius="$4"
      onPress={onPress}
      fontWeight={isActive ? '600' : '400'}
    >
      {label}
    </Button>
  )
}

export function LessonsScreen() {
  const { userId } = useAuth()
  const toast = useToastController()
  const [activeTab, setActiveTab] = useState<TabType>('upcoming')

  // Get user details to determine role
  const { data: userDetails, isLoading: userLoading } = useUserDetails()
  const userRole: 'STUDENT' | 'TUTOR' = (userDetails?.role as 'STUDENT' | 'TUTOR') || 'STUDENT'

  // Fetch lessons from API
  const {
    data: lessons = [],
    isLoading: lessonsLoading,
    error,
  } = useLessons(userId || '', userRole, !!userId && !!userRole)

  const acceptLessonMutation = useAcceptLesson()
  const cancelLessonMutation = useCancelLesson()

  const isLoading = userLoading || lessonsLoading

  // Filter lessons based on active tab
  const filteredLessons = useMemo(() => {
    const now = new Date()

    return lessons.filter((lesson) => {
      const lessonTime = lesson.time ? new Date(lesson.time) : new Date()
      const isUpcoming = lessonTime > now
      const isPending = lesson.status === 'PENDING'
      const isConfirmed = lesson.status === 'CONFIRMED' || lesson.status === 'ACCEPTED'
      const isArchived =
        lesson.status === 'COMPLETED' ||
        lesson.status === 'CANCELLED' ||
        lesson.status === 'REJECTED' ||
        lessonTime < now

      switch (activeTab) {
        case 'upcoming':
          return isUpcoming && isConfirmed
        case 'pending':
          return isPending
        case 'archived':
          return isArchived
        default:
          return true
      }
    })
  }, [lessons, activeTab])

  const handleAccept = async (lessonId: string) => {
    if (!userId) return
    try {
      await acceptLessonMutation.mutateAsync({
        userId,
        lessonId,
        action: 'CONFIRMED',
      })
      toast.show('Success', { message: 'Lesson has been accepted' })
    } catch (error) {
      toast.show('Error', { message: 'Failed to accept lesson' })
    }
  }

  const handleReject = async (lessonId: string) => {
    if (!userId) return
    try {
      await acceptLessonMutation.mutateAsync({
        userId,
        lessonId,
        action: 'REJECTED',
      })
      toast.show('Success', { message: 'Lesson has been rejected' })
    } catch (error) {
      toast.show('Error', { message: 'Failed to reject lesson' })
    }
  }

  const handleCancel = async (lessonId: string) => {
    if (!userId) return
    try {
      await cancelLessonMutation.mutateAsync({
        userId,
        lessonId,
        role: userRole,
      })
      toast.show('Success', { message: 'Booking has been cancelled' })
    } catch (error) {
      toast.show('Error', { message: 'Failed to cancel booking' })
    }
  }

  const handleJoin = (lessonId: string) => {
    // TODO: Implement video call join functionality
    toast.show('Info', { message: 'Video feature coming soon' })
  }

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" bg="$background">
        <Spinner size="large" color="$orange6" />
        <Paragraph mt="$3" color="$textSecondary">
          Loading lessons...
        </Paragraph>
      </YStack>
    )
  }

  return (
    <YStack flex={1} bg="$background">
      {/* Header */}
      <YStack padding="$4" gap="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <H1 color="$textPrimary" fontSize="$7">
            Lessons
          </H1>

          {/* Tabs */}
          <XStack bg="$gray3" borderRadius="$4" padding="$1" gap="$1">
            <TabButton
              label="Upcoming"
              isActive={activeTab === 'upcoming'}
              onPress={() => setActiveTab('upcoming')}
            />
            <TabButton
              label="Pending"
              isActive={activeTab === 'pending'}
              onPress={() => setActiveTab('pending')}
            />
            <TabButton
              label="Archived"
              isActive={activeTab === 'archived'}
              onPress={() => setActiveTab('archived')}
            />
          </XStack>
        </XStack>

        <YStack>
          <H2 color="$textPrimary" fontSize="$6">
            Your Lessons
          </H2>
          <Paragraph color="$textSecondary" fontSize="$3">
            Manage your meetings and activities
          </Paragraph>
        </YStack>
      </YStack>

      {/* Lessons List */}
      <ScrollView flex={1} padding="$4">
        {filteredLessons.length > 0 ? (
          <YStack gap="$4">
            {filteredLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                currentUserId={userId || ''}
                userRole={userRole}
                onAccept={() => lesson.id && handleAccept(lesson.id)}
                onReject={() => lesson.id && handleReject(lesson.id)}
                onCancel={() => lesson.id && handleCancel(lesson.id)}
                onJoin={() => lesson.id && handleJoin(lesson.id)}
                isLoading={acceptLessonMutation.isPending || cancelLessonMutation.isPending}
              />
            ))}
          </YStack>
        ) : (
          <YStack flex={1} alignItems="center" justifyContent="center" padding="$6" gap="$3">
            <Calendar size={48} color="$gray8" />
            <Paragraph color="$textSecondary" textAlign="center">
              {activeTab === 'upcoming' && 'No upcoming lessons'}
              {activeTab === 'pending' && 'No pending bookings'}
              {activeTab === 'archived' && 'No archived lessons'}
            </Paragraph>
          </YStack>
        )}
      </ScrollView>
    </YStack>
  )
}

