import { createPublicClient, createWalletClient, http, getContract, parseEther } from 'viem'
import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import dotenv from 'dotenv'

// Load environment variables
console.log('🔗 Loading blockchain service...')
dotenv.config()

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

// Validate environment variables and initialize clients
console.log('✅ Validating environment variables...')

if (!process.env.PRIVATE_KEY) {
  console.error('❌ PRIVATE_KEY environment variable is not set')
  throw new Error('PRIVATE_KEY environment variable is not set')
}
console.log('✅ PRIVATE_KEY is set')

if (!process.env.RPC_URL) {
  console.error('❌ RPC_URL environment variable is not set')
  throw new Error('RPC_URL environment variable is not set')
}
console.log('✅ RPC_URL is set:', process.env.RPC_URL)

if (!process.env.CONTRACT_ADDRESS) {
  console.error('❌ CONTRACT_ADDRESS environment variable is not set')
  throw new Error('CONTRACT_ADDRESS environment variable is not set')
}
console.log('✅ CONTRACT_ADDRESS is set:', process.env.CONTRACT_ADDRESS)

// Format private key (add 0x prefix if not present)
console.log('🔑 Formatting private key...')
const privateKey = process.env.PRIVATE_KEY.startsWith('0x') 
  ? process.env.PRIVATE_KEY 
  : `0x${process.env.PRIVATE_KEY}`

console.log('🔑 Private key formatted, length:', privateKey.length)

// Declare variables outside try-catch for global access
let publicClient: any
let walletClient: any
let faucetContract: any
let account: any

// Create clients
try {
  console.log('🌐 Creating Ethereum clients...')
  console.log('🌐 Using RPC URL:', process.env.RPC_URL)

  publicClient = createPublicClient({
    chain: sepolia,
    transport: http(process.env.RPC_URL),
  })

  console.log('👤 Creating account from private key...')
  account = privateKeyToAccount(privateKey as `0x${string}`)
  console.log('👤 Account created:', account.address)

  walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(process.env.RPC_URL),
  })

  // Create contract instance
  faucetContract = getContract({
    address: process.env.CONTRACT_ADDRESS! as `0x${string}`,
    abi: FAUCET_TOKEN_ABI,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  })

  console.log('✅ All blockchain components initialized successfully!')

} catch (error) {
  console.error('❌ Error initializing blockchain service:', error)
  console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
  // Don't throw here, let the server start but log the error
}

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