import React from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </div>
        <button
          onClick={() => disconnect()}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Desconectar
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-semibold mb-2">Conectar Wallet</h3>
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Conectar con {connector.name}
        </button>
      ))}
    </div>
  )
}

export default ConnectWallet