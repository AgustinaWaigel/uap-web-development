import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  createTaskTool,
  updateTaskTool,
  deleteTaskTool,
  searchTasksTool,
  getTaskStatsTool
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
      content: `You are a helpful AI task manager assistant. IMPORTANT RULES for task operations:

When users ask you to UPDATE or DELETE a task by name/title (NOT by ID):
1. ALWAYS use searchTasks first to find the task and get its taskId
2. Then use updateTask or deleteTask with that taskId
3. If multiple tasks match, ask the user which one they mean

When marking tasks as COMPLETE or COMPLETED:
1. Use searchTasks to find the task by name/title
2. Use updateTask with taskId and completed=true (MUST BE TRUE, NOT FALSE)
3. Confirm to user with: "✅ Marked '[task name]' as completed!"

When marking tasks as INCOMPLETE or PENDING:
1. Use searchTasks to find the task
2. Use updateTask with taskId and completed=false
3. Confirm to user

Example flows:
User: "Marca como completada la tarea de comprar leche"
1. searchTasks with query="comprar leche"
2. Get taskId from results
3. updateTask with taskId and completed=true
4. Respond: "✅ Marked 'comprar leche' as completed!"

User: "Complete the buy milk task"
1. searchTasks with query="buy milk"
2. Get taskId from results  
3. updateTask with taskId and completed=true
4. Respond: "✅ Marked 'buy milk' as completed!"`
    }
    
    const messagesWithSystem = [systemPrompt, ...parsed.messages]
    
    const requestBody = { 
      model, 
      messages: messagesWithSystem, 
      tools: openaiTools, 
      tool_choice: 'auto',
      temperature: 0 
    }
    
    console.log('Calling OpenRouter with:', JSON.stringify(requestBody, null, 2))
    
    const resp = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}))
      console.error('OpenRouter API error:', {
        status: resp.status,
        statusText: resp.statusText,
        error: err
      })
      return NextResponse.json({ 
        error: 'LLM error', 
        details: err,
        message: `OpenRouter returned ${resp.status}: ${JSON.stringify(err)}`
      }, { status: 500 }) // Always return 500 to client, log actual status
    }

    const data = await resp.json()
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

      const finalResp = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages: messagesWithTool, temperature: 0.7, max_tokens: 800 })
      })

      if (!finalResp.ok) {
        const err = await finalResp.json().catch(() => ({}))
        return NextResponse.json({ error: 'LLM error on final reply', details: err }, { status: finalResp.status })
      }

      const finalData = await finalResp.json()
      const finalText = finalData?.choices?.[0]?.message?.content || ''

      return NextResponse.json({ success: true, tool: name, toolResult, assistant: finalText })
    }

    // If no function call, return assistant message directly
    const assistantText = choice?.message?.content || ''
    return NextResponse.json({ success: true, assistant: assistantText })

  } catch (err: any) {
    console.error('Error in chat/tools endpoint:', err)
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: err?.message || String(err) 
    }, { status: 500 })
  }
}
