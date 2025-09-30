import axios from 'axios'
import { BACKEND_URL } from '../config/wagmi'

const api = axios.create({
  baseURL: BACKEND_URL,
})

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface AuthMessageResponse {
  message: string
  nonce: string
}

export interface AuthSignInResponse {
  token: string
  address: string
}

export interface FaucetStatusResponse {
  hasClaimed: boolean
  balance: string
  users: string[]
}

export interface ClaimResponse {
  txHash: string
  success: boolean
}

export const authApi = {
  getMessage: async (address: string): Promise<AuthMessageResponse> => {
    const response = await api.post('/auth/message', { address })
    return response.data
  },

  signIn: async (message: string, signature: string): Promise<AuthSignInResponse> => {
    const response = await api.post('/auth/signin', { message, signature })
    return response.data
  },
}

export const faucetApi = {
  getStatus: async (address: string): Promise<FaucetStatusResponse> => {
    const response = await api.get(`/faucet/status/${address}`)
    return response.data
  },

  claimTokens: async (): Promise<ClaimResponse> => {
    const response = await api.post('/faucet/claim')
    return response.data
  },
}

export default api