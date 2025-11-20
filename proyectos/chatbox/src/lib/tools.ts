import prisma from './prismadb'

export async function createTaskTool(params: any) {
  const { title, priority = 'medium', dueDate, category = 'other', description } = params
  if (!title || typeof title !== 'string') throw new Error('title is required')
  if (dueDate) {
    const d = new Date(dueDate)
    if (isNaN(d.getTime())) throw new Error('invalid dueDate')
    if (d.getTime() <= Date.now()) throw new Error('dueDate must be in the future')
  }

  const task = await prisma.task.create({
    data: {
      title,
      description: description ?? null,
      priority: priority as any,
      category: category as any,
      dueDate: dueDate ? new Date(dueDate) : null
    }
  })

  return task
}

export async function updateTaskTool(params: any) {
  console.log('updateTaskTool received params:', JSON.stringify(params, null, 2))
  
  const { taskId, ...data } = params
  if (!taskId) throw new Error('taskId is required')

  const existing = await prisma.task.findUnique({ where: { id: taskId } })
  if (!existing || existing.deleted) throw new Error('task not found')

  const payload: any = {}
  if (data.title) payload.title = data.title
  if (Object.prototype.hasOwnProperty.call(data, 'description')) payload.description = data.description
  if (typeof data.completed === 'boolean') {
    console.log('Setting completed to:', data.completed)
    payload.completed = data.completed
  }
  if (data.priority) payload.priority = data.priority
  if (data.category) payload.category = data.category
  if (data.dueDate) {
    const d = new Date(data.dueDate)
    if (isNaN(d.getTime())) throw new Error('invalid dueDate')
    payload.dueDate = d
  }

  console.log('Update payload:', JSON.stringify(payload, null, 2))
  
  if (Object.keys(payload).length === 0) throw new Error('no fields to update')

  const updated = await prisma.task.update({ where: { id: taskId }, data: payload })
  console.log('Task updated successfully:', JSON.stringify(updated, null, 2))
  return updated
}

export async function deleteTaskTool(params: any) {
  const { taskId } = params
  if (!taskId) throw new Error('taskId is required')
  const existing = await prisma.task.findUnique({ where: { id: taskId } })
  if (!existing) throw new Error('task not found')
  await prisma.task.update({ where: { id: taskId }, data: { deleted: true } })
  return { deleted: 1, title: existing.title }
}

export async function searchTasksTool(params: any) {
  const {
    query,
    completed,
    priority,
    category,
    dueDateFrom,
    dueDateTo,
    sortBy,
    sortOrder = 'asc',
    limit = 50
  } = params || {}

  const where: any = { deleted: false }
  if (query) where.OR = [{ title: { contains: query, mode: 'insensitive' } }, { description: { contains: query, mode: 'insensitive' } }]
  if (typeof completed === 'boolean') where.completed = completed
  if (priority) where.priority = priority
  if (category) where.category = category
  if (dueDateFrom || dueDateTo) {
    where.dueDate = {}
    if (dueDateFrom) where.dueDate.gte = new Date(dueDateFrom)
    if (dueDateTo) where.dueDate.lte = new Date(dueDateTo)
  }

  const orderBy: any = {}
  if (sortBy) orderBy[sortBy] = sortOrder
  else orderBy.createdAt = 'desc'

  const tasks = await prisma.task.findMany({ where, orderBy, take: Number(limit || 50) })
  const total = await prisma.task.count({ where })
  return { tasks, total }
}

export async function getTaskStatsTool(params: any) {
  const { period = 'all-time' } = params || {}
  const now = new Date()

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
