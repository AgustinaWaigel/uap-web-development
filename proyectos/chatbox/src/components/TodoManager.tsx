'use client';

import { useState, useRef, useEffect } from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import ChatHeader from './ChatHeader';
import TaskList from './TaskList';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function TodoManager() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTasks, setRefreshTasks] = useState(0);
  const [showTasks, setShowTasks] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Intentar primero con tools (para comandos de tareas)
      const toolsRes = await fetch('/api/chat/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })) })
      });

      if (toolsRes.ok) {
        const data = await toolsRes.json();
        
        if (data.success && data.tool) {
          // Si se ejecutó una tool, mostrar resultado y refrescar tareas
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.assistant || `✅ ${data.tool} ejecutado exitosamente`
          };
          setMessages(prev => [...prev, assistantMessage]);
          setRefreshTasks(prev => prev + 1); // Trigger refresh de TaskList
        } else {
          // Si no se usó tool, respuesta normal del LLM
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.assistant || 'Sin respuesta'
          };
          setMessages(prev => [...prev, assistantMessage]);
        }
      } else {
        // Si hay error, intentar leer el mensaje de error
        const errorData = await toolsRes.json().catch(() => ({ error: 'Error desconocido' }));
        console.error('Error details:', errorData);
        throw new Error(errorData.error || errorData.message || 'Error en la API de tools');
      }
    } catch (err) {
      console.error('Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al procesar tu mensaje: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Panel de Tareas (izquierda) */}
      <div className={`${showTasks ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-slate-700 bg-slate-900`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-white font-bold text-lg">📝 Mis Tareas</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <TaskList refreshTrigger={refreshTasks} />
          </div>
        </div>
      </div>

      {/* Panel de Chat (derecha) */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <button
            onClick={() => setShowTasks(!showTasks)}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle tasks panel"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <ChatHeader messageCount={messages.length} />
          <div className="w-6"></div> {/* Spacer para centrar el header */}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-4">
              <div className="text-6xl">🤖✅</div>
              <h2 className="text-2xl font-bold text-gray-300">AI Todo Manager</h2>
              <p className="text-sm max-w-md">
                Gestiona tus tareas de forma conversacional.
                <br />
                Crea, actualiza, busca y obtén estadísticas de tus tareas.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8 max-w-2xl">
                <SuggestionCard 
                  emoji="➕"
                  title="Crear tarea"
                  suggestion="Agregar tarea: comprar leche, prioridad alta"
                  onClick={() => {
                    setInput("Agregar tarea: comprar leche, prioridad alta");
                    // Auto-submit after a brief delay to show the input
                    setTimeout(() => {
                      const form = document.querySelector('form');
                      if (form) form.requestSubmit();
                    }, 100);
                  }}
                />
                <SuggestionCard 
                  emoji="📋"
                  title="Ver tareas"
                  suggestion="Muéstrame todas mis tareas pendientes"
                  onClick={() => {
                    setInput("Muéstrame todas mis tareas pendientes");
                    setTimeout(() => {
                      const form = document.querySelector('form');
                      if (form) form.requestSubmit();
                    }, 100);
                  }}
                />
                <SuggestionCard 
                  emoji="✅"
                  title="Completar tarea"
                  suggestion="Marca como completada la tarea de comprar leche"
                  onClick={() => {
                    setInput("Marca como completada la tarea de comprar leche");
                    setTimeout(() => {
                      const form = document.querySelector('form');
                      if (form) form.requestSubmit();
                    }, 100);
                  }}
                />
                <SuggestionCard 
                  emoji="📊"
                  title="Estadísticas"
                  suggestion="¿Qué tan productivo he sido esta semana?"
                  onClick={() => {
                    setInput("¿Qué tan productivo he sido esta semana?");
                    setTimeout(() => {
                      const form = document.querySelector('form');
                      if (form) form.requestSubmit();
                    }, 100);
                  }}
                />
              </div>
            </div>
          ) : (
            <>
              <MessageList messages={messages} isLoading={isLoading} />
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {error && (
          <div className="mx-4 mb-2 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            <strong>❌ Error:</strong> {error}
          </div>
        )}

        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

function SuggestionCard({ emoji, title, suggestion, onClick }: { emoji: string; title: string; suggestion: string; onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:scale-105 hover:border-purple-500/50"
    >
      <div className="text-2xl mb-2">{emoji}</div>
      <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
      <p className="text-gray-400 text-xs">{suggestion}</p>
    </div>
  );
}
