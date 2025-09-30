import { createPublicClient, createWalletClient, http, getContract, parseEther } from 'viem'
import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

// Contract ABI for the FaucetToken
const FAUCET_TOKEN_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'hasAddressClaimed',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'claimTokens',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getFaucetUsers',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getFaucetAmount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// Create clients
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.RPC_URL),
})

const account = privateKeyToAccount(process.env.PRIVATE_KEY! as `0x${string}`)

const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(process.env.RPC_URL),
})

// Create contract instance
const faucetContract = getContract({
  address: process.env.CONTRACT_ADDRESS! as `0x${string}`,
  abi: FAUCET_TOKEN_ABI,
  client: {
    public: publicClient,
    wallet: walletClient,
  },
})

export class BlockchainService {
  static async hasAddressClaimed(address: string): Promise<boolean> {
    try {
      const result = await faucetContract.read.hasAddressClaimed([address as `0x${string}`])
      return result
    } catch (error) {
      console.error('Error checking claim status:', error)
      throw new Error('Failed to check claim status')
    }
  }

  static async claimTokens(): Promise<string> {
    try {
      const hash = await faucetContract.write.claimTokens()
      return hash
    } catch (error) {
      console.error('Error claiming tokens:', error)
      throw new Error('Failed to claim tokens')
    }
  }

  static async getFaucetUsers(): Promise<string[]> {
    try {
      const users = await faucetContract.read.getFaucetUsers()
      return Array.from(users)
    } catch (error) {
      console.error('Error getting faucet users:', error)
      throw new Error('Failed to get faucet users')
    }
  }

  static async getTokenBalance(address: string): Promise<string> {
    try {
      const balance = await faucetContract.read.balanceOf([address as `0x${string}`])
      return balance.toString()
    } catch (error) {
      console.error('Error getting token balance:', error)
      throw new Error('Failed to get token balance')
    }
  }

  static async getFaucetAmount(): Promise<string> {
    try {
      const amount = await faucetContract.read.getFaucetAmount()
      return amount.toString()
    } catch (error) {
      console.error('Error getting faucet amount:', error)
      throw new Error('Failed to get faucet amount')
    }
  }
}