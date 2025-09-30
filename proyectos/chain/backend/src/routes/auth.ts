import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { SiweMessage } from 'siwe'
import { body, validationResult } from 'express-validator'

const router = Router()

// Temporary storage for nonces (in production, use Redis or database)
const nonces = new Map<string, { nonce: string; timestamp: number }>()

// Clean up old nonces every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [address, data] of nonces.entries()) {
    if (now - data.timestamp > 10 * 60 * 1000) { // 10 minutes
      nonces.delete(address)
    }
  }
}, 10 * 60 * 1000)

/**
 * POST /auth/message
 * Generate a SIWE message for the user to sign
 */
router.post('/message', 
  body('address').isEthereumAddress().withMessage('Invalid Ethereum address'),
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { address } = req.body
    
    // Generate a random nonce
    const nonce = Math.random().toString(36).substring(2, 15)
    
    // Store nonce temporarily
    nonces.set(address.toLowerCase(), {
      nonce,
      timestamp: Date.now()
    })

    // Create SIWE message
    const siweMessage = new SiweMessage({
      domain: req.headers.host || 'localhost:3001',
      address,
      statement: 'Sign in with Ethereum to access the Faucet DApp.',
      uri: req.headers.origin || 'http://localhost:3000',
      version: '1',
      chainId: 11155111, // Sepolia
      nonce,
    })

    const message = siweMessage.prepareMessage()

    res.json({ message, nonce })
  }
)

/**
 * POST /auth/signin
 * Verify SIWE signature and return JWT token
 */
router.post('/signin',
  body('message').notEmpty().withMessage('Message is required'),
  body('signature').notEmpty().withMessage('Signature is required'),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { message, signature } = req.body

      // Parse the SIWE message
      const siweMessage = new SiweMessage(message)
      
      // Verify the signature
      const result = await siweMessage.verify({ signature })

      if (!result.success) {
        return res.status(401).json({ error: 'Invalid signature' })
      }

      // Check if nonce exists and is valid
      const storedNonce = nonces.get(siweMessage.address.toLowerCase())
      if (!storedNonce || storedNonce.nonce !== siweMessage.nonce) {
        return res.status(401).json({ error: 'Invalid or expired nonce' })
      }

      // Remove used nonce
      nonces.delete(siweMessage.address.toLowerCase())

      // Generate JWT token
      const token = jwt.sign(
        { address: siweMessage.address },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      )

      res.json({ token, address: siweMessage.address })
    } catch (error) {
      console.error('SIWE verification error:', error)
      res.status(500).json({ error: 'Authentication failed' })
    }
  }
)

export default router