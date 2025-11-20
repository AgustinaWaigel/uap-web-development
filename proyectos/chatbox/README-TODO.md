# 🤖✅ AI Todo Manager - Ejercicio 13 Parte 2B

## Descripción del Proyecto

Gestor de tareas inteligente con interfaz conversacional que utiliza Next.js, el AI SDK de Vercel, OpenRouter (LLM), y Prisma con SQLite. Los usuarios gestionan tareas naturalmente a través de una conversación con el asistente de IA, que puede ejecutar operaciones CRUD, búsquedas avanzadas y generar estadísticas de productividad.

## ✨ Características Implementadas

### ✅ Requisitos Obligatorios Cumplidos

1. **Interfaz de Chat Conversacional**: UI moderna donde los usuarios gestionan tareas naturalmente
2. **Sistema de Tool Calling**: El LLM puede ejecutar las 5 herramientas definidas
3. **API Local de Tareas**: Backend propio para gestionar CRUD de tareas
4. **Base de Datos Persistente**: SQLite con Prisma para almacenamiento de tareas
5. **Búsqueda y Filtros Avanzados**: Capacidad de buscar y filtrar tareas por múltiples criterios
6. **Sistema de Estadísticas**: Analytics de productividad del usuario
7. **Manejo de Estado**: Persistencia de conversación y sincronización de datos

### 🛠️ Herramientas (Tools) Implementadas

#### 1. **createTask**
Crear una nueva tarea en el sistema.

**Ejemplo de uso:**
- "Agregar tarea: comprar leche"
- "Necesito recordar llamar al doctor mañana"
- "Crea una tarea para terminar el informe con prioridad alta"

**Parámetros:**
- `title` (requerido): Título de la tarea
- `priority` (opcional): "low" | "medium" | "high"
- `dueDate` (opcional): Fecha límite en formato ISO
- `category` (opcional): "work" | "personal" | "shopping" | "health" | "other"
- `description` (opcional): Descripción adicional

#### 2. **updateTask**
Modificar una tarea existente.

**Ejemplo de uso:**
- "Marca como completada la tarea de comprar leche"
- "Cambia la prioridad de 'hacer ejercicio' a alta"
- "Renombra la tarea 'informe' a 'informe trimestral Q1'"

**Parámetros:**
- `taskId` (requerido): ID único de la tarea
- `title` (opcional): Nuevo título
- `completed` (opcional): Estado de completitud
- `priority` (opcional): Nueva prioridad
- `dueDate` (opcional): Nueva fecha límite
- `category` (opcional): Nueva categoría

#### 3. **deleteTask**
Eliminar permanentemente una tarea (soft delete).

**Ejemplo de uso:**
- "Elimina la tarea de comprar leche"
- "Borra todas las tareas completadas"
- "Quita esa tarea de mi lista"

**Parámetros:**
- `taskId` (requerido): ID único de la tarea
- `confirm` (opcional): Flag de confirmación

#### 4. **searchTasks**
Buscar, filtrar y listar tareas según diversos criterios.

**Ejemplo de uso:**
- "Muéstrame todas mis tareas"
- "¿Qué tareas tengo pendientes?"
- "Lista las tareas de alta prioridad"
- "Busca tareas que contengan 'informe'"
- "Muestra tareas completadas esta semana"

**Parámetros:**
- `query` (opcional): Texto de búsqueda
- `completed` (opcional): Filtrar por estado
- `priority` (opcional): Filtrar por prioridad
- `category` (opcional): Filtrar por categoría
- `dueDateFrom` (opcional): Rango de fecha inicio
- `dueDateTo` (opcional): Rango de fecha fin
- `sortBy` (opcional): Campo de ordenamiento
- `sortOrder` (opcional): "asc" | "desc"
- `limit` (opcional): Número máximo de resultados

#### 5. **getTaskStats**
Generar estadísticas y analytics de productividad.

**Ejemplo de uso:**
- "¿Cuántas tareas he completado?"
- "Muéstrame mis estadísticas"
- "¿Qué tan productivo he sido esta semana?"
- "¿En qué categoría tengo más tareas?"

**Parámetros:**
- `period` (opcional): "today" | "week" | "month" | "year" | "all-time"
- `groupBy` (opcional): "category" | "priority" | "date"

## 🚀 Configuración e Instalación

### Prerrequisitos
- Node.js 18+ instalado
- npm o yarn
- Cuenta gratuita en OpenRouter

### Paso 1: Obtener API Key de OpenRouter (GRATIS)

