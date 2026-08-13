import re

with open('app/App.tsx', 'r') as f:
    content = f.read()

old_page_gallery = """                  ) : (
                    settings.gallery.map((photo) => (
                      <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] cursor-pointer" onClick={() => setSelectedGalleryPhoto(photo.url)}>
                        <img src={photo.url} alt="Gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-left pointer-events-none">
                          <span className="text-white text-[10px] font-bold truncate">{photo.uploader}</span>
                          <span className="text-[#aaa] text-[9px]">{photo.date}</span>
                        </div>"""

new_page_gallery = """                  ) : (
                    settings.gallery.map((photo, index) => (
                      <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#333] cursor-pointer" onClick={() => setSelectedGalleryPhoto(photo.url)}>
                        <div className="absolute top-2 left-2 bg-black/60 text-[#d4af37] text-[10px] font-bold px-2 py-1 rounded-md z-10">#{settings.gallery!.length - index}</div>
                        <img src={photo.url} alt="Gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-left pointer-events-none">
                          <span className="text-white text-[10px] font-bold truncate">{photo.uploader}</span>
                          <span className="text-[#aaa] text-[9px]">{photo.date}</span>
                        </div>"""

content = content.replace(old_page_gallery, new_page_gallery)

old_admin_gallery = """            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(settings.gallery || []).map((photo) => (
                <div key={photo.id} className="relative group aspect-square bg-[#1a1a1a]/60 backdrop-blur-sm rounded-lg overflow-hidden border border-[#333]">
                  <img src={photo.url} alt="Galeri" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">"""

new_admin_gallery = """            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(settings.gallery || []).map((photo, index) => (
                <div key={photo.id} className="relative group aspect-square bg-[#1a1a1a]/60 backdrop-blur-sm rounded-lg overflow-hidden border border-[#333]">
                  <div className="absolute top-2 left-2 bg-black/60 text-[#d4af37] text-[10px] font-bold px-2 py-1 rounded-md z-10">#{(settings.gallery || []).length - index}</div>
                  <img src={photo.url} alt="Galeri" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">"""

content = content.replace(old_admin_gallery, new_admin_gallery)

with open('app/App.tsx', 'w') as f:
    f.write(content)

print("Done")
