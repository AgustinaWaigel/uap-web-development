import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import toast from 'react-hot-toast'

interface TransactionSimulationProps {
  isAuthenticated: boolean
}

interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  timestamp: number
  status: 'success' | 'pending' | 'failed'
}

interface TransactionHistory {
  address: string
  transactions: Transaction[]
  count: number
}

export function TransactionSimulation({ isAuthenticated }: TransactionSimulationProps) {
  const { address } = useAccount()
  const [activeSection, setActiveSection] = useState<'transfer' | 'history' | 'approve'>('transfer')
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<TransactionHistory | null>(null)

  // Transfer form state
  const [transferData, setTransferData] = useState({
    toAddress: '',
    amount: ''
  })

  // Approve form state
  const [approveData, setApproveData] = useState({
    spenderAddress: '',
    amount: ''
  })

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated || !address) {
      toast.error('Por favor autentica tu wallet primero')
      return
    }

    if (!transferData.toAddress || !transferData.amount) {
      toast.error('Por favor completa todos los campos')
      return
    }

    if (parseFloat(transferData.amount) <= 0) {
      toast.error('La cantidad debe ser mayor a 0')
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        toast.error('Token de autenticación no encontrado')
        return
      }

      const response = await fetch('http://localhost:3001/api/faucet/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(transferData)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success(`¡Tokens transferidos exitosamente! TX: ${result.txHash}`)
        setTransferData({ toAddress: '', amount: '' })
        // Actualizar historial si está visible
        if (activeSection === 'history') {
          await fetchHistory()
        }
      } else {
        toast.error(result.error || 'Error al transferir tokens')
      }
    } catch (error) {
      console.error('Error transferring tokens:', error)
      toast.error('Error al transferir tokens')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated || !address) {
      toast.error('Por favor autentica tu wallet primero')
      return
    }

    if (!approveData.spenderAddress || !approveData.amount) {
      toast.error('Por favor completa todos los campos')
      return
    }

    if (parseFloat(approveData.amount) <= 0) {
      toast.error('La cantidad debe ser mayor a 0')
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        toast.error('Token de autenticación no encontrado')
        return
      }

      const response = await fetch('http://localhost:3001/api/faucet/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(approveData)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success(`¡Tokens aprobados exitosamente! TX: ${result.txHash}`)
        setApproveData({ spenderAddress: '', amount: '' })
      } else {
        toast.error(result.error || 'Error al aprobar tokens')
      }
    } catch (error) {
      console.error('Error approving tokens:', error)
      toast.error('Error al aprobar tokens')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchHistory = async () => {
    if (!isAuthenticated || !address) return

    setIsLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        toast.error('Token de autenticación no encontrado')
        return
      }

      const response = await fetch(`http://localhost:3001/api/faucet/history/${address}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setHistory(data)
      } else {
        toast.error('Error al obtener historial')
      }
    } catch (error) {
      console.error('Error fetching history:', error)
      toast.error('Error al obtener historial')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (activeSection === 'history' && isAuthenticated) {
      fetchHistory()
    }
  }, [activeSection, isAuthenticated, address])

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🔐</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Autenticación Requerida</h3>
        <p className="text-gray-600">
          Necesitas autenticarte para usar las funciones de simulación de transacciones.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
          <span className="text-white text-2xl">💸</span>
        </div>
        <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Simulación de Transacciones
        </h3>
      </div>

      {/* Section Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-8">
        <button
          onClick={() => setActiveSection('transfer')}
          className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
            activeSection === 'transfer'
              ? 'bg-white text-purple-600 shadow-md'
              : 'text-gray-600 hover:text-purple-600'
          }`}
        >
          <span className="mr-2">💸</span>
          Transferir Tokens
        </button>
        <button
          onClick={() => setActiveSection('history')}
          className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
            activeSection === 'history'
              ? 'bg-white text-purple-600 shadow-md'
              : 'text-gray-600 hover:text-purple-600'
          }`}
        >
          <span className="mr-2">📊</span>
          Historial
        </button>
        <button
          onClick={() => setActiveSection('approve')}
          className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
            activeSection === 'approve'
              ? 'bg-white text-purple-600 shadow-md'
              : 'text-gray-600 hover:text-purple-600'
          }`}
        >
          <span className="mr-2">💰</span>
          Aprobar Tokens
        </button>
      </div>

      {/* Transfer Section */}
      {activeSection === 'transfer' && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-200 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">💸</span>
            <h4 className="text-2xl font-bold text-purple-800">Transferir Tokens FAUCET</h4>
          </div>
          
          <form onSubmit={handleTransfer} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-purple-700 mb-2">
                Dirección de Destino
              </label>
              <input
                type="text"
                value={transferData.toAddress}
                onChange={(e) => setTransferData({ ...transferData, toAddress: e.target.value })}
                placeholder="0x..."
                className="w-full px-4 py-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-purple-700 mb-2">
                Cantidad de Tokens
              </label>
              <input
                type="number"
                value={transferData.amount}
                onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                placeholder="1000"
                min="0"
                step="0.000000000000000001"
                className="w-full px-4 py-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Transfiriendo...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <span>💸</span>
                  <span>Transferir Tokens</span>
                </div>
              )}
            </button>
          </form>

          <div className="mt-6 bg-purple-100 border border-purple-300 rounded-xl p-4">
            <p className="text-purple-800 text-sm">
              <span className="font-semibold">💡 Nota:</span> Esta función simula una transferencia real de tokens en la blockchain. 
              Asegúrate de tener suficientes tokens en tu balance antes de realizar la transferencia.
            </p>
          </div>
        </div>
      )}

      {/* History Section */}
      {activeSection === 'history' && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📊</span>
              <h4 className="text-2xl font-bold text-blue-800">Historial de Transacciones</h4>
            </div>
            <button
              onClick={fetchHistory}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2"
            >
              <span>🔄</span>
              Actualizar
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-lg text-blue-600">Cargando historial...</span>
              </div>
            </div>
          ) : history && history.transactions.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {history.transactions.map((tx, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        tx.status === 'success' ? 'bg-green-500' : 
                        tx.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="font-semibold text-gray-800">
                        {tx.status === 'success' ? '✅ Exitosa' : 
                         tx.status === 'pending' ? '⏳ Pendiente' : '❌ Fallida'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(tx.timestamp * 1000).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-600">Hash:</span>
                      <p className="font-mono text-gray-800 break-all">{tx.hash}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-600">Cantidad:</span>
                      <p className="text-gray-800">{(parseFloat(tx.value) / 1e18).toLocaleString()} FAUCET</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-600">De:</span>
                      <p className="font-mono text-gray-800 break-all">{tx.from}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-600">Para:</span>
                      <p className="font-mono text-gray-800 break-all">{tx.to}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📋</span>
              <h5 className="text-xl font-semibold text-gray-700 mb-2">No hay transacciones</h5>
              <p className="text-gray-500">
                Aún no has realizado ninguna transferencia de tokens.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Approve Section */}
      {activeSection === 'approve' && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-200 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">💰</span>
            <h4 className="text-2xl font-bold text-green-800">Aprobar Tokens</h4>
          </div>
          
          <form onSubmit={handleApprove} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-green-700 mb-2">
                Dirección del Gastador (Spender)
              </label>
              <input
                type="text"
                value={approveData.spenderAddress}
                onChange={(e) => setApproveData({ ...approveData, spenderAddress: e.target.value })}
                placeholder="0x..."
                className="w-full px-4 py-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-green-700 mb-2">
                Cantidad a Aprobar
              </label>
              <input
                type="number"
                value={approveData.amount}
                onChange={(e) => setApproveData({ ...approveData, amount: e.target.value })}
                placeholder="1000"
                min="0"
                step="0.000000000000000001"
                className="w-full px-4 py-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Aprobando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <span>💰</span>
                  <span>Aprobar Tokens</span>
                </div>
              )}
            </button>
          </form>

          <div className="mt-6 bg-green-100 border border-green-300 rounded-xl p-4">
            <p className="text-green-800 text-sm">
              <span className="font-semibold">💡 Explicación:</span> Aprobar tokens permite que otra dirección (como un contrato inteligente) 
              gaste una cantidad específica de tus tokens en tu nombre. Esto es útil para interactuar con DeFi y otros protocolos.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionSimulation