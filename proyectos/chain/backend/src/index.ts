import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth.js'
import faucetRoutes from './routes/faucet.js'

// Load environment variables
console.log('🔧 Loading environment variables...')
dotenv.config()

console.log('📝 Environment check:')
console.log('- NODE_ENV:', process.env.NODE_ENV)
console.log('- PORT:', process.env.PORT)
console.log('- PRIVATE_KEY:', process.env.PRIVATE_KEY ? `${process.env.PRIVATE_KEY.substring(0, 8)}...` : 'NOT SET')
console.log('- RPC_URL:', process.env.RPC_URL)
console.log('- CONTRACT_ADDRESS:', process.env.CONTRACT_ADDRESS)
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET')

const app = express()
const PORT = process.env.PORT || 3001

console.log('🚀 Starting Express server...')

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(limiter)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/auth', authRoutes)
app.use('/faucet', faucetRoutes)

// Health check endpoint
app.get('/health', (_, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// 404 handler
app.use('*', (_, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Global error handler
app.use((err: any, _: express.Request, res: express.Response) => {
  console.error('Error:', err)
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

console.log('🎧 Starting server on port', PORT)

app.listen(PORT, () => {
  console.log('=================================')
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL}`)
  console.log(`🔗 Contract: ${process.env.CONTRACT_ADDRESS}`)
  console.log(`🌐 Backend URL: http://localhost:${PORT}`)
  console.log('=================================')
})