import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { faucetApi, FaucetStatusResponse } from '../services/api'
import toast from 'react-hot-toast'

interface FaucetDashboardProps {
  isAuthenticated: boolean
}

export function FaucetDashboard({ isAuthenticated }: FaucetDashboardProps) {
  const { address } = useAccount()
  const [status, setStatus] = useState<FaucetStatusResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)

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
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        Please authenticate to access the faucet
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse">Loading faucet information...</div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Faucet Dashboard</h3>
      
      {status && (
        <div className="space-y-4">
          {/* Balance */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800">Your Balance</h4>
            <p className="text-2xl font-bold text-blue-600">
              {(parseFloat(status.balance) / 1e18).toLocaleString()} FAUCET
            </p>
          </div>

          {/* Claim Status */}
          <div className={`p-4 rounded-lg ${status.hasClaimed ? 'bg-green-50' : 'bg-orange-50'}`}>
            <h4 className={`font-semibold ${status.hasClaimed ? 'text-green-800' : 'text-orange-800'}`}>
              Claim Status
            </h4>
            <p className={status.hasClaimed ? 'text-green-600' : 'text-orange-600'}>
              {status.hasClaimed ? 'You have already claimed tokens' : 'You can claim 1,000,000 FAUCET tokens'}
            </p>
          </div>

          {/* Claim Button */}
          {!status.hasClaimed && (
            <button
              onClick={handleClaim}
              disabled={isClaiming}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isClaiming ? 'Claiming...' : 'Claim 1,000,000 FAUCET Tokens'}
            </button>
          )}

          {/* Users List */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">
              Users who claimed ({status.users.length})
            </h4>
            <div className="max-h-32 overflow-y-auto">
              {status.users.length > 0 ? (
                <ul className="space-y-1">
                  {status.users.map((user, index) => (
                    <li key={index} className="text-sm text-gray-600 font-mono">
                      {user}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No users have claimed yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={fetchStatus}
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
      >
        Refresh Status
      </button>
    </div>
  )
}

export default FaucetDashboard