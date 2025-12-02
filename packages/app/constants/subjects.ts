/**
 * Static subject definitions for SkillBridge
 * These subjects are available for tutoring on the platform
 */

export interface Subject {
  id: string
  name: string
  description: string
  tag: 'Popular' | 'Trending' | 'New' | 'Niche'
  tagColor: string
  rating: number
  costPerHour: number
}

export const SUBJECTS: Subject[] = [
  {
    id: '1',
    name: 'Mathematics',
    description: 'Algebra, geometry, calculus basics.',
    tag: 'Popular',
    tagColor: '$orange6',
    rating: 4.8,
    costPerHour: 50,
  },
  {
    id: '2',
    name: 'Physics',
    description: 'Mechanics, electricity, optics overview.',
    tag: 'Trending',
    tagColor: '$blue6',
    rating: 4.6,
    costPerHour: 55,
  },
  {
    id: '3',
    name: 'Chemistry',
    description: 'Atoms, reactions, laboratory basics.',
    tag: 'Popular',
    tagColor: '$orange6',
    rating: 4.5,
    costPerHour: 48,
  },
  {
    id: '4',
    name: 'Biology',
    description: 'Cells, genetics, ecosystems quick intro.',
    tag: 'New',
    tagColor: '$green6',
    rating: 4.4,
    costPerHour: 45,
  },
  {
    id: '5',
    name: 'English',
    description: 'Speaking, grammar, exam preparation.',
    tag: 'Popular',
    tagColor: '$orange6',
    rating: 4.7,
    costPerHour: 40,
  },
  {
    id: '6',
    name: 'Spanish',
    description: 'Conversational practice and basics.',
    tag: 'Trending',
    tagColor: '$blue6',
    rating: 4.5,
    costPerHour: 42,
  },
  {
    id: '7',
    name: 'History',
    description: 'World history essentials and sources.',
    tag: 'Popular',
    tagColor: '$orange6',
    rating: 4.3,
    costPerHour: 38,
  },
  {
    id: '8',
    name: 'Philosophy',
    description: 'Critical thinking and ethics overview.',
    tag: 'Niche',
    tagColor: '$purple6',
    rating: 4.2,
    costPerHour: 43,
  },
]

// Helper function to get subject by ID
export function getSubjectById(id: string): Subject | undefined {
  return SUBJECTS.find((subject) => subject.id === id)
}

// Helper function to get subjects by name (search)
export function searchSubjects(query: string): Subject[] {
  const lowerQuery = query.toLowerCase()
  return SUBJECTS.filter((subject) =>
    subject.name.toLowerCase().includes(lowerQuery)
  )
}












