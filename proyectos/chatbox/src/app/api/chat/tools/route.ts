import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  createTaskTool,
  updateTaskTool,
  deleteTaskTool,
  searchTasksTool,
  getTaskStatsTool,
  completeTaskTool
} from '../../../../lib/tools'

// Explicitly set runtime to nodejs
export const runtime = 'nodejs'

// messages schema
const messageSchema = z.object({
  messages: z.array(
    z.object({ 
      role: z.enum(['user', 'assistant', 'system', 'tool']), 
      content: z.string().min(1).max(4000)
    })
  ).min(1).max(50)
})

// Define tools for function-calling
const tools = [
  {
    name: 'createTask',
    description: 'Create a new task',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'] },
        dueDate: { type: 'string', format: 'date-time' },
        category: { type: 'string', enum: ['work', 'personal', 'shopping', 'health', 'other'] },
        description: { type: 'string' }
      },
      required: ['title']
    }
  },
  {
    name: 'completeTask',
    description: 'Mark a task as completed by searching for it by name/title. Use this when user wants to complete/finish a task.',
    parameters: {
      type: 'object',
      properties: {
        taskName: { type: 'string', description: 'The name or title of the task to mark as completed' }
      },
      required: ['taskName']
    }
  },
  {
    name: 'updateTask',
    description: 'Update an existing task. IMPORTANT: If user mentions task by name/title instead of ID, you MUST first use searchTasks to find the taskId, then use this tool with that taskId.',
    parameters: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'The unique ID of the task to update (required)' },
        title: { type: 'string', description: 'New title for the task' },
        completed: { type: 'boolean', description: 'Mark task as completed (true) or pending (false)' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'], description: 'New priority level' },
        dueDate: { type: 'string', format: 'date-time', description: 'New due date in ISO format' },
        category: { type: 'string', enum: ['work', 'personal', 'shopping', 'health', 'other'], description: 'New category' }
      },
      required: ['taskId']
    }
  },
  {
    name: 'deleteTask',
    description: 'Delete a task by id (soft delete)',
    parameters: {
      type: 'object',
      properties: { taskId: { type: 'string' }, confirm: { type: 'boolean' } },
      required: ['taskId']
    }
  },
  {
    name: 'searchTasks',
    description: 'Search and filter tasks. Use this to find tasks by name/title before updating or deleting them. Returns list of tasks with their IDs.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search text to find in task title or description' },
        completed: { type: 'boolean', description: 'Filter by completion status: true for completed, false for pending' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Filter by priority level' },
        category: { type: 'string', enum: ['work', 'personal', 'shopping', 'health', 'other'], description: 'Filter by category' },
        dueDateFrom: { type: 'string', format: 'date-time', description: 'Filter tasks with due date after this date' },
        dueDateTo: { type: 'string', format: 'date-time', description: 'Filter tasks with due date before this date' },
        sortBy: { type: 'string', enum: ['createdAt', 'dueDate', 'priority', 'title'], description: 'Field to sort by' },
        sortOrder: { type: 'string', enum: ['asc', 'desc'], description: 'Sort order: ascending or descending' },
        limit: { type: 'integer', description: 'Maximum number of results to return (default 50)' }
      }
    }
  },
  {
    name: 'getTaskStats',
    description: 'Get productivity statistics',
    parameters: {
      type: 'object',
      properties: { period: { type: 'string', enum: ['today', 'week', 'month', 'year', 'all-time'] } }
    }
  }
]

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate with better error handling
    const validationResult = messageSchema.safeParse(body)
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error)
      return NextResponse.json({ 
        error: 'Invalid request body', 
        details: validationResult.error.issues 
      }, { status: 400 })
    }
    
    const parsed = validationResult.data

    const apiKey = process.env.OPENROUTER_API_KEY
    const baseURL = process.env.OPENROUTER_BASE_URL
    const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-3b-instruct:free'

    if (!apiKey || !baseURL) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
    }

    // Call OpenRouter WITHOUT streaming to get potential function_call
    // Note: OpenRouter uses 'tools' format (OpenAI compatible)
    const openaiTools = tools.map(t => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters
      }
    }))
    
    // Add system prompt to guide the LLM
    const systemPrompt = {
      role: 'system',
      content: `You are a helpful AI task manager assistant. You MUST use the available tools/functions to help users manage their tasks.

CRITICAL RULES FOR COMPLETING TASKS:
- When user wants to mark a task as completed/done/finished, use completeTask(taskName="task name")
- The completeTask tool will automatically find and complete the task in ONE STEP
- DO NOT use searchTasks + updateTask for completing, just use completeTask directly

OTHER OPERATIONS:
- Create new task: use createTask(title="...")
- Show tasks: use searchTasks()
- Update task details: use searchTasks first, then updateTask with taskId
- Delete task: use searchTasks first, then deleteTask with taskId
- Get statistics: use getTaskStats()

Examples:
User: "marca completada la tarea comprar leche"
→ Call completeTask(taskName="comprar leche")

User: "completa la tarea de estudiar"  
→ Call completeTask(taskName="estudiar")

User: "termina la tarea X"
→ Call completeTask(taskName="X")

User: "crea tarea X"
→ Call createTask(title="X")

User: "muestra mis tareas"
→ Call searchTasks()

ALWAYS USE THE TOOLS. DO NOT just respond with text, USE THE FUNCTIONS!`
    }
    
    const messagesWithSystem = [systemPrompt, ...parsed.messages]
    
    const requestBody = { 
      model, 
      messages: messagesWithSystem, 
      tools: openaiTools, 
      tool_choice: 'auto',
      temperature: 0.1,
      max_tokens: 1000
    }
    
    console.log('\n=== CALLING OPENROUTER ===')
    console.log('Model:', model)
    console.log('Messages count:', messagesWithSystem.length)
    console.log('Last user message:', parsed.messages[parsed.messages.length - 1]?.content)
    
    const resp = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/AgustinaWaigel/uap-web-development',
        'X-Title': 'AI Todo Manager'
      },
      body: JSON.stringify(requestBody)
    })

    if (!resp.ok) {
      const errText = await resp.text()
      let err: any
      try {
        err = JSON.parse(errText)
      } catch {
        err = { message: errText }
      }
      console.error('\n=== OPENROUTER ERROR ===')
      console.error('Status:', resp.status, resp.statusText)
      console.error('Error:', JSON.stringify(err, null, 2))
      console.error('Model:', model)
      
      let errorMessage = err?.error?.message || err?.message || errText
      
      // Provide helpful error messages
      if (resp.status === 429) {
        errorMessage = `El modelo ${model} ha alcanzado su límite de uso. Por favor, cambia el modelo en .env.local a: meta-llama/llama-3.2-3b-instruct:free`
      } else if (resp.status === 401) {
        errorMessage = 'API Key inválida. Verifica tu OPENROUTER_API_KEY en .env.local'
      } else if (resp.status === 400) {
        errorMessage = `El modelo ${model} no soporta function calling o los parámetros son inválidos`
      }
      
      return NextResponse.json({ 
        error: 'LLM error', 
        details: err,
        message: `Error (${resp.status}): ${errorMessage}`
      }, { status: 500 })
    }

    const data = await resp.json()
    console.log('\n=== OPENROUTER RESPONSE ===')
    console.log('Response:', JSON.stringify(data, null, 2))
    
    const choice = data?.choices?.[0]

    // If model wants to call a tool (OpenAI tools format)
    if (choice?.message?.tool_calls && choice.message.tool_calls.length > 0) {
      const toolCall = choice.message.tool_calls[0] // Handle first tool call
      const { name, arguments: argsRaw } = toolCall.function
      let args: any = {}
      try { args = JSON.parse(argsRaw || '{}') } catch (e) { args = {} }

      console.log('Tool called:', name)
      console.log('Tool arguments:', JSON.stringify(args, null, 2))

      // Execute corresponding tool
      let toolResult: any
      try {
        switch (name) {
          case 'createTask':
            toolResult = await createTaskTool(args)
            break
          case 'completeTask':
            console.log('Executing completeTask with args:', args)
            toolResult = await completeTaskTool(args)
            console.log('completeTask result:', JSON.stringify(toolResult, null, 2))
            break
          case 'updateTask':
            console.log('Executing updateTask with args:', args)
            toolResult = await updateTaskTool(args)
            break
          case 'deleteTask':
            toolResult = await deleteTaskTool(args)
            break
          case 'searchTasks':
            toolResult = await searchTasksTool(args)
            break
          case 'getTaskStats':
            toolResult = await getTaskStatsTool(args)
            break
          default:
            toolResult = { error: 'unknown tool' }
        }
      } catch (toolErr: any) {
        // Return a helpful error message to the user
        return NextResponse.json({ success: false, tool: name, error: String(toolErr) })
      }

      // Append tool result to conversation and ask model to produce final assistant message
      const messagesWithTool = [
        ...parsed.messages, 
        { 
          role: 'assistant', 
          content: null,
          tool_calls: [toolCall]
        },
        { 
          role: 'tool', 
          content: JSON.stringify(toolResult), 
          tool_call_id: toolCall.id 
        }
      ]

      console.log('\n=== MAKING FINAL CALL TO GET RESPONSE ===')
      console.log('Tool result being sent to model:', JSON.stringify(toolResult, null, 2))

      // Make another call with tools available so model can make follow-up tool calls
      const finalResp = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          model, 
          messages: [systemPrompt, ...messagesWithTool], 
          tools: openaiTools,
          tool_choice: 'auto',
          temperature: 0.1, 
          max_tokens: 1000 
        })
      })

      if (!finalResp.ok) {
        const err = await finalResp.json().catch(() => ({}))
        return NextResponse.json({ error: 'LLM error on final reply', details: err }, { status: finalResp.status })
      }

      const finalData = await finalResp.json()
      console.log('\n=== FINAL RESPONSE FROM MODEL ===')
      console.log('Response:', JSON.stringify(finalData, null, 2))
      
      const finalChoice = finalData?.choices?.[0]
      
      // Check if model wants to make ANOTHER tool call (for multi-step operations)
      if (finalChoice?.message?.tool_calls && finalChoice.message.tool_calls.length > 0) {
        const secondToolCall = finalChoice.message.tool_calls[0]
        const { name: secondName, arguments: secondArgsRaw } = secondToolCall.function
        let secondArgs: any = {}
        try { secondArgs = JSON.parse(secondArgsRaw || '{}') } catch (e) { secondArgs = {} }
        
        console.log('\n=== SECOND TOOL CALL ===')
        console.log('Tool:', secondName)
        console.log('Args:', JSON.stringify(secondArgs, null, 2))
        
        // Execute second tool
        let secondToolResult: any
        try {
          switch (secondName) {
            case 'createTask':
              secondToolResult = await createTaskTool(secondArgs)
              break
            case 'completeTask':
              console.log('Executing second completeTask with args:', secondArgs)
              secondToolResult = await completeTaskTool(secondArgs)
              break
            case 'updateTask':
              console.log('Executing second updateTask with args:', secondArgs)
              secondToolResult = await updateTaskTool(secondArgs)
              break
            case 'deleteTask':
              secondToolResult = await deleteTaskTool(secondArgs)
              break
            case 'searchTasks':
              secondToolResult = await searchTasksTool(secondArgs)
              break
            case 'getTaskStats':
              secondToolResult = await getTaskStatsTool(secondArgs)
              break
            default:
              secondToolResult = { error: 'unknown tool' }
          }
          
          // Make final call to get human-readable response
          const messagesWithSecondTool = [
            ...messagesWithTool,
            {
              role: 'assistant',
              content: null,
              tool_calls: [secondToolCall]
            },
            {
              role: 'tool',
              content: JSON.stringify(secondToolResult),
              tool_call_id: secondToolCall.id
            }
          ]
          
          const thirdResp = await fetch(`${baseURL}/chat/completions`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              model, 
              messages: [systemPrompt, ...messagesWithSecondTool], 
              temperature: 0.7, 
              max_tokens: 500 
            })
          })
          
          if (!thirdResp.ok) {
            return NextResponse.json({ 
              success: true, 
              tool: `${name} + ${secondName}`, 
              toolResult: secondToolResult, 
              assistant: `✅ Ejecuté ${name} y luego ${secondName}` 
            })
          }
          
          const thirdData = await thirdResp.json()
          const finalText = thirdData?.choices?.[0]?.message?.content || `✅ Operación completada: ${name} → ${secondName}`
          
          return NextResponse.json({ 
            success: true, 
            tool: `${name} + ${secondName}`, 
            toolResult: secondToolResult, 
            assistant: finalText 
          })
          
        } catch (toolErr: any) {
          return NextResponse.json({ 
            success: false, 
            tool: secondName, 
            error: String(toolErr) 
          })
        }
      }
      
      // No second tool call, return first tool result
      let finalText = finalChoice?.message?.content || ''
      
      // If tool result has a message field (like completeTask with multiple matches), use it if model didn't respond
      if (!finalText && toolResult?.message) {
        finalText = toolResult.message
      }
      
      // If still no text and task was completed successfully, provide default message
      if (!finalText && toolResult?.success) {
        finalText = toolResult.message || `✅ Operación completada exitosamente`
      }
      
      console.log('Final assistant text:', finalText)
      return NextResponse.json({ success: true, tool: name, toolResult, assistant: finalText })
    }

    // If no function call, return assistant message directly
    const assistantText = choice?.message?.content || ''
    console.log('\n=== NO TOOL CALLED ===')
    console.log('Model responded with text only:', assistantText)
    console.log('User message was:', parsed.messages[parsed.messages.length - 1]?.content)
    
    // If the user seems to be asking for a task operation but model didn't use tools, warn them
    const userMsg = parsed.messages[parsed.messages.length - 1]?.content.toLowerCase() || ''
    const isTaskOperation = /creat|agregar|nueva|complet|marca|borra|elimina|muestra|lista|busca/i.test(userMsg)
    
    if (isTaskOperation && !assistantText) {
      return NextResponse.json({ 
        success: true, 
        assistant: '⚠️ El modelo no pudo procesar tu solicitud. Intenta ser más específico o prueba con otro modelo en .env.local (ej: meta-llama/llama-3.1-8b-instruct:free)' 
      })
    }
    
    return NextResponse.json({ success: true, assistant: assistantText || '🤔 No tengo respuesta para eso' })

  } catch (err: any) {
    console.error('Error in chat/tools endpoint:', err)
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: err?.message || String(err) 
    }, { status: 500 })
  }
}
