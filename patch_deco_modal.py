import re

with open('app/App.tsx', 'r') as f:
    content = f.read()

deco_modal = """
            {/* DECO MODAL */}
            {activeModal === 'deco' && (
              <>
                <div className="flex justify-between items-center mt-2 mb-5 border-b border-[#333] pb-2">
                  <h2 className="text-[#ffd700] text-[22px] font-black uppercase tracking-[1px] flex items-center gap-2">
                    <Star className="text-[#ffd700]" /> Toko Deco
                  </h2>
                  <div className="flex items-center gap-1.5 bg-[#ffd700]/10 px-3 py-1.5 rounded-lg border border-[#ffd700]/30">
                    <Star size={14} className="text-[#ffd700]" fill="#ffd700" />
                    <span className="text-[#ffd700] font-bold text-sm">{user?.points?.toLocaleString() || 0}</span>
                  </div>
                </div>
                
                <p className="text-[12px] text-[#888] text-left mb-6">Pilih border avatar yang ingin kamu pakai atau beli menggunakan poin.</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#ffd700]">
                  {AVATAR_BORDERS.map((border) => {
                    const isOwned = user?.ownedBorders?.includes(border.id) || border.id === 'classic';
                    const isActive = user?.avatarBorder === border.id || (!user?.avatarBorder && border.id === 'classic');
                    
                    return (
                      <div key={border.id} className={`bg-[#1a1a1a] p-4 rounded-2xl flex flex-col items-center gap-4 text-center border-2 transition-all ${isActive ? 'border-[#ffd700] bg-[#ffd700]/5' : 'border-[#333] hover:border-[#555]'}`}>
                        <div className="h-24 flex items-center justify-center">
                          <PlayerAvatar 
                            user={user} 
                            size="xl" 
                            customBorder={border.id} 
                            onClick={undefined} 
                          />
                        </div>
                        <div className="w-full flex flex-col items-center gap-1">
                          <span className="text-xs text-[#888] font-bold uppercase tracking-wider">{border.category}</span>
                          <span className="text-white font-bold text-sm">{border.name}</span>
                          <span className="text-[10px] text-gray-500 line-clamp-2 min-h-[30px]">{border.desc}</span>
                        </div>
                        
                        <div className="mt-auto pt-3 w-full">
                          {isActive ? (
                            <button disabled className="w-full py-2 bg-[#ffd700]/20 text-[#ffd700] rounded-lg text-xs font-bold uppercase cursor-default">Sedang Dipakai</button>
                          ) : isOwned ? (
                            <button onClick={() => handleEquipBorder(border.id)} className="w-full py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-xs font-bold uppercase transition-colors">Pakai Border</button>
                          ) : (
                            <button 
                              onClick={() => handleBuyBorder(border.id, border.price)}
                              className={`w-full py-2 rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-colors ${
                                (user?.points || 0) >= border.price 
                                  ? 'bg-[#ffd700] text-black hover:bg-[#e6c200]' 
                                  : 'bg-[#333] text-[#888] cursor-not-allowed'
                              }`}
                            >
                              <Star size={12} fill={(user?.points || 0) >= border.price ? "#000" : "transparent"} /> {border.price.toLocaleString()}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            
            {/* TAKTIK MODAL */}"""

content = content.replace("            {/* TAKTIK MODAL */}", deco_modal)

with open('app/App.tsx', 'w') as f:
    f.write(content)
