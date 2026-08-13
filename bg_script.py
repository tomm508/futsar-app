import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

# 1. Update background rendering
old_bg = """      {/* Global Video Background */}
      <div className="fixed inset-0 w-full h-full z-0 bg-[#0a0a0a]">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-50 opacity-40 transition-opacity duration-1000"
        >
          <source src="/logo-futsar.mp4" type="video/mp4" />
        </video>
        {/* Subtle Gradient Overlays for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90 z-10 pointer-events-none"></div>
      </div>"""

new_bg = """      {/* Global Media Background */}
      <div className="fixed inset-0 w-full h-full z-0 bg-[#0a0a0a]">
        {settings.bgVideoUrl && settings.bgVideoUrl.match(/\.(mp4|webm|ogg)$/i) ? (
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-50 opacity-40 transition-opacity duration-1000"
          >
            <source src={settings.bgVideoUrl} />
          </video>
        ) : (
          <img 
            src={settings.bgVideoUrl || '/logo-futsar.mp4'} 
            alt="Background" 
            className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-50 opacity-40 transition-opacity duration-1000" 
            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1518605368461-1ee51188cd8d?q=80&w=2000&auto=format&fit=crop'; }}
          />
        )}
        {/* Subtle Gradient Overlays for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90 z-10 pointer-events-none"></div>
      </div>"""

content = content.replace(old_bg, new_bg)

# Fix the fallback for the default value, currently /logo-futsar.mp4 is technically an mp4.
# So if it matches mp4 it will use <video>.
# If someone puts a photo URL it will use <img>.
# Let's adjust the condition to also check if it's strictly the default logo-futsar.mp4
new_bg_fixed = """      {/* Global Media Background */}
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
        )}
        {/* Subtle Gradient Overlays for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90 z-10 pointer-events-none"></div>
      </div>"""
      
content = content.replace(new_bg, new_bg_fixed)


# 2. Add handleBgSubmit
old_handle_kas = """  const handleKasSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const m = parseInt(fd.get('kasMingguan') as string, 10);
    const b = parseInt(fd.get('kasBulanan') as string, 10);
    const cycle = fd.get('activePaymentCycle') as 'mingguan' | 'bulanan';
    onUpdateSettings({ ...settings, kasMingguan: m, kasBulanan: b, activePaymentCycle: cycle });
    alert('Pengaturan nominal kas dan siklus berhasil disimpan!');
  };"""

new_handle_kas = """  const handleKasSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const m = parseInt(fd.get('kasMingguan') as string, 10);
    const b = parseInt(fd.get('kasBulanan') as string, 10);
    const cycle = fd.get('activePaymentCycle') as 'mingguan' | 'bulanan';
    onUpdateSettings({ ...settings, kasMingguan: m, kasBulanan: b, activePaymentCycle: cycle });
    alert('Pengaturan nominal kas dan siklus berhasil disimpan!');
  };

  const handleBgSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const bgUrl = fd.get('bgVideoUrl') as string;
    onUpdateSettings({ ...settings, bgVideoUrl: bgUrl });
    alert('Latar belakang berhasil diperbarui!');
  };"""

content = content.replace(old_handle_kas, new_handle_kas)

# 3. Add the UI block
old_qris_end = """              <div className="relative overflow-hidden inline-block w-full">
                <button type="button" className="w-full bg-[#1a1a1a] text-white border border-[#333] p-3 rounded-lg text-sm font-bold uppercase cursor-pointer hover:bg-white/10 transition-colors">
                  Pilih Gambar QRIS Baru
                </button>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg" 
                  onChange={handleQrisUpload} 
                  className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>"""

new_qris_end = """              <div className="relative overflow-hidden inline-block w-full">
                <button type="button" className="w-full bg-[#1a1a1a]/60 backdrop-blur-sm text-white border border-[#333] p-3 rounded-lg text-sm font-bold uppercase cursor-pointer hover:bg-white/10 transition-colors">
                  Pilih Gambar QRIS Baru
                </button>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg" 
                  onChange={handleQrisUpload} 
                  className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#111]/60 backdrop-blur-md border border-[#333] p-6 rounded-2xl">
            <h3 className="text-[#d4af37] font-black text-xl mb-1 uppercase tracking-widest">Pengaturan Latar Belakang</h3>
            <p className="text-xs text-[#888] mb-6">Gunakan Link Foto (.jpg/.png) atau Link Video (.mp4) untuk latar belakang.</p>
            
            <form onSubmit={handleBgSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[#aaa] text-[11px] font-bold mb-1.5 uppercase">URL Foto / Video</label>
                <input type="text" name="bgVideoUrl" defaultValue={settings.bgVideoUrl || '/logo-futsar.mp4'} placeholder="Contoh: https://link-foto.com/gambar.jpg" className="w-full p-3 rounded-lg bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] text-white focus:outline-none focus:border-[#d4af37] transition-colors" required />
              </div>
              <button type="submit" className="w-full bg-[#d4af37] text-[#0a0a0a] border-none p-3 rounded-lg text-sm font-bold uppercase cursor-pointer hover:bg-opacity-80 transition-colors mt-2">
                Simpan Latar
              </button>
            </form>
          </div>"""

content = content.replace(old_qris_end, new_qris_end)

with open('app/page.tsx', 'w') as f:
    f.write(content)
