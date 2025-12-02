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
  Input,
  Label,
  Sheet,
} from '@my/ui'
import { Calendar, Clock, Plus, Trash2, ChevronLeft, ChevronRight } from '@tamagui/lucide-icons'
import { useAuth } from '../../contexts/auth-context'
import { useTutorAvailableSlots, useCreateCalendarSlot } from '../../api/hooks/use-calendar'
import { useUserDetails } from '../../api/hooks/use-user'
import type { CalendarSlot } from '../../api/generated/models'

// Get the start and end of a week given a date
function getWeekBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(date)
  const day = start.getDay()
  const diff = start.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Monday start
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

// Format date for display
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

// Format time for display
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Get day name
function getDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' })
}

// Generate week days
function getWeekDays(startDate: Date): Date[] {
  const days: Date[] = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate)
    day.setDate(startDate.getDate() + i)
    days.push(day)
  }
  return days
}

// Get local date key (YYYY-MM-DD) without timezone conversion
function getLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// Group slots by day
function groupSlotsByDay(slots: CalendarSlot[]): Map<string, CalendarSlot[]> {
  const grouped = new Map<string, CalendarSlot[]>()
  
  for (const slot of slots) {
    if (!slot.lessonTime) continue
    const date = new Date(slot.lessonTime)
    const key = getLocalDateKey(date)
    
    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key)!.push(slot)
  }
  
  // Sort slots within each day
  for (const [key, daySlots] of grouped) {
    daySlots.sort((a, b) => {
      const timeA = a.lessonTime ? new Date(a.lessonTime).getTime() : 0
      const timeB = b.lessonTime ? new Date(b.lessonTime).getTime() : 0
      return timeA - timeB
    })
  }
  
  return grouped
}

interface SlotCardProps {
  slot: CalendarSlot
  onDelete?: () => void
}

function SlotCard({ slot, onDelete }: SlotCardProps) {
  const time = slot.lessonTime ? new Date(slot.lessonTime) : null
  const isAvailable = slot.available !== false
  
  return (
    <XStack
      bg={isAvailable ? '$green4' : '$gray4'}
      borderRadius="$3"
      padding="$3"
      alignItems="center"
      justifyContent="space-between"
      borderWidth={1}
      borderColor={isAvailable ? '$green6' : '$borderColor'}
    >
      <XStack alignItems="center" gap="$2">
        <Clock size={16} color={isAvailable ? '$green10' : '$textSecondary'} />
        <Paragraph fontWeight="500" color={isAvailable ? '$green10' : '$textSecondary'}>
          {time ? formatTime(time) : 'Unknown'}
        </Paragraph>
        {!isAvailable && (
          <Paragraph fontSize="$2" color="$textSecondary">
            (booked)
          </Paragraph>
        )}
      </XStack>
      
      {isAvailable && onDelete && (
        <Button
          size="$2"
          circular
          backgroundColor="transparent"
          icon={<Trash2 size={16} color="$red10" />}
          onPress={onDelete}
          hoverStyle={{ backgroundColor: '$red4' }}
        />
      )}
    </XStack>
  )
}

interface DayColumnProps {
  date: Date
  slots: CalendarSlot[]
  isToday: boolean
  onAddSlot: (date: Date) => void
}

function DayColumn({ date, slots, isToday, onAddSlot }: DayColumnProps) {
  const dayName = getDayName(date)
  const dayNumber = date.getDate()
  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
  
  return (
    <YStack
      flex={1}
      minWidth={140}
      bg={isToday ? '$orange2' : '$gray2'}
      borderRadius="$4"
      padding="$3"
      gap="$3"
      opacity={isPast ? 0.6 : 1}
      borderWidth={isToday ? 2 : 1}
      borderColor={isToday ? '$orange6' : '$borderColor'}
    >
      {/* Day Header */}
      <YStack alignItems="center" gap="$1">
        <Paragraph
          fontSize="$2"
          color={isToday ? '$orange10' : '$textSecondary'}
          fontWeight="500"
          textTransform="capitalize"
        >
          {dayName}
        </Paragraph>
        <YStack
          width={36}
          height={36}
          borderRadius={18}
          bg={isToday ? '$orange6' : 'transparent'}
          alignItems="center"
          justifyContent="center"
        >
          <Paragraph
            fontSize="$5"
            fontWeight="700"
            color={isToday ? 'white' : '$textPrimary'}
          >
            {dayNumber}
          </Paragraph>
        </YStack>
      </YStack>
      
      {/* Slots */}
      <YStack gap="$2" flex={1}>
        {slots.length > 0 ? (
          slots.map((slot) => (
            <SlotCard key={slot.id} slot={slot} />
          ))
        ) : (
          <Paragraph fontSize="$2" color="$textSecondary" textAlign="center">
            No slots
          </Paragraph>
        )}
      </YStack>
      
      {/* Add Slot Button */}
      {!isPast && (
        <Button
          size="$3"
          backgroundColor="$orange6"
          color="white"
          icon={Plus}
          onPress={() => onAddSlot(date)}
          borderRadius="$3"
        >
          Add
        </Button>
      )}
    </YStack>
  )
}

