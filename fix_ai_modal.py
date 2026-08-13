import re

with open('app/App.tsx', 'r') as f:
    content = f.read()

target = """            {/* CHAT ADMIN MODAL */}
            {activeModal === 'chat_admin' && ("""

ai_modal = """            {/* AI BOT MODAL */}
            {activeModal === 'ai_bot' && (
              <>
                <div className="flex items-center gap-3 mb-4 border-b border-[#333] pb-4">
                  <div className="w-10 h-10 bg-[#1abc9c]/20 rounded-full flex items-center justify-center mt-2">
                    <Bot className="text-[#1abc9c]" size={20} />
                  </div>
                  <div className="mt-2">
                    <h2 className="text-[#1abc9c] text-lg font-black uppercase tracking-widest">Asisten AI Futsar</h2>
                    <p className="text-[10px] text-[#888]">Powered by Gemini</p>
                  </div>
                </div>
                
                <div className="flex flex-col h-[55vh] max-h-[350px]">
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
                  
                  <form onSubmit={handleSendAiMessage} className="relative flex items-center mt-auto border-t border-[#333] pt-4">
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
                      className="absolute right-2 top-1/2 -translate-y-1/2 mt-2 mr-1 p-2 bg-[#1abc9c] text-black rounded-lg disabled:opacity-50 hover:bg-[#16a085] transition-colors"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </>
            )}

            {/* CHAT ADMIN MODAL */}
            {activeModal === 'chat_admin' && ("""

if target in content:
    content = content.replace(target, ai_modal)
    with open('app/App.tsx', 'w') as f:
        f.write(content)
    print("AI modal added successfully!")
else:
    print("Target not found!")

