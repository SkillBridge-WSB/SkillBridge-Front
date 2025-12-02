/**
 * Pre-configured API instances with authentication
 * All instances automatically include the auth token from storage
 */

import { createApiInstance } from './api-config'
import {
  AuthControllerApi,
  CalendarControllerApi,
  ChatControllerApi,
  LessonControllerApi,
  StudentControllerApi,
  SubjectControllerApi,
  TutorControllerApi,
  UserControllerApi,
} from './generated/apis'

// Create authenticated API instances
export const authApi = createApiInstance(AuthControllerApi)
export const calendarApi = createApiInstance(CalendarControllerApi)
export const chatApi = createApiInstance(ChatControllerApi)
export const lessonApi = createApiInstance(LessonControllerApi)
export const studentApi = createApiInstance(StudentControllerApi)
export const subjectApi = createApiInstance(SubjectControllerApi)
export const tutorApi = createApiInstance(TutorControllerApi)
export const userApi = createApiInstance(UserControllerApi)








