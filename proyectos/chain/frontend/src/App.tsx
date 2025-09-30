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
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Chain Faucet DApp</h1>
                <p className="text-gray-600 mt-2">
                  Claim your FAUCET tokens on Sepolia testnet
                </p>
              </div>
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Logout
                </button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Wallet Connection */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <ConnectWallet />
            </div>

            {/* Authentication */}
            {isConnected && !isAuthenticated && (
              <Authenticate onAuthenticated={handleAuthenticated} />
            )}

            {/* Faucet Dashboard */}
            {isConnected && (
              <FaucetDashboard isAuthenticated={isAuthenticated} />
            )}

            {/* Info Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Contract Information</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Network:</strong> Sepolia Testnet</p>
                <p><strong>Contract:</strong> 0x3E2117C19A921507EaD57494BbF29032F33C7412</p>
                <p><strong>Token:</strong> FAUCET</p>
                <p><strong>Amount per claim:</strong> 1,000,000 FAUCET</p>
                <p><strong>Etherscan:</strong> 
                  <a 
                    href="https://sepolia.etherscan.io/address/0x3E2117C19A921507EaD57494BbF29032F33C7412" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 ml-1"
                  >
                    View on Etherscan
                  </a>
                </p>
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