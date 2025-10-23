# 🔑 CONFIGURACIÓN DE API KEY - INICIO RÁPIDO

## ⚠️ IMPORTANTE: Configura tu API key ANTES de usar el chatbot

### Paso 1: Obtén tu API Key de OpenRouter (GRATIS)

1. Ve a [https://openrouter.ai/](https://openrouter.ai/)
2. Haz clic en "Sign Up" o "Log In"
3. Una vez dentro, ve a "Keys" en el menú lateral
4. Haz clic en "Create Key"
5. Copia tu API key (empieza con `sk-or-v1-...`)

### Paso 2: Configura el archivo `.env.local`

1. Abre el archivo `.env.local` en la raíz del proyecto
2. Busca esta línea:
   ```
   OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
   ```
3. Reemplaza `sk-or-v1-your-api-key-here` con tu API key real
4. Guarda el archivo

**Ejemplo:**
```env
OPENROUTER_API_KEY=sk-or-v1-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=meta-llama/llama-3.2-3b-instruct:free
```

### Paso 3: Reinicia el servidor

Si el servidor ya está corriendo, detén el servidor (Ctrl+C en la terminal) y vuelve a ejecutar:

```bash
npm run dev
```

### Paso 4: Abre el navegador

Abre [http://localhost:3000](http://localhost:3000) y empieza a chatear!

---

## 🔒 Recordatorios de Seguridad

- ✅ La API key está en `.env.local` que está en `.gitignore`
- ✅ NUNCA subas tu API key a GitHub
- ✅ NUNCA compartas tu API key públicamente
- ✅ Si accidentalmente expones tu key, bórrala y crea una nueva en OpenRouter

---

## 🐛 Solución de Problemas

### Error: "Configuración del servidor incompleta"
- Verifica que el archivo `.env.local` exista
- Verifica que la API key esté configurada correctamente
- Reinicia el servidor

### El bot no responde
- Verifica tu API key en [https://openrouter.ai/keys](https://openrouter.ai/keys)
- Asegúrate de estar usando un modelo gratuito
- Revisa la consola del navegador para más detalles

### Error 401 Unauthorized
- Tu API key es inválida o ha expirado
- Crea una nueva API key en OpenRouter

---

¡Listo! Ahora puedes usar tu chatbot 🚀
