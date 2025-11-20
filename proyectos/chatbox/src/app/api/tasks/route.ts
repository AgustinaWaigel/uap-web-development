import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '../../../lib/prismadb'

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().datetime().optional(),
  category: z.enum(['work', 'personal', 'shopping', 'health', 'other']).optional()
})

const updateTaskSchema = z.object({
  taskId: z.string().min(1),
  title: z.string().optional(),
  description: z.string().nullable().optional(),
  completed: z.boolean().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().datetime().optional(),
  category: z.enum(['work', 'personal', 'shopping', 'health', 'other']).optional()
})

const searchSchema = z.object({
  query: z.string().optional(),
  completed: z.preprocess((v) => {
    if (v === 'true') return true
    if (v === 'false') return false
    return undefined
  }, z.boolean().optional()),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  category: z.enum(['work', 'personal', 'shopping', 'health', 'other']).optional(),
  dueDateFrom: z.string().datetime().optional(),
  dueDateTo: z.string().datetime().optional(),
  sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z.preprocess((v) => parseInt(String(v || '50'), 10), z.number().int().optional())
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = createTaskSchema.parse(body)

    // dueDate validation: if provided must be in future
    if (parsed.dueDate) {
      const d = new Date(parsed.dueDate)
      if (isNaN(d.getTime())) {
        return NextResponse.json({ error: 'dueDate is invalid' }, { status: 400 })
      }
      if (d.getTime() <= Date.now()) {
        return NextResponse.json({ error: 'dueDate must be in the future' }, { status: 400 })
      }
    }

    const task = await prisma.task.create({
      data: {
        title: parsed.title,
        description: parsed.description ?? null,
        priority: parsed.priority ?? 'medium',
        category: parsed.category ?? 'other',
        dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null
      }
    })

    return NextResponse.json({ success: true, task }, { status: 201 })
  } catch (err: any) {
    if (err?.errors) {
      return NextResponse.json({ error: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const q = Object.fromEntries(url.searchParams.entries())
    const parsed = searchSchema.parse(q)

    // If stats param present, return stats
    if (url.searchParams.get('stats')) {
      const period = url.searchParams.get('period') ?? 'all-time'
      const stats = await computeStats(period as string)
      return NextResponse.json({ success: true, stats })
    }

    const where: any = { deleted: false }
    if (parsed.query) {
      where.OR = [
        { title: { contains: parsed.query, mode: 'insensitive' } },
        { description: { contains: parsed.query, mode: 'insensitive' } }
      ]
    }
    if (typeof parsed.completed === 'boolean') where.completed = parsed.completed
    if (parsed.priority) where.priority = parsed.priority
    if (parsed.category) where.category = parsed.category
    if (parsed.dueDateFrom || parsed.dueDateTo) {
      where.dueDate = {}
      if (parsed.dueDateFrom) where.dueDate.gte = new Date(parsed.dueDateFrom)
      if (parsed.dueDateTo) where.dueDate.lte = new Date(parsed.dueDateTo)
    }

    const orderBy: any = {}
    if (parsed.sortBy) {
      orderBy[parsed.sortBy] = parsed.sortOrder ?? 'asc'
    } else {
      orderBy.createdAt = 'desc'
    }

    const limit = parsed.limit ?? 50

    const tasks = await prisma.task.findMany({
      where,
      orderBy,
      take: limit
    })

    const total = await prisma.task.count({ where })

    return NextResponse.json({ success: true, tasks, total, hasMore: total > tasks.length })
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const parsed = updateTaskSchema.parse(body)

    const existing = await prisma.task.findUnique({ where: { id: parsed.taskId } })
    if (!existing || existing.deleted) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const data: any = {}
    if (parsed.title) data.title = parsed.title
    if (parsed.description !== undefined) data.description = parsed.description
    if (parsed.completed !== undefined) data.completed = parsed.completed
    if (parsed.priority) data.priority = parsed.priority
    if (parsed.category) data.category = parsed.category
    if (parsed.dueDate) {
      const d = new Date(parsed.dueDate)
      if (isNaN(d.getTime())) return NextResponse.json({ error: 'Invalid dueDate' }, { status: 400 })
      data.dueDate = d
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const updated = await prisma.task.update({ where: { id: parsed.taskId }, data })

    return NextResponse.json({ success: true, task: updated })
  } catch (err: any) {
    if (err?.errors) return NextResponse.json({ error: err.errors }, { status: 400 })
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { taskId, confirm } = body || {}

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 })
    }

    const existing = await prisma.task.findUnique({ where: { id: taskId } })
    if (!existing) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

    // soft delete: mark deleted=true
    await prisma.task.update({ where: { id: taskId }, data: { deleted: true } })

    return NextResponse.json({ success: true, deleted: 1, title: existing.title })
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

async function computeStats(period: string) {
  // Basic stats implementation for requested period. Can be extended.
  const whereBase: any = { deleted: false }
  const now = new Date()

  if (period === 'today') {
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    whereBase.createdAt = { gte: start }
  }

  const totalTasks = await prisma.task.count({ where: { deleted: false } })
  const completedTasks = await prisma.task.count({ where: { deleted: false, completed: true } })
  const pendingTasks = totalTasks - completedTasks
  const overdueTasks = await prisma.task.count({ where: { deleted: false, completed: false, dueDate: { lt: new Date() } } })

  const byPriority = {
    high: await prisma.task.count({ where: { deleted: false, priority: 'high' } }),
    medium: await prisma.task.count({ where: { deleted: false, priority: 'medium' } }),
    low: await prisma.task.count({ where: { deleted: false, priority: 'low' } })
  }

  const nextDue = await prisma.task.findFirst({ where: { deleted: false, dueDate: { gte: new Date() } }, orderBy: { dueDate: 'asc' } })

  return {
    summary: { totalTasks, completedTasks, pendingTasks, completionRate: totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100), overdueTasks },
    byPriority,
    upcoming: {
      dueTodayCount: await prisma.task.count({ where: { deleted: false, dueDate: { gte: new Date(new Date().setHours(0,0,0,0)), lte: new Date(new Date().setHours(23,59,59,999)) } } }),
      dueThisWeekCount: 0,
      nextDueTask: nextDue
    }
  }
}
