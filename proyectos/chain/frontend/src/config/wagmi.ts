import { http, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { walletConnect, injected } from 'wagmi/connectors'

// Get projectId from https://cloud.walletconnect.com
const projectId = 'your-project-id'

if (!projectId) throw new Error('Project ID is not defined')

export const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
  connectors: [
    walletConnect({ projectId }),
    injected({ shimDisconnect: false }),
  ],
})

export const CONTRACT_ADDRESS = '0x3E2117C19A921507EaD57494BbF29032F33C7412' as const
export const BACKEND_URL = 'http://localhost:3001'