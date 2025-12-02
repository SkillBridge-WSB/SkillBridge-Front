import { useState, useEffect } from 'react'
import {
  H1,
  H2,
  H3,
  Paragraph,
  YStack,
  XStack,
  Button,
  Input,
  Label,
  Spinner,
  TextArea,
  useToastController,
  Sheet,
  ScrollView,
} from '@my/ui'
import {
  LogOut,
  User,
  Mail,
  Edit3,
  Save,
  X,
  Plus,
  BookOpen,
  DollarSign,
  Trash2,
  GraduationCap,
  Clock,
  Pencil,
} from '@tamagui/lucide-icons'
import { useAuth } from '../../contexts/auth-context'
import { useCurrentUser, useUpdateUser, useMySubjects, useCreateSubject, useDeleteSubject, useUpdateSubject } from '../../api/hooks'
import { Platform } from 'react-native'
import { useRouter } from 'solito/navigation'
import type { CreateSubject, Subject, UpdateSubject } from '../../api/generated/models'
import { SUBJECTS as AVAILABLE_SUBJECTS } from '../../constants/subjects'

interface SubjectCardProps {
  subject: Subject
  onEdit?: (subject: Subject) => void
  onDelete?: (subjectId: string) => void
  isDeleting?: boolean
}

function SubjectCard({ subject, onEdit, onDelete, isDeleting }: SubjectCardProps) {
  return (
    <XStack
      bg="$surface"
      borderRadius="$3"
      padding="$3"
      gap="$3"
      alignItems="center"
      borderWidth={1}
      borderColor="$borderColor"
      hoverStyle={{
        borderColor: '$orange6',
      }}
    >
      <YStack
        bg="$orange3"
        padding="$2"
        borderRadius="$2"
      >
        <BookOpen size={20} color="$orange10" />
      </YStack>
      <YStack flex={1} gap="$1">
        <Paragraph fontWeight="600" color="$textPrimary">
          {subject.name}
        </Paragraph>
        <XStack alignItems="center" gap="$2">
          <DollarSign size={14} color="$textSecondary" />
          <Paragraph fontSize="$2" color="$textSecondary">
            ${subject.costPerHour}/hr
          </Paragraph>
        </XStack>
        {subject.availability && (
          <XStack alignItems="center" gap="$2">
            <Clock size={14} color="$textSecondary" />
            <Paragraph fontSize="$2" color="$textSecondary">
              {subject.availability}
            </Paragraph>
          </XStack>
        )}
      </YStack>
      <XStack gap="$1">
        {onEdit && (
          <Button
            size="$3"
            circular
            bg="transparent"
            color="$orange6"
            icon={Pencil}
            onPress={() => onEdit(subject)}
            hoverStyle={{ bg: '$orange2' }}
            pressStyle={{ opacity: 0.7 }}
          />
        )}
        {onDelete && subject.id && (
          <Button
            size="$3"
            circular
            bg="transparent"
            color="$red10"
            icon={isDeleting ? undefined : Trash2}
            onPress={() => onDelete(subject.id!)}
            disabled={isDeleting}
            hoverStyle={{ bg: '$red4' }}
            pressStyle={{ opacity: 0.7 }}
          >
            {isDeleting && <Spinner size="small" color="$red10" />}
          </Button>
        )}
      </XStack>
    </XStack>
  )
}

interface AddSubjectSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddSubject: (subject: CreateSubject) => void
  isLoading: boolean
  existingSubjectNames: string[]
}

