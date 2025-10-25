// Export API client and types
export { apiClient } from './client'
export type { paths, components, operations } from './types'

// Export custom auth functions
export { login } from './custom-auth'
export type { LoginRequest, LoginResponse } from './custom-auth'

// Export all hooks
export * from './hooks'
