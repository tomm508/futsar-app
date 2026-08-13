import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

# 1. AppSettings
content = content.replace(
    'bgVideoUrl?: string;',
    'bgVideoUrl?: string;\n  bgInsideUrl?: string;'
)

# 2. defaultSettings
content = content.replace(
    "bgVideoUrl: '/logo-futsar.mp4',",
    "bgVideoUrl: '/logo-futsar.mp4',\n  bgInsideUrl: '/logo-futsar.mp4',"
)

# 3. handleBgSubmit
old_handle_bg = """  const handleBgSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const bgUrl = fd.get('bgVideoUrl') as string;
    onUpdateSettings({ ...settings, bgVideoUrl: bgUrl });
    alert('Latar belakang berhasil diperbarui!');
  };"""

new_handle_bg = """  const handleBgSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const bgUrl = fd.get('bgVideoUrl') as string;
    const bgInside = fd.get('bgInsideUrl') as string;
    onUpdateSettings({ ...settings, bgVideoUrl: bgUrl, bgInsideUrl: bgInside });
    alert('Latar belakang berhasil diperbarui!');
  };"""
content = content.replace(old_handle_bg, new_handle_bg)

# 4. Background Rendering
old_render = """      {/* Global Media Background */}
      <div className="fixed inset-0 w-full h-full z-0 bg-[#0a0a0a]">
        {(!settings.bgVideoUrl || settings.bgVideoUrl.match(/\.(mp4|webm|ogg)$/i) || settings.bgVideoUrl.includes('youtube.com') || settings.bgVideoUrl === '/logo-futsar.mp4') ? (
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-50 opacity-40 transition-opacity duration-1000"
          >
            <source src={settings.bgVideoUrl || '/logo-futsar.mp4'} />
          </video>
        ) : (
          <img 
            src={settings.bgVideoUrl} 
            alt="Background" 
            className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-50 opacity-40 transition-opacity duration-1000" 
            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1518605368461-1ee51188cd8d?q=80&w=2000&auto=format&fit=crop'; }}
          />
        )}"""

new_render = """      {/* Global Media Background */}
      <div className="fixed inset-0 w-full h-full z-0 bg-[#0a0a0a]">
        {(() => {
          const activeBg = user ? (settings.bgInsideUrl || '/logo-futsar.mp4') : (settings.bgVideoUrl || '/logo-futsar.mp4');
          const isVideo = activeBg.match(/\.(mp4|webm|ogg)$/i) || activeBg.includes('youtube.com') || activeBg === '/logo-futsar.mp4';
          
          if (isVideo) {
            return (
              <video 
                key={activeBg}
                autoPlay 
                loop 
                muted 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-50 opacity-40 transition-opacity duration-1000"
              >
                <source src={activeBg} />
              </video>
            );
          }
          
          return (
            <img 
              key={activeBg}
              src={activeBg} 
              alt="Background" 
              className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-50 opacity-40 transition-opacity duration-1000" 
              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1518605368461-1ee51188cd8d?q=80&w=2000&auto=format&fit=crop'; }}
            />
          );
        })()}"""
content = content.replace(old_render, new_render)

# 5. Admin UI Form
old_admin_form = """            <form onSubmit={handleBgSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">URL Foto / Video</label>
                <input type="text" name="bgVideoUrl" defaultValue={settings.bgVideoUrl || '/logo-futsar.mp4'} placeholder="Contoh: https://link-foto.com/gambar.jpg" className="w-full p-3 rounded-lg bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] text-white focus:outline-none focus:border-[#d4af37] transition-colors" required />
              </div>
              <button type="submit" className="w-full bg-[#d4af37] text-[#0a0a0a] border-none p-3 rounded-lg text-sm font-bold uppercase cursor-pointer hover:bg-opacity-80 transition-colors mt-2">
                Simpan Latar
              </button>
            </form>"""

new_admin_form = """            <form onSubmit={handleBgSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Latar Halaman Depan</label>
                <input type="text" name="bgVideoUrl" defaultValue={settings.bgVideoUrl || '/logo-futsar.mp4'} placeholder="Contoh: https://link-foto.com/gambar.jpg" className="w-full p-3 rounded-lg bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] text-white focus:outline-none focus:border-[#d4af37] transition-colors" required />
              </div>
              <div>
                <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">Latar Halaman Dalam (Dashboard & Menu)</label>
                <input type="text" name="bgInsideUrl" defaultValue={settings.bgInsideUrl || '/logo-futsar.mp4'} placeholder="Contoh: https://link-foto.com/gambar2.jpg" className="w-full p-3 rounded-lg bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] text-white focus:outline-none focus:border-[#d4af37] transition-colors" required />
              </div>
              <button type="submit" className="w-full bg-[#d4af37] text-[#0a0a0a] border-none p-3 rounded-lg text-sm font-bold uppercase cursor-pointer hover:bg-opacity-80 transition-colors mt-2">
                Simpan Latar
              </button>
            </form>"""

content = content.replace(old_admin_form, new_admin_form)

with open('app/page.tsx', 'w') as f:
    f.write(content)
