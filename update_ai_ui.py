import re

with open('app/App.tsx', 'r') as f:
    content = f.read()

# 1. Add menu button in grid
old_menu_chat_admin = """                <button onClick={() => setActiveModal('chat_admin')} className="bg-[#111]/60 backdrop-blur-md border border-[#222] rounded-2xl p-6 flex flex-col justify-between group hover:border-[#d4af37] transition-colors text-left active:scale-[0.98]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-white/10 p-3 rounded-xl">
                      <MessageCircle className="text-white" size={24} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 text-white">Chat Admin</h3>
                    <p className="text-xs text-gray-500">Hubungi pengurus</p>
                  </div>
                </button>
              </div>"""

new_menu_chat_admin = """                <button onClick={() => setActiveModal('chat_admin')} className="bg-[#111]/60 backdrop-blur-md border border-[#222] rounded-2xl p-6 flex flex-col justify-between group hover:border-[#d4af37] transition-colors text-left active:scale-[0.98]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-white/10 p-3 rounded-xl">
                      <MessageCircle className="text-white" size={24} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 text-white">Chat Admin</h3>
                    <p className="text-xs text-gray-500">Hubungi pengurus</p>
                  </div>
                </button>
                
                <button onClick={() => setActiveModal('ai_bot')} className="bg-[#111]/60 backdrop-blur-md border border-[#222] rounded-2xl p-6 flex flex-col justify-between group hover:border-[#d4af37] transition-colors text-left active:scale-[0.98]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-[#1abc9c]/10 p-3 rounded-xl">
                      <Bot className="text-[#1abc9c]" size={24} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 text-white">Asisten AI</h3>
                    <p className="text-xs text-gray-500">Tanya seputar Futsar</p>
                  </div>
                </button>
              </div>"""

content = content.replace(old_menu_chat_admin, new_menu_chat_admin)

# 2. Add AI Bot Modal Content
old_modal_end = """            {activeModal === 'chat_admin' && (
              <>
                <div className="flex items-center gap-3 mb-5 border-b border-[#333] pb-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                    <MessageCircle className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-black uppercase tracking-widest">Chat Admin</h2>
                    <p className="text-[11px] text-[#888]">Hubungi pengurus Futsar</p>
                  </div>
                </div>"""

new_modal_ai_bot = """            {activeModal === 'ai_bot' && (
              <>
                <div className="flex items-center gap-3 mb-4 border-b border-[#333] pb-4">
                  <div className="w-10 h-10 bg-[#1abc9c]/20 rounded-full flex items-center justify-center">
                    <Bot className="text-[#1abc9c]" size={20} />
                  </div>
                  <div>
                    <h2 className="text-[#1abc9c] text-lg font-black uppercase tracking-widest">Asisten AI Futsar</h2>
                    <p className="text-[10px] text-[#888]">Powered by Gemini</p>
                  </div>
                </div>
                
                <div className="flex flex-col h-[60vh] max-h-[400px]">
                  <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2 scrollbar-thin scrollbar-thumb-[#1abc9c]">
                    {aiMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-[13px] leading-relaxed ${msg.role === 'user' ? 'bg-[#d4af37] text-black rounded-tr-none' : 'bg-[#222] text-white rounded-tl-none border border-[#333]'}`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isAiTyping && (
                      <div className="flex justify-start">
                        <div className="bg-[#222] border border-[#333] p-3 rounded-2xl rounded-tl-none flex gap-1">
                          <span className="w-2 h-2 bg-[#888] rounded-full animate-bounce"></span>
                          <span className="w-2 h-2 bg-[#888] rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                          <span className="w-2 h-2 bg-[#888] rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <form onSubmit={handleSendAiMessage} className="relative flex items-center mt-auto">
                    <input 
                      type="text" 
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder="Tanya sesuatu..."
                      className="w-full bg-[#111] border border-[#333] focus:border-[#1abc9c] text-white p-3 pr-12 rounded-xl text-[13px] outline-none transition-colors"
                      disabled={isAiTyping}
                    />
                    <button 
                      type="submit" 
                      disabled={isAiTyping || !aiInput.trim()}
                      className="absolute right-2 p-2 bg-[#1abc9c] text-black rounded-lg disabled:opacity-50 hover:bg-[#16a085] transition-colors"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </>
            )}

            {activeModal === 'chat_admin' && (
              <>
                <div className="flex items-center gap-3 mb-5 border-b border-[#333] pb-4">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                    <MessageCircle className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-black uppercase tracking-widest">Chat Admin</h2>
                    <p className="text-[11px] text-[#888]">Hubungi pengurus Futsar</p>
                  </div>
                </div>"""

content = content.replace(old_modal_end, new_modal_ai_bot)

with open('app/App.tsx', 'w') as f:
    f.write(content)

print("Done")
