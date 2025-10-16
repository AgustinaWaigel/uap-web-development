import { Router, Request, Response } from 'express'
import { param, body, validationResult } from 'express-validator'
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
  async (req: AuthenticatedRequest, res: Response) => {
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
  async (req: AuthenticatedRequest, res: Response) => {
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
router.get('/info', async (_req: Request, res: Response) => {
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

/**
 * POST /faucet/transfer
 * Transfer tokens to another address
 */
router.post('/transfer',
  authenticateToken,
  [
    body('toAddress').isEthereumAddress().withMessage('Invalid recipient address'),
    body('amount').isNumeric().withMessage('Invalid amount')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { toAddress, amount } = req.body

      // Verificar que el usuario tenga suficientes tokens
      const balance = await BlockchainService.getTokenBalance(req.user!.address)
      const balanceNumber = parseFloat(balance) / 1e18
      const amountNumber = parseFloat(amount)

      if (balanceNumber < amountNumber) {
        return res.status(400).json({ error: 'Insufficient balance' })
      }

      const txHash = await BlockchainService.transferTokens(toAddress, amount)

      res.json({
        success: true,
        txHash,
        message: `Successfully transferred ${amount} FAUCET tokens to ${toAddress}`
      })
    } catch (error) {
      console.error('Error transferring tokens:', error)
      res.status(500).json({ error: 'Failed to transfer tokens' })
    }
  }
)

/**
 * GET /faucet/history/:address?
 * Get transaction history
 */
router.get('/history/:address?',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { address } = req.params
      const targetAddress = address || req.user!.address

      // Solo permitir ver el historial propio a menos que sea admin
      if (targetAddress.toLowerCase() !== req.user!.address.toLowerCase()) {
        return res.status(403).json({ error: 'Access denied: can only view your own history' })
      }

      const history = await BlockchainService.getTransferHistory(targetAddress)

      res.json({
        address: targetAddress,
        transactions: history,
        count: history.length
      })
    } catch (error) {
      console.error('Error getting transaction history:', error)
      res.status(500).json({ error: 'Failed to get transaction history' })
    }
  }
)

/**
 * GET /faucet/transaction/:hash
 * Get detailed transaction information
 */
router.get('/transaction/:hash',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { hash } = req.params
      const details = await BlockchainService.getTransactionDetails(hash)

      res.json(details)
    } catch (error) {
      console.error('Error getting transaction details:', error)
      res.status(500).json({ error: 'Failed to get transaction details' })
    }
  }
)

/**
 * POST /faucet/approve
 * Approve tokens for another address to spend
 */
router.post('/approve',
  authenticateToken,
  [
    body('spenderAddress').isEthereumAddress().withMessage('Invalid spender address'),
    body('amount').isNumeric().withMessage('Invalid amount')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { spenderAddress, amount } = req.body
      const txHash = await BlockchainService.approveTokens(spenderAddress, amount)

      res.json({
        success: true,
        txHash,
        message: `Successfully approved ${amount} FAUCET tokens for ${spenderAddress}`
      })
    } catch (error) {
      console.error('Error approving tokens:', error)
      res.status(500).json({ error: 'Failed to approve tokens' })
    }
  }
)

export default router