function AddSubjectSheet({
  open,
  onOpenChange,
  onAddSubject,
  isLoading,
  existingSubjectNames,
}: AddSubjectSheetProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [costPerHour, setCostPerHour] = useState('')
  const [availability, setAvailability] = useState('')

  const availableToAdd = AVAILABLE_SUBJECTS.filter(
    (s) => !existingSubjectNames.includes(s.name)
  )

  const handleAdd = () => {
    if (!selectedSubject || !costPerHour) return

    onAddSubject({
      name: selectedSubject,
      costPerHour: parseFloat(costPerHour),
      availability: availability || 'Available',
    })

    // Reset form
    setSelectedSubject(null)
    setCostPerHour('')
    setAvailability('')
  }

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[80]}
      dismissOnSnapToBottom
      zIndex={100000}
    >
      <Sheet.Overlay
        animation="quick"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        bg="rgba(0,0,0,0.5)"
      />
      <Sheet.Frame bg="$background" borderTopLeftRadius="$4" borderTopRightRadius="$4">
        <Sheet.Handle bg="$gray8" />
        <YStack padding="$4" gap="$4" flex={1}>
          <XStack justifyContent="space-between" alignItems="center">
            <H2 color="$textPrimary">Add Subject</H2>
            <Button
              size="$3"
              circular
              chromeless
              onPress={() => onOpenChange(false)}
              icon={X}
            />
          </XStack>

          <ScrollView style={{ flex: 1 }}>
            <YStack gap="$4">
              {/* Subject selection */}
              <YStack gap="$2">
                <Label color="$textSecondary">Select Subject</Label>
                <XStack flexWrap="wrap" gap="$2">
                  {availableToAdd.length === 0 ? (
                    <Paragraph color="$textSecondary">
                      You've added all available subjects!
                    </Paragraph>
                  ) : (
                    availableToAdd.map((subject) => (
                      <Button
                        key={subject.id}
                        size="$3"
                        bg={selectedSubject === subject.name ? '$orange6' : '$surface'}
                        color={selectedSubject === subject.name ? '$color1' : '$textPrimary'}
                        borderWidth={1}
                        borderColor={selectedSubject === subject.name ? '$orange6' : '$borderColor'}
                        onPress={() => setSelectedSubject(subject.name)}
                        hoverStyle={{
                          bg: selectedSubject === subject.name ? '$orange7' : '$surface',
                          borderColor: '$orange6',
                        }}
                      >
                        {subject.name}
                      </Button>
                    ))
                  )}
                </XStack>
              </YStack>

              {/* Cost per hour */}
              <YStack gap="$2">
                <Label color="$textSecondary">Hourly Rate ($)</Label>
                <Input
                  value={costPerHour}
                  onChangeText={setCostPerHour}
                  placeholder="e.g., 50"
                  keyboardType="numeric"
                  bg="$surface"
                  borderColor="$borderColor"
                  color="$textPrimary"
                  placeholderTextColor="$textSecondary"
                />
              </YStack>

              {/* Availability (optional) */}
              <YStack gap="$2">
                <Label color="$textSecondary">Availability (optional)</Label>
                <Input
                  value={availability}
                  onChangeText={setAvailability}
                  placeholder="e.g., Weekdays 9-5"
                  bg="$surface"
                  borderColor="$borderColor"
                  color="$textPrimary"
                  placeholderTextColor="$textSecondary"
                />
              </YStack>

              <Button
                size="$4"
                bg="$orange6"
                color="$color1"
                onPress={handleAdd}
                disabled={!selectedSubject || !costPerHour || isLoading}
                opacity={!selectedSubject || !costPerHour || isLoading ? 0.5 : 1}
                icon={isLoading ? undefined : Plus}
                marginTop="$4"
              >
                {isLoading ? <Spinner size="small" color="$color1" /> : 'Add Subject'}
              </Button>
            </YStack>
          </ScrollView>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}

interface EditSubjectSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject: Subject | null
  onUpdateSubject: (subjectId: string, data: UpdateSubject) => void
  isLoading: boolean
}

