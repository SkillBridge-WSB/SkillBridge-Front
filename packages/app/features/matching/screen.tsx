import { useState, useEffect } from 'react'
import {
  H1,
  H2,
  H3,
  Paragraph,
  YStack,
  XStack,
  Button,
  Spinner,
  ScrollView as TamaguiScrollView,
} from '@my/ui'
import { X, Check, User, MapPin, Clock, Info, Home } from '@tamagui/lucide-icons'
import { useTutors, useSwipe } from '../../api/hooks'
import type { TutorListItemResponse } from '../../api'
import { Image, Platform } from 'react-native'
import { SUBJECTS } from '../../constants/subjects'
import { useRouter } from 'solito/router'

interface TutorCardProps {
  tutor: TutorListItemResponse
  onPass: () => void
  onMatch: () => void
}

function TutorCard({ tutor, onPass, onMatch }: TutorCardProps) {
  // Get subjects for this tutor
  const tutorSubjects =
    tutor.subjects?.map((s) => SUBJECTS.find((sub) => sub.name === s.name)).filter(Boolean) || []
  const primarySubject = tutorSubjects[0]

  return (
    <YStack
      flex={1}
      bg="$surface"
      borderRadius="$6"
      overflow="hidden"
      maxWidth={600}
      width="100%"
      alignSelf="center"
      shadowColor="$shadowColor"
      shadowOffset={{ width: 0, height: 4 }}
      shadowOpacity={0.3}
      shadowRadius={12}
      elevation={8}
    >
      {/* Profile Image */}
      <YStack position="relative" height={400}>
        {tutor.imageUrl ? (
          <Image
            source={{ uri: tutor.imageUrl }}
            style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
          />
        ) : (
          <YStack flex={1} bg="$gray8" alignItems="center" justifyContent="center">
            <User size={80} color="$gray11" />
          </YStack>
        )}

        {/* Badges on image */}
        <YStack position="absolute" bottom={16} left={16} gap="$2">
          <XStack gap="$2">
            <YStack
              bg="rgba(0,0,0,0.7)"
              paddingHorizontal="$3"
              paddingVertical="$2"
              borderRadius="$3"
            >
              <Paragraph color="$color1" fontSize="$3" fontWeight="600">
                Role: Tutor
              </Paragraph>
            </YStack>
            {primarySubject && (
              <YStack
                bg="rgba(0,0,0,0.7)"
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius="$3"
              >
                <Paragraph color="$color1" fontSize="$3" fontWeight="600">
                  {primarySubject.name}
                </Paragraph>
              </YStack>
            )}
          </XStack>
          {primarySubject && (
            <YStack
              bg="rgba(0,0,0,0.7)"
              paddingHorizontal="$3"
              paddingVertical="$2"
              borderRadius="$3"
            >
              <Paragraph color="$color1" fontSize="$3" fontWeight="600">
                Rate: ${primarySubject.costPerHour}/h
              </Paragraph>
            </YStack>
          )}
        </YStack>
      </YStack>

      {/* Content */}
      <TamaguiScrollView flex={1}>
        <YStack padding="$4" gap="$4">
          {/* Name and Status */}
          <XStack alignItems="center" gap="$3" flexWrap="wrap">
            <XStack alignItems="center" gap="$2">
              <User size={20} color="$textPrimary" />
              <H2 color="$textPrimary" fontSize="$7" fontWeight="700">
                {tutor.name || 'Anonymous'}
              </H2>
            </XStack>
            <XStack gap="$2" alignItems="center">
              <YStack width={8} height={8} borderRadius={4} bg="$green9" />
              <Paragraph color="$green9" fontSize="$3" fontWeight="600">
                Online
              </Paragraph>
            </XStack>
          </XStack>

          {/* Bio */}
          {tutor.bio && (
            <YStack gap="$2">
              <H3 color="$textPrimary" fontSize="$5" fontWeight="600">
                Bio
              </H3>
              <Paragraph color="$textSecondary" fontSize="$4" lineHeight="$4">
                {tutor.bio}
              </Paragraph>
            </YStack>
          )}

          {/* Subjects */}
          {tutorSubjects.length > 0 && (
            <YStack gap="$2">
              <H3 color="$textPrimary" fontSize="$5" fontWeight="600">
                Subjects
              </H3>
              <XStack gap="$2" flexWrap="wrap">
                {tutorSubjects.map((subject) => (
                  <YStack
                    key={subject?.id}
                    bg="$orange6"
                    paddingHorizontal="$3"
                    paddingVertical="$2"
                    borderRadius="$3"
                  >
                    <Paragraph color="$color1" fontSize="$3" fontWeight="500">
                      {subject?.name} - ${subject?.costPerHour}/h
                    </Paragraph>
                  </YStack>
                ))}
              </XStack>
            </YStack>
          )}

          {/* Availability from subject data */}
          {tutorSubjects.some((s) => s?.availability) && (
            <YStack gap="$2">
              <H3 color="$textPrimary" fontSize="$5" fontWeight="600">
                Availability
              </H3>
              {tutorSubjects.map((subject) =>
                subject?.availability ? (
                  <XStack key={subject.id} alignItems="center" gap="$2">
                    <Clock size={16} color="$textSecondary" />
                    <Paragraph color="$textSecondary" fontSize="$4">
                      {subject.name}: {subject.availability}
                    </Paragraph>
                  </XStack>
                ) : null
              )}
            </YStack>
          )}
        </YStack>
      </TamaguiScrollView>

      {/* Action Buttons */}
      <XStack
        padding="$4"
        gap="$4"
        justifyContent="center"
        bg="$background"
        borderTopWidth={1}
        borderTopColor="$borderColor"
      >
        <Button
          size="$6"
          circular
          width={70}
          height={70}
          icon={X}
          backgroundColor="$background"
          borderColor="$red10"
          borderWidth={2}
          color="$red10"
          onPress={onPass}
          hoverStyle={{
            backgroundColor: '$red4',
            scale: 1.05,
          }}
          pressStyle={{
            scale: 0.95,
          }}
        />
        <Button
          size="$6"
          circular
          width={70}
          height={70}
          icon={Check}
          backgroundColor="$orange6"
          color="$color1"
          onPress={onMatch}
          hoverStyle={{
            backgroundColor: '$orange7',
            scale: 1.05,
          }}
          pressStyle={{
            scale: 0.95,
          }}
        />
      </XStack>
    </YStack>
  )
}

