import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { faucetApi, FaucetStatusResponse } from '../services/api'
import toast from 'react-hot-toast'
import TransactionSimulation from './TransactionSimulation'

interface FaucetDashboardProps {
  isAuthenticated: boolean
}

type ActiveTab = 'dashboard' | 'transactions'

export function FaucetDashboard({ isAuthenticated }: FaucetDashboardProps) {
  const { address } = useAccount()
  const [status, setStatus] = useState<FaucetStatusResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard')

  const fetchStatus = async () => {
    if (!address || !isAuthenticated) return

    setIsLoading(true)
    try {
      const statusData = await faucetApi.getStatus(address)
      setStatus(statusData)
    } catch (error) {
      console.error('Error fetching status:', error)
      toast.error('Failed to fetch faucet status')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClaim = async () => {
    if (!address || !isAuthenticated) return

    setIsClaiming(true)
    try {
      const result = await faucetApi.claimTokens()
      if (result.success) {
        toast.success(`Tokens claimed! TX: ${result.txHash}`)
        // Refresh status after claim
        await fetchStatus()
      } else {
        toast.error('Failed to claim tokens')
      }
    } catch (error) {
      console.error('Error claiming tokens:', error)
      toast.error('Failed to claim tokens')
    } finally {
      setIsClaiming(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [address, isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 text-yellow-800 p-6 rounded-2xl shadow-lg flex items-center gap-4">
        <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
          <span className="text-white text-xl">🔐</span>
        </div>
        <div>
          <h3 className="font-bold text-lg">Autenticación Requerida</h3>
          <p>Por favor autentica tu wallet para acceder al faucet</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl">
        <div className="flex items-center justify-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg text-gray-600">Cargando información del faucet...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-300 ${
            activeTab === 'dashboard'
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span className="text-lg mr-2">📊</span>
          Dashboard Principal
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-300 ${
            activeTab === 'transactions'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span className="text-lg mr-2">💸</span>
          Simulación de Transacciones
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-8">
        {activeTab === 'dashboard' && (
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl">📊</span>
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Dashboard del Faucet
              </h3>
            </div>
            
            {status && (
              <div className="space-y-6">
                {/* Balance */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">💰</span>
                    <h4 className="text-xl font-bold text-blue-800">Tu Balance</h4>
                  </div>
                  <p className="text-4xl font-bold text-blue-600 mb-2">
                    {(parseFloat(status.balance) / 1e18).toLocaleString()} 
                    <span className="text-2xl text-blue-500 ml-2">FAUCET</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-blue-600">Balance actualizado</span>
                  </div>
                </div>

                {/* Claim Status */}
                <div className={`p-6 rounded-2xl shadow-lg border-2 ${
                  status.hasClaimed 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                    : 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200'
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{status.hasClaimed ? '✅' : '⏳'}</span>
                    <h4 className="text-xl font-bold text-gray-800">Estado del Reclamo</h4>
                  </div>
                  <p className={`text-lg font-semibold mb-4 ${
                    status.hasClaimed ? 'text-green-700' : 'text-orange-700'
                  }`}>
                    {status.hasClaimed 
                      ? '¡Ya reclamaste tus tokens!' 
                      : 'Aún puedes reclamar tokens gratis'
                    }
                  </p>
                  
                  {!status.hasClaimed && (
                    <button
                      onClick={handleClaim}
                      disabled={isClaiming}
                      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg flex items-center gap-3 font-bold text-lg"
                    >
                      <span className="text-xl">{isClaiming ? '⏳' : '🎁'}</span>
                      {isClaiming ? 'Reclamando...' : 'Reclamar 1,000,000 FAUCET Tokens'}
                    </button>
                  )}
                </div>

                {/* Users List */}
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-2xl border border-gray-200 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">👥</span>
                    <h4 className="text-xl font-bold text-gray-800">
                      Usuarios que Reclamaron ({status.users.length})
                    </h4>
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {status.users.length > 0 ? (
                      <ul className="space-y-2">
                        {status.users.map((user, index) => (
                          <li key={index} className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-700 font-mono font-medium">
                              {user.slice(0, 10)}...{user.slice(-8)}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              #{index + 1}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-8">
                        <span className="text-4xl mb-3 block">🚀</span>
                        <p className="text-gray-500">¡Sé el primero en reclamar tokens!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <button
                onClick={fetchStatus}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-3 font-semibold"
              >
                <span className="text-lg">🔄</span>
                Actualizar Estado
              </button>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <TransactionSimulation isAuthenticated={isAuthenticated} />
        )}
      </div>
    </div>
  )
}

export default FaucetDashboard