function EditSubjectSheet({
  open,
  onOpenChange,
  subject,
  onUpdateSubject,
  isLoading,
}: EditSubjectSheetProps) {
  const [costPerHour, setCostPerHour] = useState('')
  const [availability, setAvailability] = useState('')

  // Initialize form when subject changes
  useEffect(() => {
    if (subject) {
      setCostPerHour(subject.costPerHour?.toString() || '')
      setAvailability(subject.availability || '')
    }
  }, [subject])

  const handleUpdate = () => {
    if (!subject?.id || !costPerHour) return

    onUpdateSubject(subject.id, {
      costPerHour: parseFloat(costPerHour),
      availability: availability || undefined,
    })
  }

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[50]}
      dismissOnSnapToBottom
      zIndex={100000}
    >
      <Sheet.Overlay
        animation="quick"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        bg="rgba(0,0,0,0.5)"
      />
      <Sheet.Frame bg="$background" borderTopLeftRadius="$4" borderTopRightRadius="$4">
        <Sheet.Handle bg="$gray8" />
        <YStack padding="$4" gap="$4" flex={1}>
          <XStack justifyContent="space-between" alignItems="center">
            <H2 color="$textPrimary">Edit {subject?.name}</H2>
            <Button
              size="$3"
              circular
              chromeless
              onPress={() => onOpenChange(false)}
              icon={X}
            />
          </XStack>

          <YStack gap="$4">
            {/* Cost per hour */}
            <YStack gap="$2">
              <Label color="$textSecondary">Hourly Rate ($)</Label>
              <Input
                value={costPerHour}
                onChangeText={setCostPerHour}
                placeholder="e.g., 50"
                keyboardType="numeric"
                bg="$surface"
                borderColor="$borderColor"
                color="$textPrimary"
                placeholderTextColor="$textSecondary"
              />
            </YStack>

            {/* Availability */}
            <YStack gap="$2">
              <Label color="$textSecondary">Availability</Label>
              <Input
                value={availability}
                onChangeText={setAvailability}
                placeholder="e.g., Weekdays 9-5"
                bg="$surface"
                borderColor="$borderColor"
                color="$textPrimary"
                placeholderTextColor="$textSecondary"
              />
            </YStack>

            <Button
              size="$4"
              bg="$orange6"
              color="$color1"
              onPress={handleUpdate}
              disabled={!costPerHour || isLoading}
              opacity={!costPerHour || isLoading ? 0.5 : 1}
              icon={isLoading ? undefined : Save}
              marginTop="$2"
            >
              {isLoading ? <Spinner size="small" color="$color1" /> : 'Save Changes'}
            </Button>
          </YStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}

