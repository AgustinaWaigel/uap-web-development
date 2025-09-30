# Instrucciones de Instalación y Configuración

## Prerrequisitos

- Node.js 18+ instalado
- MetaMask u otra wallet EVM compatible
- Faucet de Sepolia para obtener ETH de prueba

## 1. Clonar y Configurar el Proyecto

```bash
# Navegar al directorio del proyecto
cd proyectos/chain
```

## 2. Configurar el Backend

```bash
# Ir al directorio backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Editar .env con tus datos
# - PRIVATE_KEY: Clave privada de una wallet con ETH en Sepolia
# - JWT_SECRET: Una clave secreta fuerte para JWT
# - Mantener otros valores por defecto
```

### Variables de Entorno del Backend

Edita el archivo `.env`:

```env
NODE_ENV=development
PORT=3001
JWT_SECRET=tu-clave-secreta-super-fuerte-cambia-esto
PRIVATE_KEY=0xtu_clave_privada_aqui
RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
CONTRACT_ADDRESS=0x3E2117C19A921507EaD57494BbF29032F33C7412
FRONTEND_URL=http://localhost:3000
```

⚠️ **Importante**: La `PRIVATE_KEY` debe ser de una wallet que tenga ETH en Sepolia para pagar el gas de las transacciones.

```bash
# Iniciar el servidor backend
npm run dev
```

El backend estará disponible en: http://localhost:3001

## 3. Configurar el Frontend

```bash
# Abrir nueva terminal e ir al directorio frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar la aplicación
npm run dev
```

La aplicación estará disponible en: http://localhost:3000

## 4. Configurar MetaMask

### Agregar Red Sepolia

1. Abrir MetaMask
2. Ir a Configuración > Redes > Agregar red
3. Configurar:
   - **Nombre de la red**: Sepolia Testnet
   - **RPC URL**: https://ethereum-sepolia-rpc.publicnode.com
   - **Chain ID**: 11155111
   - **Símbolo**: ETH
   - **Block Explorer**: https://sepolia.etherscan.io

### Obtener ETH de Prueba

Visita un faucet de Sepolia para obtener ETH:
- https://cloud.google.com/application/web3/faucet/ethereum/sepolia
- https://sepoliafaucet.com/

## 5. Usar la Aplicación

1. **Conectar Wallet**: Haz clic en "Conectar con MetaMask"
2. **Autenticar**: Firma el mensaje de autenticación SIWE
3. **Reclamar Tokens**: Si es tu primera vez, podrás reclamar 1,000,000 FAUCET tokens
4. **Ver Status**: Revisa tu balance y la lista de usuarios

## Scripts Disponibles

### Backend
- `npm run dev` - Iniciar servidor en modo desarrollo
- `npm run build` - Compilar TypeScript
- `npm start` - Iniciar servidor en producción
- `npm run lint` - Ejecutar linter

### Frontend
- `npm run dev` - Iniciar aplicación en modo desarrollo
- `npm run build` - Construir para producción
- `npm run preview` - Previsualizar build de producción
- `npm run lint` - Ejecutar linter

## Solución de Problemas

### Backend no inicia
- Verificar que todas las variables de entorno estén configuradas
- Verificar que la `PRIVATE_KEY` sea válida y tenga formato hexadecimal
- Verificar que el puerto 3001 esté disponible

### Frontend no se conecta al backend
- Verificar que el backend esté ejecutándose en puerto 3001
- Verificar configuración de CORS en el backend
- Revisar la consola del navegador para errores

### Error al reclamar tokens
- Verificar que la wallet del backend tenga ETH en Sepolia
- Verificar que no hayas reclamado tokens previamente
- Revisar los logs del backend para detalles del error

### MetaMask no se conecta
- Verificar que MetaMask esté instalado y desbloqueado
- Verificar que estés en la red Sepolia
- Refrescar la página e intentar nuevamente

## Estructura de Archivos

```
chain/
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.ts          # Middleware de autenticación JWT
│   │   ├── routes/
│   │   │   ├── auth.ts          # Rutas de autenticación SIWE
│   │   │   └── faucet.ts        # Rutas del faucet
│   │   ├── services/
│   │   │   └── blockchain.ts    # Servicio para interactuar con el contrato
│   │   └── index.ts             # Servidor principal
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ConnectWallet.tsx
    │   │   ├── Authenticate.tsx
    │   │   └── FaucetDashboard.tsx
    │   ├── config/
    │   │   └── wagmi.ts         # Configuración de Wagmi
    │   ├── services/
    │   │   └── api.ts           # Cliente API
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    ├── vite.config.ts
    └── tailwind.config.js
```

## Próximos Pasos

1. Personalizar la interfaz de usuario
2. Agregar más funcionalidades al smart contract
3. Implementar una base de datos para persistir datos
4. Agregar tests unitarios
5. Desplegar en producción

¡Ya tienes una DApp completa funcionando! 🚀