interface ChatHeaderProps {
  messageCount: number;
}

export default function ChatHeader({ messageCount }: ChatHeaderProps) {
  return (
    <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-lg px-4 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
            🤖
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">UAP Chatbot</h1>
            <p className="text-xs text-gray-400">
              {messageCount === 0 ? 'Listo para ayudarte' : `${messageCount} mensajes`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            En línea
          </div>
        </div>
      </div>
    </div>
  );
}
