import { OpenAIStream, StreamingTextResponse } from 'ai';
import { z } from 'zod';

// ⚠️ SEGURIDAD: Las API keys NUNCA deben exponerse al cliente
// Esta función se ejecuta SOLO en el servidor

// Validación del schema de request usando Zod
const messageSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().min(1).max(4000), // Límite de caracteres por seguridad
    })
  ).min(1).max(50), // Máximo 50 mensajes para evitar abusos
});

export async function POST(req: Request) {
  try {
    // 1. Validar que existan las variables de entorno necesarias
    const apiKey = process.env.OPENROUTER_API_KEY;
    const baseURL = process.env.OPENROUTER_BASE_URL;
    const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-3b-instruct:free';

    if (!apiKey || !baseURL) {
      console.error('❌ Variables de entorno faltantes');
      return new Response(
        JSON.stringify({ error: 'Configuración del servidor incompleta' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Parsear y validar el body del request
    const body = await req.json();
    const validationResult = messageSchema.safeParse(body);

    if (!validationResult.success) {
      console.error('❌ Validación fallida:', validationResult.error);
      return new Response(
        JSON.stringify({ 
          error: 'Datos inválidos', 
          details: validationResult.error.issues 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { messages } = validationResult.data;

    // 3. Sanitizar mensajes (remover caracteres potencialmente peligrosos)
    const sanitizedMessages = messages.map(msg => ({
      ...msg,
      content: msg.content.trim().slice(0, 4000), // Límite adicional de seguridad
    }));

    // 4. Realizar la request a OpenRouter
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'UAP Chatbot',
      },
      body: JSON.stringify({
        model: model,
        messages: sanitizedMessages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error de OpenRouter:', errorData);
      return new Response(
        JSON.stringify({ 
          error: 'Error al comunicarse con el modelo',
          details: errorData
        }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 5. Convertir la respuesta a stream compatible con AI SDK
    const stream = OpenAIStream(response);
    
    // 6. Retornar la respuesta como stream
    return new StreamingTextResponse(stream);
    
  } catch (error) {
    console.error('❌ Error en API route:', error);
    
    // No exponer detalles del error al cliente en producción
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return new Response(
      JSON.stringify({ 
        error: 'Error al procesar la solicitud',
        ...(isDevelopment && { details: String(error) })
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
