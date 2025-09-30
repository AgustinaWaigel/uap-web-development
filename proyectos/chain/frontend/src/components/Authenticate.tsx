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
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <span className="text-white text-2xl">🔐</span>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Autenticación con Ethereum
        </h3>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200 mb-6">
          <p className="text-gray-700 text-lg leading-relaxed">
            <span className="font-semibold">🛡️ Paso de Seguridad:</span><br />
            Firma un mensaje para demostrar que eres dueño de esta wallet.<br />
            <span className="text-sm text-purple-600 mt-2 block">
              ✨ No cuesta gas, es solo una firma digital
            </span>
          </p>
        </div>

        <button
          onClick={handleSignIn}
          disabled={isLoading || !address}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Firmando mensaje...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">✍️</span>
              <span>Firmar con Ethereum</span>
            </div>
          )}
        </button>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span>Conexión segura establecida</span>
        </div>
      </div>
    </div>
  )
}

export default Authenticate