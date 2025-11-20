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

    // Create a placeholder for the assistant message
    const assistantMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: assistantMessageId,
      role: 'assistant',
      content: ''
    }]);

    try {
      const toolsRes = await fetch('/api/chat/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })) })
      });

      if (toolsRes.ok) {
        const data = await toolsRes.json();
        
        if (data.success) {
          const fullText = data.assistant || (data.tool ? `✅ ${data.tool} ejecutado exitosamente` : 'Sin respuesta');
          
          // Animate text word by word
          const words = fullText.split(' ');
          let currentText = '';
          
          for (let i = 0; i < words.length; i++) {
            currentText += (i > 0 ? ' ' : '') + words[i];
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: currentText }
                : msg
            ));
            // Delay between words (adjust speed here)
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          
          // Refresh tasks if a tool was executed
          if (data.tool) {
            setRefreshTasks(prev => prev + 1);
          }
        }
      } else {
        const errorData = await toolsRes.json().catch(() => ({ error: 'Error desconocido' }));
        console.error('Error details:', errorData);
        
        // Remove placeholder and show error
        setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
        throw new Error(errorData.error || errorData.message || 'Error en la API de tools');
      }
    } catch (err) {
      console.error('Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al procesar tu mensaje: ${errorMessage}`);
      
      // Remove placeholder on error
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="flex justify-center h-screen bg-gradient-to-br from-rose-950 via-pink-900 to-rose-850">
      {/* Panel de Tareas (izquierda) */}
      <div className={`${showTasks ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-pink-900 bg-gradient-to-b from-rose-950/50 to-pink-950/50 backdrop-blur-sm`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-pink-900/30">
            <h2 className="text-white font-bold text-lg tracking-tight flex items-center gap-2">
              <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Mis Tareas
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <TaskList refreshTrigger={refreshTasks} />
          </div>
        </div>
      </div>

      {/* Panel de Chat (derecha) */}
      <div className="flex-1 flex flex-col">
        <div className="flex w-full items-center justify-between px-4 py-3">
          <button
            onClick={() => setShowTasks(!showTasks)}
            className="text-gray-400 hover:text-white transition-colors" 
            aria-label="Alternar panel de tareas"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <ChatHeader messageCount={messages.length} />
          <div className="w-6"></div> {/* Spacer para centrar el header */}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 w-full items-center">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full w-full text-center space-y-6">
              <div className="w-24 h-24 mx-auto mt-90 rounded-full overflow-hidden border-4 border-pink-500/30 shadow-2xl shadow-pink-500/30">
                <img 
                  src="/bertram.jpg" 
                  alt="Bertram AI Assistant" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback si no se encuentra la imagen
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<div class=\"w-full h-full bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 flex items-center justify-center text-white font-bold text-5xl\">B</div>';
                  }}
                />
              </div>
              <div className="flex flex-col items-center justify-center space-y-2 mt-15">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-300 via-rose-300 to-pink-400 bg-clip-text text-transparent tracking-tight">Bienvenido a Bertram</h2>
                <img src="/bertram 2.jpg" alt="bertram" className="w-80 h-80 rounded-full mx-auto" />
                <p className="text-pink-300/60 w-full">
                  Tu mayordomo inteligente.<br />Te ayudaré a organizarte mejor.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
                <SuggestionCard 
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
                  title="Crear Tarea"
                  suggestion="Creá una tarea: estudiar para el examen"
                  onClick={() => setInput("Creá una tarea: estudiar para el examen")}
                />
                <SuggestionCard 
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                  title="Ver Tareas"
                  suggestion="Mostrá todas mis tareas pendientes"
                  onClick={() => setInput("Mostrá todas mis tareas pendientes")}
                />
                <SuggestionCard 
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  title="Completar Tarea"
                  suggestion="Marcar como completada [nombre de la tarea]"
                  onClick={() => setInput("Marcar como completada ")}
                />
                <SuggestionCard 
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                  title="Estadísticas"
                  suggestion="¿Qué tan productivo fui esta semana?"
                  onClick={() => setInput("¿Qué tan productivo fui esta semana?")}
                />
                <SuggestionCard 
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
                  title="Buscar Tareas"
                  suggestion="Buscar tareas de trabajo"
                  onClick={() => setInput("Buscar tareas de trabajo")}
                />
                <SuggestionCard 
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                  title="Eliminar Tarea"
                  suggestion="Eliminar tarea [nombre]"
                  onClick={() => setInput("Eliminar tarea ")}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setMessages([])}
                  className="flex items-center gap-2 px-4 py-2.5 bg-pink-950/30 hover:bg-pink-900/40 text-pink-200 rounded-xl transition-all duration-200 border border-pink-800/30 hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/20"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="font-medium">Volver al Menú</span>
                </button>
              </div>
              <MessageList messages={messages} isLoading={isLoading} />
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {error && (
          <div className="mx-4 mb-2 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm backdrop-blur-sm flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <strong className="font-semibold">Error:</strong> {error}
            </div>
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

function SuggestionCard({ icon, title, suggestion, onClick }: { icon: React.ReactNode; title: string; suggestion: string; onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="group bg-pink-950/20 hover:bg-pink-900/30 border border-pink-800/30 hover:border-pink-500/50 rounded-xl p-5 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-pink-500/20 backdrop-blur-sm"
    >
      <div className="text-pink-400 mb-3 group-hover:scale-110 transition-transform duration-200">{icon}</div>
      <h3 className="text-pink-100 font-semibold text-sm mb-2 tracking-tight">{title}</h3>
      <p className="text-pink-300/60 text-xs leading-relaxed">{suggestion}</p>
    </div>
  );
}
