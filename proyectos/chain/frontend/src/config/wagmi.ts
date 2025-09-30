import { http, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http('https://ethereum-sepolia-rpc.publicnode.com'),
  },
  connectors: [
    injected({ shimDisconnect: false }),
  ],
})

export const CONTRACT_ADDRESS = '0x3E2117C19A921507EaD57494BbF29032F33C7412' as const
export const BACKEND_URL = 'http://localhost:3001'