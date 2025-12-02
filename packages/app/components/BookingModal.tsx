import { useState, useMemo } from 'react'
import {
  YStack,
  XStack,
  Button,
  H2,
  Paragraph,
  Sheet,
  Spinner,
  ScrollView,
  useToastController,
} from '@my/ui'
import { X, ChevronLeft, ChevronRight, Calendar, Clock, HelpCircle } from '@tamagui/lucide-icons'
import { useTutorAvailableSlots } from '../api/hooks/use-calendar'
import { useSubjectsByTutor } from '../api/hooks/use-subjects'
import { useBookLesson } from '../api/hooks/use-lessons'
import { useAuth } from '../contexts/auth-context'
import type { CalendarSlot, Subject } from '../api/generated/models'

interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tutorId: string
  tutorName: string
}

// Day names in English
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export function BookingModal({ open, onOpenChange, tutorId, tutorName }: BookingModalProps) {
  const { userId } = useAuth()
  const toast = useToastController()

  // Current month/year for calendar navigation
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)

  // Calculate date range for fetching slots (current month view)
  const { startOfMonth, endOfMonth } = useMemo(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59)
    return { startOfMonth: start, endOfMonth: end }
  }, [currentDate])

  // Fetch available slots for the tutor
  const {
    data: slots,
    isLoading: slotsLoading,
    error: slotsError,
  } = useTutorAvailableSlots(tutorId, startOfMonth, endOfMonth, open && !!tutorId)

  // Fetch tutor's subjects
  const { data: subjects, isLoading: subjectsLoading } = useSubjectsByTutor(
    tutorId,
    open && !!tutorId
  )

  // Book lesson mutation
  const bookLessonMutation = useBookLesson()

  // Group slots by date for easy lookup
  const slotsByDate = useMemo(() => {
    if (!slots) return new Map<string, CalendarSlot[]>()
    const map = new Map<string, CalendarSlot[]>()
    for (const slot of slots) {
      if (slot.lessonTime && slot.available) {
        const dateKey = new Date(slot.lessonTime).toDateString()
        const existing = map.get(dateKey) || []
        existing.push(slot)
        map.set(dateKey, existing)
      }
    }
    return map
  }, [slots])

  // Get slots for the selected date
  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return []
    return slotsByDate.get(selectedDate.toDateString()) || []
  }, [selectedDate, slotsByDate])

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)

    // Start from Monday (adjust for weeks starting on Monday)
    let startDay = firstDay.getDay() - 1
    if (startDay < 0) startDay = 6

    const days: (Date | null)[] = []

    // Add empty cells for days before the first day
    for (let i = 0; i < startDay; i++) {
      const prevMonthDay = new Date(year, month, -startDay + i + 1)
      days.push(prevMonthDay)
    }

    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    // Add days from next month to complete the grid
    const remaining = 42 - days.length // 6 rows * 7 days
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i))
    }

    return days
  }, [currentDate])

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    setSelectedDate(null)
    setSelectedSlot(null)
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    setSelectedDate(null)
    setSelectedSlot(null)
  }

  const handleDateSelect = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Can't select past dates or dates without slots
    if (date < today) return
    if (!slotsByDate.has(date.toDateString())) return

    setSelectedDate(date)
    setSelectedSlot(null)
  }

  const handleSlotSelect = (slot: CalendarSlot) => {
    setSelectedSlot(slot)
  }

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject)
  }

  const handleBookLesson = async () => {
    if (!userId || !selectedSlot || !selectedSubject || !selectedSlot.id || !selectedSubject.id) {
      toast.show('Error', { message: 'Please select a time slot and subject' })
      return
    }

    try {
      await bookLessonMutation.mutateAsync({
        userId,
        data: {
          tutorId,
          calendarSlotId: selectedSlot.id,
          subjectId: selectedSubject.id,
        },
      })
      toast.show('Success!', { message: 'Booking request has been sent' })
      onOpenChange(false)
      // Reset state
      setSelectedDate(null)
      setSelectedSlot(null)
      setSelectedSubject(null)
    } catch (error) {
      toast.show('Error', { message: 'Failed to book lesson' })
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDayName = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[date.getDay()]
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const hasAvailableSlots = (date: Date) => {
    return slotsByDate.has(date.toDateString())
  }

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString()
  }

  return (
    <Sheet modal open={open} onOpenChange={onOpenChange} snapPoints={[90]} dismissOnSnapToBottom>
      <Sheet.Overlay />
      <Sheet.Frame bg="$background" borderTopLeftRadius="$6" borderTopRightRadius="$6">
        <Sheet.Handle />

        {/* Header */}
        <XStack
          paddingHorizontal="$4"
          paddingVertical="$3"
          alignItems="center"
          justifyContent="space-between"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <Button icon={X} size="$3" circular chromeless onPress={() => onOpenChange(false)} />
          <H2 fontSize="$6" fontWeight="600">
            Select Time Slot
          </H2>
          <Button icon={HelpCircle} size="$3" circular chromeless opacity={0.5} />
        </XStack>

        <ScrollView flex={1}>
          <YStack padding="$4" gap="$4">
            {/* Instructions */}
            <Paragraph color="$textSecondary" fontSize="$3">
              Select a day with availability marked by color.
            </Paragraph>

            {/* Calendar */}
            <YStack
              bg="$gray3"
              borderRadius="$4"
              padding="$4"
              gap="$3"
              borderWidth={1}
              borderColor="$borderColor"
            >
              {/* Month Navigation */}
              <XStack alignItems="center" justifyContent="space-between">
                <Button
                  icon={ChevronLeft}
                  size="$3"
                  circular
                  chromeless
                  onPress={handlePrevMonth}
                />
                <Paragraph fontWeight="600" fontSize="$5">
                  {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
                </Paragraph>
                <Button
                  icon={ChevronRight}
                  size="$3"
                  circular
                  chromeless
                  onPress={handleNextMonth}
                />
              </XStack>

              {/* Day Names Header */}
              <XStack>
                {DAY_NAMES.map((day) => (
                  <YStack key={day} flex={1} alignItems="center" paddingVertical="$2">
                    <Paragraph color="$textSecondary" fontSize="$2" fontWeight="500">
                      {day}
                    </Paragraph>
                  </YStack>
                ))}
              </XStack>

              {/* Calendar Grid */}
              {slotsLoading ? (
                <YStack alignItems="center" padding="$6">
                  <Spinner size="large" color="$orange6" />
                </YStack>
              ) : (
                <YStack gap="$1">
                  {Array.from({ length: 6 }, (_, weekIndex) => (
                    <XStack key={weekIndex}>
                      {calendarDays
                        .slice(weekIndex * 7, (weekIndex + 1) * 7)
                        .map((date, dayIndex) => {
                          if (!date) return <YStack key={dayIndex} flex={1} />

                          const inCurrentMonth = isCurrentMonth(date)
                          const available = hasAvailableSlots(date)
                          const selected = isSelected(date)
                          const today = isToday(date)
                          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))

                          return (
                            <YStack
                              key={dayIndex}
                              flex={1}
                              alignItems="center"
                              paddingVertical="$2"
                            >
                              <Button
                                size="$4"
                                width={40}
                                height={40}
                                borderRadius={20}
                                chromeless
                                backgroundColor={selected ? '$orange6' : 'transparent'}
                                borderWidth={available && !selected ? 2 : 0}
                                borderColor="$orange6"
                                opacity={inCurrentMonth && !isPast ? 1 : 0.3}
                                disabled={!available || isPast}
                                onPress={() => handleDateSelect(date)}
                                hoverStyle={{
                                  backgroundColor: available && !selected ? '$orange3' : undefined,
                                }}
                              >
                                <Paragraph
                                  color={selected ? 'white' : today ? '$orange6' : '$textPrimary'}
                                  fontWeight={today || selected ? '700' : '400'}
                                  fontSize="$3"
                                >
                                  {date.getDate()}
                                </Paragraph>
                              </Button>
                            </YStack>
                          )
                        })}
                    </XStack>
                  ))}
                </YStack>
              )}
            </YStack>

            {/* Time Slots */}
            {selectedDate && (
              <YStack gap="$3">
                <XStack alignItems="center" gap="$2">
                  <Clock size={18} color="$textSecondary" />
                  <Paragraph color="$textSecondary" fontSize="$3">
                    Available times ({formatDayName(selectedDate)}, {selectedDate.getDate()}{' '}
                    {MONTH_NAMES[selectedDate.getMonth()].substring(0, 3)})
                  </Paragraph>
                </XStack>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <XStack gap="$2" paddingVertical="$1">
                    {slotsForSelectedDate.length > 0 ? (
                      slotsForSelectedDate
                        .sort((a, b) => {
                          if (!a.lessonTime || !b.lessonTime) return 0
                          return new Date(a.lessonTime).getTime() - new Date(b.lessonTime).getTime()
                        })
                        .map((slot) => (
                          <Button
                            key={slot.id}
                            size="$4"
                            paddingHorizontal="$4"
                            borderRadius="$4"
                            backgroundColor={selectedSlot?.id === slot.id ? '$orange6' : '$gray4'}
                            borderWidth={selectedSlot?.id === slot.id ? 0 : 1}
                            borderColor="$orange6"
                            onPress={() => handleSlotSelect(slot)}
                          >
                            <Paragraph
                              color={selectedSlot?.id === slot.id ? 'white' : '$textPrimary'}
                              fontWeight="500"
                            >
                              {slot.lessonTime && formatTime(new Date(slot.lessonTime))}
                            </Paragraph>
                          </Button>
                        ))
                    ) : (
                      <Paragraph color="$textSecondary">No available times</Paragraph>
                    )}
                  </XStack>
                </ScrollView>
              </YStack>
            )}

            {/* Subject Selection */}
            {selectedSlot && (
              <YStack gap="$3">
                <XStack alignItems="center" gap="$2">
                  <Calendar size={18} color="$textSecondary" />
                  <Paragraph color="$textSecondary" fontSize="$3">
                    Select Subject
                  </Paragraph>
                </XStack>

                {subjectsLoading ? (
                  <Spinner size="small" color="$orange6" />
                ) : subjects && subjects.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <XStack gap="$2" paddingVertical="$1">
                      {subjects.map((subject) => (
                        <Button
                          key={subject.id}
                          size="$4"
                          paddingHorizontal="$4"
                          borderRadius="$4"
                          backgroundColor={
                            selectedSubject?.id === subject.id ? '$orange6' : '$gray4'
                          }
                          borderWidth={selectedSubject?.id === subject.id ? 0 : 1}
                          borderColor="$borderColor"
                          onPress={() => handleSubjectSelect(subject)}
                        >
                          <YStack>
                            <Paragraph
                              color={selectedSubject?.id === subject.id ? 'white' : '$textPrimary'}
                              fontWeight="500"
                            >
                              {subject.name}
                            </Paragraph>
                            {subject.costPerHour && (
                              <Paragraph
                                color={
                                  selectedSubject?.id === subject.id ? '$orange2' : '$textSecondary'
                                }
                                fontSize="$2"
                              >
                                ${subject.costPerHour}/hr
                              </Paragraph>
                            )}
                          </YStack>
                        </Button>
                      ))}
                    </XStack>
                  </ScrollView>
                ) : (
                  <Paragraph color="$textSecondary">Tutor has no assigned subjects</Paragraph>
                )}
              </YStack>
            )}
          </YStack>
        </ScrollView>

        {/* Footer */}
        <YStack
          padding="$4"
          gap="$3"
          borderTopWidth={1}
          borderTopColor="$borderColor"
          bg="$background"
        >
          <Button
            size="$5"
            backgroundColor="$orange6"
            color="white"
            fontWeight="600"
            borderRadius="$4"
            onPress={handleBookLesson}
            disabled={!selectedSlot || !selectedSubject || bookLessonMutation.isPending}
            opacity={selectedSlot && selectedSubject ? 1 : 0.5}
          >
            {bookLessonMutation.isPending ? (
              <Spinner size="small" color="white" />
            ) : (
              'Send Booking Request'
            )}
          </Button>
          <Paragraph color="$textSecondary" fontSize="$2" textAlign="center">
            You will receive confirmation from the tutor via message.
          </Paragraph>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
