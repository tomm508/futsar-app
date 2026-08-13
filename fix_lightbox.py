import re

with open('app/App.tsx', 'r') as f:
    content = f.read()

# 1. Add state
old_state = "const [isMounted, setIsMounted] = useState(false);"
new_state = "const [isMounted, setIsMounted] = useState(false);\n  const [selectedGalleryPhoto, setSelectedGalleryPhoto] = useState<string | null>(null);"
content = content.replace(old_state, new_state)

# 2. Main Gallery
old_main_gallery = """                    settings.gallery.map((photo) => (
                      <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333]">
                        <img src={photo.url} alt="Gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-left">"""
new_main_gallery = """                    settings.gallery.map((photo) => (
                      <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] cursor-pointer" onClick={() => setSelectedGalleryPhoto(photo.url)}>
                        <img src={photo.url} alt="Gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-left pointer-events-none">"""
content = content.replace(old_main_gallery, new_main_gallery)

old_delete_btn = """<button onClick={() => handleDeleteGallery(photo.id)} className="absolute top-2 right-2 bg-black/60 text-[#e53e3e] w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black transition-all">"""
new_delete_btn = """<button onClick={(e) => { e.stopPropagation(); handleDeleteGallery(photo.id); }} className="absolute top-2 right-2 bg-black/60 text-[#e53e3e] w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black transition-all pointer-events-auto">"""
content = content.replace(old_delete_btn, new_delete_btn)

# 3. Admin Gallery
old_admin_gallery = """              {(settings.gallery || []).map((photo) => (
                <div key={photo.id} className="relative group aspect-square bg-[#1a1a1a]/60 backdrop-blur-sm rounded-lg overflow-hidden border border-[#333]">
                  <img src={photo.url} alt="Galeri" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">"""
new_admin_gallery = """              {(settings.gallery || []).map((photo) => (
                <div key={photo.id} className="relative group aspect-square bg-[#1a1a1a]/60 backdrop-blur-sm rounded-lg overflow-hidden border border-[#333] cursor-pointer" onClick={() => setSelectedGalleryPhoto(photo.url)}>
                  <img src={photo.url} alt="Galeri" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between pointer-events-none">"""
content = content.replace(old_admin_gallery, new_admin_gallery)

old_admin_delete_btn = """                    <button 
                      onClick={() => handleDeleteGalleryPhoto(photo.id)}
                      className="self-end bg-[#e53e3e] text-white p-1.5 rounded-md hover:bg-[#c53030] transition-colors"
                      title="Hapus Foto"
                    >"""
new_admin_delete_btn = """                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteGalleryPhoto(photo.id); }}
                      className="self-end bg-[#e53e3e] text-white p-1.5 rounded-md hover:bg-[#c53030] transition-colors pointer-events-auto"
                      title="Hapus Foto"
                    >"""
content = content.replace(old_admin_delete_btn, new_admin_delete_btn)

# 4. Add modal HTML
old_end = """    </div>
  );
}"""

new_end = """      {selectedGalleryPhoto && (
        <div 
          className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setSelectedGalleryPhoto(null)}
        >
          <button 
            onClick={() => setSelectedGalleryPhoto(null)}
            className="absolute top-4 right-4 md:top-8 md:right-8 bg-[#111] border border-[#333] p-3 rounded-full text-white hover:bg-[#222] hover:text-[#d4af37] transition-colors z-[210] shadow-xl"
          >
            <X size={24} />
          </button>
          <img 
            src={selectedGalleryPhoto} 
            alt="Fullscreen Gallery" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl relative z-[205]"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
}"""
content = content.replace(old_end, new_end)

with open('app/App.tsx', 'w') as f:
    f.write(content)

print("Replacement script executed!")
