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
    // Set completedAt when marking as completed, clear when marking as incomplete
    payload.completedAt = data.completed ? new Date() : null
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
  
  // For SQLite compatibility, we need to do case-insensitive search manually
  // Fetch all matching tasks first, then filter in JavaScript
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

  let tasks = await prisma.task.findMany({ where, orderBy })
  
  // Apply text search filter in JavaScript (case-insensitive for SQLite)
  if (query) {
    const queryLower = query.toLowerCase()
    tasks = tasks.filter(task => 
      task.title.toLowerCase().includes(queryLower) ||
      (task.description && task.description.toLowerCase().includes(queryLower))
    )
  }
  
  // Apply limit after filtering
  const total = tasks.length
  tasks = tasks.slice(0, Number(limit || 50))
  
  return { tasks, total, hasMore: total > tasks.length }
}

export async function completeTaskTool(params: any) {
  try {
    const { taskName } = params
    if (!taskName || typeof taskName !== 'string') {
      throw new Error('taskName is required')
    }

    console.log('completeTaskTool: Searching for task:', taskName)
    
    // Search for tasks (case-insensitive for SQLite - do comparison in code)
    const allPendingTasks = await prisma.task.findMany({
      where: {
        deleted: false,
        completed: false
      }
    })
    
    // Filter manually for case-insensitive search (SQLite doesn't support mode: 'insensitive')
    const taskNameLower = taskName.toLowerCase()
    const tasks = allPendingTasks.filter(task => 
      task.title.toLowerCase().includes(taskNameLower) ||
      (task.description && task.description.toLowerCase().includes(taskNameLower))
    ).slice(0, 10)
    
    console.log(`completeTaskTool: Found ${tasks.length} task(s) matching "${taskName}"`)

    if (tasks.length === 0) {
      throw new Error(`❌ No se encontró ninguna tarea pendiente con el nombre "${taskName}". Verifica el nombre e intenta nuevamente.`)
    }

    // Separate exact matches from partial matches
    const exactMatches = tasks.filter(t => t.title.toLowerCase() === taskNameLower)
  
  // If we have exact matches, use only those; otherwise use all matches
  const tasksToProcess = exactMatches.length > 0 ? exactMatches : tasks
  
  console.log(`completeTaskTool: ${exactMatches.length} exact match(es), ${tasks.length} total match(es)`)

  // Check if we have multiple different task names
  const uniqueTitles = new Set(tasksToProcess.map(t => t.title.toLowerCase()))
  const allSameTitle = uniqueTitles.size === 1

  if (tasksToProcess.length > 1 && !allSameTitle) {
    // Multiple different tasks - ask user to be more specific
    const taskList = tasksToProcess.map((t, i) => `${i + 1}. "${t.title}" (${t.priority} priority, ${t.category})`).join('\n')
    return {
      multipleMatches: true,
      count: tasksToProcess.length,
      message: `⚠️ Encontré ${tasksToProcess.length} tareas diferentes que coinciden:\n\n${taskList}\n\nPor favor, usa el nombre exacto de la tarea que quieres completar.`,
      tasks: tasksToProcess.map(t => ({ id: t.id, title: t.title, priority: t.priority, category: t.category }))
    }
  }

  // Complete all tasks (either one task, or multiple with same exact name)
  const now = new Date()
  const updatePromises = tasksToProcess.map(task => 
    prisma.task.update({
      where: { id: task.id },
      data: { completed: true, completedAt: now }
    })
  )

  const updatedTasks = await Promise.all(updatePromises)
  
  console.log(`completeTaskTool: Marked ${updatedTasks.length} task(s) as completed`)
  
    if (updatedTasks.length === 1) {
      return {
        success: true,
        message: `✅ Tarea "${updatedTasks[0].title}" marcada como completada`,
        task: updatedTasks[0]
      }
    } else {
      return {
        success: true,
        message: `✅ ${updatedTasks.length} tareas con el nombre "${updatedTasks[0].title}" marcadas como completadas`,
        tasks: updatedTasks,
        count: updatedTasks.length
      }
    }
  } catch (error: any) {
    console.error('completeTaskTool ERROR:', error)
    throw new Error(`Error al completar tarea: ${error.message || String(error)}`)
  }
}

