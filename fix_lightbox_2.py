import re

with open('app/App.tsx', 'r') as f:
    content = f.read()

# 1. Remove the modal from the end of AdminDashboard
bad_end = """      {selectedGalleryPhoto && (
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
good_end = """    </div>
  );
}"""
content = content.replace(bad_end, good_end)

# 2. Add the modal to the end of Page
bad_page_end = """      {/* --- ADMIN DASHBOARD --- */}
      {user && user.role === 'admin' && (
        <AdminDashboard settings={settings} onUpdateSettings={updateSettings} onLogout={handleLogout} />
      )}
    </main>
  );
}"""
good_page_end = """      {/* --- ADMIN DASHBOARD --- */}
      {user && user.role === 'admin' && (
        <AdminDashboard settings={settings} onUpdateSettings={updateSettings} onLogout={handleLogout} />
      )}

      {selectedGalleryPhoto && (
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
    </main>
  );
}"""
content = content.replace(bad_page_end, good_page_end)

# 3. Revert AdminDashboard gallery
bad_admin_gallery = """              {(settings.gallery || []).map((photo) => (
                <div key={photo.id} className="relative group aspect-square bg-[#1a1a1a]/60 backdrop-blur-sm rounded-lg overflow-hidden border border-[#333] cursor-pointer" onClick={() => setSelectedGalleryPhoto(photo.url)}>
                  <img src={photo.url} alt="Galeri" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between pointer-events-none">"""
good_admin_gallery = """              {(settings.gallery || []).map((photo) => (
                <div key={photo.id} className="relative group aspect-square bg-[#1a1a1a]/60 backdrop-blur-sm rounded-lg overflow-hidden border border-[#333]">
                  <img src={photo.url} alt="Galeri" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">"""
content = content.replace(bad_admin_gallery, good_admin_gallery)

bad_admin_delete_btn = """                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteGalleryPhoto(photo.id); }}
                      className="self-end bg-[#e53e3e] text-white p-1.5 rounded-md hover:bg-[#c53030] transition-colors pointer-events-auto"
                      title="Hapus Foto"
                    >"""
good_admin_delete_btn = """                    <button 
                      onClick={() => handleDeleteGalleryPhoto(photo.id)}
                      className="self-end bg-[#e53e3e] text-white p-1.5 rounded-md hover:bg-[#c53030] transition-colors"
                      title="Hapus Foto"
                    >"""
content = content.replace(bad_admin_delete_btn, good_admin_delete_btn)

with open('app/App.tsx', 'w') as f:
    f.write(content)
print("Fix executed!")
