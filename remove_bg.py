import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

# 1. Remove admin UI handlers
handlers = """  const handleVideoBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) {
        alert('Gagal: Ukuran video terlalu besar! Maksimal 800KB. Silakan kompres video Anda atau pilih "Tanpa Video".');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUpdateSettings({ ...settings, bgVideoUrl: base64String });
        alert('Video latar belakang berhasil diunggah!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetVideoBg = () => {
    onUpdateSettings({ ...settings, bgVideoUrl: '/logo-futsar.mp4' });
    alert('Video latar belakang dikembalikan ke default (/logo-futsar.mp4)!');
  };

  const handleRemoveVideoBg = () => {
    onUpdateSettings({ ...settings, bgVideoUrl: 'none' });
    alert('Video latar belakang dimatikan! Menggunakan latar gelap.');
  };
"""
content = content.replace(handlers, "")

# 2. Remove Admin UI
ui = """          {/* UPLOAD VIDEO LATAR BELAKANG */}
          <div className="bg-[#111] border border-[#333] p-6 rounded-2xl">
            <h3 className="text-[#3498db] font-black text-xl mb-1 uppercase tracking-widest flex items-center gap-2">
              🎬 Video Latar Belakang (.MP4)
            </h3>
            <p className="text-xs text-[#888] mb-4">Ubah latar belakang video (maksimal 800KB) atau matikan saja.</p>
            
            <div className="flex flex-col gap-3">
              <div className="relative overflow-hidden inline-block w-full">
                <button type="button" className="w-full bg-[#3498db] text-white border-none p-3 rounded-lg text-sm font-bold uppercase cursor-pointer hover:bg-opacity-80 transition-colors shadow-md">
                  📤 Unggah Video MP4 Kecil
                </button>
                <input 
                  type="file" 
                  accept="video/mp4, video/webm" 
                  onChange={handleVideoBgUpload} 
                  className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={handleResetVideoBg}
                  className="flex-1 bg-[#1a1a1a] text-[#aaa] border border-[#333] p-2.5 rounded-lg text-xs font-bold uppercase hover:text-white hover:bg-white/5 transition-colors"
                >
                  🔄 Video Default
                </button>
                <button 
                  type="button" 
                  onClick={handleRemoveVideoBg}
                  className="flex-1 bg-[#e53e3e]/10 text-[#e53e3e] border border-[#e53e3e] p-2.5 rounded-lg text-xs font-bold uppercase hover:text-white hover:bg-[#e53e3e] transition-colors"
                >
                  ❌ Tanpa Video
                </button>
              </div>
            </div>
          </div>"""
content = content.replace(ui, "")

# 3. Simplify Video rendering
old_render = """          {/* Background Video & Overlay */}
          <div className="absolute inset-0 w-full h-full z-0 bg-[#0a0a0a]">
            {/* Primary Moving Video Background */}
            {settings.bgVideoUrl !== 'none' && (
              <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                key={settings.bgVideoUrl || '/logo-futsar.mp4'}
                className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-90 transition-opacity duration-1000"
              >
                <source src={settings.bgVideoUrl || '/logo-futsar.mp4'} type="video/mp4" />
                <source src="/logo-futsar.mp4" type="video/mp4" />
                <source src="/futsar-bg.mp4" type="video/mp4" />
                <source src="/video-bg.mp4" type="video/mp4" />
              </video>
            )}
            {/* Subtle Gradient Overlays for contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-10 pointer-events-none"></div>
          </div>"""

new_render = """          {/* Background Video & Overlay */}
          <div className="absolute inset-0 w-full h-full z-0 bg-[#0a0a0a]">
            {/* Primary Moving Video Background */}
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-90 transition-opacity duration-1000"
            >
              <source src="/logo-futsar.mp4" type="video/mp4" />
            </video>
            {/* Subtle Gradient Overlays for contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-10 pointer-events-none"></div>
          </div>"""
content = content.replace(old_render, new_render)

with open('app/page.tsx', 'w') as f:
    f.write(content)
