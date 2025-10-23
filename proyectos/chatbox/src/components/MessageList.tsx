import type { Message } from 'ai/react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  // Componentes personalizados para ReactMarkdown
  const markdownComponents: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return match ? (
        <code className={`${className} bg-slate-900 rounded px-1`} {...props}>
          {children}
        </code>
      ) : (
        <code className="bg-slate-900 rounded px-1" {...props}>
          {children}
        </code>
      );
    },
    pre({ children }) {
      return (
        <pre className="bg-slate-900 rounded-lg p-3 overflow-x-auto my-2">
          {children}
        </pre>
      );
    },
    p({ children }) {
      return <p className="mb-2 last:mb-0">{children}</p>;
    },
    ul({ children }) {
      return <ul className="list-disc list-inside mb-2">{children}</ul>;
    },
    ol({ children }) {
      return <ol className="list-decimal list-inside mb-2">{children}</ol>;
    },
  };

  return (
    <>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              message.role === 'user'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-gray-100 border border-slate-700'
            }`}
          >
            <div className="flex items-start gap-3">
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  AI
                </div>
              )}
              <div className="flex-1 min-w-0">
                {message.role === 'user' ? (
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown components={markdownComponents}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  TÚ
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-slate-800 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                AI
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
