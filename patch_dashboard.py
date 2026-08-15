import re

with open('app/App.tsx', 'r') as f:
    content = f.read()

# Add points to the user card
user_card_stats = """                    <div className="flex flex-wrap gap-6 md:gap-12 mt-6">
                      <div className="border-l-2 pl-4" style={{ borderColor: user.themeColor || '#d4af37' }}>
                        <p className="text-[10px] text-[#888] font-bold uppercase tracking-tighter">Member ID</p>
                        <p className="text-lg md:text-xl font-mono font-bold">{user.id}</p>
                      </div>
                      <div className="border-l-2 pl-4" style={{ borderColor: user.themeColor || '#d4af37' }}>
                        <p className="text-[10px] text-[#888] font-bold uppercase tracking-tighter">Position</p>
                        <p className="text-lg md:text-xl font-bold uppercase">{user.posisi}</p>
                      </div>
                      <div className="border-l-2 pl-4" style={{ borderColor: user.themeColor || '#d4af37' }}>
                        <p className="text-[10px] text-[#888] font-bold uppercase tracking-tighter">Points</p>
                        <p className="text-lg md:text-xl font-bold text-[#ffd700] flex items-center gap-1.5"><Star size={16} fill="#ffd700" /> {user.points?.toLocaleString() || 0}</p>
                      </div>
                    </div>"""
content = re.sub(r'                    <div className="flex flex-wrap gap-6 md:gap-12 mt-6">.*?<\/div>\s*<\/div>\s*<\/div>', user_card_stats + '\n                  </div>', content, flags=re.DOTALL)

# Add Toko Deco button to the grid
toko_deco_btn = """                <button onClick={() => setActiveModal('deco')} className="bg-[#111]/60 backdrop-blur-md border border-[#222] rounded-2xl p-6 flex flex-col justify-between group hover:border-[#ffd700] transition-colors text-left active:scale-[0.98]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-[#ffd700]/10 p-3 rounded-xl">
                      <Star className="text-[#ffd700]" size={24} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 text-white">Toko Deco</h3>
                    <p className="text-xs text-gray-500">Beli & pakai border profil</p>
                  </div>
                </button>
                <button onClick={() => setActiveModal('info')}"""
content = content.replace("                <button onClick={() => setActiveModal('info')}", toko_deco_btn)

# Write back
with open('app/App.tsx', 'w') as f:
    f.write(content)
