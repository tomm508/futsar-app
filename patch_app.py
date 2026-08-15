import re

with open('app/App.tsx', 'r') as f:
    content = f.read()

# 1. Update User interface
user_type_repl = """  themeColor?: string;
  avatarBorder?: string;
  points?: number;
  ownedBorders?: string[];
  joinedDate?: string;"""
content = re.sub(r'  themeColor\?: string;\s*avatarBorder\?: string;\s*joinedDate\?: string;', user_type_repl, content)

# 2. Update AVATAR_BORDERS
avatar_borders_repl = """const AVATAR_BORDERS = [
  { id: 'classic', name: 'Solid Klasik', price: 0, category: 'Basic', desc: 'Ring solid tegas selaras warna tema' },
  { id: 'nika', name: 'Nika', price: 25000, category: 'One Piece Series', desc: 'Aura kebebasan sang dewa matahari' },
  { id: 'sasuke', name: 'Sasuke', price: 15000, category: 'Naruto Series', desc: 'Cakra ungu dengan mata kutukan' },
  { id: 'dragon', name: 'White Chinese Dragon', price: 15000, category: 'Dragon Series', desc: 'Naga putih bersinar' },
  { id: 'wanglin', name: 'Wang Lin', price: 15000, category: 'Renegade Series', desc: 'Aura spiritual kuno' },
  { id: 'wanglin2', name: 'Wang Lin II', price: 25000, category: 'Renegade Series', desc: 'Evolusi aura spiritual tingkat dewa' },
];"""
content = re.sub(r'const AVATAR_BORDERS = \[.*?\];', avatar_borders_repl, content, flags=re.DOTALL)

# 3. Update PlayerAvatar styles
get_frame_classes_repl = """  const getFrameClasses = () => {
    switch (borderStyle) {
      case 'nika':
        return 'p-[3px] rounded-full bg-gradient-to-tr from-white via-purple-100 to-white shadow-[0_0_15px_rgba(255,255,255,0.8),inset_0_0_10px_rgba(168,85,247,0.5)] animate-pulse';
      case 'sasuke':
        return 'p-[3px] rounded-full bg-gradient-to-tr from-purple-900 via-purple-600 to-indigo-900 shadow-[0_0_15px_rgba(147,51,234,0.6)] ring-1 ring-red-500/50';
      case 'dragon':
        return 'p-[3px] rounded-full bg-gradient-to-tr from-amber-200 via-yellow-500 to-white shadow-[0_0_12px_rgba(251,191,36,0.6)]';
      case 'wanglin':
        return 'p-[3px] rounded-full bg-gradient-to-br from-cyan-900 via-blue-500 to-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.5)]';
      case 'wanglin2':
        return 'p-[4px] rounded-full bg-gradient-to-r from-black via-blue-900 to-black shadow-[0_0_20px_rgba(30,58,138,0.8),inset_0_0_10px_rgba(255,255,255,0.2)] ring-2 ring-blue-500/30';
      case 'classic':
      default:
        return 'p-[2px] rounded-full border-2';
    }
  };"""
content = re.sub(r'  const getFrameClasses = \(\) => \{.*?  \};', get_frame_classes_repl, content, flags=re.DOTALL)

# Update PlayerAvatar custom inline styles for classic/glow (glow removed, just keep classic)
get_frame_styles_repl = """  const getFrameStyles = () => {
    if (borderStyle === 'classic' || !AVATAR_BORDERS.find(b => b.id === borderStyle)) {
      return {
        borderColor: theme,
        boxShadow: `0 2px 8px ${theme}33`
      };
    }
    return undefined;
  };"""
content = re.sub(r'  const getFrameStyles = \(\) => \{.*?  \};', get_frame_styles_repl, content, flags=re.DOTALL)

# 4. Remove CSV button for non-admins
# In the REKAP KAS MODAL
rekap_kas_repl = """            {/* REKAP KAS MODAL */}
            {activeModal === 'rekap_kas' && (
              <>
                <div className="flex justify-between items-center mt-2 mb-3 border-b border-[#333] pb-2">
                  <h2 className="text-[#d4af37] text-[22px] font-black uppercase tracking-[1px]">Catatan Kas</h2>
                  {user?.role === 'admin' && (
                    <button 
                      onClick={() => exportDataToCSV(allUsers)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#27ae60]/20 hover:bg-[#27ae60] text-[#27ae60] hover:text-white border border-[#27ae60]/40 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-sm"
                      title="Unduh Rekap CSV"
                    >
                      <Download size={13} /> Ekspor CSV
                    </button>
                  )}
                </div>"""
content = re.sub(r'\{\/\* REKAP KAS MODAL \*\/.*?<\/button>\s*<\/div>', rekap_kas_repl, content, flags=re.DOTALL)

with open('app/App.tsx', 'w') as f:
    f.write(content)

