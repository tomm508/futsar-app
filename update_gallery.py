import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

old_upload = """  const handleUploadGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          const newPhoto: GalleryPhoto = {
            id: Math.random().toString(36).substr(2, 9),
            url: dataUrl,
            uploader: user.nama,
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
          };
          const newSettings = { ...settings, gallery: [newPhoto, ...(settings.gallery || [])] };
          updateSettings(newSettings);
          alert('Foto berhasil diunggah ke Galeri!');
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };"""

new_upload = """  const handleAddGalleryLink = () => {
    if (!user) return;
    const link = prompt('Masukkan Link URL Foto (Contoh: https://contoh.com/foto.jpg):');
    if (link && link.trim() !== '') {
      const newPhoto: GalleryPhoto = {
        id: Math.random().toString(36).substr(2, 9),
        url: link.trim(),
        uploader: user.nama,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      };
      const newSettings = { ...settings, gallery: [newPhoto, ...(settings.gallery || [])] };
      updateSettings(newSettings);
      alert('Foto berhasil ditambahkan ke Galeri via Link!');
    }
  };"""

content = content.replace(old_upload, new_upload)

old_button = """                  {user?.role === 'admin' && (
                    <label className="bg-[#9b59b6]/20 text-[#9b59b6] px-3 py-1.5 rounded text-[11px] font-bold cursor-pointer hover:bg-[#9b59b6]/30 transition-colors flex items-center gap-1">
                      <Plus size={14} /> Unggah
                      <input type="file" accept="image/*" onChange={handleUploadGallery} className="hidden" />
                    </label>
                  )}"""

new_button = """                  {user?.role === 'admin' && (
                    <button onClick={handleAddGalleryLink} className="bg-[#9b59b6]/20 text-[#9b59b6] px-3 py-1.5 rounded text-[11px] font-bold cursor-pointer hover:bg-[#9b59b6]/30 transition-colors flex items-center gap-1">
                      <Plus size={14} /> Tambah Link
                    </button>
                  )}"""

content = content.replace(old_button, new_button)

old_official = """            <div className="text-[10px] uppercase font-black tracking-[3px] text-[#d4af37] bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#d4af37]/20">
              Official Club App
            </div>"""
            
new_official = """"""

content = content.replace(old_official, new_official)

with open('app/page.tsx', 'w') as f:
    f.write(content)