1. Ve a [https://openrouter.ai/](https://openrouter.ai/)
2. Crea una cuenta (gratis)
3. Ve a "Keys" en el menú
4. Crea una nueva API Key
5. Copia la key (empieza con `sk-or-v1-...`)

### Paso 2: Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto (o copia `.env.local.example`):

```env
# OpenRouter API Key - NUNCA commitear este archivo
OPENROUTER_API_KEY=sk-or-v1-TU-API-KEY-AQUI
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=meta-llama/llama-3.2-3b-instruct:free
```

También crea un archivo `.env` (Prisma lo requiere):

```env
DATABASE_URL="file:./dev.db"
```

⚠️ **IMPORTANTE**: 
- NUNCA compartas tu API key
- NUNCA la subas a GitHub
- Los archivos `.env` y `.env.local` ya están en `.gitignore`

### Paso 3: Instalar Dependencias

```bash
npm install
```

### Paso 4: Generar Prisma Client y Crear Base de Datos

```bash
# Generar cliente Prisma
npx prisma generate

# Crear base de datos y ejecutar migración inicial
npx prisma migrate dev --name init
```

### Paso 5: Ejecutar el Servidor de Desarrollo

```bash
npm run dev
```

### Paso 6: Abrir en el Navegador

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
proyectos/chatbox/
├── prisma/
│   ├── schema.prisma              # Schema de base de datos
│   └── migrations/                # Migraciones de DB
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   ├── route.ts       # Endpoint de chat original
│   │   │   │   └── tools/
│   │   │   │       └── route.ts   # Endpoint de chat con tool calling
│   │   │   └── tasks/
│   │   │       └── route.ts       # API REST de tareas (CRUD)
│   │   ├── page.tsx               # Página principal
│   │   ├── layout.tsx             # Layout de Next.js
│   │   └── globals.css            # Estilos globales
│   ├── components/
│   │   ├── TodoManager.tsx        # Componente principal (chat + tareas)
│   │   ├── TaskList.tsx           # Lista de tareas
│   │   ├── Chat.tsx               # Componente de chat original
│   │   ├── MessageList.tsx        # Lista de mensajes
│   │   ├── ChatInput.tsx          # Input para escribir mensajes
│   │   └── ChatHeader.tsx         # Header del chat
│   └── lib/
│       ├── prismadb.ts            # Cliente Prisma (singleton)
│       └── tools.ts               # Implementación de las 5 tools
├── .env                           # Variables para Prisma (NO COMMITEAR)
├── .env.local                     # Variables para Next.js (NO COMMITEAR)
├── .env.local.example             # Ejemplo de configuración
├── .gitignore                     # Archivos ignorados por git
├── package.json                   # Dependencias
├── README-TODO.md                 # Este archivo
└── tsconfig.json                  # Configuración de TypeScript
```

## 🎯 Arquitectura de la Solución

### Frontend (Next.js Client Components)
- **TodoManager.tsx**: Componente principal que integra chat con gestor de tareas
- **TaskList.tsx**: Visualización y gestión directa de tareas
- **ChatInput**: Input con validación y límite de caracteres
- Manejo de estado local de conversación
- Streaming de respuestas del LLM en tiempo real
- Indicadores de loading cuando se ejecutan tools
- Actualización en tiempo real del estado de tareas

### Backend (Next.js API Routes)
- **`/api/chat/tools`**: Comunicación con OpenRouter (LLM) con tool calling
  - Recibe mensajes del usuario
  - Envía función definitions al LLM
  - Ejecuta tools cuando el LLM las solicita
  - Retorna respuesta final del asistente
- **`/api/tasks`**: API REST para gestión directa de tareas
  - `POST`: Crear tarea
  - `GET`: Buscar/listar tareas (con filtros)
  - `PATCH`: Actualizar tarea
  - `DELETE`: Eliminar tarea (soft delete)
  - `GET ?stats=1`: Obtener estadísticas
- **`src/lib/tools.ts`**: Implementación de las 5 herramientas
  - Validación de parámetros
  - Operaciones con Prisma
  - Manejo de errores

### Base de Datos (SQLite + Prisma)
- **Modelo Task**:
  - `id`: Identificador único (cuid)
  - `title`: Título de la tarea (requerido)
  - `description`: Descripción opcional
  - `completed`: Estado (boolean)
  - `priority`: Prioridad (string: low/medium/high)
  - `category`: Categoría (string: work/personal/shopping/health/other)
  - `dueDate`: Fecha límite (opcional)
  - `deleted`: Soft delete flag (boolean)
  - `createdAt`: Timestamp de creación
  - `updatedAt`: Timestamp de última actualización
- Índices en title, priority, category para búsquedas rápidas

## 🧪 Cómo Probar el AI Todo Manager

### Ejemplos de Prompts para Probar

#### Crear Tareas:
- "Agregar tarea: comprar leche, prioridad media"
- "Necesito recordar llamar al dentista mañana"
- "Crea una tarea de trabajo para terminar el informe con prioridad alta"
- "Anota que debo hacer ejercicio esta tarde, categoría salud"

#### Actualizar Tareas:
- "Marca como completada la tarea de comprar leche"
- "Cambia la prioridad del informe a alta"
- "Renombra la tarea 'ejercicio' a 'correr 5km'"
- "Mueve la fecha del dentista a pasado mañana"

#### Buscar Tareas:
- "Muéstrame todas mis tareas"
- "¿Qué tareas tengo pendientes?"
- "Lista las tareas de alta prioridad"
- "Busca tareas que contengan 'informe'"
- "Muestra tareas de trabajo"
- "¿Qué tengo para hoy?"

#### Eliminar Tareas:
- "Elimina la tarea de comprar leche"
- "Borra la tarea del dentista"
- "Quita esa tarea de mi lista"

#### Estadísticas:
- "¿Cuántas tareas he completado?"
- "Muéstrame mis estadísticas"
- "¿Qué tan productivo he sido?"
- "¿Cuántas tareas me faltan?"

### Probar APIs Directamente (Sin LLM)

**Crear tarea:**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Comprar leche","priority":"medium","category":"shopping"}'
```

**Buscar tareas:**
```bash
curl "http://localhost:3000/api/tasks?query=leche"
curl "http://localhost:3000/api/tasks?completed=false"
curl "http://localhost:3000/api/tasks?priority=high"
```

**Actualizar tarea:**
```bash
curl -X PATCH http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"taskId":"<TASK_ID>","completed":true}'
```

**Eliminar tarea:**
```bash
curl -X DELETE http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"taskId":"<TASK_ID>"}'
```

**Estadísticas:**
```bash
curl "http://localhost:3000/api/tasks?stats=1&period=week"
```

## 🔒 Seguridad Implementada

### ✅ Checklist de Seguridad

- ✅ **API keys solo en backend**: NUNCA expuestas al cliente
- ✅ **Variables de entorno protegidas**: `.env` y `.env.local` en `.gitignore`
- ✅ **Validación de todos los inputs**: Schemas Zod en todos los endpoints
- ✅ **Sanitización de mensajes**: Límites de caracteres y validación
- ✅ **SQL Injection Protection**: Prisma ORM con queries parametrizadas
- ✅ **Soft deletes**: Las tareas eliminadas se marcan, no se borran
- ✅ **Límites de caracteres**: 4000 caracteres por mensaje
- ✅ **Límites de mensajes**: Máximo 50 mensajes por request
- ✅ **Manejo robusto de errores**: Try-catch en todos los endpoints
- ✅ **No exponer detalles de errores en producción**: Errores genéricos al cliente

### Reglas de Oro de Seguridad

1. **API Keys solo en backend**: Nunca en código del cliente
2. **Variables de entorno**: Usar `.env.local` para keys sensibles, sin `NEXT_PUBLIC_` prefix
3. **Nunca commitear keys**: Agregar `.env` y `.env.local` a `.gitignore`
4. **Validación de inputs**: Sanitizar todos los inputs del usuario
5. **SQL Injection Protection**: Usar ORMs y prepared statements
6. **Rate limiting**: Implementar límites para prevenir abuso (opcional para producción)

## 📊 Tecnologías Utilizadas

- **Next.js 15**: Framework de React con App Router
- **Vercel AI SDK**: Manejo de chat y streaming
- **OpenRouter**: Proveedor de LLMs (usando modelo gratuito)
- **Prisma 5**: ORM para TypeScript/JavaScript
- **SQLite**: Base de datos embebida
- **Tailwind CSS**: Estilos utility-first
- **TypeScript**: Tipado estático
- **Zod**: Validación de schemas

## 🎨 Funcionalidades de la UI

### Panel de Tareas (Izquierda)
- Lista de tareas con filtros (todas/pendientes/completadas)
- Checkbox para marcar completadas
- Indicadores visuales de prioridad (colores)
- Emojis por categoría
- Fechas límite
- Botón de eliminar
- Auto-refresh cuando se ejecutan tools

### Panel de Chat (Derecha)
- Interfaz conversacional moderna
- Sugerencias de prompts iniciales
- Streaming de respuestas del LLM
- Indicadores de loading
- Manejo de errores visual
- Auto-scroll a nuevos mensajes
- Toggle para ocultar/mostrar panel de tareas

## 🧩 Flujo de Ejemplo Completo

```
Usuario: "Hola, necesito organizar mis tareas del día"

AI: "¡Claro! Puedo ayudarte a gestionar tus tareas. ¿Qué necesitas hacer hoy?"

Usuario: "Agregar tres tareas: comprar leche, terminar informe de ventas,
         y llamar al dentista. El informe es urgente."

AI: [Ejecuta createTask 3 veces]
    "Perfecto, agregué estas 3 tareas:
    ✅ Comprar leche (Prioridad: media)
    ⚡ Terminar informe de ventas (Prioridad: alta)
    📞 Llamar al dentista (Prioridad: media)"

Usuario: "Ya compré la leche, márcala como completada"

AI: [Ejecuta searchTasks + updateTask]
    "¡Excelente! Marqué 'Comprar leche' como completada ✓"

Usuario: "¿Qué tan productivo he sido?"

AI: [Ejecuta getTaskStats]
    "📊 Has completado 1 de 3 tareas (33% de completitud).
    Te quedan 2 tareas pendientes."
```

## 🔧 Scripts Disponibles

```bash
npm run dev      # Ejecutar en desarrollo
npm run build    # Construir para producción
npm run start    # Ejecutar en producción
npm run lint     # Ejecutar ESLint
npx prisma studio # Abrir Prisma Studio (UI para ver/editar DB)
```

## 📝 Notas Técnicas

### Tool Calling Implementation
- La ruta `/api/chat/tools` implementa tool calling **sin streaming**
- El LLM recibe las definiciones de las 5 funciones
- Cuando el LLM solicita ejecutar una función:
  1. El backend parsea los argumentos
  2. Ejecuta la tool correspondiente con Prisma
  3. Retorna el resultado al LLM
  4. El LLM genera una respuesta final en lenguaje natural
- Esto permite conversaciones naturales que ejecutan acciones reales

### Limitaciones Conocidas
- Tool calling sin streaming (respuestas más lentas que streaming puro)
- No hay autenticación de usuarios (todas las tareas son globales)
- No hay rate limiting implementado (recomendado para producción)
- Modelo LLM gratuito puede tener límites de uso
- Algunos modelos LLM no soportan function calling bien

### Mejoras Futuras (Opcionales)
- [ ] Streaming + tool calling simultáneo
- [ ] Autenticación de usuarios (NextAuth)
- [ ] Múltiples usuarios con tareas separadas
- [ ] Rate limiting por usuario
- [ ] Subtareas y dependencias
- [ ] Etiquetas/tags personalizables
- [ ] Tareas recurrentes
- [ ] Notificaciones por email/push
- [ ] Sincronización con Google Calendar
- [ ] Vista de calendario
- [ ] Vista Kanban
- [ ] Gráficos de productividad avanzados
- [ ] Export/import de tareas
- [ ] Colaboración entre usuarios
- [ ] AI suggestions de prioridades

## ⚠️ Solución de Problemas

### El chat no responde
- Verifica que tu API key en `.env.local` sea correcta
- Revisa la consola del navegador para errores
- Verifica que el servidor esté corriendo
- Comprueba que tengas créditos en OpenRouter

### Error de Prisma "Environment variable not found"
- Asegúrate de tener `.env` con `DATABASE_URL="file:./dev.db"`
- Ejecuta `npx prisma generate` nuevamente
- Verifica que el archivo `.env` esté en la raíz del proyecto

### Error "enum not supported"
- El schema ya usa strings en lugar de enums para compatibilidad
- Si persiste, borra `node_modules` y `package-lock.json`, luego `npm install`

### Tareas no se muestran
- Verifica que la migración se haya ejecutado: `npx prisma migrate dev`
- Abre Prisma Studio para ver la DB: `npx prisma studio`
- Revisa la consola del navegador para errores de fetch

### Error de compilación TypeScript
- Ejecuta `npm install` nuevamente
- Borra la carpeta `.next` y vuelve a ejecutar `npm run dev`

## 📖 Recursos Adicionales

- [Vercel AI SDK Docs](https://sdk.vercel.ai/)
- [Vercel AI SDK - Tool Calling](https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling)
- [OpenRouter Docs](https://openrouter.ai/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tool Calling Best Practices](https://platform.openai.com/docs/guides/function-calling)

## 👨‍💻 Desarrollo

**Desarrollado para UAP - Programación 4**  
**Ejercicio 13 Parte 2B: AI Todo Manager**

---

¡Gracias por usar AI Todo Manager! 🚀
