# 🔒 Guía de Seguridad - AI Todo Manager

## ⚠️ IMPORTANTE SOBRE API KEYS

### ✅ Tu API Key está protegida

Tu archivo `.env.local` **NO está en Git** gracias al `.gitignore`. Esto está correcto. ✅

### 🔒 Buenas prácticas que ya implementaste:

1. ✅ `.env.local` en `.gitignore`
2. ✅ API key solo en backend
3. ✅ No usar prefix `NEXT_PUBLIC_*`
4. ✅ `.env.local.example` sin valores reales

### ⚠️ Situaciones donde SÍ estaría expuesta:

1. **Screenshots compartidos** - Si compartes capturas de pantalla con el archivo abierto
2. **Compartir workspace** - Si compartes tu carpeta del proyecto completa
3. **Streams/grabaciones** - Si grabas tu pantalla mientras codeas
4. **Chats/mensajes** - Si copias y pegas el contenido del archivo
5. **Deploy mal configurado** - Si subes `.env.local` manualmente al servidor

### 🛡️ Recomendaciones adicionales:

- Rota tu API key cada 3-6 meses
- Usa keys diferentes para desarrollo y producción
- Monitorea el uso en OpenRouter dashboard
- Si alguna vez sospechas que se expuso, rótala inmediatamente

---

## ✅ Checklist de Seguridad Implementada

### 1. API Keys Protegidas ✅
- ✅ API keys solo en backend (nunca en frontend)
- ✅ No usa prefix `NEXT_PUBLIC_*`
- ✅ `.env.local` en `.gitignore`
- ✅ `.env.local.example` disponible sin secrets

### 2. Validación de Inputs ✅
- ✅ Zod para validación de schemas
- ✅ Validaciones en cada tool
- ✅ Límites en longitud de mensajes (max 4000 chars)
- ✅ Límite de mensajes por request (max 50)

### 3. Protección SQL Injection ✅
- ✅ Prisma ORM con prepared statements
- ✅ No hay queries SQL crudas
- ✅ Validación de tipos antes de DB operations

### 4. Rate Limiting ✅
- ✅ Implementado en `/api/chat/tools`
- ✅ 100 requests por 15 minutos (configurable)
- ✅ Headers estándar (X-RateLimit-*)
- ✅ Identificación por IP address

### 5. Error Handling ✅
- ✅ Try-catch en todas las operaciones críticas
- ✅ Mensajes de error sanitizados
- ✅ No expone detalles internos al cliente
- ✅ Logging para debugging

---

## 📋 Configuración de Rate Limiting

El sistema está configurado para prevenir abuso:

```env
# .env.local
RATE_LIMIT_MAX_REQUESTS=100      # Máximo 100 requests
RATE_LIMIT_WINDOW_MS=900000      # Por cada 15 minutos
```

### Ajustar límites según necesidad:

**Desarrollo (más permisivo):**
```env
RATE_LIMIT_MAX_REQUESTS=500
RATE_LIMIT_WINDOW_MS=900000
```

**Producción (más restrictivo):**
```env
RATE_LIMIT_MAX_REQUESTS=50
RATE_LIMIT_WINDOW_MS=600000  # 10 minutos
```

**Respuesta cuando se excede el límite:**
```json
{
  "error": "Rate limit exceeded",
  "message": "Has excedido el límite de 100 requests. Intenta nuevamente después de 14:30:00.",
  "retryAfter": 450
}
```

---

## 🔐 Mejores Prácticas

### Para API Keys:

1. **Nunca** las incluyas en:
   - Git commits
   - Screenshots
   - Mensajes de chat
   - Issues de GitHub
   - Documentación pública

2. **Rotar keys regularmente** (cada 3-6 meses)

3. **Usar keys diferentes** para desarrollo y producción

4. **Monitorear uso** en OpenRouter dashboard

### Para Base de Datos:

1. **Soft deletes** ya implementados (field `deleted`)
2. **Timestamps automáticos** (createdAt, updatedAt, completedAt)
3. **Índices** en campos de búsqueda frecuente
4. **Backups regulares** (especialmente antes de migrations)

### Para Producción:

1. **Considerar PostgreSQL** en lugar de SQLite
2. **Implementar autenticación de usuarios**
3. **HTTPS obligatorio**
4. **CORS configurado correctamente**
5. **Rate limiting más estricto**
6. **Logging centralizado** (Winston, Pino)
7. **Monitoring** (Sentry, LogRocket)

---

## 🚀 Migrando a Producción

### 1. Base de Datos

**SQLite (actual)** es bueno para desarrollo, pero para producción considera:

```env
# PostgreSQL (Recomendado)
DATABASE_URL="postgresql://user:password@host:5432/database"

# Supabase (Fácil de configurar)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
```

### 2. Variables de Entorno

Configura en tu plataforma de hosting (Vercel, Railway, etc.):

```bash
OPENROUTER_API_KEY=<nueva-key-de-produccion>
DATABASE_URL=<url-base-datos-produccion>
RATE_LIMIT_MAX_REQUESTS=50
RATE_LIMIT_WINDOW_MS=600000
```

### 3. Deploy Checklist

- [ ] Nueva API key generada para producción
- [ ] Base de datos en la nube configurada
- [ ] Variables de entorno configuradas en hosting
- [ ] `.env.local` NO incluido en deploy
- [ ] Rate limiting testeado
- [ ] CORS configurado correctamente
- [ ] Error handling validado
- [ ] Monitoreo configurado

---

## 📊 Monitoring y Debugging

### Logs Implementados:

El sistema logea automáticamente:
- ✅ Llamadas a OpenRouter
- ✅ Ejecución de tools
- ✅ Errores de validación
- ✅ Rate limit excedidos
- ✅ Operaciones de base de datos

### Ver logs en desarrollo:

```bash
# Terminal donde corre npm run dev
# Los logs aparecen automáticamente
```

### En producción (Vercel):

```bash
vercel logs <deployment-url>
```

---

## 🆘 Soporte y Recursos

- **OpenRouter Docs**: https://openrouter.ai/docs
- **Prisma Security**: https://www.prisma.io/docs/guides/security
- **Next.js Security**: https://nextjs.org/docs/app/building-your-application/configuring/security
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/

---

## 📝 Notas Finales

Este proyecto implementa las mejores prácticas de seguridad para un entorno de desarrollo/educativo. Para producción real, considera:

1. Sistema completo de autenticación (NextAuth, Clerk, Auth0)
2. Autorización granular (permisos por usuario)
3. Auditoría completa de acciones
4. Encriptación de datos sensibles
5. Penetration testing
6. Compliance con regulaciones (GDPR, CCPA)

---

**Última actualización:** Noviembre 2025
**Autor:** Sistema de AI Todo Manager
**Versión:** 1.0
