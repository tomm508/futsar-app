import re

with open('app/App.tsx', 'r') as f:
    content = f.read()

old_form = """                  <form onSubmit={handleSendAiMessage} className="relative flex items-center mt-auto border-t border-[#333] pt-4">
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
                  </form>"""

new_form = """                  <form onSubmit={handleSendAiMessage} className="flex gap-2 mt-auto border-t border-[#333] pt-4">
                    <input 
                      type="text" 
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder="Tanya sesuatu..."
                      className="flex-1 bg-[#1a1a1a] border border-[#333] focus:border-[#1abc9c] text-white p-3 rounded-xl text-[14px] outline-none transition-colors"
                    />
                    <button 
                      type="submit" 
                      disabled={isAiTyping || !aiInput.trim()}
                      className="p-3 bg-[#1abc9c] text-black rounded-xl disabled:opacity-50 hover:bg-[#16a085] transition-colors flex items-center justify-center shrink-0 min-w-[50px]"
                    >
                      <Send size={18} />
                    </button>
                  </form>"""

if old_form in content:
    content = content.replace(old_form, new_form)
    with open('app/App.tsx', 'w') as f:
        f.write(content)
    print("Form replaced successfully!")
else:
    print("Old form not found!")