export async function getTaskStatsTool(params: any) {
  const { period = 'all-time', groupBy } = params || {}
  const now = new Date()
  
  // Define date ranges based on period
  let dateFilter: any = {}
  const todayStart = new Date(now.setHours(0, 0, 0, 0))
  const todayEnd = new Date(now.setHours(23, 59, 59, 999))
  const weekStart = new Date(now)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const yearStart = new Date(now.getFullYear(), 0, 1)

  if (period === 'today') dateFilter = { gte: todayStart }
  else if (period === 'week') dateFilter = { gte: weekStart }
  else if (period === 'month') dateFilter = { gte: monthStart }
  else if (period === 'year') dateFilter = { gte: yearStart }

  // Summary statistics
  const totalTasks = await prisma.task.count({ 
    where: { deleted: false, ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}) } 
  })
  const completedTasks = await prisma.task.count({ 
    where: { deleted: false, completed: true, ...(Object.keys(dateFilter).length > 0 ? { completedAt: dateFilter } : {}) } 
  })
  const pendingTasks = await prisma.task.count({ where: { deleted: false, completed: false } })
  const overdueTasks = await prisma.task.count({ 
    where: { deleted: false, completed: false, dueDate: { lt: now } } 
  })
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  // By Priority
  const priorities = ['high', 'medium', 'low']
  const byPriority: any = {}
  for (const priority of priorities) {
    const total = await prisma.task.count({ where: { deleted: false, priority } })
    const completed = await prisma.task.count({ where: { deleted: false, priority, completed: true } })
    byPriority[priority] = { total, completed, pending: total - completed }
  }

  // By Category
  const categories = ['work', 'personal', 'shopping', 'health', 'other']
  const byCategory: any = {}
  for (const category of categories) {
    const total = await prisma.task.count({ where: { deleted: false, category } })
    const completed = await prisma.task.count({ where: { deleted: false, category, completed: true } })
    byCategory[category] = { total, completed, pending: total - completed }
  }

  // Timeline metrics
  const tasksCreatedToday = await prisma.task.count({ 
    where: { deleted: false, createdAt: { gte: todayStart, lte: todayEnd } } 
  })
  const tasksCompletedToday = await prisma.task.count({ 
    where: { deleted: false, completed: true, completedAt: { gte: todayStart, lte: todayEnd } } 
  })
  const tasksCreatedThisWeek = await prisma.task.count({ 
    where: { deleted: false, createdAt: { gte: weekStart } } 
  })
  const tasksCompletedThisWeek = await prisma.task.count({ 
    where: { deleted: false, completed: true, completedAt: { gte: weekStart } } 
  })

  // Productivity metrics
  const completedTasksWithTime = await prisma.task.findMany({
    where: { deleted: false, completed: true, completedAt: { not: null } },
    select: { createdAt: true, completedAt: true }
  })

  let averageCompletionTime = 'N/A'
  if (completedTasksWithTime.length > 0) {
    const totalMs = completedTasksWithTime.reduce((sum, task) => {
      if (task.completedAt) {
        return sum + (task.completedAt.getTime() - task.createdAt.getTime())
      }
      return sum
    }, 0)
    const avgMs = totalMs / completedTasksWithTime.length
    const avgHours = Math.round(avgMs / (1000 * 60 * 60))
    const avgDays = Math.floor(avgHours / 24)
    const remainingHours = avgHours % 24
    averageCompletionTime = avgDays > 0 
      ? `${avgDays}d ${remainingHours}h` 
      : `${remainingHours}h`
  }

  // Most productive day (day with most completions)
  const completedByDay: { [key: string]: number } = {}
  const completedTasks30Days = await prisma.task.findMany({
    where: { 
      deleted: false, 
      completed: true, 
      completedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
    },
    select: { completedAt: true }
  })

  completedTasks30Days.forEach(task => {
    if (task.completedAt) {
      const dayName = task.completedAt.toLocaleDateString('es-ES', { weekday: 'long' })
      completedByDay[dayName] = (completedByDay[dayName] || 0) + 1
    }
  })

  const mostProductiveDay = Object.keys(completedByDay).length > 0
    ? Object.entries(completedByDay).sort((a, b) => b[1] - a[1])[0][0]
    : 'N/A'

  // Current streak (consecutive days with completed tasks)
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  
  const last90Days = await prisma.task.findMany({
    where: { 
      deleted: false, 
      completed: true, 
      completedAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } 
    },
    orderBy: { completedAt: 'desc' },
    select: { completedAt: true }
  })

  if (last90Days.length > 0) {
    const dateSet = new Set(
      last90Days
        .filter(t => t.completedAt)
        .map(t => t.completedAt!.toISOString().split('T')[0])
    )
    
    const sortedDates = Array.from(dateSet).sort().reverse()
    
    // Calculate current streak
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    if (sortedDates.includes(today) || sortedDates.includes(yesterday)) {
      let checkDate = sortedDates.includes(today) ? today : yesterday
      for (const date of sortedDates) {
        if (date === checkDate) {
          currentStreak++
          const prevDay = new Date(new Date(checkDate).getTime() - 24 * 60 * 60 * 1000)
          checkDate = prevDay.toISOString().split('T')[0]
        } else {
          break
        }
      }
    }

    // Calculate longest streak
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0 || isConsecutiveDay(sortedDates[i], sortedDates[i - 1])) {
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 1
      }
    }
  }

  // Upcoming tasks
  const dueTodayCount = await prisma.task.count({ 
    where: { deleted: false, completed: false, dueDate: { gte: todayStart, lte: todayEnd } } 
  })
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)
  const dueThisWeekCount = await prisma.task.count({ 
    where: { deleted: false, completed: false, dueDate: { gte: now, lte: weekEnd } } 
  })
  const nextDueTask = await prisma.task.findFirst({ 
    where: { deleted: false, completed: false, dueDate: { gte: now } }, 
    orderBy: { dueDate: 'asc' } 
  })

  return {
    summary: {
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      overdueTasks
    },
    byPriority,
    byCategory,
    timeline: {
      tasksCreatedToday,
      tasksCompletedToday,
      tasksCreatedThisWeek,
      tasksCompletedThisWeek
    },
    productivity: {
      averageCompletionTime,
      mostProductiveDay,
      currentStreak,
      longestStreak
    },
    upcoming: {
      dueTodayCount,
      dueThisWeekCount,
      nextDueTask
    }
  }
}

// Helper function to check if two dates are consecutive days
function isConsecutiveDay(dateStr1: string, dateStr2: string): boolean {
  const date1 = new Date(dateStr1)
  const date2 = new Date(dateStr2)
  const diffTime = Math.abs(date2.getTime() - date1.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays === 1
}
