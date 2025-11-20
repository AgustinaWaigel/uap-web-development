# 🤖 AI Todo Manager

Gestor de tareas inteligente con interfaz conversacional utilizando Next.js, OpenRouter, y Prisma.

## ✨ Características

- 🗣️ **Interfaz conversacional** - Gestiona tareas hablando naturalmente
- 🛠️ **6 herramientas AI** - createTask, updateTask, deleteTask, searchTasks, getTaskStats, completeTask
- 📊 **Estadísticas avanzadas** - Métricas de productividad, streaks, tiempo promedio
- 🔒 **Seguridad robusta** - Rate limiting, validación de inputs, API keys protegidas
- 💾 **Base de datos persistente** - SQLite con Prisma ORM
- ⚡ **Animación de texto** - Respuestas palabra por palabra
- 🎨 **UI moderna** - Diseño responsive con Tailwind CSS

## 🚀 Quick Start

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia `.env.local.example` a `.env.local` y configura tu API key:

```bash
cp .env.local.example .env.local
```

Edita `.env.local` y agrega tu OpenRouter API key:
```env
OPENROUTER_API_KEY=tu-api-key-aqui
```

### 3. Configurar base de datos

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Iniciar servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📖 Documentación

- **[MEJORAS.md](./MEJORAS.md)** - Log completo de mejoras implementadas
- **[SECURITY.md](./SECURITY.md)** - Guía de seguridad y mejores prácticas
- **[README-TODO.md](./README-TODO.md)** - Lista de tareas del proyecto
- **[README-PROYECTO.md](./README-PROYECTO.md)** - Documentación del proyecto

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **AI**: OpenRouter API (múltiples modelos LLM)
- **Base de Datos**: SQLite + Prisma ORM
- **Estilos**: Tailwind CSS
- **TypeScript**: Tipado completo
- **Validación**: Zod
- **Rate Limiting**: Custom middleware

## 🔧 Herramientas AI Disponibles

### 1. createTask
Crear nuevas tareas con prioridad, categoría y fecha límite.

### 2. updateTask
Modificar tareas existentes (título, estado, prioridad, etc).

### 3. deleteTask
Eliminar tareas (soft delete).

### 4. searchTasks
Buscar y filtrar tareas por múltiples criterios.

### 5. getTaskStats
Obtener estadísticas completas de productividad:
- Tasa de completitud
- Tiempo promedio de completitud
- Día más productivo
- Racha actual y más larga
- Estadísticas por categoría y prioridad

### 6. completeTask
Marcar tareas como completadas por nombre.

## 🎯 Ejemplos de Uso

```
"Crea una tarea para comprar leche"
"Muéstrame todas mis tareas pendientes"
"Marca como completada la tarea de estudiar"
"¿Qué tan productivo he sido esta semana?"
"Busca tareas de trabajo con alta prioridad"
"Elimina la tarea de ir al dentista"
```

## 🔒 Seguridad

- ✅ API keys solo en backend
- ✅ Rate limiting (100 req/15min configurable)
- ✅ Validación de inputs con Zod
- ✅ Protección SQL injection (Prisma)
- ✅ Variables de entorno protegidas

Lee [SECURITY.md](./SECURITY.md) para más detalles.

## 📊 Cumplimiento del Ejercicio

- ✅ 100% de requisitos implementados
- ✅ 6/5 herramientas (1 extra para mejor UX)
- ✅ Estadísticas completas con métricas avanzadas
- ✅ Seguridad robusta con rate limiting
- ✅ Base de datos optimizada
- ✅ Documentación extensa

## 🚀 Deploy

### Vercel (Recomendado)

1. Push tu código a GitHub
2. Importa en Vercel
3. Configura variables de entorno
4. Deploy automático

### Variables de entorno necesarias:
```env
OPENROUTER_API_KEY=tu-api-key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=x-ai/grok-4.1-fast
DATABASE_URL=postgresql://... (usar PostgreSQL en producción)
RATE_LIMIT_MAX_REQUESTS=50
RATE_LIMIT_WINDOW_MS=600000
```

## 📝 License

MIT

## 👥 Autor

Proyecto educativo - UAP Web Development Course
