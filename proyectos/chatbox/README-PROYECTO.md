# 🤖 Chatbot con Next.js y AI SDK - Proyecto UAP

## ✅ Estado del Proyecto

### Ya Implementado:
- ✅ **Estructura del proyecto**: Next.js 15 con App Router
- ✅ **Backend seguro**: API route en `/api/chat/route.ts` con validación Zod
- ✅ **Interfaz de chat moderna**: UI responsiva con Tailwind CSS
- ✅ **Streaming de respuestas**: Respuestas en tiempo real del LLM
- ✅ **Manejo de estado**: Hook `useChat` de Vercel AI SDK
- ✅ **Indicadores de carga**: Loading states y typing indicators
- ✅ **Manejo de errores**: Gestión robusta de errores
- ✅ **Validación de inputs**: Sanitización y límites de caracteres
- ✅ **Auto-scroll**: Scroll automático a nuevos mensajes
- ✅ **Sugerencias iniciales**: Cards con ideas para comenzar
- ✅ **Contador de mensajes**: Tracking de conversación

## 🚀 Cómo Ejecutar el Proyecto

### 1. Obtener API Key de OpenRouter (GRATIS)

1. Ve a [https://openrouter.ai/](https://openrouter.ai/)
2. Crea una cuenta (gratis)
3. Ve a "Keys" en el menú
4. Crea una nueva API Key
5. Copia la key (empieza con `sk-or-v1-...`)

### 2. Configurar Variables de Entorno

Edita el archivo `.env.local` y reemplaza `your-api-key-here` con tu API key real:

```env
OPENROUTER_API_KEY=sk-or-v1-TU-API-KEY-AQUI
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=meta-llama/llama-3.2-3b-instruct:free
```

⚠️ **IMPORTANTE**: 
- NUNCA compartas tu API key
- NUNCA la subas a GitHub
- El archivo `.env.local` ya está en `.gitignore`

### 3. Instalar Dependencias (si no lo hiciste)

```bash
npm install
```

### 4. Ejecutar el Servidor de Desarrollo

```bash
npm run dev
```

### 5. Abrir en el Navegador

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
proyectos/chatbox/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts          # Backend API endpoint (SEGURO)
│   │   ├── page.tsx                  # Página principal
│   │   ├── layout.tsx                # Layout de Next.js
│   │   └── globals.css               # Estilos globales
│   └── components/
│       ├── Chat.tsx                  # Componente principal del chat
│       ├── MessageList.tsx           # Lista de mensajes
│       ├── ChatInput.tsx             # Input para escribir mensajes
│       └── ChatHeader.tsx            # Header del chat
├── .env.local                        # Variables de entorno (NO COMMITEAR)
├── package.json                      # Dependencias
└── README-PROYECTO.md                # Este archivo
```

## 🎨 Características Implementadas

### Frontend (Client Components)
- **Chat.tsx**: Componente principal que maneja el estado del chat
- **MessageList.tsx**: Renderiza los mensajes con Markdown support
- **ChatInput.tsx**: Input con validación y límite de caracteres
- **ChatHeader.tsx**: Header con contador de mensajes y estado

### Backend (API Routes)
- **route.ts**: 
  - ✅ Validación con Zod
  - ✅ Sanitización de inputs
  - ✅ Manejo seguro de API keys
  - ✅ Límites de caracteres y mensajes
  - ✅ Streaming de respuestas
  - ✅ Manejo de errores

### Seguridad
- ✅ API keys solo en backend
- ✅ Variables de entorno protegidas
- ✅ Validación de todos los inputs
- ✅ Sanitización de mensajes
- ✅ Límites de caracteres (4000/mensaje)
- ✅ Límites de mensajes (50 máximo)

## 🧪 Probar el Chatbot

1. Escribe un mensaje en el input
2. Presiona Enter o click en "Enviar"
3. Observa el streaming de la respuesta en tiempo real
4. Prueba las sugerencias en las cards

### Ejemplos de Prompts:
- "Explícame qué es React y para qué sirve"
- "Dame 3 ideas para un proyecto web innovador"
- "¿Cómo puedo mejorar el rendimiento de mi app?"
- "Ayúdame a entender Next.js"

## 📚 Tecnologías Utilizadas

- **Next.js 15**: Framework de React con App Router
- **Vercel AI SDK**: Hook useChat para manejo de chat
- **OpenRouter**: Proveedor de LLMs (usando modelo gratuito)
- **Tailwind CSS**: Estilos utility-first
- **TypeScript**: Tipado estático
- **Zod**: Validación de schemas
- **react-markdown**: Renderizado de Markdown

## 🔧 Scripts Disponibles

```bash
npm run dev      # Ejecutar en desarrollo
npm run build    # Construir para producción
npm run start    # Ejecutar en producción
npm run lint     # Ejecutar ESLint
```

## ⚠️ Solución de Problemas

### El chat no responde
- Verifica que tu API key en `.env.local` sea correcta
- Revisa la consola del navegador para errores
- Verifica que el servidor esté corriendo

### Error de API
- Asegúrate de tener créditos en OpenRouter
- Verifica que estés usando un modelo gratuito
- Revisa los logs del servidor

### Error de compilación
- Ejecuta `npm install` nuevamente
- Borra la carpeta `.next` y vuelve a ejecutar `npm run dev`

## 🎯 Requisitos Cumplidos

- ✅ **Interfaz de Chat**: UI moderna y responsiva
- ✅ **Streaming de Respuestas**: Tiempo real
- ✅ **Manejo de Estado**: Persistencia en sesión
- ✅ **Validación de Inputs**: Sanitización y validación
- ✅ **Indicadores de Carga**: Loading y typing indicators
- ✅ **Manejo de Errores**: Gestión robusta

## 📝 Notas de Seguridad

1. **NUNCA** expongas tu API key en el frontend
2. Todas las requests al LLM se hacen desde el backend
3. El archivo `.env.local` está en `.gitignore`
4. Todos los inputs son validados y sanitizados
5. Hay límites de caracteres y mensajes para prevenir abusos

## 🚀 Próximos Pasos (Opcionales)

- [ ] Agregar persistencia con localStorage
- [ ] Implementar rate limiting
- [ ] Agregar autenticación de usuarios
- [ ] Implementar múltiples conversaciones
- [ ] Agregar soporte para imágenes
- [ ] Implementar modo oscuro/claro
- [ ] Agregar tests unitarios

## 📖 Recursos

- [Vercel AI SDK Docs](https://sdk.vercel.ai/)
- [OpenRouter Docs](https://openrouter.ai/docs)
- [Next.js Docs](https://nextjs.org/docs)

---

**Desarrollado para UAP - Programación 4**  
**Ejercicio 13: Chatbot con Next.js y AI SDK**
