import React, { useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { SiweMessage } from 'siwe'
import { authApi } from '../services/api'
import toast from 'react-hot-toast'

interface AuthenticateProps {
  onAuthenticated: (token: string) => void
}

export function Authenticate({ onAuthenticated }: AuthenticateProps) {
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }

    setIsLoading(true)
    try {
      // 1. Get message from backend
      const { message, nonce } = await authApi.getMessage(address)
      
      // 2. Create SIWE message
      const siweMessage = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in with Ethereum to the app.',
        uri: window.location.origin,
        version: '1',
        chainId: 11155111, // Sepolia
        nonce,
      })

      const messageToSign = siweMessage.prepareMessage()

      // 3. Sign message
      const signature = await signMessageAsync({ message: messageToSign })

      // 4. Send signature to backend
      const { token } = await authApi.signIn(messageToSign, signature)

      // 5. Store token and notify parent
      localStorage.setItem('jwt', token)
      onAuthenticated(token)
      toast.success('Successfully authenticated!')
    } catch (error) {
      console.error('Authentication error:', error)
      toast.error('Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Authenticate with Ethereum</h3>
      <p className="text-gray-600 mb-4">
        Sign a message to prove you own this wallet address
      </p>
      <button
        onClick={handleSignIn}
        disabled={isLoading || !address}
        className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Signing...' : 'Sign In with Ethereum'}
      </button>
    </div>
  )
}

export default Authenticate