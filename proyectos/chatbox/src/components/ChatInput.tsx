import { FormEvent, ChangeEvent } from 'react';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export default function ChatInput({ input, handleInputChange, handleSubmit, isLoading }: ChatInputProps) {
  return (
    <div className="border-t border-slate-700 bg-slate-900/50 backdrop-blur-lg p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Escribe tu mensaje..."
              disabled={isLoading}
              className="w-full bg-slate-800 text-white rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              maxLength={4000}
            />
            <div className="absolute right-3 bottom-3 text-xs text-gray-500">
              {input.length}/4000
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-2xl px-6 py-3 font-semibold transition-all duration-200 hover:scale-105 disabled:hover:scale-100 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </>
            ) : (
              <>
                Enviar
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </>
            )}
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          Powered by OpenRouter • Next.js • Vercel AI SDK
        </div>
      </form>
    </div>
  );
}
