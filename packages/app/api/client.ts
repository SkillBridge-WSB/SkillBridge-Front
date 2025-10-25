import createClient from 'openapi-fetch'
import type { paths } from './types'
import { getCookie } from '../utils/cookies'

// Create the API client with the base URL
export const apiClient = createClient<paths>({
  baseUrl: '', // Use relative URLs since Next.js rewrites will handle the proxying
})

// Configure default headers if needed
apiClient.use({
  onRequest({ request }) {
    // Add authentication headers here if needed
    const token = getCookie('auth_token')
    if (token) {
      request.headers.set('x-auth-token', `Bearer ${token}`)
    }
    return request
  },
  onResponse({ response }) {
    // Handle global response logic here
    return response
  },
})
