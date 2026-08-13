import re

with open('app/App.tsx', 'r') as f:
    content = f.read()

old_lightbox = """      {selectedGalleryPhoto && (
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
      )}"""

new_lightbox = """      {selectedGalleryPhoto && (
        <div 
          className="fixed inset-0 bg-black/95 z-[600] flex items-center justify-center p-4 backdrop-blur-xl animate-in fade-in duration-300"
          onClick={() => setSelectedGalleryPhoto(null)}
        >
          <button 
            onClick={() => setSelectedGalleryPhoto(null)}
            className="absolute top-4 right-4 md:top-8 md:right-8 bg-black/50 border border-white/20 p-3 rounded-full text-white hover:bg-white/20 transition-colors z-[610] shadow-xl"
          >
            <X size={24} />
          </button>
          <img 
            src={selectedGalleryPhoto} 
            alt="Fullscreen Gallery" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl relative z-[605] animate-in zoom-in-50 duration-300"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}"""

content = content.replace(old_lightbox, new_lightbox)

with open('app/App.tsx', 'w') as f:
    f.write(content)
print("Done!")
