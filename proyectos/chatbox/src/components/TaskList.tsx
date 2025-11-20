'use client';

import { useState, useEffect } from 'react';

interface Task {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  priority: string;
  category: string;
  dueDate?: string | null;
  createdAt: string;
}

interface TaskListProps {
  refreshTrigger?: number;
}

export default function TaskList({ refreshTrigger = 0 }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | 'pending' | 'completed',
    priority: 'all' as 'all' | 'high' | 'medium' | 'low',
    category: 'all' as 'all' | 'work' | 'personal' | 'shopping' | 'health' | 'other',
    sortBy: 'createdAt' as 'createdAt' | 'dueDate' | 'priority' | 'title',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.status !== 'all') {
        params.append('completed', filters.status === 'completed' ? 'true' : 'false');
      }
      if (filters.priority !== 'all') params.append('priority', filters.priority);
      if (filters.category !== 'all') params.append('category', filters.category);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);
      
      const url = '/api/tasks' + (params.toString() ? '?' + params.toString() : '');
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.tasks) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters, refreshTrigger]);

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, completed: !completed })
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    try {
      const res = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-rose-400 border-rose-400/50 bg-rose-500/10';
      case 'medium': return 'text-pink-400 border-pink-400/50 bg-pink-500/10';
      case 'low': return 'text-purple-400 border-purple-400/50 bg-purple-500/10';
      default: return 'text-gray-400 border-gray-500/50 bg-gray-500/10';
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'work': return '💼';
      case 'personal': return '🏠';
      case 'shopping': return '🛒';
      case 'health': return '❤️';
      default: return '📝';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con contador y botón de filtros */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-pink-200/80">
          <span className="font-semibold">{tasks.length}</span> tareas
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-1.5 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-400/30 rounded-lg text-pink-200 text-sm transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtros
        </button>
      </div>

      {/* Panel de filtros expandible */}
      {showFilters && (
        <div className="bg-pink-500/5 border border-pink-400/20 rounded-xl p-4 space-y-4">
          {/* Status Filter */}
          <div>
            <label className="text-xs text-pink-200/80 font-medium mb-2 block">Estado</label>
            <div className="flex gap-2">
              {[{value: 'all', label: 'Todas'}, {value: 'pending', label: 'Pendientes'}, {value: 'completed', label: 'Completadas'}].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFilters({...filters, status: item.value as any})}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filters.status === item.value
                      ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                      : 'bg-pink-500/10 text-pink-200/70 hover:bg-pink-500/20 border border-pink-400/20'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="text-xs text-pink-200/80 font-medium mb-2 block">Prioridad</label>
            <div className="flex gap-2">
              {[{value: 'all', label: 'Todas'}, {value: 'high', label: 'Alta'}, {value: 'medium', label: 'Media'}, {value: 'low', label: 'Baja'}].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFilters({...filters, priority: item.value as any})}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filters.priority === item.value
                      ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                      : 'bg-pink-500/10 text-pink-200/70 hover:bg-pink-500/20 border border-pink-400/20'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-xs text-pink-200/80 font-medium mb-2 block">Categoría</label>
            <div className="flex flex-wrap gap-2">
              {[{value: 'all', label: 'Todas'}, {value: 'work', label: 'Trabajo'}, {value: 'personal', label: 'Personal'}, {value: 'shopping', label: 'Compras'}, {value: 'health', label: 'Salud'}, {value: 'other', label: 'Otras'}].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFilters({...filters, category: item.value as any})}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filters.category === item.value
                      ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                      : 'bg-pink-500/10 text-pink-200/70 hover:bg-pink-500/20 border border-pink-400/20'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-pink-200/80 font-medium mb-2 block">Ordenar por</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value as any})}
                className="w-full bg-pink-500/10 border border-pink-400/20 rounded-lg px-3 py-2 text-sm text-pink-200 focus:outline-none focus:border-pink-400/50"
              >
                <option value="createdAt">Fecha de creación</option>
                <option value="dueDate">Fecha límite</option>
                <option value="priority">Prioridad</option>
                <option value="title">Título</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-pink-200/80 font-medium mb-2 block">Orden</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => setFilters({...filters, sortOrder: e.target.value as any})}
                className="w-full bg-pink-500/10 border border-pink-400/20 rounded-lg px-3 py-2 text-sm text-pink-200 focus:outline-none focus:border-pink-400/50"
              >
                <option value="asc">Ascendente</option>
                <option value="desc">Descendente</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="text-center text-pink-200/50 py-8">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="font-medium">No hay tareas</p>
          <p className="text-xs mt-2">Pedile a Bertram que cree una tarea para vos</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`bg-pink-500/5 border rounded-xl p-4 transition-all hover:bg-pink-500/10 ${
                task.completed ? 'opacity-50 border-pink-400/20' : 'border-pink-400/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleTask(task.id, task.completed)}
                  className={`mt-1 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                    task.completed ? 'bg-pink-500 border-pink-500' : 'border-pink-400/50 hover:border-pink-400'
                  }`}
                >
                  {task.completed && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getCategoryEmoji(task.category)}</span>
                    <h3 className={`font-semibold ${task.completed ? 'line-through text-pink-200/40' : 'text-pink-100'}`}>
                      {task.title}
                    </h3>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-pink-200/60 mb-2">{task.description}</p>
                  )}

                  <div className="flex items-center gap-2 text-xs">
                    <span className={`px-2 py-1 rounded-lg font-medium border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="text-pink-200/60">{task.category}</span>
                    {task.dueDate && (
                      <span className="flex items-center gap-1 text-pink-200/60">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-pink-200/40 hover:text-rose-400 transition-colors"
                  aria-label="Eliminar tarea"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
