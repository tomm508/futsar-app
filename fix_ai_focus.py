import re

with open('app/App.tsx', 'r') as f:
    content = f.read()

old_form = """                  <form onSubmit={handleSendAiMessage} className="flex gap-2 mt-auto border-t border-[#333] pt-4">
                    <input 
                      type="text" 
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder="Tanya sesuatu..."
                      className="flex-1 bg-[#1a1a1a] border border-[#333] focus:border-[#1abc9c] text-white p-3 rounded-xl text-[14px] outline-none transition-colors"
                    />"""

new_form = """                  <form onSubmit={handleSendAiMessage} className="flex gap-2 mt-auto border-t border-[#333] pt-4 relative z-50">
                    <input 
                      type="text" 
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder="Ketik pesan..."
                      className="flex-1 bg-[#1a1a1a] border border-[#333] focus:border-[#1abc9c] text-white p-3 rounded-xl text-[14px] outline-none transition-colors touch-auto select-auto"
                      autoFocus
                      onFocus={(e) => {
                        // Workaround for some mobile browsers
                        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                    />"""

if old_form in content:
    content = content.replace(old_form, new_form)
    with open('app/App.tsx', 'w') as f:
        f.write(content)
    print("Focus fix applied!")
else:
    print("Old form not found!")

