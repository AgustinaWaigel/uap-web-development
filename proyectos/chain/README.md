# Chain Project - Web3 Faucet DApp

Este proyecto implementa una aplicación descentralizada (DApp) completa que permite a los usuarios conectar su wallet y reclamar tokens desde un smart contract FaucetToken desplegado en Sepolia.

## Arquitectura del Proyecto

- **Frontend**: Aplicación React con TypeScript, Wagmi, y Web3Modal
- **Backend**: API Express con autenticación Sign-In with Ethereum (SIWE)
- **Smart Contract**: FaucetToken desplegado en Sepolia Testnet

## Estructura del Proyecto

```
chain/
├── frontend/          # Aplicación React
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
├── backend/           # API Express
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── services/
│   ├── package.json
│   └── .env.example
└── README.md
```

## Smart Contract Information

- **Red**: Sepolia Testnet
- **Dirección**: `0x3E2117C19A921507EaD57494BbF29032F33C7412`
- **Etherscan**: https://sepolia.etherscan.io/address/0x3E2117C19A921507EaD57494BbF29032F33C7412
- **Tokens por reclamo**: 1,000,000 FAUCET

## Instalación y Uso

### 1. Configurar el Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurar variables de entorno
npm run dev
```

### 2. Configurar el Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Configurar MetaMask

- Red: Sepolia Testnet
- RPC URL: https://ethereum-sepolia-rpc.publicnode.com
- Chain ID: 11155111

## Funcionalidades

- ✅ Conexión de wallet (MetaMask)
- ✅ Autenticación Sign-In with Ethereum
- ✅ Reclamar tokens del faucet
- ✅ Verificar estado de reclamo
- ✅ Mostrar balance de tokens
- ✅ Lista de usuarios que han reclamado

## Tecnologías Utilizadas

### Frontend
- React 18 con TypeScript
- Vite como bundler
- Wagmi para interacción Web3
- Web3Modal para conexión de wallets
- Tailwind CSS para estilos

### Backend
- Node.js con Express
- TypeScript
- SIWE para autenticación
- JWT para manejo de sesiones
- Viem para interacción con blockchain

## Variables de Entorno

### Backend (.env)
```
PRIVATE_KEY=your_private_key_here
JWT_SECRET=your_jwt_secret_here
RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
CONTRACT_ADDRESS=0x3E2117C19A921507EaD57494BbF29032F33C7412
PORT=3001
```

## Endpoints de la API

- `POST /auth/message` - Obtener mensaje para firmar
- `POST /auth/signin` - Autenticación SIWE
- `POST /faucet/claim` - Reclamar tokens (autenticado)
- `GET /faucet/status/:address` - Estado del faucet (autenticado)

## Desarrollo

Este proyecto forma parte del ejercicio 12 del programa Web Development y demuestra:

1. Integración completa frontend-backend-blockchain
2. Autenticación descentralizada con SIWE
3. Interacción segura con smart contracts
4. Mejores prácticas en desarrollo Web3

## Licencia

MIT