export function MatchingScreen() {
  const router = useRouter()
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([])
  const [subjectsLoaded, setSubjectsLoaded] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [matches, setMatches] = useState<string[]>([])
  const [passes, setPasses] = useState<string[]>([])

  // Load selected subjects from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('selectedSubjects')
      if (stored) {
        try {
          const ids = JSON.parse(stored) as string[]
          setSelectedSubjectIds(ids)
        } catch (e) {
          console.error('Failed to parse selected subjects:', e)
        }
      }
      setSubjectsLoaded(true)
    }
  }, [])

  // Convert subject IDs to names for API
  const selectedSubjectNames = selectedSubjectIds
    .map((id) => SUBJECTS.find((s) => s.id === id)?.name)
    .filter(Boolean) as string[]

  // Fetch tutors filtered by selected subjects (only after subjects are loaded)
  const {
    data: tutors,
    isLoading,
    error,
  } = useTutors(
    selectedSubjectNames.length > 0 ? selectedSubjectNames : undefined,
    subjectsLoaded // Only enable query after subjects are loaded from localStorage
  )

  // Swipe mutation for sending match/pass to backend
  const { mutate: swipe, isPending: isSwipping } = useSwipe()

  // Filter out already matched/passed tutors
  const availableTutors =
    tutors?.filter(
      (tutor) => !matches.includes(tutor.id || '') && !passes.includes(tutor.id || '')
    ) || []

  const currentTutor = availableTutors[currentIndex]

  const handlePass = () => {
    if (currentTutor?.id) {
      // Send swipe to backend with like=0 (pass)
      swipe(
        { tutorId: currentTutor.id, like: 0 },
        {
          onSuccess: () => {
            console.log('Passed on tutor:', currentTutor.name, '(like=0)')
          },
          onError: (error) => {
            console.warn('Swipe API failed, continuing locally:', error)
          },
        }
      )
      setPasses((prev) => [...prev, currentTutor.id!])
    }
    setCurrentIndex((prev) => prev + 1)
  }

  const handleMatch = () => {
    if (currentTutor?.id) {
      // Send swipe to backend with like=1 (match)
      swipe(
        { tutorId: currentTutor.id, like: 1 },
        {
          onSuccess: () => {
            console.log('Matched with tutor:', currentTutor.name, '(like=1)')
          },
          onError: (error) => {
            console.warn('Swipe API failed, continuing locally:', error)
          },
        }
      )
      setMatches((prev) => [...prev, currentTutor.id!])
    }
    setCurrentIndex((prev) => prev + 1)
  }

  // Reset index when we run out of tutors
  useEffect(() => {
    if (currentIndex >= availableTutors.length && availableTutors.length > 0) {
      setCurrentIndex(0)
    }
  }, [currentIndex, availableTutors.length])

  return (
    <YStack flex={1} bg="$background">
      {/* Header */}
      <YStack padding="$4" bg="$background" borderBottomWidth={1} borderBottomColor="$borderColor">
        <XStack alignItems="center" justifyContent="space-between">
          <H1 color="$textPrimary" fontSize="$8">
            Matching
          </H1>
          <XStack alignItems="center" gap="$2">
            <Info size={20} color="$textSecondary" />
            <Paragraph color="$textSecondary" fontSize="$3">
              {availableTutors.length} tutors available
            </Paragraph>
          </XStack>
        </XStack>
      </YStack>

      {/* Content */}
      <YStack flex={1} padding="$4" justifyContent="center">
        {isLoading ? (
          <YStack alignItems="center" justifyContent="center" gap="$4">
            <Spinner size="large" color="$orange6" />
            <Paragraph color="$textSecondary">Loading tutors...</Paragraph>
          </YStack>
        ) : error ? (
          <YStack alignItems="center" justifyContent="center" gap="$4">
            <Paragraph color="$red10" textAlign="center">
              Failed to load tutors. Please try again.
            </Paragraph>
          </YStack>
        ) : !currentTutor ? (
          <YStack alignItems="center" justifyContent="center" gap="$4" padding="$4">
            <Check size={64} color="$green9" />
            <H2 color="$textPrimary" textAlign="center">
              No More Tutors
            </H2>
            <Paragraph color="$textSecondary" textAlign="center">
              You've seen all available tutors. Check back later for new matches!
            </Paragraph>
            {matches.length > 0 && (
              <Paragraph color="$green9" textAlign="center" marginTop="$4">
                You matched with {matches.length} tutor{matches.length !== 1 ? 's' : ''}!
              </Paragraph>
            )}
            <Button
              marginTop="$4"
              icon={Home}
              onPress={() => router.push('/')}
              backgroundColor="$orange6"
              color="$color1"
            >
              Back to Explore
            </Button>
          </YStack>
        ) : (
          <TutorCard tutor={currentTutor} onPass={handlePass} onMatch={handleMatch} />
        )}
      </YStack>

      {/* Match counter */}
      {matches.length > 0 && currentTutor && (
        <YStack
          position="absolute"
          top={80}
          right={20}
          bg="$green9"
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius="$4"
          zIndex={100}
        >
          <Paragraph color="$color1" fontSize="$3" fontWeight="700">
            {matches.length} Match{matches.length !== 1 ? 'es' : ''}
          </Paragraph>
        </YStack>
      )}
    </YStack>
  )
}
