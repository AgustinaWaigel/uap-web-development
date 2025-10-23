'use client';

import { useChat } from 'ai/react';
import { useState, useRef, useEffect } from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import ChatHeader from './ChatHeader';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    onError: (error: Error) => {
      console.error('Error en chat:', error);
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Auto-scroll al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Detectar si el usuario necesita el botón de scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
    setShowScrollButton(!isNearBottom && messages.length > 3);
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      <ChatHeader messageCount={messages.length} />

      <div 
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-4">
            <div className="text-6xl">💬</div>
            <h2 className="text-2xl font-bold text-gray-300">¡Bienvenido al Chatbot!</h2>
            <p className="text-sm max-w-md">
              Powered by OpenRouter y Vercel AI SDK. 
              <br />
              Escribe un mensaje para comenzar la conversación.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8 max-w-2xl">
              <SuggestionCard 
                emoji="🤖"
                title="¿Qué puedes hacer?"
                suggestion="Explícame qué tipo de preguntas puedo hacerte"
              />
              <SuggestionCard 
                emoji="💡"
                title="Dame ideas"
                suggestion="Dame 3 ideas para un proyecto web innovador"
              />
              <SuggestionCard 
                emoji="📚"
                title="Ayuda con código"
                suggestion="Explícame qué es React y para qué sirve"
              />
              <SuggestionCard 
                emoji="🎯"
                title="Resuelve problemas"
                suggestion="¿Cómo puedo mejorar el rendimiento de mi app?"
              />
            </div>
          </div>
        ) : (
          <>
            <MessageList messages={messages} isLoading={isLoading} />
            <div ref={messagesEndRef} />
          </>
        )}

        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-24 right-8 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Scroll to bottom"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        )}
      </div>

      {error && (
        <div className="mx-4 mb-2 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          <strong>❌ Error:</strong> {error.message}
        </div>
      )}

      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}

// Componente de tarjeta de sugerencia
function SuggestionCard({ emoji, title, suggestion }: { emoji: string; title: string; suggestion: string }) {
  return (
    <div className="bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:scale-105 hover:border-purple-500/50">
      <div className="text-2xl mb-2">{emoji}</div>
      <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
      <p className="text-gray-400 text-xs">{suggestion}</p>
    </div>
  );
}
