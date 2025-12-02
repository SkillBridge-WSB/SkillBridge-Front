import { useState } from 'react'
import { H1, H2, H3, Paragraph, YStack, XStack, Button, Input, Spinner } from '@my/ui'
import { Search, Star, Plus, Check } from '@tamagui/lucide-icons'
import { useSubjects, useCurrentUser } from '../../api/hooks'
import type { Subject } from '../../constants/subjects'
import { ScrollView, Platform } from 'react-native'
import { useRouter } from 'solito/navigation'

interface SubjectCardProps {
  subject: Subject
  isSelected: boolean
  onToggle: () => void
}

function SubjectCard({ subject, isSelected, onToggle }: SubjectCardProps) {
  return (
    <YStack
      bg="$surface"
      borderRadius="$4"
      padding="$4"
      gap="$3"
      width="100%"
      maxWidth={400}
      borderWidth={1}
      borderColor="$borderColor"
      hoverStyle={{
        borderColor: '$orange6',
        shadowColor: '$orange6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      }}
      pressStyle={{
        scale: 0.98,
      }}
      animation="quick"
    >
      {/* Header with name and tag */}
      <XStack justifyContent="space-between" alignItems="center">
        <H3 color="$textPrimary" fontSize="$6" fontWeight="600">
          {subject.name}
        </H3>
        <XStack
          bg={subject.tagColor}
          paddingHorizontal="$3"
          paddingVertical="$1"
          borderRadius="$2"
        >
          <Paragraph fontSize="$2" color="$color1" fontWeight="500">
            {subject.tag}
          </Paragraph>
        </XStack>
      </XStack>

      {/* Description */}
      <Paragraph color="$textSecondary" fontSize="$3" lineHeight="$3">
        {subject.description}
      </Paragraph>

      {/* Footer with rating and action button */}
      <XStack justifyContent="space-between" alignItems="center" marginTop="$2">
        {/* Rating */}
        <XStack alignItems="center" gap="$2">
          <Star size={16} color="#FFA500" fill="#FFA500" />
          <Paragraph color="$textPrimary" fontWeight="600">
            {subject.rating.toFixed(1)}
          </Paragraph>
        </XStack>

        {/* Action button */}
        <Button
          onPress={onToggle}
          size="$3"
          backgroundColor={isSelected ? '$orange6' : 'transparent'}
          color={isSelected ? '$color1' : '$orange6'}
          borderColor="$orange6"
          borderWidth={1}
          icon={isSelected ? Check : Plus}
          fontWeight="600"
          hoverStyle={{
            backgroundColor: isSelected ? '$orange7' : '$orange2',
            opacity: 1,
          }}
          pressStyle={{
            scale: 0.95,
          }}
        >
          {isSelected ? 'Selected' : 'Add'}
        </Button>
      </XStack>

      {/* Cost info */}
      <XStack justifyContent="flex-end" marginTop="$1">
        <Paragraph fontSize="$2" color="$textSecondary">
          From ${subject.costPerHour}/hr
        </Paragraph>
      </XStack>
    </YStack>
  )
}

export function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set())
  const { data: subjects, isLoading, error } = useSubjects()
  const { data: currentUser } = useCurrentUser()
  const router = useRouter()

  // Tutors should not see the matching functionality
  const isStudent = currentUser?.role?.toLowerCase() !== 'tutor'

  // Filter subjects based on search
  const filteredSubjects = subjects?.filter((subject) =>
    subject.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(subjectId)) {
        newSet.delete(subjectId)
      } else {
        newSet.add(subjectId)
      }
      return newSet
    })
  }

  return (
    <YStack flex={1} bg="$background">
      {/* Header Section */}
      <YStack padding="$4" gap="$4" bg="$background" borderBottomWidth={1} borderBottomColor="$borderColor">
        {/* Title and Search */}
        <YStack gap="$3">
          <XStack justifyContent="space-between" alignItems="center">
            <YStack>
              <H1 color="$textPrimary" fontSize="$9">
                Explore Subjects
              </H1>
              <Paragraph color="$textSecondary">
                Find tutors and subjects
              </Paragraph>
            </YStack>
            {isStudent && selectedSubjects.size > 0 && (
              <Button
                size="$4"
                backgroundColor="$orange6"
                color="$color1"
                onPress={() => {
                  // Store selected subjects for matching screen
                  if (Platform.OS === 'web' && typeof window !== 'undefined') {
                    window.localStorage.setItem('selectedSubjects', JSON.stringify(Array.from(selectedSubjects)))
                  }
                  console.log('Find tutors for:', Array.from(selectedSubjects))
                  // Navigate to matching screen
                  router.push('/matching')
                }}
              >
                Find Tutors ({selectedSubjects.size})
              </Button>
            )}
          </XStack>

          {/* Search Input */}
          <XStack
            bg="$surface"
            borderRadius="$3"
            borderWidth={1}
            borderColor="$borderColor"
            paddingHorizontal="$3"
            paddingVertical="$2"
            alignItems="center"
            gap="$2"
          >
            <Search size={20} color="$textSecondary" />
            <Input
              placeholder="Search subjects..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              flex={1}
              borderWidth={0}
              backgroundColor="transparent"
              color="$textPrimary"
              placeholderTextColor="$textSecondary"
            />
          </XStack>
        </YStack>
      </YStack>

      {/* Content Area */}
      <ScrollView style={{ flex: 1 }}>
        <YStack padding="$4" gap="$4">
          {isLoading ? (
            <YStack flex={1} justify="center" items="center" paddingVertical="$8">
              <Spinner size="large" color="$orange6" />
              <Paragraph color="$textSecondary" marginTop="$4">
                Loading subjects...
              </Paragraph>
            </YStack>
          ) : error ? (
            <YStack flex={1} justify="center" items="center" paddingVertical="$8">
              <Paragraph color="$red10" textAlign="center">
                Failed to load subjects. Please try again.
              </Paragraph>
            </YStack>
          ) : !filteredSubjects || filteredSubjects.length === 0 ? (
            <YStack flex={1} justify="center" items="center" paddingVertical="$8">
              <Paragraph color="$textSecondary" textAlign="center">
                {searchQuery ? 'No subjects found matching your search.' : 'No subjects available.'}
              </Paragraph>
            </YStack>
          ) : (
            <>
              {/* Results count */}
              <Paragraph color="$textSecondary">
                Showing {filteredSubjects.length} subject{filteredSubjects.length !== 1 ? 's' : ''}
              </Paragraph>

              {/* Subject cards grid */}
              <XStack flexWrap="wrap" gap="$4" justifyContent="flex-start">
                {filteredSubjects.map((subject) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    isSelected={selectedSubjects.has(subject.id || '')}
                    onToggle={() => toggleSubject(subject.id || '')}
                  />
                ))}
              </XStack>
            </>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
}

