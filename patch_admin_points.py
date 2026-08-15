import re

with open('app/App.tsx', 'r') as f:
    content = f.read()

edit_poin_btn = """                      {onSelectMember && (
                        <button 
                          onClick={() => onSelectMember(u)}
                          className="px-3 py-2 bg-white/10 text-white hover:bg-white/20 rounded-lg text-[10px] font-bold uppercase transition-colors"
                        >
                          Profil
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          const newPoints = prompt('Set poin untuk ' + u.nama + ':', String(u.points || 0));
                          if (newPoints !== null && !isNaN(Number(newPoints))) {
                            import('firebase/firestore').then(({ updateDoc, doc }) => {
                              // We already have updateDoc and doc in scope
                              updateDoc(doc(db, "users", u.wa), { points: Number(newPoints) });
                            });
                          }
                        }}
                        className="px-3 py-2 bg-[#ffd700]/10 text-[#ffd700] border border-[#ffd700]/30 hover:bg-[#ffd700] hover:text-black rounded-lg text-[10px] font-bold uppercase transition-colors"
                      >
                        Poin
                      </button>"""

content = content.replace("""                      {onSelectMember && (
                        <button 
                          onClick={() => onSelectMember(u)}
                          className="px-3 py-2 bg-white/10 text-white hover:bg-white/20 rounded-lg text-[10px] font-bold uppercase transition-colors"
                        >
                          Profil
                        </button>
                      )}""", edit_poin_btn)

with open('app/App.tsx', 'w') as f:
    f.write(content)
