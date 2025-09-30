import React from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-white text-xl">✅</span>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Wallet Conectada</p>
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-xl text-sm font-mono font-semibold border border-green-200">
              {address?.slice(0, 8)}...{address?.slice(-6)}
            </div>
          </div>
        </div>
        <button
          onClick={() => disconnect()}
          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
        >
          <span>🔌</span>
          Desconectar
        </button>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <span className="text-white text-2xl">👛</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Conectar Wallet</h3>
        <p className="text-gray-600">Conecta tu wallet para comenzar a reclamar tokens</p>
      </div>
      
      <div className="space-y-4 max-w-md mx-auto">
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3 font-semibold text-lg"
          >
            <span className="text-2xl">🦊</span>
            Conectar con {connector.name}
          </button>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <p className="text-sm text-blue-700">
          <span className="font-semibold">💡 Tip:</span> Asegúrate de estar en la red Sepolia para usar el faucet
        </p>
      </div>
    </div>
  )
}

export default ConnectWallet