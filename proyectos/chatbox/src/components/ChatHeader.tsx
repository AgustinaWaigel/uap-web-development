interface ChatHeaderProps {
  messageCount: number;
}

export default function ChatHeader({ messageCount }: ChatHeaderProps) {
  return (
    <div className="border-b border-pink-300/20 bg-gradient-to-r from-pink-00/5 via-rose-00/5 to-pink-00/5 backdrop-blur-lg px-4 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-pink-400/40 shadow-lg shadow-pink-400/30">
            <img 
              src="/bertram.jpg" 
              alt="Bertram AI Assistant" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback si no se encuentra la imagen
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<div class="h-full bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 flex items-center justify-center text-white font-bold text-lg">B</div>';
              }}
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-rose-200 bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text tracking-tight">Bertram</h1>
            <p className="text-xs text-pink-200/80">
              {messageCount === 0 ? 'Listo para ayudarte' : `${messageCount} mensajes`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 ">
          <div className="flex items-center gap-2 text-xs bg-pink-500/10 px-3 py-1.5 rounded-full border border-pink-400/30 text-rose-200/80 ">
            <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse "></div>
            <span className="font-medium">En línea</span>
          </div>
        </div>
      </div>
    </div>
  );
}
