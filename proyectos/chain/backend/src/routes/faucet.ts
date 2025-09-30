import { Router } from 'express'
import { param, validationResult } from 'express-validator'
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js'
import { BlockchainService } from '../services/blockchain.js'

const router = Router()

/**
 * GET /faucet/status/:address
 * Get faucet status for a specific address
 */
router.get('/status/:address',
  authenticateToken,
  param('address').isEthereumAddress().withMessage('Invalid Ethereum address'),
  async (req: AuthenticatedRequest, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { address } = req.params

      // Verify that the authenticated user is requesting their own status
      if (req.user?.address.toLowerCase() !== address.toLowerCase()) {
        return res.status(403).json({ error: 'Access denied: can only check your own status' })
      }

      // Get claim status
      const hasClaimed = await BlockchainService.hasAddressClaimed(address)
      
      // Get token balance
      const balance = await BlockchainService.getTokenBalance(address)
      
      // Get all faucet users
      const users = await BlockchainService.getFaucetUsers()

      res.json({
        hasClaimed,
        balance,
        users,
      })
    } catch (error) {
      console.error('Error getting faucet status:', error)
      res.status(500).json({ error: 'Failed to get faucet status' })
    }
  }
)

/**
 * POST /faucet/claim
 * Claim tokens from the faucet
 */
router.post('/claim',
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userAddress = req.user?.address

      if (!userAddress) {
        return res.status(401).json({ error: 'User address not found' })
      }

      // Check if user has already claimed
      const hasClaimed = await BlockchainService.hasAddressClaimed(userAddress)
      if (hasClaimed) {
        return res.status(400).json({ error: 'Address has already claimed tokens' })
      }

      // Claim tokens (this will be executed by the backend's private key)
      const txHash = await BlockchainService.claimTokens()

      res.json({
        success: true,
        txHash,
        message: '1,000,000 FAUCET tokens claimed successfully!'
      })
    } catch (error) {
      console.error('Error claiming tokens:', error)
      res.status(500).json({ 
        success: false,
        error: 'Failed to claim tokens',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
)

/**
 * GET /faucet/info
 * Get general faucet information
 */
router.get('/info', async (req, res) => {
  try {
    const faucetAmount = await BlockchainService.getFaucetAmount()
    const users = await BlockchainService.getFaucetUsers()

    res.json({
      contractAddress: process.env.CONTRACT_ADDRESS,
      faucetAmount,
      totalUsers: users.length,
      network: 'Sepolia Testnet',
      chainId: 11155111,
    })
  } catch (error) {
    console.error('Error getting faucet info:', error)
    res.status(500).json({ error: 'Failed to get faucet information' })
  }
})

export default router