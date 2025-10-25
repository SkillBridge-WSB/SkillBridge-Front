import { apiClient } from './client'

// Custom login types that won't be overwritten by OpenAPI generator
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

// Custom login API function
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const { data, error } = await apiClient.POST('/auth/register', {
    body: credentials,
  })

  if (error) {
    throw new Error('Login failed')
  }

  return data as unknown as LoginResponse
}
