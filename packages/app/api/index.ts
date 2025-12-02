// Export API client and types
export { apiClient } from './client'
export type { paths, components, operations } from './types'

// Export custom auth functions
export { login } from './custom-auth'
export type { LoginRequest, LoginResponse } from './custom-auth'

// Export authenticated API instances
export * from './api-instances'

// Export API configuration
export { apiConfiguration, createApiInstance } from './api-config'

// Export all hooks
export * from './hooks'

// Re-export generated types for convenience
export * from './generated/models'
