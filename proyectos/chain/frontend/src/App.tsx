import React, { useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { config } from './config/wagmi'
import ConnectWallet from './components/ConnectWallet'
import Authenticate from './components/Authenticate'
import FaucetDashboard from './components/FaucetDashboard'
import { useAccount } from 'wagmi'
import './index.css'

const queryClient = new QueryClient()

function AppContent() {
  const { isConnected } = useAccount()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  React.useEffect(() => {
    // Check if user has valid JWT token
    const token = localStorage.getItem('jwt')
    if (token) {
      // Here you could validate the token with the backend
      setIsAuthenticated(true)
    }
  }, [])

  const handleAuthenticated = (token: string) => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('jwt')
    setIsAuthenticated(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white p-8 rounded-2xl shadow-xl mb-8 border border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">💧</span>
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Grifo de Tokens FAUCET
                  </h1>
                </div>
                <p className="text-gray-600 text-lg">
                  🎁 Reclama tus tokens FAUCET gratis en la red Sepolia
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">Red Sepolia Activa</span>
                </div>
              </div>
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  🚪 Cerrar Sesión
                </button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Wallet Connection */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <ConnectWallet />
            </div>

            {/* Authentication */}
            {isConnected && !isAuthenticated && (
              <div className="transform transition-all duration-500 ease-in-out animate-fadeIn">
                <Authenticate onAuthenticated={handleAuthenticated} />
              </div>
            )}

            {/* Faucet Dashboard */}
            {isConnected && (
              <div className="transform transition-all duration-500 ease-in-out">
                <FaucetDashboard isAuthenticated={isAuthenticated} />
              </div>
            )}

            {/* Info Section */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-2xl shadow-xl border border-indigo-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <span className="text-2xl">📋</span>
                Información del Contrato
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                    <span className="text-xl">🌐</span>
                    <div>
                      <span className="font-semibold text-gray-700">Red:</span>
                      <span className="ml-2 text-indigo-600 font-medium">Sepolia Testnet</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                    <span className="text-xl">🪙</span>
                    <div>
                      <span className="font-semibold text-gray-700">Token:</span>
                      <span className="ml-2 text-purple-600 font-bold">FAUCET</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                    <span className="text-xl">💰</span>
                    <div>
                      <span className="font-semibold text-gray-700">Cantidad:</span>
                      <span className="ml-2 text-green-600 font-bold">1,000,000 FAUCET</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                    <span className="text-xl">🔍</span>
                    <div>
                      <span className="font-semibold text-gray-700">Explorador:</span>
                      <a 
                        href="https://sepolia.etherscan.io/address/0x3E2117C19A921507EaD57494BbF29032F33C7412" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-500 hover:text-blue-600 font-medium underline decoration-2 hover:decoration-blue-600 transition-all"
                      >
                        Ver en Etherscan
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-white rounded-xl shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📜</span>
                  <span className="font-semibold text-gray-700">Dirección del Contrato:</span>
                </div>
                <code className="text-xs bg-gray-100 p-2 rounded-lg block font-mono text-gray-600 break-all">
                  0x3E2117C19A921507EaD57494BbF29032F33C7412
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
        <Toaster position="top-right" />
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App