export function ProfileScreen() {
  const { logout, userId } = useAuth()
  const router = useRouter()
  const toast = useToastController()

  const { data: user, isLoading: userLoading, refetch: refetchUser } = useCurrentUser()
  const updateUserMutation = useUpdateUser()
  const { data: mySubjects, isLoading: subjectsLoading, refetch: refetchSubjects } = useMySubjects(
    user?.role?.toLowerCase() === 'tutor'
  )
  const createSubjectMutation = useCreateSubject()
  const deleteSubjectMutation = useDeleteSubject()
  const updateSubjectMutation = useUpdateSubject()

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [editedBio, setEditedBio] = useState('')
  const [editedImageUrl, setEditedImageUrl] = useState('')

  // Add subject sheet
  const [showAddSubject, setShowAddSubject] = useState(false)

  // Edit subject sheet
  const [showEditSubject, setShowEditSubject] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)

  // Initialize form when user data loads
  useEffect(() => {
    if (user) {
      setEditedName(user.name || '')
      setEditedBio(user.bio || '')
      setEditedImageUrl(user.imageUrl || '')
    }
  }, [user])

  const handleLogout = () => {
    logout()
    if (Platform.OS === 'web') {
      router.push('/')
    }
  }

  const handleSave = async () => {
    if (!userId) return

    try {
      await updateUserMutation.mutateAsync({
        userId,
        data: {
          name: editedName,
          bio: editedBio || undefined,
          imageUrl: editedImageUrl || undefined,
        },
      })
      toast.show('Profile updated!', { message: 'Your changes have been saved.' })
      setIsEditing(false)
      refetchUser()
    } catch (error) {
      toast.show('Update failed', { message: 'Please try again.' })
    }
  }

  const handleCancelEdit = () => {
    // Reset to original values
    if (user) {
      setEditedName(user.name || '')
      setEditedBio(user.bio || '')
      setEditedImageUrl(user.imageUrl || '')
    }
    setIsEditing(false)
  }

  const handleAddSubject = async (subjectData: CreateSubject) => {
    if (!userId) return

    try {
      await createSubjectMutation.mutateAsync({
        userId,
        data: subjectData,
      })
      toast.show('Subject added!', { message: `${subjectData.name} has been added to your profile.` })
      setShowAddSubject(false)
      refetchSubjects()
    } catch (error) {
      toast.show('Failed to add subject', { message: 'Please try again.' })
    }
  }

  const handleDeleteSubject = async (subjectId: string) => {
    try {
      await deleteSubjectMutation.mutateAsync({ subjectId })
      toast.show('Subject removed!', { message: 'The subject has been removed from your profile.' })
      refetchSubjects()
    } catch (error) {
      toast.show('Failed to remove subject', { message: 'Please try again.' })
    }
  }

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject)
    setShowEditSubject(true)
  }

  const handleUpdateSubject = async (subjectId: string, data: UpdateSubject) => {
    try {
      await updateSubjectMutation.mutateAsync({ subjectId, data })
      toast.show('Subject updated!', { message: 'Your changes have been saved.' })
      setShowEditSubject(false)
      setEditingSubject(null)
      refetchSubjects()
    } catch (error) {
      toast.show('Failed to update subject', { message: 'Please try again.' })
    }
  }

  const isTutor = user?.role?.toLowerCase() === 'tutor'

  if (userLoading) {
    return (
      <YStack flex={1} justify="center" items="center" bg="$background">
        <Spinner size="large" color="$orange6" />
        <Paragraph color="$textSecondary" marginTop="$4">
          Loading profile...
        </Paragraph>
      </YStack>
    )
  }

  return (
    <YStack flex={1} bg="$background">
      <ScrollView style={{ flex: 1 }}>
        <YStack padding="$4" gap="$6" maxWidth={800} alignSelf="center" width="100%">
          {/* Header Section */}
          <XStack justifyContent="space-between" alignItems="flex-start">
            <YStack gap="$2">
              <H1 color="$textPrimary">Profile</H1>
              <XStack alignItems="center" gap="$2">
                <YStack
                  bg={isTutor ? '$blue5' : '$green5'}
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$2"
                >
                  <Paragraph fontSize="$2" color={isTutor ? '$blue11' : '$green11'} fontWeight="600">
                    {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : 'Student'}
                  </Paragraph>
                </YStack>
              </XStack>
            </YStack>

            {!isEditing ? (
              <Button
                size="$3"
                bg="transparent"
                color="$orange6"
                borderColor="$orange6"
                borderWidth={1}
                icon={Edit3}
                onPress={() => setIsEditing(true)}
                hoverStyle={{ bg: '$orange2' }}
              >
                Edit
              </Button>
            ) : (
              <XStack gap="$2">
                <Button
                  size="$3"
                  bg="transparent"
                  color="$textSecondary"
                  borderColor="$borderColor"
                  borderWidth={1}
                  icon={X}
                  onPress={handleCancelEdit}
                  hoverStyle={{ bg: '$gray3' }}
                >
                  Cancel
                </Button>
                <Button
                  size="$3"
                  bg="$orange6"
                  color="$color1"
                  icon={updateUserMutation.isPending ? undefined : Save}
                  onPress={handleSave}
                  disabled={updateUserMutation.isPending}
                  opacity={updateUserMutation.isPending ? 0.5 : 1}
                >
                  {updateUserMutation.isPending ? <Spinner size="small" color="$color1" /> : 'Save'}
                </Button>
              </XStack>
            )}
          </XStack>

          {/* Profile Card */}
          <YStack
            bg="$surface"
            borderRadius="$4"
            padding="$5"
            gap="$5"
            borderWidth={1}
            borderColor="$borderColor"
          >
            {/* Avatar and basic info */}
            <XStack gap="$4" alignItems="flex-start" flexWrap="wrap">
              {/* Avatar placeholder */}
              <YStack
                width={100}
                height={100}
                borderRadius={50}
                bg="$orange3"
                justifyContent="center"
                alignItems="center"
                borderWidth={3}
                borderColor="$orange6"
              >
                {editedImageUrl && isEditing ? (
                  <Paragraph color="$orange10" fontSize="$2" textAlign="center" padding="$2">
                    Preview
                  </Paragraph>
                ) : user?.imageUrl ? (
                  <Paragraph color="$orange10" fontSize="$8" fontWeight="bold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </Paragraph>
                ) : (
                  <User size={40} color="$orange10" />
                )}
              </YStack>

              <YStack flex={1} gap="$3" minWidth={200}>
                {/* Name */}
                <YStack gap="$1">
                  <Label color="$textSecondary" fontSize="$2">
                    Name
                  </Label>
                  {isEditing ? (
                    <Input
                      value={editedName}
                      onChangeText={setEditedName}
                      placeholder="Your name"
                      bg="$background"
                      borderColor="$borderColor"
                      color="$textPrimary"
                      fontSize="$5"
                      fontWeight="600"
                    />
                  ) : (
                    <Paragraph color="$textPrimary" fontSize="$5" fontWeight="600">
                      {user?.name || 'No name set'}
                    </Paragraph>
                  )}
                </YStack>

                {/* Email */}
                <XStack alignItems="center" gap="$2">
                  <Mail size={16} color="$textSecondary" />
                  <Paragraph color="$textSecondary">{user?.email}</Paragraph>
                </XStack>
              </YStack>
            </XStack>

            {/* Bio */}
            <YStack gap="$2">
              <Label color="$textSecondary" fontSize="$2">
                Bio
              </Label>
              {isEditing ? (
                <TextArea
                  value={editedBio}
                  onChangeText={setEditedBio}
                  placeholder="Tell us about yourself..."
                  bg="$background"
                  borderColor="$borderColor"
                  color="$textPrimary"
                  numberOfLines={4}
                  minHeight={100}
                />
              ) : (
                <Paragraph color="$textPrimary" lineHeight="$5">
                  {user?.bio || 'No bio yet. Add a short description about yourself!'}
                </Paragraph>
              )}
            </YStack>

            {/* Image URL (only in edit mode) */}
            {isEditing && (
              <YStack gap="$2">
                <Label color="$textSecondary" fontSize="$2">
                  Profile Image URL
                </Label>
                <Input
                  value={editedImageUrl}
                  onChangeText={setEditedImageUrl}
                  placeholder="https://example.com/your-image.jpg"
                  bg="$background"
                  borderColor="$borderColor"
                  color="$textPrimary"
                />
              </YStack>
            )}
          </YStack>

          {/* Subjects Section (Tutor only) */}
          {isTutor && (
            <YStack gap="$4">
              <XStack justifyContent="space-between" alignItems="center">
                <XStack alignItems="center" gap="$2">
                  <GraduationCap size={24} color="$orange6" />
                  <H2 color="$textPrimary">My Subjects</H2>
                </XStack>
                <Button
                  size="$3"
                  bg="$orange6"
                  color="$color1"
                  icon={Plus}
                  onPress={() => setShowAddSubject(true)}
                  hoverStyle={{ bg: '$orange7' }}
                >
                  Add Subject
                </Button>
              </XStack>

              {subjectsLoading ? (
                <YStack padding="$4" alignItems="center">
                  <Spinner size="small" color="$orange6" />
                </YStack>
              ) : !mySubjects || mySubjects.length === 0 ? (
                <YStack
                  bg="$surface"
                  borderRadius="$4"
                  padding="$6"
                  alignItems="center"
                  gap="$3"
                  borderWidth={1}
                  borderColor="$borderColor"
                  borderStyle="dashed"
                >
                  <BookOpen size={40} color="$textSecondary" />
                  <Paragraph color="$textSecondary" textAlign="center">
                    You haven't added any subjects yet.
                  </Paragraph>
                  <Paragraph color="$textSecondary" fontSize="$2" textAlign="center">
                    Add subjects you can teach to start getting matched with students!
                  </Paragraph>
                  <Button
                    size="$3"
                    bg="$orange6"
                    color="$color1"
                    icon={Plus}
                    onPress={() => setShowAddSubject(true)}
                    marginTop="$2"
                  >
                    Add Your First Subject
                  </Button>
                </YStack>
              ) : (
                <YStack gap="$2">
                  {mySubjects.map((subject) => (
                    <SubjectCard
                      key={subject.id}
                      subject={subject}
                      onEdit={handleEditSubject}
                      onDelete={handleDeleteSubject}
                      isDeleting={deleteSubjectMutation.isPending}
                    />
                  ))}
                </YStack>
              )}
            </YStack>
          )}

          {/* Logout Button */}
          <YStack marginTop="$4">
            <Button
              onPress={handleLogout}
              size="$4"
              icon={LogOut}
              backgroundColor="transparent"
              color="$red10"
              borderColor="$red10"
              borderWidth={1}
              hoverStyle={{
                backgroundColor: '$red4',
                opacity: 1,
              }}
              pressStyle={{
                opacity: 0.8,
              }}
            >
              Logout
            </Button>
          </YStack>
        </YStack>
      </ScrollView>

      {/* Add Subject Sheet */}
      <AddSubjectSheet
        open={showAddSubject}
        onOpenChange={setShowAddSubject}
        onAddSubject={handleAddSubject}
        isLoading={createSubjectMutation.isPending}
        existingSubjectNames={mySubjects?.map((s) => s.name || '') || []}
      />

      {/* Edit Subject Sheet */}
      <EditSubjectSheet
        open={showEditSubject}
        onOpenChange={(open) => {
          setShowEditSubject(open)
          if (!open) setEditingSubject(null)
        }}
        subject={editingSubject}
        onUpdateSubject={handleUpdateSubject}
        isLoading={updateSubjectMutation.isPending}
      />
    </YStack>
  )
}