interface AddSlotSheetProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date | null
  onSubmit: (date: Date, time: string) => void
  isLoading: boolean
}

function AddSlotSheet({ isOpen, onClose, selectedDate, onSubmit, isLoading }: AddSlotSheetProps) {
  const [time, setTime] = useState('09:00')
  
  const handleSubmit = () => {
    if (selectedDate) {
      onSubmit(selectedDate, time)
    }
  }
  
  const timeOptions = useMemo(() => {
    const options: string[] = []
    for (let hour = 8; hour <= 20; hour++) {
      options.push(`${hour.toString().padStart(2, '0')}:00`)
      options.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    return options
  }, [])
  
  return (
    <Sheet
      modal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      snapPoints={[400]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay />
      <Sheet.Frame padding="$4" gap="$4">
        <Sheet.Handle />
        
        <H2 color="$textPrimary">Add Availability</H2>
        
        {selectedDate && (
          <YStack gap="$3">
            <XStack alignItems="center" gap="$2">
              <Calendar size={20} color="$orange6" />
              <Paragraph fontWeight="600" color="$textPrimary">
                {formatDate(selectedDate)}
              </Paragraph>
            </XStack>
            
            <YStack gap="$2">
              <Label htmlFor="time" color="$textSecondary">
                Start Time
              </Label>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <XStack gap="$2" paddingVertical="$2">
                  {timeOptions.map((opt) => (
                    <Button
                      key={opt}
                      size="$3"
                      backgroundColor={time === opt ? '$orange6' : '$gray4'}
                      color={time === opt ? 'white' : '$textPrimary'}
                      onPress={() => setTime(opt)}
                      borderRadius="$3"
                    >
                      {opt}
                    </Button>
                  ))}
                </XStack>
              </ScrollView>
            </YStack>
            
            <Paragraph fontSize="$2" color="$textSecondary">
              Slot will be available for 1 hour
            </Paragraph>
            
            <XStack gap="$3" marginTop="$2">
              <Button
                flex={1}
                size="$4"
                backgroundColor="$gray4"
                color="$textPrimary"
                onPress={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                flex={1}
                size="$4"
                backgroundColor="$orange6"
                color="white"
                onPress={handleSubmit}
                disabled={isLoading}
                icon={isLoading ? <Spinner size="small" color="white" /> : undefined}
              >
                {isLoading ? 'Adding...' : 'Add slot'}
              </Button>
            </XStack>
          </YStack>
        )}
      </Sheet.Frame>
    </Sheet>
  )
}

export function CalendarScreen() {
  const { userId } = useAuth()
  const toast = useToastController()
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const { start } = getWeekBounds(new Date())
    return start
  })
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  
  // Get user details
  const { data: userDetails, isLoading: userLoading } = useUserDetails()
  
  // Calculate week bounds
  const weekBounds = useMemo(() => {
    const start = new Date(currentWeekStart)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    return { start, end }
  }, [currentWeekStart])
  
  // Fetch slots for current week
  const {
    data: slots = [],
    isLoading: slotsLoading,
    error,
  } = useTutorAvailableSlots(
    userId || '',
    weekBounds.start,
    weekBounds.end,
    !!userId
  )
  
  const createSlotMutation = useCreateCalendarSlot()
  
  const isLoading = userLoading || slotsLoading
  
  // Group slots by day
  const slotsByDay = useMemo(() => groupSlotsByDay(slots), [slots])
  
  // Get week days
  const weekDays = useMemo(() => getWeekDays(currentWeekStart), [currentWeekStart])
  
  // Check if user is tutor
  const isTutor = userDetails?.role === 'TUTOR'
  
  // Navigation handlers
  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart)
    newStart.setDate(newStart.getDate() - 7)
    setCurrentWeekStart(newStart)
  }
  
  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart)
    newStart.setDate(newStart.getDate() + 7)
    setCurrentWeekStart(newStart)
  }
  
  const goToToday = () => {
    const { start } = getWeekBounds(new Date())
    setCurrentWeekStart(start)
  }
  
  // Add slot handler
  const handleAddSlot = (date: Date) => {
    setSelectedDate(date)
    setSheetOpen(true)
  }
  
  const handleSubmitSlot = async (date: Date, time: string) => {
    if (!userId) return
    
    try {
      const [hours, minutes] = time.split(':').map(Number)
      const lessonTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hours,
        minutes,
        0,
        0
      )
      
      await createSlotMutation.mutateAsync({
        userId,
        slot: { lessonTime },
      })
      
      toast.show('Success', { message: 'Slot has been added' })
      setSheetOpen(false)
      setSelectedDate(null)
    } catch (error) {
      toast.show('Error', { message: 'Failed to add slot' })
    }
  }
  
  // Format week range for header
  const weekRangeText = useMemo(() => {
    const start = weekBounds.start
    const end = weekBounds.end
    const startStr = start.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
    const endStr = end.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    return `${startStr} - ${endStr}`
  }, [weekBounds])
  
  // Check if today is in current week
  const today = new Date()
  const isCurrentWeek = today >= weekBounds.start && today <= weekBounds.end
  
  if (!isTutor && !userLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" bg="$background" padding="$4">
        <Calendar size={64} color="$gray8" />
        <H2 color="$textPrimary" textAlign="center" marginTop="$4">
          Tutor Access Only
        </H2>
        <Paragraph color="$textSecondary" textAlign="center" marginTop="$2">
          This section is only available for tutor accounts.
        </Paragraph>
      </YStack>
    )
  }
  
  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" bg="$background">
        <Spinner size="large" color="$orange6" />
        <Paragraph mt="$3" color="$textSecondary">
          Loading calendar...
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
            Calendar
          </H1>
        </XStack>
        
        <YStack>
          <H2 color="$textPrimary" fontSize="$6">
            Manage Availability
          </H2>
          <Paragraph color="$textSecondary" fontSize="$3">
            Add time slots that will be visible to students
          </Paragraph>
        </YStack>
        
        {/* Week Navigation */}
        <XStack alignItems="center" justifyContent="space-between" gap="$3">
          <Button
            size="$3"
            circular
            backgroundColor="$gray4"
            icon={<ChevronLeft size={20} color="$textPrimary" />}
            onPress={goToPreviousWeek}
          />
          
          <XStack alignItems="center" gap="$3" flex={1} justifyContent="center">
            <Paragraph fontWeight="600" color="$textPrimary" fontSize="$4">
              {weekRangeText}
            </Paragraph>
            {!isCurrentWeek && (
              <Button
                size="$2"
                backgroundColor="$orange6"
                color="white"
                onPress={goToToday}
                borderRadius="$2"
              >
                Today
              </Button>
            )}
          </XStack>
          
          <Button
            size="$3"
            circular
            backgroundColor="$gray4"
            icon={<ChevronRight size={20} color="$textPrimary" />}
            onPress={goToNextWeek}
          />
        </XStack>
      </YStack>
      
      {/* Calendar Grid */}
      <ScrollView flex={1} horizontal showsHorizontalScrollIndicator={false}>
        <XStack padding="$4" gap="$3" paddingTop="$0">
          {weekDays.map((day) => {
            const key = getLocalDateKey(day)
            const daySlots = slotsByDay.get(key) || []
            const isToday = day.toDateString() === today.toDateString()
            
            return (
              <DayColumn
                key={key}
                date={day}
                slots={daySlots}
                isToday={isToday}
                onAddSlot={handleAddSlot}
              />
            )
          })}
        </XStack>
      </ScrollView>
      
      {/* Add Slot Sheet */}
      <AddSlotSheet
        isOpen={sheetOpen}
        onClose={() => {
          setSheetOpen(false)
          setSelectedDate(null)
        }}
        selectedDate={selectedDate}
        onSubmit={handleSubmitSlot}
        isLoading={createSlotMutation.isPending}
      />
    </YStack>
  )
}

